import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Briefcase, TerminalSquare, Settings, Command } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import PromptRunner from './pages/PromptRunner';
import SettingsPage from './pages/Settings';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Command size={28} className="text-primary" />
        <span>Career-Ops</span>
      </div>
      <nav>
        <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/jobs" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Briefcase size={20} /> Jobs Pipeline
        </NavLink>
        <NavLink to="/prompt" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <TerminalSquare size={20} /> Prompt Runner
        </NavLink>
        <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
          <Settings size={20} /> Settings
        </NavLink>
      </nav>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/prompt" element={<PromptRunner />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
