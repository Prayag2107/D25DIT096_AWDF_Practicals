import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { UserPlus, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // If already logged in, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password) {
            setError('All fields are required.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await register(email.trim(), password);
            showToast('Account created successfully! Logging you in...', 'success');
            // Seamless auto-login right after registration
            await login(email.trim(), password);
            navigate('/', { replace: true });
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page-container">
            <div className="card auth-card">
                <div className="auth-header">
                    <div className="auth-icon-circle">
                        <UserPlus size={26} color="var(--primary)" />
                    </div>
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Register to manage your personal tasks securely</p>
                </div>

                {error && (
                    <div className="auth-error-alert">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-email">
                            Email Address
                        </label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon" />
                            <input
                                id="reg-email"
                                type="email"
                                className="form-input with-left-icon"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-password">
                            Password <span className="label-hint">(min 6 characters)</span>
                        </label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                id="reg-password"
                                type="password"
                                className="form-input with-left-icon"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="reg-confirm-password">
                            Confirm Password
                        </label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon" />
                            <input
                                id="reg-confirm-password"
                                type="password"
                                className="form-input with-left-icon"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => {
                                    setConfirmPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner" style={{ width: '1.2rem', height: '1.2rem' }}></div>
                                <span>Creating Account...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign Up</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Already have an account? </span>
                    <Link to="/login" className="auth-switch-link">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
