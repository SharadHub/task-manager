'use client';
import { useState, useEffect } from 'react';
import { getProjects } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import TasksView from '../components/TasksView';
import ProjectsView from '../components/ProjectsView';
import HistoryView from '../components/HistoryView';
import AnalyticsView from '../components/AnalyticsView';

export default function Home() {
  const [activeView, setActiveView] = useState('dashboard');
  const [viewProps, setViewProps] = useState({});
  const [projects, setProjects] = useState([]);

  const loadProjects = () => {
    getProjects().then(setProjects).catch(() => {});
  };
  useEffect(loadProjects, []);

  const handleNav = (view, props = {}) => {
    setActiveView(view);
    setViewProps(props);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard onNav={handleNav} />;
      case 'tasks': return <TasksView key={JSON.stringify(viewProps)} initialFilters={viewProps} />;
      case 'projects': return <ProjectsView onNav={handleNav} />;
      case 'history': return <HistoryView />;
      case 'analytics': return <AnalyticsView />;
      default: return <Dashboard onNav={handleNav} />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar active={activeView} onNav={handleNav} projects={projects} />
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </main>
    </div>
  );
}
