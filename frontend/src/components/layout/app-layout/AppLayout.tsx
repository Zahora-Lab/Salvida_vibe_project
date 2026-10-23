import { Outlet } from 'react-router-dom';
import Sidebar from '../sidebar/Sidebar';
import DemoModeBanner from '../../features/app/demo-mode-banner/DemoModeBanner';
import { motion } from 'motion/react';
import { useUIStore } from '@/store/useUIStore';
import './AppLayout.css';

export default function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);

  return (
    <div className="app-layout">
      <DemoModeBanner />
      <div
        className={`app-layout__backdrop${sidebarOpen ? ' app-layout__backdrop--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar />
      <main className="app-layout__main">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="app-layout__content"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
