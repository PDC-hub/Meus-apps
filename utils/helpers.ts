
import { InstallmentPeriod } from '../types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const generateId = () => Math.random().toString(36).substring(2, 11);

export const getNextInstallmentDate = (baseDate: string, index: number, period: InstallmentPeriod): string => {
  const date = new Date(baseDate);
  if (period === 'week') {
    date.setDate(date.getDate() + (index * 7));
  } else if (period === 'month') {
    date.setMonth(date.getMonth() + index);
  } else if (period === 'year') {
    date.setFullYear(date.getFullYear() + index);
  }
  return date.toISOString().split('T')[0];
};
