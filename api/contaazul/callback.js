import fetch from "node-fetch";
import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL
});

await redis.connect();

export default async function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).send("Erro na autorização do Conta Azul");
  }

  if (!code || !state) {
    return res.status(400).send("Code ou state ausente");
  }

  const tokenResponse = await fetch(
    "https://auth.contaazul.com/oauth2/token",
    {
      method: "POST",
      headers: {
        "Authorization":
          "Basic " +
          Buffer.from(
            `${process.env.CA_CLIENT_ID}:${process.env.CA_CLIENT_SECRET}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri:
          "https://api.staffconsult.com.br/api/contaazul/callback"
      })
    }
  );

  const tokens = await tokenResponse.json();

  if (!tokens.access_token) {
    return res.status(500).json(tokens);
  }

  // salva tokens por cliente
  await redis.set(
    `contaazul:${state}`,
    JSON.stringify(tokens),
    { EX: tokens.expires_in }
  );

  return res
    .status(200)
    .send(`Auth OK para ${state}. Tokens armazenados.`);
}
