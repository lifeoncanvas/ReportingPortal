import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, DollarSign,
  BarChart2, ClipboardList, Users, BookOpen,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import './styles.css';
import logo from '../../HSLogo.png';

export default function Sidebar({ isOpen, onClose }) {
  const { user, avatar } = useAuth();
  const { t } = useSettings();

  const role = user?.role ?? 'global';
  const initial = (user?.firstName?.[0] ?? 'U').toUpperCase();
  const name = user?.name ?? 'User';

  const roleLabel =
    role === 'admin'
      ? 'System Administrator'
      : role === 'zonal'
      ? 'Zonal Manager'
      : 'Global Manager';

  const NAV_CONFIG = {
    global: [
<<<<<<< HEAD
      { label: t?.dashboard       || 'Dashboard',       icon: LayoutDashboard, path: '/global/dashboard' },
      { label: t?.reportingPortal || 'Reporting Portal',icon: FileText,         path: '/global/reporting' },
      { label: t?.analytics       || 'Analytics',       icon: BarChart2,        path: '/global/analytics' },
      { label: t?.auditLogs       || 'Audit Logs',      icon: ClipboardList,    path: '/global/audit'     },
    ],
    zonal: [
      { label: t?.dashboard       || 'Dashboard',       icon: LayoutDashboard, path: '/zonal/dashboard' },
      { label: t?.reportingPortal || 'Reporting Portal',icon: FileText,         path: '/zonal/reporting' },
      { label: t?.analytics       || 'Analytics',       icon: BarChart2,        path: '/zonal/analytics' },
    ],
    admin: [
      { label: t?.dashboard       || 'Dashboard',       icon: LayoutDashboard, path: '/admin/dashboard'  },
      { label: t?.userManagement  || 'User Management', icon: Users,            path: '/admin/users'      },
      { label: t?.reportingPortal || 'Reporting Portal',icon: FileText,         path: '/admin/reporting'  },
      { label: t?.analytics       || 'Analytics',       icon: BarChart2,        path: '/admin/analytics'  },
      { label: t?.auditLogs       || 'Audit Logs',      icon: ClipboardList,    path: '/admin/audit'      },
=======
      { label: t?.dashboard || 'Dashboard', icon: LayoutDashboard, path: '/global/dashboard' },
      { label: t?.reportingPortal || 'Reporting Portal', icon: FileText, path: '/global/reporting' },
      { label: t?.financePortal || 'Finance Portal', icon: DollarSign, path: '/global/finance' },
      { label: t?.analytics || 'Analytics', icon: BarChart2, path: '/global/analytics' },
      { label: t?.magazine || 'Magazine', icon: BookOpen, path: '/global/magazine' },
      { label: t?.auditLogs || 'Audit Logs', icon: ClipboardList, path: '/global/audit' },
    ],
    zonal: [
      { label: t?.dashboard || 'Dashboard', icon: LayoutDashboard, path: '/zonal/dashboard' },
      { label: t?.reportingPortal || 'Reporting Portal', icon: FileText, path: '/zonal/reporting' },
      { label: t?.analytics || 'Analytics', icon: BarChart2, path: '/zonal/analytics' },
      { label: t?.magazine || 'Magazine', icon: BookOpen, path: '/zonal/magazine' },
    ],
    admin: [
      { label: t?.dashboard || 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
      { label: t?.userManagement || 'User Management', icon: Users, path: '/admin/users' },
      { label: t?.reportingPortal || 'Reporting Portal', icon: FileText, path: '/admin/reporting' },
      { label: t?.financePortal || 'Finance Portal', icon: DollarSign, path: '/admin/finance' },
      { label: t?.analytics || 'Analytics', icon: BarChart2, path: '/admin/analytics' },
      { label: t?.magazine || 'Magazine', icon: BookOpen, path: '/admin/magazine' },
      { label: t?.auditLogs || 'Audit Logs', icon: ClipboardList, path: '/admin/audit' },
>>>>>>> 42cb4602337a17172f6e96ad65b280ca46679939
    ],
  };

  const navItems = NAV_CONFIG[role] ?? NAV_CONFIG.global;

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

        {/* ✅ Logo Section */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '16px' }}>Healing School</h1>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>
                Zonal Manager Report
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ✅ Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {avatar ? (
                <img
                  src={avatar}
                  alt="avatar"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              ) : (
                initial
              )}
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