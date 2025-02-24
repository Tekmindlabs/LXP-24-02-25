'use client';

import * as React from 'react';
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

function toast({ title, description, variant = "default" }: ToastProps) {
  if (variant === "destructive") {
    sonnerToast.error(title, {
      description,
    });
  } else {
    sonnerToast(title, {
      description,
    });
  }
}

// Add convenience methods
toast.error = (message: string) => {
  sonnerToast.error(message);
};

toast.success = (message: string) => {
  sonnerToast.success(message);
};

function useToast() {
  return {
    toast,
  };
}

export { useToast, toast };



