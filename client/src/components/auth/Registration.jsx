import './css/Registration.css'
import { HeaderWithoutNav } from '../ui/Header.jsx'
import { useState} from 'react'
import { registerUser } from '../../lib/auth.js'
import { useNavigate } from 'react-router-dom'

// TODO: Need to make a good css look for formError. Should probably be a error next to the signup button.

function Registration() {
  
  const [email, setEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");

  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const [name, setName] = useState("");

  const [formError, setFormError] = useState("");

  const emailsMatch = email.trim() === verifyEmail.trim();
  const passwordsMatch = password.trim() === verifyPassword.trim();
  const navigate = useNavigate();
  
  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    if(!emailsMatch){
      setFormError('Emails do not match');
      return;
    }

    if(!passwordsMatch){
      setFormError('Passwords do not match');
      return;
    }
    
    try{
      const result = await registerUser({email, password, name});
      console.log('Registered: ', result)
      navigate('/');

    }catch(error){
      setFormError(error.message);
    }
    
  }

  return (
    <div className="page-shell">

      <main className="registration-card">
      <div className="registration-header">
        <HeaderWithoutNav />
      </div>
        <form className="form-card" onSubmit={handleSubmit}>
          <section className="field-section">
            <p className="field-label">Email</p>
            <div className="input-row">
              <input type="email" 
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)} 
              required/>
              <input type="email" 
              placeholder="Re-Enter your email"
              value={verifyEmail}
              onChange={(event) => setVerifyEmail(event.target.value)}
              required />
            </div>
          </section>

          <section className="field-section">
            <p className="field-label">Password</p>
            <div className="input-row">
              <input type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required />
              <input type="password" 
              placeholder="Re-Enter your password"
              value={verifyPassword}
              onChange={(event) => setVerifyPassword(event.target.value)} />
            </div>
          </section>

          <section className="field-section">
            <p className="field-label">Name</p>
            <div className="name-row">
              <input type="text" 
              placeholder="Enter your name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required />
              <label className="terms-label">
                <input type="checkbox" />I agree to the Terms of Service
              </label>
            </div>
          </section>

          <button type="submit" className="signup-button">
            SignUp
          </button>

          <span>{formError}</span>

          <p className="tagline">TouchGrassEvents: Find events. Get out. Touch grass.</p>
        </form>
      </main>
    </div>
  )
}

export default Registration
