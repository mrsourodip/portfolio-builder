"use client";
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1e293b',
          color: '#e2e8f0',
          border: '1px solid #334155',
          fontSize: '13px',
          borderRadius: '8px',
        },
        success: {
          iconTheme: { primary: '#2dd4bf', secondary: '#0f172a' },
          duration: 3000,
        },
        error: {
          iconTheme: { primary: '#f87171', secondary: '#0f172a' },
          duration: 4000,
        },
        loading: {
          iconTheme: { primary: '#94a3b8', secondary: '#0f172a' },
        },
      }}
    />
  );
}
