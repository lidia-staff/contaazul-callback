export default async function handler(req, res) {
  try {
    const { code, state, error, error_description } = req.query;

    console.log("Callback recebido:", { code, state, error });

    if (error) {
      console.error("Erro OAuth:", error_description);
      return res.status(400).send(`Erro OAuth: ${error_description}`);
    }

    if (!code) {
      return res.status(400).send("Callback sem code.");
    }

    const clientId = process.env.CA_CLIENT_ID;
    const clientSecret = process.env.CA_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("Client ID ou Client Secret não configurados");
      return res.status(500).send("Client ID / Client Secret ausentes.");
    }

    const tokenUrl = "https://auth.contaazul.com/oauth2/token";
    const redirectUri = "https://api.staffconsult.com.br/api/contaazul/callback";

    const basicAuth = Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString("base64");

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    console.log("Resposta token Conta Azul:", data);

    if (!response.ok) {
      console.error("Erro ao gerar tokens:", data);
      return res.status(400).json(data);
    }

    // 🔐 Aqui depois vamos salvar por cliente (state = AKLAB)
    console.log("OAuth concluído com sucesso para:", state);

    return res
      .status(200)
      .send(`OAuth OK para ${state}. Tokens gerados com sucesso.`);
  } catch (err) {
    console.error("Erro inesperado no callback:", err);
    return res.status(500).send("Erro interno no callback.");
  }
}
