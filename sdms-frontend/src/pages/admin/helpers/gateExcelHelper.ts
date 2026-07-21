import * as XLSX from 'xlsx';
import { snackbar } from '@/helpers/snackbar';

export const handleDownloadTemplate = () => {
  const templateData = [
    {
      'Tên cổng (name)*': 'Cổng chính tòa A',
      'Loại cổng (gateType)*': 'BUILDING_GATE',
      'Mã phòng (roomCode — chỉ khi ROOM_DOOR)': '',
      'MAC Address (tuỳ chọn)': 'AA:BB:CC:DD:EE:01',
      'Trạng thái (active)*': 'true',
    },
    {
      'Tên cổng (name)*': 'Cửa phòng 101',
      'Loại cổng (gateType)*': 'ROOM_DOOR',
      'Mã phòng (roomCode — chỉ khi ROOM_DOOR)': '101',
      'MAC Address (tuỳ chọn)': 'AA:BB:CC:DD:EE:02',
      'Trạng thái (active)*': 'true',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(templateData);
  // Đặt độ rộng cột
  ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 35 }, { wch: 22 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Gates');
  XLSX.writeFile(wb, 'template_gates.xlsx');
  snackbar.success('Tải template thành công!');
};

export const parseExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);

      // Map sang format chuẩn + validate từng dòng
      const parsed = rows.map((row, idx) => {
        const name = String(row['Tên cổng (name)*'] || '').trim();
        const gateTypeRaw = String(row['Loại cổng (gateType)*'] || '').trim().toUpperCase();
        const gateType = gateTypeRaw === 'ROOM_DOOR' ? 'ROOM_DOOR' : 'BUILDING_GATE';
        const roomCode = String(row['Mã phòng (roomCode — chỉ khi ROOM_DOOR)'] || '').trim();
        const macAddress = String(row['MAC Address (tuỳ chọn)'] || '').trim();
        const activeRaw = String(row['Trạng thái (active)*'] || 'true').trim().toLowerCase();
        const active = activeRaw !== 'false';

        const errors: string[] = [];
        if (!name) errors.push('Thiếu tên cổng');
        if (!['BUILDING_GATE', 'ROOM_DOOR'].includes(gateType)) errors.push('Loại cổng không hợp lệ');
        if (gateType === 'ROOM_DOOR' && !roomCode) errors.push('ROOM_DOOR cần có mã phòng');

        return {
          _row: idx + 2, // Row số trong Excel (1-indexed + header)
          name,
          gateType,
          roomCode,
          macAddress,
          active,
          _errors: errors,
          _status: 'pending' as 'pending' | 'success' | 'error',
          _message: '',
        };
      });
      resolve(parsed);
    };
    reader.readAsArrayBuffer(file);
  });
};
