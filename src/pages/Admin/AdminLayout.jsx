import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header  from '../../components/Header/Header';
import '../GlobalMgr/layout.css';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <Header basePath="/admin" onMenuToggle={() => setSidebarOpen(o => !o)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
