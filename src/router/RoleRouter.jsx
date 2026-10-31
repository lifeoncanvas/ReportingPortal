import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

import ZonalMgrLayout  from '../pages/ZonalMgr/ZonalMgrLayout';
import AdminLayout     from '../pages/Admin/AdminLayout';
import SubmitReport from '../pages/Report/SubmitReport';
import ZonalInformationForm from '../pages/Report/ZonalInformationForm';

import ReportingPortal  from '../pages/GlobalMgr/ReportingPortal/ReportingPortal';

import ZonalDashboard      from '../pages/ZonalMgr/Dashboard/Dashboard';
import ZonalReportingTabs  from '../pages/ZonalMgr/ReportingPortal/ZonalReportingTabs';
import ZonalAnalytics      from '../pages/ZonalMgr/Analytics/Analytics';

import AdminDashboard   from '../pages/Admin/Dashboard/Dashboard';
import UserManagement   from '../pages/Admin/UserManagement/UserManagement';
import AdminAnalytics   from '../pages/Admin/Analytics/Analytics';
import AdminAuditLogs   from '../pages/Admin/AuditLogs/AuditLogs';

import Notifications from '../pages/common/Notifications/Notifications';
import Settings      from '../pages/common/Settings/Settings';

export default function RoleRouter() {
  const { user } = useAuth();

  if (user === null) return <Navigate to="/login" replace />;

  if (user?.role?.toLowerCase() === 'admin') {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="users"          element={<UserManagement />} />
          <Route path="reporting"      element={<ReportingPortal />} />
          <Route path="analytics"      element={<AdminAnalytics />} />
          <Route path="audit"          element={<AdminAuditLogs />} />
          <Route path="notifications"  element={<Notifications />} />
          <Route path="settings"       element={<Settings />} />
          <Route path="submit-report"  element={<SubmitReport />} />
          <Route path="zonal-info"     element={<ZonalInformationForm />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    );
  }

  // All other users (zonal managers)
  return (
    <Routes>
      <Route path="/zonal" element={<ZonalMgrLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<ZonalDashboard />} />
        <Route path="reporting"     element={<ZonalReportingTabs />} />
        <Route path="analytics"     element={<ZonalAnalytics />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings"      element={<Settings />} />
        <Route path="submit-report" element={<SubmitReport />} />
        <Route path="zonal-info"    element={<ZonalInformationForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/zonal/dashboard" replace />} />
    </Routes>
  );
}
