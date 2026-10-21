import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { LogOut, User as UserIcon, CheckSquare, ShieldCheck, FolderGit2, Mail } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleLogout = () => {
        logout();
        showToast('Logged out successfully', 'info');
        navigate('/login');
    };

    return (
        <header className="navbar-container">
            <div className="navbar-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <Link to="/" className="navbar-brand">
                        <CheckSquare size={22} className="brand-icon" style={{ color: 'var(--primary)' }} />
                        <span className="brand-text">TaskMaster</span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="navbar-nav-links" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <NavLink
                            to="/"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                transition: 'all 0.2s ease'
                            })}
                        >
                            <CheckSquare size={16} />
                            <span>Tasks</span>
                        </NavLink>

                        <NavLink
                            to="/projects"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                transition: 'all 0.2s ease'
                            })}
                        >
                            <FolderGit2 size={16} />
                            <span>Projects</span>
                        </NavLink>

                        <NavLink
                            to="/contact"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            style={({ isActive }) => ({
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                transition: 'all 0.2s ease'
                            })}
                        >
                            <Mail size={16} />
                            <span>Contact</span>
                        </NavLink>
                    </nav>
                </div>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <div className="user-profile-section">
                            <div className="user-email-chip" title="Logged in user">
                                <UserIcon size={16} />
                                <span className="user-email-text">{user?.email}</span>
                            </div>
                            <div className="jwt-badge" title="Authenticated via JWT Bearer Token">
                                <ShieldCheck size={14} />
                                <span>JWT</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline btn-logout"
                                title="Sign out of your account"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="auth-links">
                            <Link to="/login" className="btn btn-outline">Login</Link>
                            <Link to="/register" className="btn btn-primary">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
