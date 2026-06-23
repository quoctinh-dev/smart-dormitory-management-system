import { Box, TextField, Alert, FormControl, InputLabel, Select, MenuItem, OutlinedInput, Typography, Divider } from "@mui/material";

const PRIORITY_OPTIONS = [
    { value: "PRIORITY_01", label: "1. Con liệt sĩ, con thương binh, bệnh binh..." },
    { value: "PRIORITY_02", label: "2. Con đẻ người hoạt động kháng chiến nhiễm chất độc hóa học" },
    { value: "PRIORITY_03", label: "3. Sinh viên dân tộc thiểu số" },
    { value: "PRIORITY_04", label: "4. Hộ khẩu vùng khó khăn / Hộ nghèo" },
    { value: "PRIORITY_05", label: "5. Khuyết tật / Mồ côi cả cha lẫn mẹ" },
    { value: "PRIORITY_06", label: "6. Đảng viên / Bộ đội xuất ngũ" },
    { value: "PRIORITY_07", label: "7. Tham gia hoạt động công tác xã hội" },
    { value: "NONE", label: "Không thuộc diện ưu tiên" }
];

export default function InfoSection({ formData, error, setFormData }) {
    return (
        <Box display="flex" flexDirection="column" gap={3} maxWidth={600} mx="auto" mt={4}>
            <Alert severity="success" sx={{ borderRadius: 3 }}>
                Hệ thống xác nhận Quý khách đủ điều kiện nộp hồ sơ. Vui lòng cung cấp đầy đủ các thông tin cá nhân dưới đây.
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
            
            <Typography variant="h6" fontWeight="bold" color="primary" mt={2}>I. Thông tin cá nhân</Typography>
            <Divider />

            <TextField 
                label="Họ và tên" 
                value={formData.fullName} 
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
                required 
                fullWidth 
            />
            
            <Box display="flex" gap={2}>
                <TextField 
                    label="Mã số định danh (CCCD)" 
                    value={formData.cccd} 
                    disabled 
                    fullWidth 
                    sx={{ bgcolor: 'action.hover' }}
                />
                <TextField 
                    label="Ngày cấp CCCD" 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    value={formData.issueDate || ''} 
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})} 
                    fullWidth 
                />
            </Box>
            
            <TextField 
                label="Nơi cấp CCCD" 
                value={formData.issuePlace || ''} 
                onChange={(e) => setFormData({...formData, issuePlace: e.target.value})} 
                fullWidth 
            />

            <Box display="flex" gap={2}>
                <TextField 
                    label="Ngày sinh" 
                    type="date" 
                    InputLabelProps={{ shrink: true }} 
                    value={formData.dob} 
                    onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                    required 
                    fullWidth 
                />
                <TextField 
                    label="Giới tính" 
                    select 
                    SelectProps={{ native: true }}
                    value={formData.gender} 
                    onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                    required 
                    fullWidth
                >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                </TextField>
            </Box>

            <Box display="flex" gap={2}>
                <TextField 
                    label="Nơi sinh" 
                    value={formData.pob || ''} 
                    onChange={(e) => setFormData({...formData, pob: e.target.value})} 
                    fullWidth 
                />
                <TextField 
                    label="Khoa" 
                    value={formData.faculty || ''} 
                    onChange={(e) => setFormData({...formData, faculty: e.target.value})} 
                    fullWidth 
                />
            </Box>

            <Box display="flex" gap={2}>
                <TextField 
                    label="Dân tộc" 
                    value={formData.ethnic || ''} 
                    onChange={(e) => setFormData({...formData, ethnic: e.target.value})} 
                    fullWidth 
                />
                <TextField 
                    label="Tôn giáo" 
                    value={formData.religion || ''} 
                    onChange={(e) => setFormData({...formData, religion: e.target.value})} 
                    fullWidth 
                />
            </Box>

            <Box display="flex" gap={2}>
                <TextField 
                    label="Thư điện tử (Email)" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    required 
                    fullWidth 
                />
                <TextField 
                    label="Số điện thoại di động" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                    required 
                    fullWidth 
                />
            </Box>

            <TextField 
                label="Hộ khẩu thường trú" 
                value={formData.permanentAddress} 
                onChange={(e) => setFormData({...formData, permanentAddress: e.target.value})} 
                required 
                fullWidth 
            />
            <TextField 
                label="Địa chỉ liên hệ hiện tại" 
                value={formData.contactAddress} 
                onChange={(e) => setFormData({...formData, contactAddress: e.target.value})} 
                required 
                fullWidth 
            />

            <Typography variant="h6" fontWeight="bold" color="primary" mt={3}>II. Thông tin gia đình</Typography>
            <Divider />

            <Box display="flex" gap={2}>
                <TextField 
                    label="Họ và tên Cha" 
                    value={formData.fatherName || ''} 
                    onChange={(e) => setFormData({...formData, fatherName: e.target.value})} 
                    fullWidth 
                />
                <TextField 
                    label="Năm sinh" 
                    type="number"
                    value={formData.fatherYob || ''} 
                    onChange={(e) => setFormData({...formData, fatherYob: e.target.value})} 
                    sx={{ width: 120 }} 
                />
            </Box>
            <Box display="flex" gap={2}>
                <TextField 
                    label="Nghề nghiệp" 
                    value={formData.fatherJob || ''} 
                    onChange={(e) => setFormData({...formData, fatherJob: e.target.value})} 
                    fullWidth 
                />
                <TextField 
                    label="Số điện thoại" 
                    value={formData.fatherPhone || ''} 
                    onChange={(e) => setFormData({...formData, fatherPhone: e.target.value})} 
                    fullWidth 
                />
            </Box>

            <Box display="flex" gap={2} mt={2}>
                <TextField 
                    label="Họ và tên Mẹ" 
                    value={formData.motherName || ''} 
                    onChange={(e) => setFormData({...formData, motherName: e.target.value})} 
                    fullWidth 
                />
                <TextField 
                    label="Năm sinh" 
                    type="number"
                    value={formData.motherYob || ''} 
                    onChange={(e) => setFormData({...formData, motherYob: e.target.value})} 
                    sx={{ width: 120 }} 
                />
            </Box>
            <Box display="flex" gap={2}>
                <TextField 
                    label="Nghề nghiệp" 
                    value={formData.motherJob || ''} 
                    onChange={(e) => setFormData({...formData, motherJob: e.target.value})} 
                    fullWidth 
                />
                <TextField 
                    label="Số điện thoại" 
                    value={formData.motherPhone || ''} 
                    onChange={(e) => setFormData({...formData, motherPhone: e.target.value})} 
                    fullWidth 
                />
            </Box>

            <TextField 
                label="Địa chỉ / Điện thoại liên hệ khi cần" 
                value={formData.familyContact || ''} 
                onChange={(e) => setFormData({...formData, familyContact: e.target.value})} 
                fullWidth 
                sx={{ mt: 2 }}
            />

            <Typography variant="h6" fontWeight="bold" color="primary" mt={3}>III. Đối tượng ưu tiên</Typography>
            <Divider />

            <Alert severity="info" sx={{ borderRadius: 2 }}>
                Lưu ý: Mức độ ưu tiên được sắp xếp giảm dần từ 1 đến 7. Nếu sinh viên thuộc nhiều diện ưu tiên, vui lòng chọn diện có số thứ tự <b>NHỎ NHẤT</b> (Ví dụ: thuộc cả diện 2 và 4 thì chọn diện 2).
            </Alert>

            <FormControl fullWidth required>
                <InputLabel>Diện ưu tiên (Chọn 1 diện cao nhất)</InputLabel>
                <Select
                    value={formData.priorityCategories?.length > 0 ? formData.priorityCategories[0] : 'NONE'}
                    onChange={(e) => setFormData({...formData, priorityCategories: [e.target.value]})}
                    input={<OutlinedInput label="Diện ưu tiên (Chọn 1 diện cao nhất)" />}
                >
                    {PRIORITY_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Box>
    );
}
