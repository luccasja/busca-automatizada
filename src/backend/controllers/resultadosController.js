const path = require("path");
const fs = require('fs');
const caminhoPastaDados = path.join(__dirname, "..", "/data/data.json");

const lerDados = () => {
	return JSON.parse(fs.readFileSync(caminhoPastaDados, 'utf-8'));
}

const escreverDados = (dados) => {
	fs.writeFileSync(caminhoPastaDados, JSON.stringify(dados, null, 4), 'utf-8');
}

const retornarResultados = (req, resp) => {
	try {
		let dados = lerDados();
		resp.status(200).send(dados);
	} catch (error) {
		resp.status(404).send({
			erro: "Arquivo de dados não encontrado!"
		})
	}
}

const excluirResultados = (req, resp) => {
	try {
		escreverDados("[]");

		resp.status(200).send({
			Ok: "Dados removidos com sucesso!"
		});
	} catch (error) {
		resp.status(404).send({
			erro: "Falha ao remover registros!"
		})
	}
}

const gravarResultado = (req, resp) => {
	const resultado = req.body

	if (resultado === undefined) {
		resp.status(404).send({
			erro: "Os dados não podem ser vazios!"
		});

		return;
	}

	try {
		let dados = lerDados();

		if (dados === undefined)
			dados = [];

		dados.push(resultado);
		escreverDados(dados);

		resp.status(200).send({
			Ok: "Resultado gravado com sucesso!"
		});
	} catch (error) {
		resp.status(404).send({
			erro: "Falha ao gravar resultado!"
		})
	}
}

const gravarResultadoInterno = (resultado) => {
	try {
		let dados = lerDados();

		if (dados === undefined)
			dados = [];

		dados.push(resultado);
		escreverDados(dados);

		return true;
	} catch (error) {
		console.log(error.message);
		return false;
	}
}

module.exports = {
	retornarResultados,
	excluirResultados,
	gravarResultado,
	gravarResultadoInterno
}