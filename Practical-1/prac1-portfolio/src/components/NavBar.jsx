import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="site-nav">
      <div className="nav-brand">Portfolio</div>
      <ul className="nav-links">
        <li>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
            About
          </NavLink>
        </li>
        <li>
          <NavLink to="/skills" className={({ isActive }) => (isActive ? 'active' : '')}>
            Skills
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
