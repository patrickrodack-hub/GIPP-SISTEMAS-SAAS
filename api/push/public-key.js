export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const vapidPublicKey = (process.env.VAPID_PUBLIC_KEY || "").trim().replace(/^['"]|['"]$/g, "") || "BKSGpAtTNnSHclTe4jk9TTOz4_RvpFBFIqJC-e-FvP5HsUaydyCHQqu2HNLjFnPrZ825u4ojE6j9K0Li9GzPj0s";
  return res.status(200).json({ publicKey: vapidPublicKey });
}
