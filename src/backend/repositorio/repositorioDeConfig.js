const path = require("path");
const fs = require('fs');
const caminhoPastaDados = path.join(__dirname,"..", "/templates/configuracao.json");

const retornarConfiguracoes = () => {
	return JSON.parse(fs.readFileSync(caminhoPastaDados, 'utf-8'));
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

const gravarTemplates = (listaDeTemplates) => {
	fs.writeFileSync(caminhoPastaDados, JSON.stringify(listaDeTemplates, null, 4), 'utf-8');
};

module.exports = {
	retornarConfiguracoes,
	buscarConfiguracaoAtiva,
	gravarTemplates
}