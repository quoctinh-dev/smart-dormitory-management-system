import { useState, useEffect } from 'react';

import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import type { BuildingResponse, BuildingStatus } from '@/types/room';

export const useBuildingForm = (
  open: boolean,
  building: BuildingResponse | null,
  onSuccess: () => void,
  onClose: () => void
) => {
  const isEdit = Boolean(building);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<BuildingStatus>('ACTIVE');
  const [gender, setGender] = useState('MIXED');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (building) {
        setCode(building.code);
        setName(building.name);
        setDescription(building.description || '');
        setStatus(building.status);
        setGender(building.gender || 'MIXED');
      } else {
        setCode('');
        setName('');
        setDescription('');
        setStatus('ACTIVE');
        setGender('MIXED');
      }
    }
  }, [open, building]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await roomApi.updateBuilding(building!.buildingId, {
          name: name.trim(),
          description: description.trim(),
          status,
          gender,
        });
        snackbar.success('Cập nhật tòa nhà thành công');
      } else {
        await roomApi.createBuilding({
          code: code.trim(),
          name: name.trim(),
          description: description.trim(),
          gender,
        });
        snackbar.success('Thêm tòa nhà mới thành công');
      }
      onSuccess();
    } catch (err: any) {
      snackbar.error(err?.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return {
    isEdit,
    code,
    setCode,
    name,
    setName,
    description,
    setDescription,
    status,
    setStatus,
    gender,
    setGender,
    loading,
    handleSubmit,
  };
};
