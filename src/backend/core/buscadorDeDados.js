const Api = require("../services/Api");
const { firefox } = require('playwright');
const { gravarResultadoInterno } = require("../controllers/resultadosController");
const { extrairResultadoJson, extrairResultadoHtml } = require("./conversorDeResultados");

const veiculoNaoEncontrado = (resp, termo) => {
	return resp.status(200).send({
		chassi: "Sem resultado ou não consta na base!",
		placa: "",
		renavam: "",
		situacao: "",
		motor: "",
		alvo: false,
		condicaoBusca: termo,
		dataBusca: new Date().toLocaleString()
	});
}

const erroNoFornecedorDeDados = (resp, condicaoBusca, erro) => {
	return resp.status(200).send({
		chassi: erro,
		placa: "",
		renavam: "",
		situacao: "",
		motor: "",
		alvo: false,
		condicaoBusca: condicaoBusca,
		dataBusca: new Date().toLocaleString()
	})
}

const filtrarConteudoJson = (conteudo) => {
	let jsonString = JSON.stringify(conteudo);
	let filtrado = jsonString.replace("Veículos Encontrados", "VeiculosEncontrados");
	return JSON.parse(filtrado);
}

const buscarPeloTermoFormatoJson = async (resp, path, termo, configuracao) => {
	Api.get(path + termo)
		.then(async resposta => {
			if (resposta.status === 200) {
				if (resposta.data.dados && resposta.data.dados.status) {
					if (resposta.data.dados.status == "ERROR" && resposta.data.dados.retorno) {
						erroNoFornecedorDeDados(resp, termo, resposta.data.dados.retorno);
						return;
					}
				}

				if (resposta.data) {
					let jsonDaResposta = JSON.stringify(resposta.data);

					if (jsonDaResposta.indexOf('"ERROR"') >= 0) {
						erroNoFornecedorDeDados(resp, termo, jsonDaResposta);
						return;
					}
				}

				const conteudoDaResposta = filtrarConteudoJson(resposta.data);
				let resultado = await extrairResultadoJson(configuracao, conteudoDaResposta, termo)

				if (resultado.alvo) {
					gravarResultadoInterno({
						id: new Date().getTime(),
						data: resultado.dataBusca,
						marcaModelo: resultado.marcaModeloDescricao,
						chassi: resultado.chassi,
						anoFabModelo: `${resultado.anoFabricacao}/${resultado.anoModelo}`,
						placa: resultado.placa,
						situacao: resultado.situacao
					})
				}

				return resp.status(200).send(resultado);
			}
		})
		.catch(erro => {
			console.log(erro.message);
			veiculoNaoEncontrado(resp, termo);
		})
}

const buscarPeloTermoFormatoHtml = async (resp, path, termo, configuracao) => {
	const browser = await firefox.launch();
	const context = await browser.newContext();
	const page = await context.newPage();

	let resultado = await extrairResultadoHtml(page, configuracao, path, termo);

	if (resultado.alvo) {
		gravarResultadoInterno({
			id: new Date().getTime(),
			data: resultado.dataBusca,
			marcaModelo: resultado.marcaModeloDescricao,
			chassi: resultado.chassi,
			anoFabModelo: `${resultado.anoFabricacao}/${resultado.anoModelo}`,
			placa: resultado.placa,
			situacao: resultado.situacao
		})
	}

	await browser.close();
	return resp.status(200).send(resultado);
}

module.exports = {
	buscarPeloTermoFormatoJson,
	buscarPeloTermoFormatoHtml
};