import { useCallback, useState } from 'react';
import type { DialogMode } from '../components/modal/BaseDialog';

interface UseDialogReturn<T> {
  dialogOpen: boolean;
  dialogMode: DialogMode;
  selectedItem: T | null;
  openDialog: (mode: DialogMode, item?: T | null) => void;
  closeDialog: () => void;
  changeMode: (mode: DialogMode) => void;
}

export function useDialog<T>(initialMode: DialogMode = 'view'): UseDialogReturn<T> {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(initialMode);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const openDialog = useCallback((mode: DialogMode, item?: T | null) => {
    setDialogMode(mode);
    setSelectedItem(item || null);
    setDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedItem(null);
    setDialogMode(initialMode);
  }, [initialMode]);

  const changeMode = useCallback((mode: DialogMode) => {
    setDialogMode(mode);
  }, []);

  return {
    dialogOpen,
    dialogMode,
    selectedItem,
    openDialog,
    closeDialog,
    changeMode,
  };
}
