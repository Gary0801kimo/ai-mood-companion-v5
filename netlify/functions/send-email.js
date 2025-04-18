const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const formatted = body.messages.map((m) => {
      return `${m.role.toUpperCase()}：${m.content}${
        m.quote ? `\n💬 金句：「\${m.quote}」\n🧠 憂鬱傾向：\${m.depressionRisk}` : ''
      }`;
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
