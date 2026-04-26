import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

import GlobalMgrLayout from '../pages/GlobalMgr/GlobalMgrLayout';
import ZonalMgrLayout  from '../pages/ZonalMgr/ZonalMgrLayout';
import AdminLayout     from '../pages/Admin/AdminLayout';
import SubmitReport from '../pages/Report/SubmitReport';

import GlobalDashboard  from '../pages/GlobalMgr/Dashboard/Dashboard';
import ReportingPortal  from '../pages/GlobalMgr/ReportingPortal/ReportingPortal';
import FinancePortal    from '../pages/GlobalMgr/FinancePortal/FinancePortal';
import Analytics        from '../pages/GlobalMgr/Analytics/Analytics';
import GlobalAuditLogs  from '../pages/GlobalMgr/AuditLogs/AuditLogs';

import ZonalDashboard      from '../pages/ZonalMgr/Dashboard/Dashboard';
import ZonalReportingTabs  from '../pages/ZonalMgr/ReportingPortal/ZonalReportingTabs';
import ZonalAnalytics      from '../pages/ZonalMgr/Analytics/Analytics';
import Magazine            from '../pages/ZonalMgr/Magazine/Magazine';


import AdminDashboard   from '../pages/Admin/Dashboard/Dashboard';
import UserManagement   from '../pages/Admin/UserManagement/UserManagement';
import AdminReporting   from '../pages/Admin/ReportingPortal/ReportingPortal';
import AdminFinance     from '../pages/Admin/FinancePortal/FinancePortal';
import AdminAnalytics   from '../pages/Admin/Analytics/Analytics';
import AdminAuditLogs   from '../pages/Admin/AuditLogs/AuditLogs';

import Notifications from '../pages/common/Notifications/Notifications';
import Settings      from '../pages/common/Settings/Settings';

export default function RoleRouter() {
  const { user } = useAuth();

  if (user === null) return <Navigate to="/login" replace />;

  if (user?.role === 'global') {
    return (
      <Routes>
        <Route path="/global" element={<GlobalMgrLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<GlobalDashboard />} />
          <Route path="reporting"     element={<ReportingPortal />} />
          <Route path="finance"       element={<FinancePortal />} />
          <Route path="analytics"     element={<Analytics />} />
          <Route path="magazine"      element={<Magazine />} />
          <Route path="audit"         element={<GlobalAuditLogs />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings"      element={<Settings />} />
          <Route path="submit-report" element={<SubmitReport />} />
        </Route>
        <Route path="*" element={<Navigate to="/global/dashboard" replace />} />
      </Routes>
    );
  }

  if (user?.role === 'zonal') {
    return (
      <Routes>
        <Route path="/zonal" element={<ZonalMgrLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"     element={<ZonalDashboard />} />
          <Route path="reporting"     element={<ZonalReportingTabs />} />
          <Route path="analytics"     element={<ZonalAnalytics />} />
          <Route path="magazine"      element={<Magazine />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings"      element={<Settings />} />
          <Route path="submit-report" element={<SubmitReport />} />
        </Route>
        <Route path="*" element={<Navigate to="/zonal/dashboard" replace />} />
      </Routes>
    );
  }

  if (user?.role === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="users"          element={<UserManagement />} />
          <Route path="reporting"      element={<AdminReporting />} />
          <Route path="finance"        element={<AdminFinance />} />
          <Route path="analytics"      element={<AdminAnalytics />} />
          <Route path="magazine"       element={<Magazine />} />
          <Route path="audit"          element={<AdminAuditLogs />} />
          <Route path="notifications"  element={<Notifications />} />
          <Route path="settings"       element={<Settings />} />
          <Route path="submit-report" element={<SubmitReport />} />


        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  return <p style={{ padding: '2rem', color: '#6b7280' }}>Role not configured.</p>;
}