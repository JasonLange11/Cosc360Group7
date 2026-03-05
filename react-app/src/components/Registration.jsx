import './Registration.css'

function App() {
  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="page-shell">
      <main className="registration-card">
        

        <form className="form-card" onSubmit={handleSubmit}>
          <section className="field-section">
            <p className="field-label">Email</p>
            <div className="input-row">
              <input type="email" placeholder="Enter your email" />
              <input type="email" placeholder="Re-Enter your email" />
            </div>
          </section>

          <section className="field-section">
            <p className="field-label">Password</p>
            <div className="input-row">
              <input type="password" placeholder="Enter your password" />
              <input type="password" placeholder="Re-Enter your password" />
            </div>
          </section>

          <section className="field-section">
            <p className="field-label">Nickname</p>
            <div className="nickname-row">
              <input type="text" placeholder="Enter your nickname" />
              <label className="terms-label">
                <input type="checkbox" />I agree to the Terms of Service
              </label>
            </div>
          </section>

          <button type="submit" className="signup-button">
            SignUp
          </button>

          <p className="tagline">TouchGrassEvents: Find events. Get out. Touch grass.</p>
        </form>
      </main>
    </div>
  )
}

export default App
