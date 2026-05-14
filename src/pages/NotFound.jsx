import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <h2 style={{ fontSize: 48, margin: 0 }}>404</h2>
      <p style={{ color: '#666', marginTop: 8 }}>页面不存在</p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginTop: 16,
          color: '#1976d2',
          textDecoration: 'none',
        }}
      >
        ← 返回仪表盘
      </Link>
    </div>
  );
}

export default NotFound;
