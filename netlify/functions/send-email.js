import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async (req, res) => {
  try {
    const { messages } = req.body;

    const formatted = messages.map((msg, i) => {
      const isAI = msg.role === 'assistant';
      return `${isAI ? '🌤️ AI' : '🧑 使用者'}：${msg.content}${
        msg.quote ? `\n💬 金句：「${msg.quote}」\n🧠 憂鬱傾向：${msg.depressionRisk}` : ''
      }`;
    }).join('\n\n');

    const result = await resend.emails.send({
      from: 'AI Mood <noreply@mood.ai>',
      to: '413155305@m365.fju.edu.tw',
      subject: 'AI Mood 心情紀錄',
      text: formatted
    });

    return res.status(200).json({ status: 'sent', result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
