const { veiculoEhAlvo } = require("./validadorDeVeiculos");

const veiculoNaoEncontrado = (termo) => {
	return {
		chassi: "Sem resultado ou não consta na base!",
		placa: "",
		renavam: "",
		situacao: "",
		motor: "",
		alvo: false,
		condicaoBusca: termo,
		dataBusca: new Date().toLocaleString()
	}
}

const obterValorDoCampo = async (campos, nomeDoCampo) => {
	return await new Promise((resolve, reject) => {
		for (let idx = 0; idx < campos.length; idx++) {
			if (campos[idx].nome === nomeDoCampo) {
				resolve(campos[idx].valor);
				break;
			}
		}
	})
}

const preencherValorResultado = async (mapeamento, resultado) => {
	return await new Promise((resolve, reject) => {
		let niveis = mapeamento.split('|');

		if (niveis.length === 1) {
			resolve(resultado[niveis[0]]);
		}

		if (niveis.length === 2) {
			if (String(niveis[0]).includes("[")) {

				var chaveValor = String(niveis[0]).split("[");
				if ((chaveValor) && (chaveValor.length > 1)) {
					var chave = chaveValor[0];
					var ultimaCaracterValor = chaveValor[1].indexOf("]")
					var valor = String(chaveValor[1]).substring(0, ultimaCaracterValor).replace("]");

					var lista = resultado[chave];
					var primeiro = lista[valor];
					var dado = primeiro[niveis[1]];

					resolve(dado);
				}

			} else {
				resolve(resultado[niveis[0]][niveis[1]]);
			}
		}

		if (niveis.length === 3) {
			if (String(niveis[0]).includes("[")) {

				var chaveValor = String(niveis[0]).split("[");
				if ((chaveValor) && (chaveValor.length > 1)) {
					var chave = chaveValor[0];
					var ultimaCaracterValor = chaveValor[1].indexOf("]")
					var valor = String(chaveValor[1]).substring(0, ultimaCaracterValor).replace("]");

					var lista = resultado[chave];
					var primeiro = lista[valor];
					var dado = primeiro[niveis[1]];

					resolve(dado);
				}

			} if (String(niveis[1]).includes("[")) {

				var chaveValor = String(niveis[1]).split("[");
				if ((chaveValor) && (chaveValor.length > 1)) {
					var chave = chaveValor[0];
					var ultimaCaracterValor = chaveValor[1].indexOf("]")
					var valor = String(chaveValor[1]).substring(0, ultimaCaracterValor).replace("]");

					var raiz = resultado[niveis[0]];
					var lista = raiz[chave];
					var primeiro = lista[valor];
					var dado = primeiro[niveis[2]];

					resolve(dado);
				}

			} else {
				resolve(resultado[niveis[0]][niveis[1]][niveis[2]]);
			}
		}

		if (niveis.length === 4) {
			resolve(resultado[niveis[0]][niveis[1]][niveis[2]][niveis[3]]);
		}

		if (niveis.length === 5) {
			resolve(resultado[niveis[0]][niveis[1]][niveis[2]][niveis[3]][niveis[4]]);
		}
	})
}

