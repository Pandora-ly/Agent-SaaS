import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout__main">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
