import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header  from '../../components/Header/Header';
import '../GlobalMgr/layout.css'; // reuse same layout CSS

export default function ZonalMgrLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <Header basePath="/zonal" />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}