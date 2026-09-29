export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: "Telegram not configured" });
  }

  const { type, username, photoBase64, latitude, longitude } = req.body || {};

  try {
    if (type === "photo") {
      if (!photoBase64) {
        return res.status(400).json({ error: "Photo missing" });
      }

      const bytes = Buffer.from(photoBase64, "base64");
      const form = new FormData();

      form.append("chat_id", chatId);
      form.append(
        "caption",
        `Photo submitted with user consent\nUsername: @${username || "unknown"}`
      );
      form.append(
        "photo",
        new Blob([bytes], { type: "image/jpeg" }),
        "photo.jpg"
      );

      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendPhoto`,
        {
          method: "POST",
          body: form,
        }
      );

      const data = await response.json();
      return res.status(response.ok ? 200 : 500).json(data);
    }

    if (type === "location") {
      if (latitude == null || longitude == null) {
        return res.status(400).json({ error: "Location missing" });
      }

      const response = await fetch(
        `https://api.telegram.org/bot${token}/sendLocation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            latitude,
            longitude,
          }),
        }
      );

      const data = await response.json();
      return res.status(response.ok ? 200 : 500).json(data);
    }

    return res.status(400).json({ error: "Unknown type" });
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
}
