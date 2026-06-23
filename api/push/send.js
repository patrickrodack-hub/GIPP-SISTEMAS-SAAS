import webpush from "web-push";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, body, subscriptions, url } = req.body;
    if (!subscriptions || !Array.isArray(subscriptions)) {
      return res.status(400).json({ error: "Subscriptions array is required" });
    }

    const vapidPublicKey = (process.env.VAPID_PUBLIC_KEY || "").trim().replace(/^['"]|['"]$/g, "") || "BKSGpAtTNnSHclTe4jk9TTOz4_RvpFBFIqJC-e-FvP5HsUaydyCHQqu2HNLjFnPrZ825u4ojE6j9K0Li9GzPj0s";
    const vapidPrivateKey = (process.env.VAPID_PRIVATE_KEY || "").trim().replace(/^['"]|['"]$/g, "") || "pWOXuAW_xGaFyFX-sI6s_j3bibSmNPRLJ1dzNHipI58";

    webpush.setVapidDetails(
      "mailto:suporte@tecnologiaigreja.com.br",
      vapidPublicKey,
      vapidPrivateKey
    );

    let sentCount = 0;
    const payload = JSON.stringify({
      notification: {
        title: title || "Alerta",
        body: body || "",
        icon: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
        badge: "https://cdn-icons-png.flaticon.com/512/3004/3004613.png",
        data: { url: url || "/" }
      }
    });

    const promises = subscriptions.map(async (sub) => {
      try {
        if (sub && sub.endpoint) {
          await webpush.sendNotification(sub, payload);
          sentCount++;
        }
      } catch (err) {
        console.error("Vercel push failed for endpoint:", err.message);
      }
    });

    await Promise.all(promises);
    return res.status(200).json({ status: "success", sent: sentCount });

  } catch (error) {
    console.error("Vercel send push error:", error);
    return res.status(500).json({ error: error.message || String(error) });
  }
}
