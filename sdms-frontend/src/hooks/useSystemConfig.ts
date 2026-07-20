import { useState, useEffect } from 'react';

import { systemConfigApi } from '@/api/system-config-api';
import { snackbar } from '@/helpers/snackbar';
import type { SystemConfig } from '@/types/system-config';

export const useSystemConfig = () => {
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await systemConfigApi.getAllConfigs();
      setConfigs(res);

      const values: Record<string, string> = {};
      res.forEach((config: SystemConfig) => {
        values[config.configKey] = config.configValue;
      });
      setEditValues(values);
    } catch {
      snackbar.error('Lỗi khi tải cấu hình hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (config: SystemConfig) => {
    const newValue = editValues[config.configKey];

    if (!newValue || newValue.trim() === '') {
      snackbar.warning('Giá trị không được để trống');
      return;
    }

    try {
      setLoading(true);
      await systemConfigApi.updateConfig(config.configKey, { configValue: newValue });
      snackbar.success('Cập nhật cấu hình thành công!');
      fetchConfigs();
    } catch (error: any) {
      snackbar.error(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình');
    } finally {
      setLoading(false);
    }
  };

  return {
    configs,
    editValues,
    loading,
    handleValueChange,
    handleSave,
  };
};
