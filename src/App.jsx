import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';
import './i18n';

export default function App() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages }),
          keepalive: true
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setInput('');

    const res = fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: '你是一個溫暖療癒的 AI，請針對用戶心情回應、給一段金句，並判斷憂鬱傾向（高、中、低）。請回傳 JSON 格式：content、quote、depressionRisk。'
          },
          { role: 'user', content: input }
        ]
      })
    });
    const data = res.json();
    const gpt = JSON.parse(data.choices[0].message.content);
    const aiMsg = {
      role: 'assistant',
      content: gpt.content,
      quote: gpt.quote,
      depressionRisk: gpt.depressionRisk
    };
    setMessages(prev => [...prev, aiMsg]);
  };

    const res = fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    const result = res.json();
    if (res.ok) {
      alert('✅ 測試寄信成功！');
      console.log(result);
    } else {
      alert('❌ 測試寄信失敗！');
      console.error(result);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      background: 'rgba(255,255,255,0.85)',
      maxWidth: '700px',
      margin: '2rem auto',
      borderRadius: '1rem',
      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
        <h1>{t('title')}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span role="img" aria-label="language">🌐</span>
          <select onChange={e => i18n.changeLanguage(e.target.value)} defaultValue="zhTW">
            <option value="zhTW">繁體中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="th">ไทย</option>
            <option value="fil">Filipino</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            background: msg.role === 'user' ? '#dbeafe' : '#fef3c7',
            padding: '0.75rem 1rem',
            margin: '0.5rem 0',
            borderRadius: '10px',
            maxWidth: '90%',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
          }}>
            <strong>{msg.role === 'user' ? '你' : '🌤️'}</strong>：{msg.content}
            {msg.quote && (
              <div style={{ fontStyle: 'italic', marginTop: '0.5rem', color: '#555' }}>
                💬 金句：「{msg.quote}」
                <br />
                🧠 憂鬱傾向：{msg.depressionRisk}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={t('placeholder')}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '0.5rem',
            marginRight: '0.5rem'
          }}
        />
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          background: '#2563eb',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer'
      </div>

        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        background: '#10b981',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9rem'
    </div>
  );
}
