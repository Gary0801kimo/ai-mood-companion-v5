
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const formatted = body.messages.map((m) => {
      if (m.role === 'user') {
        return `👤 使用者：${m.content}`;
      } else {
        return `🌤️ AI 回覆：${m.reply || '（AI 回覆失敗）'}\n` +
               (m.quote ? `🌸 金句：「${m.quote}」\n` : '') +
               (m.risk === 'high' ? '🧠 憂鬱傾向：有偵測到情緒低落，請多關心自己或尋求支持。' : '');
      }
    }).join('\n\n');

    await resend.emails.send({
      from: 'AI Mood <onboarding@resend.dev>',
      to: '413155305@m365.fju.edu.tw',
      subject: '你的 AI Mood 心情紀錄',
      text: formatted
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (e) {
    console.error('寄信錯誤：', e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
