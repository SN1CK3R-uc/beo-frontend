import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { usePermissions } from '@/hooks/usePermissions';

const BASE_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/financials', label: 'Financials', icon: '💳' },
  { to: '/meetings', label: 'Meetings', icon: '📅' },
  { to: '/summary', label: 'Overall Summary', icon: '📊' },
  { to: '/memos', label: 'Memos', icon: '📝' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
];

interface Props {
  mobileOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export function Sidebar({ mobileOpen, onClose, onOpenProfile }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const navigate = useNavigate();
  const { can } = usePermissions();

  const navItems = can('admin.access')
    ? [...BASE_ITEMS, { to: '/admin', label: 'Admin', icon: '⚙️' }]
    : BASE_ITEMS;

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleProfile = () => { onClose(); onOpenProfile(); };

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${mobileOpen ? 'drawer-open' : ''}`}>
        <nav className="nav-menu">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span aria-hidden="true">{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user-controls">
          <hr className="sidebar-divider" />

          <button className="user-identity-badge" onClick={handleProfile}>
            <div className="user-avatar">{user?.name?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className="user-info-text">
              <span className="display-name">{user?.name ?? 'Loading'}</span>
              <span className="display-role">{user?.role?.toUpperCase() ?? ''}</span>
            </div>
          </button>

          <button className="sidebar-action-btn" onClick={toggle}>
            {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button className="sidebar-logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>
    </>
  );
}