import React, { useState } from 'react';

const getApiBase = () => {
    return (window.ENV?.API_PATH || process.env.REACT_APP_API_URL || 'http://65.1.248.88:8081') + '/api/auth';
};

const API_BASE = getApiBase();

export default function ForgotPassword({ onBack }) {
    const [step, setStep] = useState(1); // 1: Email/Method, 2: Verify (OTP or Question), 3: New Password, 4: Success
    const [recoveryMethod, setRecoveryMethod] = useState('otp'); // 'otp' or 'security'
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [securityQuestion, setSecurityQuestion] = useState("");
    const [securityAnswer, setSecurityAnswer] = useState("");
    const [securityAnswer2, setSecurityAnswer2] = useState("");
    const [securityAnswer3, setSecurityAnswer3] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showSetupForm, setShowSetupForm] = useState(false);

    const handleRequestOtp = async (e) => {
        if (e) e.preventDefault();
        if (!email) { setError("Email is required."); return; }
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Server error (${res.status}).`);
            }
            setMessage("OTP has been sent to your email.");
            setStep(2);
        } catch (err) {
            console.error("Forgot Password Error:", err);
            setError(err.message || "An unexpected error occurred.");
            if (err.message.includes("Security Question")) {
                // Hint to use security question if email fails
                // setRecoveryMethod('security'); // We can auto-switch or just let the user click
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFetchQuestion = async () => {
        if (!email) { setError("Email is required."); return; }
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const res = await fetch(`${API_BASE}/security-question?email=${encodeURIComponent(email)}`);
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Could not fetch security question.");
            }
            const data = await res.json();
            setSecurityQuestion(data.question);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Invalid OTP.");
            }
            setMessage("OTP verified. Please enter your new password.");
            setStep(3);
        } catch (err) {
            setError(err.message || "Failed to verify OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");
        try {
            let url = `${API_BASE}/reset-password`;
            let body = { email, otp, newPassword };

            if (recoveryMethod === 'security') {
                if (securityQuestion === 'NOT_SET') {
                    url = `${API_BASE}/reset-password-set-questions`;
                    body = { 
                        email, 
                        answer1: securityAnswer, 
                        answer2: securityAnswer2, 
                        answer3: securityAnswer3, 
                        newPassword 
                    };
                } else {
                    url = `${API_BASE}/reset-password-security`;
                    if (securityQuestion === 'SET_3_QUESTIONS') {
                        body = { 
                            email, 
                            answer1: securityAnswer, 
                            answer2: securityAnswer2, 
                            answer3: securityAnswer3, 
                            newPassword 
                        };
                    } else {
                        body = { email, answer: securityAnswer, newPassword };
                    }
                }
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to reset password.");
            }
            setMessage("");
            setStep(4);
        } catch (err) {
            setError(err.message || "An error occurred during password reset.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Forgot Password</h2>
                
                {step === 1 && (
                    <div style={styles.tabs}>
                        <button 
                            style={recoveryMethod === 'otp' ? styles.activeTab : styles.tab} 
                            onClick={() => { setRecoveryMethod('otp'); setError(""); }}
                        >
                            Via OTP
                        </button>
                        <button 
                            style={recoveryMethod === 'security' ? styles.activeTab : styles.tab} 
                            onClick={() => { setRecoveryMethod('security'); setError(""); }}
                        >
                            Via Security Question
                        </button>
                    </div>
                )}

                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.message}>{message}</div>}

                {step === 1 && (
                    <form onSubmit={recoveryMethod === 'otp' ? handleRequestOtp : (e) => { e.preventDefault(); handleFetchQuestion(); }}>
                        <p style={styles.text}>
                            {recoveryMethod === 'otp' 
                                ? "Enter your email to receive a 6-digit OTP." 
                                : "Enter your email to retrieve your security question. If you haven't set one yet, we'll help you set it up."}
                        </p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? "Processing..." : (recoveryMethod === 'otp' ? "Send OTP" : "Get Question / Start Setup")}
                        </button>
                    </form>
                )}

                {step === 2 && recoveryMethod === 'otp' && (
                    <form onSubmit={handleVerifyOtp}>
                        <p style={styles.text}>Enter the 6-digit code sent to {email}.</p>
                        <input
                            type="text"
                            placeholder="6-Digit OTP"
                            style={styles.input}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && recoveryMethod === 'security' && (
                    <div style={{ textAlign: 'left' }}>
                        {securityQuestion === 'NOT_SET' ? (
                            <>
                                <p style={styles.text}>It looks like you haven't set your security questions yet. Please set them now to reset your password:</p>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={styles.label}>1. What is your mother's maiden name?</label>
                                    <input type="password" placeholder="Your Answer" style={styles.input}
                                        value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={styles.label}>2. What was the name of your first school?</label>
                                    <input type="password" placeholder="Your Answer" style={styles.input}
                                        value={securityAnswer2} onChange={(e) => setSecurityAnswer2(e.target.value)} required />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={styles.label}>3. What is the name of your favorite pet?</label>
                                    <input type="password" placeholder="Your Answer" style={styles.input}
                                        value={securityAnswer3} onChange={(e) => setSecurityAnswer3(e.target.value)} required />
                                </div>
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                                    <p style={styles.text}>Enter your new password:</p>
                                    <input type="password" placeholder="New Password" style={styles.input}
                                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                    <button onClick={handleResetPassword} disabled={loading} style={styles.button}>
                                        {loading ? "Updating..." : "Save Questions & Reset Password"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {securityQuestion === 'SET_3_QUESTIONS' ? (
                                    <>
                                        <p style={styles.text}>Please answer your security questions:</p>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={styles.label}>1. What is your mother's maiden name?</label>
                                            <input
                                                type="password"
                                                placeholder="Your Answer"
                                                style={styles.input}
                                                value={securityAnswer}
                                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={styles.label}>2. What was the name of your first school?</label>
                                            <input
                                                type="password"
                                                placeholder="Your Answer"
                                                style={styles.input}
                                                value={securityAnswer2}
                                                onChange={(e) => setSecurityAnswer2(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={styles.label}>3. What is the name of your favorite pet?</label>
                                            <input
                                                type="password"
                                                placeholder="Your Answer"
                                                style={styles.input}
                                                value={securityAnswer3}
                                                onChange={(e) => setSecurityAnswer3(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p style={{ ...styles.text, fontWeight: 'bold', color: '#1a2e45' }}>{securityQuestion}</p>
                                        <input
                                            type="text"
                                            placeholder="Your Answer"
                                            style={styles.input}
                                            value={securityAnswer}
                                            onChange={(e) => setSecurityAnswer(e.target.value)}
                                            required
                                        />
                                    </>
                                )}
                                
                                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #eee' }}>
                                    <p style={styles.text}>Enter your new password:</p>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        style={styles.input}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <button onClick={handleResetPassword} disabled={loading} style={styles.button}>
                                        {loading ? "Updating..." : "Verify & Change Password"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleResetPassword}>
                        <p style={styles.text}>Create a new strong password.</p>
                        <input
                            type="password"
                            placeholder="New Password"
                            style={styles.input}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? "Updating..." : "Change Password"}
                        </button>
                    </form>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                        <h3 style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>Success!</h3>
                        <p style={styles.text}>Your password has been updated successfully.</p>
                        <button onClick={onBack} style={{ ...styles.button, marginTop: '1rem' }}>
                            Go to Login
                        </button>
                    </div>
                )}

                {step !== 4 && (
                    <button onClick={onBack} style={styles.backButton}>Back to Login</button>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f5f7' },
    card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    title: { marginBottom: '1rem', color: '#1a2e45' },
    tabs: { display: 'flex', marginBottom: '1.5rem', borderBottom: '1px solid #eee' },
    tab: { flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', color: '#666', fontSize: '0.9rem' },
    activeTab: { flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: '2px solid #c8a951', cursor: 'pointer', color: '#c8a951', fontWeight: 'bold', fontSize: '0.9rem' },
    input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '0.75rem', background: '#c8a951', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    backButton: { background: 'none', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' },
    error: { color: '#e05a5a', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#fff1f1', borderRadius: '4px' },
    message: { color: '#2e7d32', marginBottom: '1rem', fontSize: '0.9rem', padding: '0.5rem', background: '#f1f8f1', borderRadius: '4px' },
    text: { color: '#555', marginBottom: '1rem', fontSize: '0.9rem' },
    label: { display: 'block', fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem', textAlign: 'left' }
}
