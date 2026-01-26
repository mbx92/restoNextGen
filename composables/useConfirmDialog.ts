import { ref } from "vue";

interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?:
    | "primary"
    | "error"
    | "warning"
    | "success"
    | "info"
    | "neutral";
  icon?: string;
}

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  confirmColor: string;
  icon: string;
  resolve: ((value: boolean) => void) | null;
}

const state = ref<ConfirmDialogState>({
  isOpen: false,
  title: "Confirm",
  message: "",
  confirmText: "Confirm",
  cancelText: "Cancel",
  confirmColor: "error",
  icon: "i-heroicons-exclamation-triangle",
  resolve: null,
});

export function useConfirmDialog() {
  const confirm = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        title: options.title || "Confirm",
        message: options.message,
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        confirmColor: options.confirmColor || "error",
        icon: options.icon || "i-heroicons-exclamation-triangle",
        resolve,
      };
    });
  };

  const handleConfirm = () => {
    if (state.value.resolve) {
      state.value.resolve(true);
    }
    state.value.isOpen = false;
    state.value.resolve = null;
  };

  const handleCancel = () => {
    if (state.value.resolve) {
      state.value.resolve(false);
    }
    state.value.isOpen = false;
    state.value.resolve = null;
  };

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
