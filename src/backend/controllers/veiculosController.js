const { buscarConfiguracaoAtiva } = require("../repositorio/repositorioDeConfig");
const { buscarPeloTermoFormatoJson, buscarPeloTermoFormatoHtml } = require("../core/buscadorDeDados");
const configuracao = buscarConfiguracaoAtiva();

const consultarVeiculoPorMotor = async (req, resp) => {
	const { pmotor } = req.params;

	if (pmotor === "0" || pmotor === "")
		return resp.status(400).send('Falta informações');

	if (configuracao.configAtiva.formato === "JSON")
		await buscarPeloTermoFormatoJson(resp, configuracao.urlMotor, pmotor, configuracao);
	else
		await buscarPeloTermoFormatoHtml(resp, configuracao.urlMotor, pmotor, configuracao);

}

const consultarVeiculoPorChassi = async (req, resp) => {
	const { pchassi } = req.params;

	if (pchassi == "0" || pchassi == "")
		return resp.status(400).send('Falta informações');

	if (configuracao.configAtiva.formato === "JSON")
		await buscarPeloTermoFormatoJson(resp, configuracao.urlChassi, pchassi, configuracao);
	else
		await buscarPeloTermoFormatoHtml(resp, configuracao.urlChassi, pchassi, configuracao);

}

module.exports = {
	consultarVeiculoPorMotor,
	consultarVeiculoPorChassi
}