// src/pages/admin/RoomManagement/components/BuildingListDialog.tsx
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  Chip,
  Box,
} from '@mui/material';
import React, { useState } from 'react';

import type { BuildingResponse } from '@/types/room';

import BuildingFormDialog from './BuildingFormDialog';

export interface BuildingListDialogProps {
  open: boolean;
  onClose: () => void;
  buildings: BuildingResponse[];
  onRefresh: () => void;
}

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  ACTIVE: 'success',
  MAINTENANCE: 'warning',
  CLOSED: 'error',
};

export default function BuildingListDialog({
                                             open,
                                             onClose,
                                             buildings,
                                             onRefresh,
                                           }: BuildingListDialogProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingResponse | null>(null);

  const handleAdd = () => {
    setSelectedBuilding(null);
    setFormOpen(true);
  };

  const handleEdit = (b: BuildingResponse) => {
    setSelectedBuilding(b);
    setFormOpen(true);
  };

  return (
      <>
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
          <DialogTitle
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            Quản lý Tòa nhà
            <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Button
                  variant="outlined"
                  startIcon={<AddIcon fontSize="small" />}
                  fullWidth
                  onClick={handleAdd}
                  sx={{ bgcolor: 'background.paper', borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
              >
                Thêm Tòa nhà Mới
              </Button>
            </Box>
            <List disablePadding>
              {buildings.map((b) => (
                  <ListItem
                      key={b.buildingId}
                      divider
                      secondaryAction={
                        <IconButton
                            edge="end"
                            onClick={() => handleEdit(b)}
                            size="small"
                            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, color: 'text.secondary' }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      }
                      sx={{ py: 1.5, px: 2 }}
                  >
                    <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <strong style={{ fontFamily: 'monospace' }}>{b.code}</strong>
                            <span>— {b.name}</span>
                            <Chip
                                label={b.status}
                                size="small"
                                color={STATUS_COLOR[b.status] || 'default'}
                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: 1 }}
                            />
                          </Stack>
                        }
                        secondary={b.description || 'Không có mô tả'}
                    />
                  </ListItem>
              ))}
              {buildings.length === 0 && (
                  <ListItem sx={{ py: 4 }}>
                    <ListItemText
                        primary="Chưa có dữ liệu tòa nhà"
                        sx={{ textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }}
                    />
                  </ListItem>
              )}
            </List>
          </DialogContent>
        </Dialog>

        {/* Form Dialog */}
        <BuildingFormDialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            building={selectedBuilding}
            onSuccess={() => {
              setFormOpen(false);
              onRefresh(); // Trigger data refresh in Dashboard
            }}
        />
      </>
  );
}