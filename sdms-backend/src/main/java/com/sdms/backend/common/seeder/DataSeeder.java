package com.sdms.backend.common.seeder;

import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.entity.Floor;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.enums.BedStatus;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.room.enums.RoomStatus;
import com.sdms.backend.modules.room.repository.BedRepository;
import com.sdms.backend.modules.room.repository.BuildingRepository;
import com.sdms.backend.modules.room.repository.FloorRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Mục tiêu/Nghiệp vụ: Khởi tạo dữ liệu mồi (Seed Data) cho hệ thống Ký túc xá vào lần đầu tiên chạy ứng dụng, bao gồm tài khoản Admin mặc định và cấu trúc hạ tầng cơ bản (Tòa nhà, Tầng, Phòng, Giường).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Implement interface ApplicationRunner của Spring Boot. Logic seeder sẽ tự động thực thi sau khi ApplicationContext khởi tạo xong toàn bộ Bean.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích tại sao phải dùng @Profile("!prod"): Nếu đưa code seeder này lên môi trường Production mà quên xóa, bất kỳ ai dò ra password mặc định cũng có thể chiếm quyền Admin. Annotation này đóng vai trò Guard Clause chặn Spring Boot khởi chạy DataSeeder trên server Prod. Ngoài ra, lệnh if check tài khoản ADMIN trước khi chạy giúp hệ thống luôn đạt tính Idempotent (chạy n lần kết quả như 1).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!prod") // Quan trọng: Chỉ chạy seeder khi không ở môi trường production
public class DataSeeder implements ApplicationRunner {

    private final UserAccountRepository userAccountRepository;
    private final BuildingRepository buildingRepository;
    private final FloorRepository floorRepository;
    private final RoomRepository roomRepository;
    private final BedRepository bedRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        // Chỉ chạy seeder nếu không có tài khoản admin nào tồn tại
        if (userAccountRepository.findByRole(Role.ADMIN).isEmpty()) {
            log.info("No ADMIN account found. Initializing seed data...");
            seedAdminUser();
            seedRoomData();
            log.info("Seed data initialized successfully.");
        } else {
            log.info("Admin account already exists. Skipping seed data.");
        }
    }

    private void seedAdminUser() {
        UserAccount admin = new UserAccount();
        admin.setUsername("admin");
        admin.setEmail("admin@sdms.com");
        admin.setPassword(passwordEncoder.encode("admin123")); // Mã hóa mật khẩu
        admin.setRole(Role.ADMIN);
        admin.setStatus(AccountStatus.ACTIVE);
        userAccountRepository.save(admin);
        log.info("Created ADMIN user with email: admin@sdms.com and password: admin123");
    }

    private void seedRoomData() {
        // 1. Tạo Tòa nhà
        Building buildingA = new Building();
        buildingA.setCode("A");
        buildingA.setName("Tòa nhà A");
        buildingA.setStatus(BuildingStatus.ACTIVE);
        buildingRepository.save(buildingA);

        // 2. Tạo các Tầng cho Tòa nhà A (Dùng ID vừa được tạo)
        Floor floorA1 = new Floor();
        floorA1.setBuilding(buildingA);
        floorA1.setFloorNumber(1);
        floorA1.setGender(Gender.MALE);
        floorRepository.save(floorA1);

        Floor floorA2 = new Floor();
        floorA2.setBuilding(buildingA);
        floorA2.setFloorNumber(2);
        floorA2.setGender(Gender.FEMALE);
        floorRepository.save(floorA2);

        // 3. Tạo các Phòng cho Tầng 1 (Dùng ID vừa được tạo)
        Room room101 = new Room();
        room101.setFloor(floorA1);
        room101.setRoomCode("101");
        room101.setCapacity(8);
        room101.setStatus(RoomStatus.AVAILABLE);
        roomRepository.save(room101);

        // 4. Tạo các Giường cho Phòng 101 (Dùng ID vừa được tạo)
        for (int i = 1; i <= 8; i++) {
            Bed bed = new Bed();
            bed.setRoom(room101);
            bed.setBedCode("A" + i);
            bed.setStatus(BedStatus.AVAILABLE);
            bedRepository.save(bed);
        }
        log.info("Seeded Building A -> Floor 1 -> Room 101 with 8 beds.");
    }
}
