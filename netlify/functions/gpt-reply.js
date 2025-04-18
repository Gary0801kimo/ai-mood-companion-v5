
exports.handler = async function () {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  console.log("✅ OPENAI_API_KEY =", OPENAI_API_KEY);
  return {
    statusCode: 200,
    body: JSON.stringify({
      keyDetected: OPENAI_API_KEY ? true : false,
      preview: OPENAI_API_KEY ? OPENAI_API_KEY.slice(0, 10) + '...' : 'undefined'
    }),
  };
};
