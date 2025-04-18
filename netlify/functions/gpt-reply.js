
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.handler = async (event) => {
  try {
    const { messages, lang } = JSON.parse(event.body || '{}');
    const promptLang = lang || 'zh';

    const systemPrompt = {
      zh: "你是善解人意的心理諮詢AI，請針對使用者的話語提供一句安慰或鼓勵的金句，並分析其是否有憂鬱傾向（低、中、高），用繁體中文回答。",
      en: "You are a compassionate AI companion. Provide an encouraging quote and assess the user's message for signs of depression (low, medium, high). Respond in English.",
      ja: "あなたは思いやりのあるAIカウンセラーです。ユーザーの発言に対して励ましの言葉を一言添え、うつの兆候（低・中・高）を分析してください。日本語で返答してください。",
      th: "คุณคือ AI ที่เข้าอกเข้าใจ โปรดให้คำพูดให้กำลังใจและวิเคราะห์ว่าผู้ใช้มีแนวโน้มซึมเศร้าหรือไม่ (ต่ำ กลาง สูง) ตอบเป็นภาษาไทย",
      fil: "Ikaw ay isang maunawaing AI. Magbigay ng isang nakaaaliw na mensahe at suriin ang antas ng depresyon ng user (mababa, katamtaman, mataas). Sagutin sa Filipino.",
      id: "Kamu adalah AI yang penuh empati. Berikan kutipan penyemangat dan nilai apakah pengguna memiliki tanda-tanda depresi (rendah, sedang, tinggi). Jawab dalam Bahasa Indonesia."
    }[promptLang] || systemPrompt.zh;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      temperature: 0.7
    });

    const fullReply = completion.data.choices[0].message.content;

    const quoteMatch = fullReply.match(/金句[:：\s「"]?(.*?)["」\n]/) || fullReply.match(/Quote[:：\s「"]?(.*?)["」\n]/);
    const riskMatch = fullReply.match(/憂鬱傾向[:：]?(低|中|高)/) || fullReply.match(/depression risk[:：]?(low|medium|high)/i);

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: fullReply,
        quote: quoteMatch ? quoteMatch[1] : '',
        depressionRisk: riskMatch ? riskMatch[1] : ''
      })
    };
  } catch (err) {
    console.error("GPT 錯誤：", err);
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: '（系統錯誤，請稍後再試）',
        quote: '',
        depressionRisk: ''
      })
    };
  }
};
