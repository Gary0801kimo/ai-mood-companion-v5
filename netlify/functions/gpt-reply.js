
const { Configuration, OpenAIApi } = require("openai");

exports.handler = async function (event, context, callback) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);

  try {
    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message || "";

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "你是一位療癒系 AI，請安慰使用者並給一段療癒金句，同時分析訊息是否憂鬱。",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const content = response.data.choices[0].message.content;
    let quote = "";
    let risk = "low";

    if (userMessage.match(/(想死|痛苦|沒人愛|不想活|崩潰|壓力|絕望)/)) {
      risk = "high";
    }

    const lines = content.split("\n").filter((l) => l.trim());
    if (lines.length >= 2) {
      quote = lines[lines.length - 1].replace(/["「」]/g, "").trim();
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        reply: content,
        quote: quote,
        risk: risk,
      }),
    });
  } catch (err) {
    console.error("GPT Function Error:", err.message);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({ error: "GPT function error" }),
    });
  }
};