const extrairResultadoJson = async (configuracao, resposta, condicaoBusca) => {
	return await new Promise(async (resolve, reject) => {
		try {
			const campos = configuracao.configAtiva.campos;

			let situacao, renavam, placa, motor, chassi, dataBusca, alvo, anoFabricacao, anoModelo, marcaModeloDescricao;

			let campoSituacao = String(await obterValorDoCampo(campos, "situacao")).trim();
			situacao = await preencherValorResultado(campoSituacao, resposta);

			const campoRenavam = String(await obterValorDoCampo(campos, "renavam")).trim();
			renavam = await preencherValorResultado(campoRenavam, resposta);

			const campoPlaca = String(await obterValorDoCampo(campos, "placa")).trim();
			placa = await preencherValorResultado(campoPlaca, resposta);

			const campoMotor = String(await obterValorDoCampo(campos, "motor")).trim();
			motor = await preencherValorResultado(campoMotor, resposta);

			const campoChassi = String(await obterValorDoCampo(campos, "chassi")).trim();
			chassi = await preencherValorResultado(campoChassi, resposta);

			const campoAnoFab = String(await obterValorDoCampo(campos, "anoFabricacao")).trim();
			anoFabricacao = await preencherValorResultado(campoAnoFab, resposta);

			const campoAnoModelo = String(await obterValorDoCampo(campos, "anoModelo")).trim();
			anoModelo = await preencherValorResultado(campoAnoModelo, resposta);

			const campoMarcaOuModelo = String(await obterValorDoCampo(campos, "marcaModeloDescricao")).trim();
			marcaModeloDescricao = await preencherValorResultado(campoMarcaOuModelo, resposta);

			dataBusca = new Date().toLocaleString();

			let resultado = {
				situacao, renavam, placa, motor, chassi, dataBusca,
				alvo, condicaoBusca, anoFabricacao, anoModelo, marcaModeloDescricao
			};

			resultado.alvo = await veiculoEhAlvo(resultado, configuracao);

			if (!resultado.chassi && !resultado.motor)
				resultado.chassi = "Sem resultado ou não consta na base!";

			resolve(resultado);

		} catch (erro) {
			resolve(veiculoNaoEncontrado(condicaoBusca));
		}
	});
}

const extrairResultadoHtml = async (page, configuracao, rota, condicaoBusca) => {
	return await new Promise(async (resolve, reject) => {

		try {
			await page.goto(rota + condicaoBusca);
			const campos = configuracao.configAtiva.campos;

			let placa, chassi, renavam, situacao, marcaModeloDescricao,
				anoModelo, anoFabricacao, motor, dataBusca, alvo;

			let campoPlaca = String(await obterValorDoCampo(campos, "placa")).trim();
			if (campoPlaca !== "")
				placa = await (await page.waitForSelector(campoPlaca)).textContent();

			let campoChassi = String(await obterValorDoCampo(campos, "chassi")).trim();
			if (campoChassi !== "")
				chassi = await (await page.waitForSelector(campoChassi)).textContent();

			let campoRenavam = String(await obterValorDoCampo(campos, "renavam")).trim();
			if (campoRenavam !== "")
				renavam = await (await page.waitForSelector(campoRenavam)).textContent();

			let campoSituacao = String(await obterValorDoCampo(campos, "situacao")).trim();
			if (campoSituacao !== "")
				situacao = await (await page.waitForSelector(campoSituacao)).textContent();

			let campoAnoModelo = String(await obterValorDoCampo(campos, "anoModelo")).trim();
			if (campoAnoModelo !== "")
				anoModelo = await (await page.waitForSelector(campoAnoModelo)).textContent();

			let campoAnoFabricacao = String(await obterValorDoCampo(campos, "anoFabricacao")).trim();
			if (campoAnoFabricacao !== "")
				anoFabricacao = await (await page.waitForSelector(campoAnoFabricacao)).textContent();

			let campoMarcaOuModelo = String(await obterValorDoCampo(campos, "marcaModeloDescricao")).trim();
			if (campoMarcaOuModelo !== "")
				marcaModeloDescricao = await (await page.waitForSelector(campoMarcaOuModelo)).textContent();

			let campoMotor = String(await obterValorDoCampo(campos, "motor")).trim();
			if (campoMotor !== "")
				motor = await (await page.waitForSelector(campoMotor)).textContent();

			dataBusca = new Date().toLocaleString();

			let resultado = {
				placa, chassi, renavam, situacao,
				marcaModeloDescricao,
				anoModelo, anoFabricacao, motor, dataBusca,
				condicaoBusca: condicaoBusca, alvo
			};

			resultado.alvo = await veiculoEhAlvo(resultado, configuracao)

			if (!resultado.chassi && !resultado.motor)
				resultado.chassi = "Sem resultado ou não consta na base!";

			resolve(resultado);

		} catch (erro) {
			console.log(erro.message);
			resolve(veiculoNaoEncontrado(condicaoBusca));
		}
	});
}

module.exports = {
	extrairResultadoJson,
	extrairResultadoHtml
}