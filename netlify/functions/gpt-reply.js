
const fetch = require("node-fetch");

exports.handler = async function (event, context) {
  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
  console.log("=== GPT Function Called ===");

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "";
    console.log("User Message:", userMessage);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "你是一位療癒系 AI，請給使用者溫暖的鼓勵與一則療癒金句，並分析是否有憂鬱傾向。",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
      }),
    });

    const result = await response.json();
    console.log("OpenAI Response:", result);

    const content = result.choices?.[0]?.message?.content || "（AI 回覆失敗）";

    let risk = "low";
    if (userMessage.match(/(想死|痛苦|沒人愛|絕望|崩潰|不想活)/)) {
      risk = "high";
    }

    const lines = content.split("\n").filter((l) => l.trim());
    const quote = lines.length > 1 ? lines[lines.length - 1].replace(/["「」]/g, "").trim() : "";

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: content,
        quote,
        risk,
      }),
    };
  } catch (err) {
    console.error("GPT FETCH ERROR", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "gpt fetch failed", details: err.message }),
    };
  }
};
