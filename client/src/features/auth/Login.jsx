import './Login.css'
import { Link } from 'react-router-dom'
import { HeaderWithoutNav } from '../../components/Header'
import { useState } from 'react'
import { loginUser } from '../../lib/auth' 

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
     const [formError, setFormError] = useState("");

    async function handleSubmit(event){
        event.preventDefault();
        setFormError('');

        try{
            const result = await loginUser({email, password});
            console.log('Logged in: ', result)
        }catch (error){
            setFormError('Invalid email or password');
            console.error(error.message);
        }
    }

    return (
        <div className="login-shell">

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
                            className="login-input"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
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
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </section>

                    <label className="login-remember-label">
                        <input type="checkbox" />
                        <span>Remember Me</span>
                    </label>

                    <br></br>
                    <span>{formError}</span>

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