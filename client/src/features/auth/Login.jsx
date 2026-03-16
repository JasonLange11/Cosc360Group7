import './Login.css'
import {Link} from 'react-router-dom'
import { HeaderWithoutNav } from '../../components/Header'

export default function Login() {
    return (
        <div className="login-shell">

            <main className="login-card">
                <div className="login-header">
                    <HeaderWithoutNav />
                </div>
                <form className="login-form">
                    <section className="login-field-section">
                        <label className="login-field-label" htmlFor="login-email">
                            Email
                        </label>
                        <input
                            id="login-email"
                            className="login-input"
                            type="email"
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
                            className="login-input"
                            type="password"
                            placeholder="Enter your password"
                            required
                        />
                    </section>

                    <label className="login-remember-label">
                        <input type="checkbox" />
                        <span>Remember Me</span>
                    </label>

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
            </main>
        </div>
    )
}