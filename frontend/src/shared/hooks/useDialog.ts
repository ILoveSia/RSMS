import { useState, useCallback } from 'react';

type DialogMode = 'create' | 'edit' | 'view';

interface UseDialogProps<T> {
  initialMode?: DialogMode;
  initialData?: T | null;
}

export function useDialog<T>({ initialMode = 'create', initialData = null }: UseDialogProps<T> = {}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>(initialMode);
  const [data, setData] = useState<T | null>(initialData);

  const openDialog = useCallback((newMode: DialogMode = 'create', newData?: T) => {
    setMode(newMode);
    setData(newData === undefined ? null : newData);
    setOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setData(null);
    // 데이터를 즉시 초기화하지 않고, 다이얼로그가 닫히는 애니메이션 동안 유지되도록 할 수 있습니다.
    // 필요하다면 setTimeout을 사용하여 데이터를 초기화할 수 있습니다.
  }, []);

  const setDialogMode = useCallback((newMode: DialogMode) => {
    setMode(newMode);
  }, []);

  return {
    dialogOpen: open,
    dialogMode: mode,
    dialogData: data,
    openDialog,
    closeDialog,
    setDialogMode,
  };
}