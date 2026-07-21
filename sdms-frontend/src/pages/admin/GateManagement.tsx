import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';

import gateApi from '@/api/gate-api';
import roomApi from '@/api/room-api';
import CustomSkeleton from '@/components/common/CustomSkeleton';
import { snackbar } from '@/helpers/snackbar';
import type { GateResponse } from '@/types/gate';

import GateDialog from './components/GateDialog';
import GateImportPreviewDialog from './components/GateImportPreviewDialog';
import { handleDownloadTemplate, parseExcelFile } from './helpers/gateExcelHelper';

const GATE_TYPE_MAP: Record<string, string> = {
  BUILDING_GATE: 'Cổng tòa nhà',
  ROOM_DOOR: 'Cửa phòng',
};

export default function GateManagement() {
  const [gates, setGates] = useState<GateResponse[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateResponse | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filterBuilding, setFilterBuilding] = useState<string>('');
  const [filterGateType, setFilterGateType] = useState<string>('');

  // ===== Excel Import State =====
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);

  const filteredGates = gates.filter((gate) => {
    if (filterBuilding && gate.buildingId !== filterBuilding) return false;
    if (filterGateType && gate.gateType !== filterGateType) return false;
    return true;
  });

  const paginatedGates = filteredGates.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [gatesRes, buildingsRes] = await Promise.all([
        gateApi.getAllGates(),
        roomApi.getBuildings(),
      ]);
      setGates(Array.isArray(gatesRes) ? gatesRes : (gatesRes as any)?.data || []);
      setBuildings(Array.isArray(buildingsRes) ? buildingsRes : (buildingsRes as any)?.data || []);
    } catch (error: any) {
      console.error('Failed to fetch data', error);
      snackbar.error('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (gate?: GateResponse) => {
    setEditingGate(gate || null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị cổng này không?')) {
      try {
        await gateApi.deleteGate(id);
        snackbar.success('Xóa thiết bị cổng thành công');
        fetchData();
      } catch {
        snackbar.error('Có lỗi xảy ra khi xóa cổng');
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedRows = await parseExcelFile(file);
      setImportRows(parsedRows);
      setImportDialogOpen(true);
    } catch (error) {
      snackbar.error('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.');
    }

    // Reset input
    e.target.value = '';
  };

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header trang */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Quản lý cổng kiểm soát (IoT)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý danh sách thiết bị cổng, cửa và cấu hình định danh MAC Address.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            <Tooltip title="Tải file mẫu Excel (.xlsx)">
              <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<DownloadIcon fontSize="small" />}
                  onClick={handleDownloadTemplate}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Tải Template
              </Button>
            </Tooltip>
            <Tooltip title="Nhập danh sách cổng từ file Excel">
              <Button
                  variant="outlined"
                  color="success"
                  startIcon={<UploadFileIcon fontSize="small" />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ textTransform: 'none', borderRadius: 1.5 }}
              >
                Nhập Excel
              </Button>
            </Tooltip>
            <Button
                variant="contained"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => handleOpenDialog()}
                disableElevation
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
            >
              Thêm thiết bị mới
            </Button>
          </Stack>
        </Box>

        {/* Bộ lọc */}
        <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', minWidth: 'max-content' }}>
              Bộ lọc dữ liệu
            </Typography>

            <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Loại cổng</InputLabel>
              <Select
                  value={filterGateType}
                  label="Loại cổng"
                  onChange={(e) => {
                    setFilterGateType(e.target.value);
                    setPage(0);
                  }}
              >
                <MenuItem value="">Tất cả loại</MenuItem>
                <MenuItem value="BUILDING_GATE">Cổng tòa nhà</MenuItem>
                <MenuItem value="ROOM_DOOR">Cửa phòng</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
              <InputLabel>Tòa nhà</InputLabel>
              <Select
                  value={filterBuilding}
                  label="Tòa nhà"
                  onChange={(e) => {
                    setFilterBuilding(e.target.value);
                    setPage(0);
                  }}
              >
                <MenuItem value="">Tất cả tòa nhà</MenuItem>
                {buildings.map((b) => (
                    <MenuItem key={b.buildingId} value={b.buildingId}>
                      {b.name}
                    </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Bảng dữ liệu */}
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 4 }}>
          {loading ? (
              <Box p={3}>
                <CustomSkeleton type="table" count={5} />
              </Box>
          ) : (
              <TableContainer>
                <Table sx={{ minWidth: 700 }}>
                  <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Gate ID (UUID)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Tên thiết bị</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Phân loại</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Khu vực (Tòa/Phòng)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>MAC Address</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedGates.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                            <Typography color="text.secondary" variant="body2">
                              Không tìm thấy dữ liệu thiết bị nào phù hợp.
                            </Typography>
                          </TableCell>
                        </TableRow>
                    ) : (
                        paginatedGates.map((gate) => (
                            <TableRow key={gate.gateId} hover>
                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'text.secondary' }}>
                                {gate.gateId}
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {gate.name}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                    label={GATE_TYPE_MAP[gate.gateType] || gate.gateType}
                                    color={gate.gateType === 'BUILDING_GATE' ? 'primary' : 'default'}
                                    size="small"
                                    variant={gate.gateType === 'BUILDING_GATE' ? 'filled' : 'outlined'}
                                    sx={{ fontWeight: 500 }}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography variant="body2">
                                  {gate.gateType === 'BUILDING_GATE' ? gate.buildingName : gate.roomCode}
                                </Typography>
                              </TableCell>

                              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                {gate.macAddress || '-'}
                              </TableCell>

                              <TableCell>
                                <Chip
                                    label={gate.active ? 'Hoạt động' : 'Tạm ngưng'}
                                    color={gate.active ? 'success' : 'default'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                              </TableCell>

                              <TableCell align="center">
                                <Stack direction="row" spacing={0.5} justifyContent="center">
                                  <IconButton
                                      color="primary"
                                      size="small"
                                      title="Chỉnh sửa thiết bị"
                                      onClick={() => handleOpenDialog(gate)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                      color="error"
                                      size="small"
                                      title="Xóa thiết bị"
                                      onClick={() => handleDelete(gate.gateId)}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </TableCell>
                            </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={filteredGates.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
              </TableContainer>
          )}
        </Paper>

        {/* Dialog thêm/sửa thiết bị */}
        <GateDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            editingGate={editingGate}
            buildings={buildings}
            onSuccess={fetchData}
        />

        {/* Dialog xác nhận import dữ liệu */}
        <GateImportPreviewDialog
            open={importDialogOpen}
            onClose={() => setImportDialogOpen(false)}
            importRows={importRows}
            setImportRows={setImportRows}
            onSuccess={fetchData}
        />
      </Box>
  );
}