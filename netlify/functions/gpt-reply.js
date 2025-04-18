
const fetch = require("node-fetch");

const systemPrompts = {
  zh: "你是一位溫柔療癒系的 AI 心靈好友「🌤️」，請根據使用者的情緒內容，給出溫暖的回應與具體建議。請將回覆結尾加上一句療癒金句（可用「療癒金句：」標示）。",
  en: "You are a gentle, therapeutic AI friend named '🌤️'. Based on the user's emotional message, reply warmly and naturally with practical support. At the end of your message, include a healing quote, starting with 'Quote:'.",
  ja: "あなたは癒し系AIの「🌤️」です。ユーザーの感情に寄り添い、優しい言葉で励ましてください。最後に癒しの一言を付けてください（「癒しの言葉：」で始めてください）。"
};

exports.handler = async function (event) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
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
        temperature: 0.8,
      }),
    });

    const result = await response.json();

    if (result.error) {
      console.error("GPT API ERROR:", result.error);
      return {
        statusCode: 200,
        body: JSON.stringify({
          reply: "（AI 回覆失敗）",
          quote: "",
          risk: "",
          debug: false,
          error: result.error.message
        }),
      };
    }

    const content = result.choices?.[0]?.message?.content || "";
    let reply = content;
    let quote = "";

    // 嘗試依標示切開
    const match = content.match(/(?:療癒金句|Quote|癒しの言葉)[：:\-]?(.*)/);
    if (match) {
      quote = match[1].trim().replace(/["「」]/g, "");
      reply = content.replace(match[0], "").trim();
    }

    let risk = "low";
    if (userMessage.match(/(想死|痛苦|沒人愛|絕望|崩潰|不想活|自殺|黑暗)/)) {
      risk = "high";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply, quote, risk, debug: true }),
    };
  } catch (err) {
    console.error("GPT FATAL ERROR:", err.message);
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: "（AI 回覆失敗）",
        quote: "",
        risk: "",
        debug: false,
        error: err.message || "Unknown failure"
      }),
    };
  }
};
