import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, DollarSign,
  BarChart2, ClipboardList, Users, BookOpen,
} from 'lucide-react';
import { useAuth }     from '../../auth/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import './styles.css';

export default function Sidebar({ open, onClose }) {
  const { user, avatar } = useAuth();
  const { t }            = useSettings();
  const role             = user?.role ?? 'global';
  const initial          = (user?.firstName?.[0] ?? 'U').toUpperCase();
  const name             = user?.name ?? 'User';
  const roleLabel        = role === 'admin' ? 'System Administrator'
                         : role === 'zonal' ? 'Zonal Manager'
                         : 'Global Manager';

  const NAV_CONFIG = {
    global: [
      { label: t?.dashboard       || 'Dashboard',       icon: LayoutDashboard, path: '/global/dashboard' },
      { label: t?.reportingPortal || 'Reporting Portal',icon: FileText,         path: '/global/reporting' },
      { label: t?.financePortal   || 'Finance Portal',  icon: DollarSign,       path: '/global/finance'   },
      { label: t?.analytics       || 'Analytics',       icon: BarChart2,        path: '/global/analytics' },
      { label: t?.auditLogs       || 'Audit Logs',      icon: ClipboardList,    path: '/global/audit'     },
    ],
    zonal: [
      { label: t.dashboard,       icon: LayoutDashboard, path: '/zonal/dashboard' },
      { label: t.reportingPortal, icon: FileText,         path: '/zonal/reporting' },
      { label: t.financePortal,   icon: DollarSign,       path: '/zonal/finance'   },
      { label: t.analytics,       icon: BarChart2,        path: '/zonal/analytics' },
    ],
    admin: [
      { label: t?.dashboard       || 'Dashboard',       icon: LayoutDashboard, path: '/admin/dashboard'  },
      { label: t?.userManagement  || 'User Management', icon: Users,            path: '/admin/users'      },
      { label: t?.reportingPortal || 'Reporting Portal',icon: FileText,         path: '/admin/reporting'  },
      { label: t?.financePortal   || 'Finance Portal',  icon: DollarSign,       path: '/admin/finance'    },
      { label: t?.analytics       || 'Analytics',       icon: BarChart2,        path: '/admin/analytics'  },
      { label: t?.auditLogs       || 'Audit Logs',      icon: ClipboardList,    path: '/admin/audit'      },
    ],
  };

  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.global;

  return (
    <>
      {/* Overlay — closes sidebar on mobile tap outside */}
      <div
        className={`sidebar-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <img src="/HSLogo.png" alt="HS Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 }} />
          </div>
          <div>
            <h1>Loveworld</h1>
            <p>Reports Platform</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {avatar
                ? <img src={avatar} alt="avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : initial
              }
            </div>
            <div className="sidebar-user-info">
              <p>{name}</p>
              <span>{roleLabel}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
