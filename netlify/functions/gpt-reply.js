
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.handler = async function (event, context) {
  try {
    const body = JSON.parse(event.body);
    const userMessage = body.message || "";

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "你是一位溫暖療癒系的 AI 好友，請針對使用者心情給出安慰與鼓勵，並附上一句療癒金句。" },
        { role: "user", content: userMessage },
      ],
    });

    const aiReply = completion.data.choices[0].message.content;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply: aiReply }),
    };
  } catch (error) {
    console.error("GPT error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch GPT reply." }),
    };
  }
};
