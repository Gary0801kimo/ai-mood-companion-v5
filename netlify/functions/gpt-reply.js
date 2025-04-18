
const fetch = require("node-fetch");

const systemPrompts = {
  zh: "你是一位溫柔療癒系的 AI 心靈好友「🌤️」，請根據使用者的情緒內容，給出溫暖的回應與具體建議，避免制式句。結尾附上一句風格一致的療癒金句。若內容有憂鬱傾向，請內部評估風險，並柔性提醒使用者，但不要讓對話顯得嚴肅或嚇人。",
  en: "You are a gentle, therapeutic AI friend named '🌤️'. Based on the user's emotional message, reply warmly and naturally with practical support. Include a healing quote. If you sense depressive tendencies, gently offer support without sounding alarming.",
  ja: "あなたは癒し系AIの「🌤️」です。ユーザーの感情に寄り添い、優しく自然な言葉で励ましてください。最後に癒しの一言も添えてください。鬱の傾向があれば、やさしくそっと寄り添ってください。",
  th: "คุณคือเพื่อน AI ที่ใจดีและอบอุ่น '🌤️' ตอบกลับอย่างอ่อนโยน พร้อมข้อเสนอแนะและกำลังใจ ปิดท้ายด้วยคำคมเยียวยาหัวใจ หากพบสัญญาณความเศร้า โปรดให้กำลังใจอย่างอ่อนโยน",
  fil: "Ikaw ay isang maaasahang AI na kaibigan na may pangalan '🌤️'. Magbigay ng payo na may malasakit at tapusin ng isang healing na quote. Kung may nakikitang lungkot, hikayatin siya sa mahinahong paraan.",
  id: "Kamu adalah AI sahabat penyemangat bernama '🌤️'. Balas dengan dukungan hangat dan positif. Sertakan kutipan penyemangat. Jika ada tanda-tanda depresi, beri dukungan dengan lembut."
};

exports.handler = async function (event, context) {
  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "";
    const lang = body.lang || "zh";
    const systemPrompt = systemPrompts[lang] || systemPrompts["zh"];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
      }),
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "（AI 回覆失敗）";

    let risk = "low";
    if (userMessage.match(/(想死|痛苦|沒人愛|絕望|崩潰|不想活|自殺|黑暗)/)) {
      risk = "high";
    }

    const lines = content.split("\n").filter((l) => l.trim());
    const reply = lines.slice(0, lines.length - 1).join("\n").trim();
    const quote = lines[lines.length - 1]?.replace(/["「」]/g, "").trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ reply, quote, risk }),
    };
  } catch (err) {
    console.error("GPT FETCH ERROR", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "gpt fetch failed", details: err.message }),
    };
  }
};
