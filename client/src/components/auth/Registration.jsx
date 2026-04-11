import './css/Registration.css'
import { HeaderWithoutNav } from '../ui/Header.jsx'
import { useEffect, useState } from 'react'
import { registerUser } from '../../lib/auth.js'
import { useNavigate } from 'react-router-dom'
import { uploadProfileImage } from '../../lib/uploadsApi.js'
import { updateMyProfile } from '../../lib/usersApi.js'
import { useAuth } from '../../context/AuthContext.jsx'

// TODO: Need to make a good css look for formError. Should probably be a error next to the signup button.

function Registration({ modal = false, onClose }) {
  const { completeLogin, refreshCurrentUser } = useAuth()
  
  const [email, setEmail] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");

  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const [name, setName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [formError, setFormError] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidVerifyEmail, setInvalidVerifyEmail] = useState(false);
  const [invalidPassword, setInvalidPassword] = useState(false);
  const [invalidVerifyPassword, setInvalidVerifyPassword] = useState(false);
  const [invalidName, setInvalidName] = useState(false);
  const [invalidTerms, setInvalidTerms] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);

  const emailsMatch = email.trim() === verifyEmail.trim();
  const passwordsMatch = password.trim() === verifyPassword.trim();
  const navigate = useNavigate();

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
  
  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setInvalidEmail(false);
    setInvalidVerifyEmail(false);
    setInvalidPassword(false);
    setInvalidVerifyPassword(false);
    setInvalidName(false);
    setInvalidTerms(false);

    const trimmedEmail = email.trim();
    const trimmedVerifyEmail = verifyEmail.trim();
    const trimmedPassword = password.trim();
    const trimmedVerifyPassword = verifyPassword.trim();
    const trimmedName = name.trim();

    if (!trimmedEmail || !trimmedVerifyEmail || !trimmedPassword || !trimmedVerifyPassword || !trimmedName) {
      setInvalidEmail(!trimmedEmail);
      setInvalidVerifyEmail(!trimmedVerifyEmail);
      setInvalidPassword(!trimmedPassword);
      setInvalidVerifyPassword(!trimmedVerifyPassword);
      setInvalidName(!trimmedName);
      setFormError('Please fill in all required fields');
      return;
    }

    if(!emailsMatch){
      setFormError('Emails do not match');
      setInvalidEmail(true);
      setInvalidVerifyEmail(true);
      return;
    }

    if(!passwordsMatch){
      setFormError('Passwords do not match');
      setInvalidPassword(true);
      setInvalidVerifyPassword(true);
      return;
    }

    if(!termsAccepted){
      setFormError('You must agree to the Terms of Service');
      setInvalidTerms(true);
      return;
    }
    
    try{
      const result = await registerUser({email, password, name});
      completeLogin(result, true)

      if (profileImageFile) {
        const uploadedImage = await uploadProfileImage(profileImageFile)

        if (uploadedImage?.imageUrl) {
          await updateMyProfile({ profileImageUrl: uploadedImage.imageUrl })
          await refreshCurrentUser()
        }
      }

      navigate('/');

    }catch(error){
      setFormError(error.message || 'Failed to sign up');
      setInvalidEmail(true);
    }
    
  }

  return (
    <div className={modal ? "auth-overlay" : "page-shell"} onClick={handleWrapperClick}>
      <div className={modal ? "auth-shell" : ""} onClick={handleShellClick}>
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
              className={invalidEmail ? 'invalid' : ''}
              onChange={(event) => {
                setEmail(event.target.value);
                setInvalidEmail(false);
                setFormError('');
              }} 
              required/>
              <input type="email" 
              placeholder="Re-Enter your email"
              value={verifyEmail}
              className={invalidVerifyEmail ? 'invalid' : ''}
              onChange={(event) => {
                setVerifyEmail(event.target.value);
                setInvalidVerifyEmail(false);
                setFormError('');
              }}
              required />
            </div>
          </section>

          <section className="field-section">
            <p className="field-label">Password</p>
            <div className="input-row">
              <input type="password" 
              placeholder="Enter your password"
              value={password}
              className={invalidPassword ? 'invalid' : ''}
              onChange={(event) => {
                setPassword(event.target.value);
                setInvalidPassword(false);
                setFormError('');
              }}
              required />
              <input type="password" 
              placeholder="Re-Enter your password"
              value={verifyPassword}
              className={invalidVerifyPassword ? 'invalid' : ''}
              onChange={(event) => {
                setVerifyPassword(event.target.value);
                setInvalidVerifyPassword(false);
                setFormError('');
              }} />
            </div>
          </section>

          <section className="field-section">
            <p className="field-label">Nickname</p>
            <div className="nickname-row">
              <input type="text" 
              placeholder="Enter your nickname"
              value={name}
              className={invalidName ? 'invalid' : ''}
              onChange={(event) => {
                setName(event.target.value);
                setInvalidName(false);
                setFormError('');
              }}
              required />
              <label className={invalidTerms ? 'terms-label invalid-terms' : 'terms-label'}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(event) => {
                    setTermsAccepted(event.target.checked);
                    setInvalidTerms(false);
                    setFormError('');
                  }}
                />I agree to the Terms of Service
              </label>
            </div>
          </section>

          <section className="field-section">
            <p className="field-label">Profile Picture (optional)</p>
            <div className="picture-row">
              <label className="picture-button" htmlFor="signup-picture-input">
                Choose picture
              </label>
              <input
                id="signup-picture-input"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="picture-input-hidden"
                onChange={(event) => setProfileImageFile(event.target.files?.[0] || null)}
              />
              <span className="picture-filename">
                {profileImageFile ? profileImageFile.name : 'No file selected'}
              </span>
            </div>
          </section>

          <button type="submit" className="signup-button">
            SignUp
          </button>

          <span className={formError ? 'error-message' : ''}>{formError}</span>

          <p className="tagline">TouchGrassEvents: Find events. Get out. Touch grass.</p>
        </form>

        <section className="signup-image">
          <img src="../../../assets/okanagan-valley.jpg" alt="Picture of the Okanagan"></img>
        </section>
      </main>
      </div>
    </div>
  )
}

export default Registration