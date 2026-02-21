// src/components/layout/AppLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ProjectModal from '../projects/ProjectModal';

export default function AppLayout() {
  const [showNewProject, setShowNewProject] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar onNewProject={() => setShowNewProject(true)} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Outlet />
      </div>
      {showNewProject && <ProjectModal onClose={() => setShowNewProject(false)} />}
    </div>
  );
}
