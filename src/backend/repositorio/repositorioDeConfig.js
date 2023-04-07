const path = require("path");
const fs = require('fs');

const retornarConfiguracoes = () => {
	let rota = path.join(__dirname,"..", "/templates/configuracao.json");
	return JSON.parse(fs.readFileSync(rota, 'utf-8'));
}

const buscarConfiguracaoAtiva = () => {

	let configuracoes = retornarConfiguracoes();

	let configAtiva;

	configuracoes.templates.forEach(config => {
		if (config.ativo) {
			configAtiva = config;
		}
	});

	let configuracao = {
		urlMotor: configuracoes.urlMotor,
		urlChassi: configuracoes.urlChassi,
		alvo: configuracoes.alvo,
		configAtiva
	}

	return configuracao;
}

module.exports = {
	retornarConfiguracoes,
	buscarConfiguracaoAtiva
}