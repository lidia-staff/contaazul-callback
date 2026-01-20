export default function handler(req, res) {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).send("Erro na autorização do Conta Azul");
  }

  if (!code) {
    return res.status(400).send("Callback acessado sem code");
  }

  return res.status(200).send("Callback do Conta Azul recebido com sucesso.");
}
