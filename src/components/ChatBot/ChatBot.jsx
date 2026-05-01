import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, User, Bot, Minimize2 } from 'lucide-react';
import './styles.css';

export default function SupportChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your Zonal Master Support assistant. How can I help you with your reports today?", isBot: true, time: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), text: inputValue, isBot: false, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, isBot: true, time: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (input) => {
    const text = input.toLowerCase();
    if (text.includes('report') || text.includes('submit')) {
      return "To submit a report, go to the 'Reporting Portal' in your sidebar and click 'Submit New Report'. Make sure you select the correct category!";
    }
    if (text.includes('status') || text.includes('active')) {
      return "Account status is managed by the System Administrator. If your account is inactive, please contact your regional office for activation.";
    }
    if (text.includes('hello') || text.includes('hi')) {
      return "Hi there! I'm here to help you navigate the Zonal Master Report portal. What's on your mind?";
    }
    if (text.includes('pdf') || text.includes('export')) {
      return "You can export any report to PDF or Excel by clicking the 'Export' button at the top of the Reporting page.";
    }
    return "I'm not quite sure about that. Would you like me to connect you with a human administrator? Or you can try asking about 'reporting', 'exports', or 'account status'.";
  };

  if (!isOpen) {
    return (
      <button className="chatbot-trigger" onClick={() => setIsOpen(true)}>
        <MessageSquare size={24} />
        <span className="trigger-pulse"></span>
      </button>
    );
  }

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <div className="header-info">
          <div className="bot-status-dot"></div>
          <div>
            <h4>Support Bot</h4>
            <span>Online</span>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setIsOpen(false)}><Minimize2 size={18} /></button>
          <button onClick={() => setIsOpen(false)}><X size={18} /></button>
        </div>
      </div>

      <div className="chatbot-messages" ref={scrollRef}>
        {messages.map(msg => (
          <div key={msg.id} className={`msg-wrapper ${msg.isBot ? 'bot' : 'user'}`}>
            <div className="msg-bubble">
              {msg.text}
              <span className="msg-time">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="msg-wrapper bot">
            <div className="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chatbot-input">
        <input 
          type="text" 
          placeholder="Type a message..." 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={!inputValue.trim()}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
