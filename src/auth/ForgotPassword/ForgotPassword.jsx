import React, { useState } from 'react';

const API_BASE = `${process.env.REACT_APP_API_URL}/api/auth`;

export default function ForgotPassword({ onBack }) {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            if (!res.ok) throw new Error(await res.text());
            setMessage("OTP has been sent to your email.");
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
            if (!res.ok) throw new Error(await res.text());
            setMessage("OTP verified. Please enter your new password.");
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });
            if (!res.ok) throw new Error(await res.text());
            setMessage("Password reset successful. You can now login.");
            setTimeout(() => onBack(), 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Forgot Password</h2>
                {error && <div style={styles.error}>{error}</div>}
                {message && <div style={styles.message}>{message}</div>}

                {step === 1 && (
                    <form onSubmit={handleRequestOtp}>
                        <p style={styles.text}>Enter your email to receive a 6-digit OTP.</p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            style={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading} style={styles.button}>
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {step === 2 && (
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
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                <button onClick={onBack} style={styles.backButton}>Back to Login</button>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f4f5f7' },
    card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center' },
    title: { marginBottom: '1rem', color: '#1a2e45' },
    input: { width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' },
    button: { width: '100%', padding: '0.75rem', background: '#c8a951', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    backButton: { background: 'none', border: 'none', color: '#666', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' },
    error: { color: '#e05a5a', marginBottom: '1rem', fontSize: '0.9rem' },
    message: { color: '#2e7d32', marginBottom: '1rem', fontSize: '0.9rem' },
    text: { color: '#555', marginBottom: '1rem', fontSize: '0.9rem' }
}
