import PropTypes from 'prop-types';
import './StatCard.css';

function StatCard({ label, value, icon, color }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }}>
      <div className="stat-card__icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-card__content">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__label">{label}</span>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
};

StatCard.defaultProps = {
  color: '#1976d2',
};

export default StatCard;
