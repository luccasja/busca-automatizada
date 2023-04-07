const veiculoEhAlvo = async (resultado, configuracao) => {
	return await new Promise((resolve, reject) => {
		let condicoes = configuracao.alvo.split("|");
		let retorno = true;

		condicoes.forEach(condicao => {
			let campo = condicao.split("=")[0];
			let valor = String(condicao.split("=")[1]);

			if (valor == "null") {
				if (resultado[campo] != null) {
					retorno = false;
				}
			} else if (!String(resultado[campo]).includes(valor)) {
				retorno = false;
			}

		});

		resolve(retorno);
	});
}

module.exports = {
	veiculoEhAlvo
};