import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ProfileModal } from '@/features/profile/ProfileModal';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="dashboard-body">
      <TopBar onMenuClick={() => setMobileOpen(true)} />
      <div className="main-layout">
        <Sidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpenProfile={() => {
            setProfileOpen(true);
            setMobileOpen(false); // close mobile drawer if open
          }}
        />
        <main className="content-area">
          <Outlet />
        </main>
      </div>

      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}