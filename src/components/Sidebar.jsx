import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/', icon: '📊', label: '仪表盘' },
  { to: '/agents', icon: '🤖', label: 'Agent 管理' },
  { to: '/tasks', icon: '📋', label: '任务管理' },
  { to: '/settings', icon: '⚙️', label: '系统设置' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__logo">⚡</span>
        <h1 className="sidebar__title">Agent SaaS</h1>
      </div>
      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span className="sidebar__icon">{item.icon}</span>
            <span className="sidebar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        <span className="sidebar__version">v1.0.0</span>
      </div>
    </aside>
  );
}

export default Sidebar;
