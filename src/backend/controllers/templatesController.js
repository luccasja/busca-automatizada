const repositorioDeConfig = require("../repositorio/repositorioDeConfig");

const consultarTempletes = (req, resp) => {

	try {
		let template = repositorioDeConfig.retornarConfiguracoes();
		resp.status(200).send(template);
	} catch (error) {
		resp.status(404).send({ erro: "Arquivo de configuração não encontrada!" })
	}

}

const gravarTemplates = (req, resp) => {
	const listaDeTemplates = req.body;

	if (listaDeTemplates === undefined || listaDeTemplates.length === 0)
		return resp.status(404).send({
			erro: "Lista de configurações vazia"
		});
	try {
		repositorioDeConfig.gravarTemplates(listaDeTemplates);
		resp.status(200).send({
			Ok: "Configurações salvas com sucesso!"
		});
	} catch (error) {
		resp.status(404).send({
			erro: "Falha ao salvar configurações:" + error.message
		});
	}

};

module.exports = {
	consultarTempletes,
	gravarTemplates
}