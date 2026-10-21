import { NavLink } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="navbar" aria-label="Main navigation">
      <ul>
        <li>
          <NavLink to="/" end>🏠 Home</NavLink>
        </li>
        <li>
          <NavLink to="/projects">📂 Projects</NavLink>
        </li>
        <li>
          <NavLink to="/contact">✉️ Contact</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default NavBar;
