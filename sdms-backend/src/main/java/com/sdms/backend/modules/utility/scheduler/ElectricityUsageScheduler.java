package com.sdms.backend.modules.utility.scheduler;

import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.utility.entity.ElectricityUsage;
import com.sdms.backend.modules.utility.event.ElectricityBillCalculatedEvent;
import com.sdms.backend.modules.utility.repository.ElectricityUsageRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

/**
 * Mục tiêu/Nghiệp vụ: Lập lịch chốt chỉ số điện nước cuối tháng cho toàn bộ các phòng trong Ký túc xá. Sinh dữ liệu tiêu thụ và kích hoạt quy trình tính tiền.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Lập lịch tự động bằng `@Scheduled` với cron expression. Do việc chốt điện có thể tốn thời gian nên sử dụng cơ chế Event-Driven (`ElectricityBillCalculatedEvent`) để ném việc sinh hóa đơn sang module Payment xử lý độc lập.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích về biểu thức Cron `0 0 0 L * ?`: Chạy vào lúc 0 giờ 0 phút 0 giây của ngày cuối cùng trong tháng (L = Last day of month). Do số ngày trong tháng biến động (28-31) nên dùng ký tự L thay vì fix cứng. Annotation `@Transactional` đảm bảo nếu tiến trình bị sập, toàn bộ dữ liệu chốt sổ của các phòng trong lô đó sẽ được rollback sạch sẽ.
 */
@Component
@RequiredArgsConstructor
public class ElectricityUsageScheduler {
    private final RoomRepository roomRepository;
    private final ElectricityUsageRepository electricityUsageRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    @Scheduled(cron = "0 0 0 L * ?") // Chạy ngầm tự động vào 0h ngày cuối cùng của tháng
    @Transactional
    public void calculateElectricity() {
        List<Room> rooms = roomRepository.findAll();
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();
        Random random = new Random();
        
        for (Room room : rooms) {
            ElectricityUsage lastUsage = electricityUsageRepository.findTopByRoomIdOrderByYearDescMonthDesc(room.getRoomId()).orElse(null);
            int oldReading = lastUsage != null ? lastUsage.getNewReading() : 0;
            int totalKwh = random.nextInt(100) + 50;
            int newReading = oldReading + totalKwh;
            
            ElectricityUsage usage = new ElectricityUsage();
            usage.setRoomId(room.getRoomId());
            usage.setMonth(currentMonth);
            usage.setYear(currentYear);
            usage.setOldReading(oldReading);
            usage.setNewReading(newReading);
            usage.setTotalKwh(totalKwh);
            usage.setIsSettled(false);
            
            usage = electricityUsageRepository.save(usage);
            
            eventPublisher.publishEvent(new ElectricityBillCalculatedEvent(room.getRoomId(), totalKwh, currentMonth, currentYear, usage.getId()));
        }
    }
}
