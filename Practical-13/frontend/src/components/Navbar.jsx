import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { LogOut, User as UserIcon, CheckSquare, ShieldCheck } from 'lucide-react';

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
                <Link to="/" className="navbar-brand">
                    <CheckSquare size={22} className="brand-icon" />
                    <span className="brand-text">TaskMaster</span>
                </Link>

                <nav className="navbar-actions">
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
                </nav>
            </div>
        </header>
    );
};

export default Navbar;
