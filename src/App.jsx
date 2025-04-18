
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';

function App() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [lang, setLang] = useState('zhTW');
  const chatRef = useRef(null);

  useEffect(() => {
    i18n.changeLanguage('zhTW');
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    try {
      const res = await fetch('/.netlify/functions/gpt-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, lang }),
      });
      const data = await res.json();
      const botMessage = {
        role: 'assistant',
        reply: data.reply || '（AI 回覆失敗）',
        quote: data.quote || '',
        risk: data.risk || '',
        debug: data.debug || false,
        error: data.error || ''
      };
      setMessages([...updatedMessages, botMessage]);
    } catch (err) {
      setMessages([...updatedMessages, {
        role: 'assistant',
        reply: '（系統錯誤，請通知開發人員～系統可能儲值囉～）',
        quote: '',
        risk: '',
        error: err.message
      }]);
    }
  };

  return (
    <div style={{
      backgroundImage: 'url("./background.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        background: '#ffffffcc',
        padding: '1rem',
        borderRadius: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2>{t('title')}</h2>
          <div>
            <span style={{ marginRight: 8 }}>🌐</span>
            <select value={lang} onChange={(e) => {
              setLang(e.target.value);
              i18n.changeLanguage(e.target.value);
            }}>
              <option value="zhTW">繁體中文</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="th">ไทย</option>
              <option value="fil">Filipino</option>
              <option value="id">Bahasa Indonesia</option>
              <option value="vi">Tiếng Việt</option>
            </select>
          </div>
        </div>

        <div ref={chatRef} style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1rem' }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              textAlign: m.role === 'user' ? 'right' : 'left',
              margin: '0.5rem 0'
            }}>
              <div style={{
                display: 'inline-block',
                padding: '0.5rem 1rem',
                borderRadius: '1rem',
                background: m.role === 'user' ? '#d0f0ff' : '#f4f4f4',
                maxWidth: '80%',
                wordBreak: 'break-word'
              }}>
                {m.role === 'user' ? (
                  <div>你：{m.content}</div>
                ) : (
                  <div>
                    <div>🌤️ AI 回覆：{m.reply}</div>
                    {m.error && (
                      <div style={{ color: 'red', fontSize: '0.9rem' }}>
                        ❗錯誤訊息：{m.error}<br />
                        🚨 請通知開發人員～系統可能儲值囉～
                      </div>
                    )}
                    {m.quote && m.reply !== '（AI 回覆失敗）' && (
                      <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        🌸 療癒金句：「{m.quote}」
                      </div>
                    )}
                    {m.risk === 'high' && (
                      <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                        🧠 憂鬱傾向提示：我們偵測到你可能有情緒低落的狀態，請尋求身邊的協助或支持。
                      </div>
                    )}
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
            placeholder={t('placeholder')}
            style={{
              flex: 1,
              padding: '0.5rem',
              fontSize: '1rem',
              borderRadius: '0.5rem 0 0 0.5rem',
              border: '1px solid #ccc'
            }}
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
