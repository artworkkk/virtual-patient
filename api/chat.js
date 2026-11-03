export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;
  
  // 從 Vercel 後台的環境變數讀取醫院 API 資訊（絕對安全，前端看不到）
  const HOSPITAL_API_URL = process.env.HOSPITAL_API_URL;
  const HOSPITAL_API_KEY = process.env.HOSPITAL_API_KEY;

  if (!HOSPITAL_API_URL || !HOSPITAL_API_KEY) {
    return res.status(500).json({ error: 'Hospital API configuration is missing on server.' });
  }

  try {
    // 轉發請求至醫院 API（假設為常見的 OpenAI 兼容格式，若醫院有特殊格式可在此調整 headers/body）
    const response = await fetch(HOSPITAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HOSPITAL_API_KEY}` // 若醫院是用其他 Header（如 x-api-key），可在此修改
      },
      body: JSON.stringify({
        model: "hospital-llm-model", // 填入醫院規定的模型名稱（或根據醫院 API 要求調整）
        messages: messages,
        temperature: 0.7,
        max_tokens: 150
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));

    // 回傳給前端（假設結構為 data.choices[0].message.content，若不同可依醫院回傳格式調整）
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}