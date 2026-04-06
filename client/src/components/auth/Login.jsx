import './css/Login.css'
import { Link, useNavigate } from 'react-router-dom'
import { HeaderWithoutNav } from '../ui/Header'
import { useEffect, useState } from 'react'
import { loginUser } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login({ modal = false, onClose }) {

    const { completeLogin } = useAuth()
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [formError, setFormError] = useState("");
    const [invalidEmail, setInvalidEmail] = useState(false);
    const [invalidPassword, setInvalidPassword] = useState(false);

    useEffect(() => {
        if (!modal) {
            return;
        }

        function handleEscape(event) {
            if (event.key === 'Escape' && typeof onClose === 'function') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [modal, onClose]);

    function handleClose() {
        if (typeof onClose === 'function') {
            onClose();
            return;
        }

        navigate('/');
    }

    function handleWrapperClick() {
        if (modal) {
            handleClose();
        }
    }

    function handleShellClick(event) {
        if (modal) {
            event.stopPropagation();
        }
    }

    async function handleSubmit(event){
        event.preventDefault();
        setFormError('');
        setInvalidEmail(false);
        setInvalidPassword(false);

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail || !trimmedPassword) {
            setInvalidEmail(!trimmedEmail);
            setInvalidPassword(!trimmedPassword);
            setFormError('Email and password are required');
            return;
        }

        try{
            const result = await loginUser({email, password});

            completeLogin(result);
            navigate('/');
        }catch (error){
            setFormError(error.message || 'Invalid email or password');
            setInvalidEmail(true);
            setInvalidPassword(true);
            console.error(error.message);
        }
    }

    return (
        <div className={modal ? "auth-overlay" : "login-shell"} onClick={handleWrapperClick}>
            <div className={modal ? "auth-shell" : ""} onClick={handleShellClick}>
            <main className="login-card">
                <div className="login-header">
                    <HeaderWithoutNav />
                </div>
                <form className="login-form" onSubmit={handleSubmit}>
                    <section className="login-field-section">
                        <label className="login-field-label" htmlFor="login-email">
                            Email
                        </label>
                        <input
                            id="login-email"
                            className={`login-input ${invalidEmail ? 'invalid' : ''}`}
                            type="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setInvalidEmail(false);
                                setFormError('');
                            }}
                            placeholder="Enter your email"
                            required
                        />
                    </section>

                    <section className="login-field-section">
                        <label className="login-field-label" htmlFor="login-password">
                            Password
                        </label>
                        <input
                            id="login-password"
                            className={`login-input ${invalidPassword ? 'invalid' : ''}`}
                            type="password"
                            value={password}
                            onChange={(event) => {
                                setPassword(event.target.value);
                                setInvalidPassword(false);
                                setFormError('');
                            }}
                            placeholder="Enter your password"
                            required
                        />
                    </section>

                    <label className="login-remember-label">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                        />
                        <span>Remember Me</span>
                    </label>

                    <span className={formError ? 'error-message' : ''}>{formError}</span>

                    <section className="login-button-section">
                        <button type="submit" className="login-button login-button-primary">
                            Login
                        </button>
                        <Link to="/signup" className="login-button login-button-secondary">
                            Signup
                        </Link>
                    </section>

                    <p className="login-tagline">TouchGrassEvents: Find events. Get out. Touch grass.</p>
                </form>
                <section className="login-image"> 
                    <img src="../../../assets/okanagan-valley.jpg" alt="Picture of the Okanagan"></img>
                </section>
            </main>
            </div>
        </div>
    )
}