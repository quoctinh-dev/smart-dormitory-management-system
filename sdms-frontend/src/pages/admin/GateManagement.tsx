import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Download as DownloadIcon, UploadFile as UploadFileIcon } from '@mui/icons-material';
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
      snackbar.error('Lỗi khi tải dữ liệu');
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
    if (window.confirm('Bạn có chắc chắn muốn xóa cổng này?')) {
      try {
        await gateApi.deleteGate(id);
        snackbar.success('Xóa cổng thành công');
        fetchData();
      } catch {
        snackbar.error('Lỗi khi xóa cổng');
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
      snackbar.error('Lỗi khi đọc file Excel');
    }
    
    // Reset input
    e.target.value = '';
  };

  return (
    <Box>
      {/* ===== Header toolbar ===== */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý cổng (IoT Gates)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Tải Template
            </Button>
          </Tooltip>
          <Tooltip title="Import danh sách cổng từ file Excel">
            <Button
              variant="outlined"
              color="success"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Import Excel
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Thêm cổng mới
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center' }} elevation={0} variant="outlined">
        <Typography variant="subtitle2" sx={{ mr: 1 }}>Bộ lọc:</Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
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

        <FormControl size="small" sx={{ minWidth: 200 }}>
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
      </Paper>

      <Paper
        elevation={3}
        sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}
      >
        {loading ? (
          <Box p={3}>
            <CustomSkeleton type="table" count={5} />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: (theme) => alpha(theme.palette.action.hover, 0.04) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Gate ID (UUID)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tên cổng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Loại cổng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Tòa nhà / phòng</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>MAC Address</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Hành động
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedGates.map((gate) => (
                  <TableRow key={gate.gateId}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{gate.gateId}</TableCell>
                    <TableCell>{gate.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={gate.gateType}
                        color={gate.gateType === 'BUILDING_GATE' ? 'primary' : 'secondary'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {gate.gateType === 'BUILDING_GATE' ? gate.buildingName : gate.roomCode}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{gate.macAddress || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={gate.active ? 'ACTIVE' : 'INACTIVE'}
                        color={gate.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="primary" onClick={() => handleOpenDialog(gate)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(gate.gateId)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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
              labelRowsPerPage="Số dòng/trang:"
            />
          </TableContainer>
        )}
      </Paper>

      <GateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editingGate={editingGate}
        buildings={buildings}
        onSuccess={fetchData}
      />

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
