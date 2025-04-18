
const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function (event, context) {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "";

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一個溫暖的 AI 好朋友，請針對使用者訊息給予療癒回應，並附上療癒金句，同時判斷訊息是否有憂鬱傾向。",
        },
        { role: "user", content: userMessage },
      ],
    });

    const responseText = completion.data.choices[0].message.content;

    const reply = responseText;
    let quote = "";
    let risk = "low";

    const lines = responseText.split("\n").filter((l) => l.trim());
    if (lines.length >= 2) {
      quote = lines[lines.length - 1].replace(/["「」]/g, "").trim();
    }

    if (userMessage.includes("想死") || userMessage.includes("沒人愛") || userMessage.includes("痛苦")) {
      risk = "high";
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply, quote, risk }),
    };
  } catch (error) {
    console.error("GPT Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GPT Function 執行錯誤" }),
    };
  }
};
