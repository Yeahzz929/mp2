import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navigation.module.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          🍽️ Meal Explorer
        </Link>
        <div className={styles.navLinks}>
          <Link 
            to="/" 
            className={`${styles.navLink} ${location.pathname === '/' ? styles.active : ''}`}
          >
            Search
          </Link>
          <Link 
            to="/gallery" 
            className={`${styles.navLink} ${location.pathname === '/gallery' ? styles.active : ''}`}
          >
            Gallery
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
