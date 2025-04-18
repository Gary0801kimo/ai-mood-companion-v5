
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [lang, setLang] = useState('zh'); i18n.changeLanguage('zh');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    const res = await fetch('/.netlify/functions/gpt-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages, lang })
    });
    const data = await res.json();

    const botMessage = {
      role: 'assistant',
      content: data.reply,
      quote: data.quote,
      depressionRisk: data.depressionRisk,
      quote: data.quote,
      depressionRisk: data.depressionRisk
    };
    setMessages([...updatedMessages, botMessage]);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        keepalive: true
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages]);

  return (
    <div style={{
      backgroundImage: 'url(/bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#ffffffcc', padding: '1rem', borderRadius: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>AI Mood Companion</h2>
          <span style={{ marginRight: 8 }}>🌐</span><select value={lang} onChange={(e) => {
            setLang(e.target.value);
            i18n.changeLanguage(e.target.value);
          }}>
            <option value="zh">繁體中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="th">ไทย</option>
            <option value="fil">Filipino</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>

        <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              textAlign: m.role === 'user' ? 'right' : 'left',
              margin: '0.5rem 0'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                background: m.role === 'user' ? '#d0f0ff' : '#f4f4f4'
              }}>
                <div>{m.role === 'user' ? '你' : '🌤️'}：{m.content}</div>
                {m.quote && (
                  <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                    💬 金句：「{m.quote}」<br />
                    🧠 憂鬱傾向：{m.depressionRisk}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('message_placeholder')}
            style={{ flex: 1, padding: '0.5rem', fontSize: '1rem', borderRadius: '0.5rem 0 0 0.5rem', border: '1px solid #ccc' }}
          />
          <button onClick={handleSend} style={{
            padding: '0.5rem 1rem',
            borderRadius: '0 0.5rem 0.5rem 0',
            background: '#00aaff',
            color: '#fff',
            border: 'none'
          }}>{t('send')}</button>
        </div>
      </div>
    </div>
  );
}

export default App;
