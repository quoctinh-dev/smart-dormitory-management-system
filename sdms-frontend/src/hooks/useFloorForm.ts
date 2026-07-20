import { useState, useEffect } from 'react';

import roomApi from '@/api/room-api';
import { snackbar } from '@/helpers/snackbar';
import type { FloorResponse, BuildingResponse } from '@/types/room';

export const useFloorForm = (
  open: boolean,
  buildingId: string,
  currentBuilding: BuildingResponse | null,
  floor: FloorResponse | null,
  onSuccess: () => void,
  onClose: () => void
) => {
  const isEdit = Boolean(floor);
  const [floorNumber, setFloorNumber] = useState<number | ''>('');
  const [gender, setGender] = useState('MALE');
  const [loading, setLoading] = useState(false);

  const isBuildingStrict =
    currentBuilding?.gender === 'MALE' || currentBuilding?.gender === 'FEMALE';
  const strictGender = isBuildingStrict ? currentBuilding.gender : null;

  useEffect(() => {
    if (open) {
      if (floor) {
        setFloorNumber(floor.floorNumber);
        setGender(floor.gender || 'MALE');
      } else {
        setFloorNumber('');
        setGender(strictGender || 'MALE');
      }
    }
  }, [open, floor, strictGender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (floorNumber === '' || !buildingId) return;

    setLoading(true);
    try {
      if (isEdit) {
        await roomApi.updateFloor(floor!.floorId, {
          gender,
        });
        snackbar.success('Cập nhật tầng thành công');
      } else {
        await roomApi.createFloor({
          buildingId,
          floorNumber: Number(floorNumber),
          gender,
        });
        snackbar.success('Thêm tầng mới thành công');
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
    floorNumber,
    setFloorNumber,
    gender,
    setGender,
    loading,
    isBuildingStrict,
    handleSubmit,
  };
};
