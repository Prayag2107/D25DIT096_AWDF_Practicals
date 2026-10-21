import { NavLink } from 'react-router-dom';

function NavBar({ theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <div className="container navbar">
        <div className="nav-left">
          <div className="brand">
            <NavLink to="/" className="brand-link">Portfolio</NavLink>
          </div>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/projects">Projects</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
          </ul>
        </div>

        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title="Toggle dark / light mode"
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
