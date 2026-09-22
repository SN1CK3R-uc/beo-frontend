import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';

import { LoginPage } from '@/features/auth/LoginPage';
import { HomePage } from '@/features/home/HomePage';
import { FinancePage } from '@/features/finance/FinancePage';
import { MeetingsPage } from '@/features/meetings/MeetingsPage';
import { SummaryPage } from '@/features/summary/SummaryPage';
import { MemosPage } from '@/features/memos/MemosPage';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';
import { AdminPage } from '@/features/admin/AdminPage';

import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

const qc = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => { bootstrap(); }, [bootstrap]);
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);

  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/financials" element={<FinancePage />} />
              <Route path="/meetings" element={<MeetingsPage />} />
              <Route path="/summary" element={<SummaryPage />} />
              <Route path="/memos" element={<MemosPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}