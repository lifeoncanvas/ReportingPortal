import React, { useState } from 'react';
import { X, MessageCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import './styles.css';

const KC_URL = 'https://kingschat.online/conversations';

export default function KingsChatWidget() {
  const { user }  = useAuth();
  const [open,    setOpen]    = useState(false);
  const [entered, setEntered] = useState(false);

  return (
    <>
      {/* ── Floating Button ── */}
      <button
        className={`kc-fab ${open ? 'kc-fab-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="KingsChat Messaging"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* ── Panel ── */}
      {open && (
        <div className="kc-panel">
          {/* Header */}
          <div className="kc-panel-header">
            <div className="kc-panel-title">
              <div className="kc-logo">
                <MessageCircle size={16} color="#fff" />
              </div>
              <div>
                <p>KingsChat</p>
                <span>Loveworld Messaging</span>
              </div>
            </div>
            <div className="kc-panel-actions">
              <a
                href={KC_URL}
                target="_blank"
                rel="noreferrer"
                className="kc-open-btn"
                title="Open in full screen"
              >
                <ExternalLink size={14} />
              </a>
              <button className="kc-close-btn" onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="kc-panel-body">
            {!entered ? (
              /* ── Prompt screen ── */
              <div className="kc-login-screen">
                <div className="kc-login-icon">
                  <MessageCircle size={36} color="#4f46e5" />
                </div>
                <h3>KingsChat Messaging</h3>
                <p>
                  Connect and chat with your peers, global managers and team
                  members directly from this dashboard using KingsChat.
                </p>

                <div className="kc-user-hint">
                  <div className="kc-user-avatar">
                    {user?.firstName?.[0] ?? 'U'}
                  </div>
                  <div>
                    <p>{user?.name}</p>
                    <span>{user?.email}</span>
                  </div>
                </div>

                <button className="kc-login-btn" onClick={() => setEntered(true)}>
                  <MessageCircle size={16} />
                  Open KingsChat
                </button>

                <p className="kc-note">
                  Sign in with your KingsChat credentials inside the chat window.
                </p>
              </div>
            ) : (
              /* ── Embedded KingsChat ── */
              <iframe
                src={KC_URL}
                title="KingsChat"
                className="kc-iframe"
                allow="microphone; camera; notifications"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
