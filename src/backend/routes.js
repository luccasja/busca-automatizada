const express = require('express');
const routes = express.Router();
const { webkit, firefox } = require('playwright');
const fs = require('fs');
const axios = require('axios');

const Api = axios.create({
    timeout: 30000
});

routes.get('/ConsultarVeiculos/motor/:pmotor', async (req, resp) => {
    const { pmotor } = req.params;
    console.log(`[CONDICAO_BUSCA]: ${pmotor}`);

    if (pmotor === '0' || pmotor === '') {
        return resp.status(400).send('Falta informações');
    }

    const configuracao = buscarConfiguracaoAtiva();

    if (configuracao.configAtiva.formato === "JSON") {
        buscarNoFormatoJson(req, resp, "MOTOR", configuracao);
    }
    else {
        await buscarNoFormatoHtml(req, resp, "MOTOR", configuracao);
    }

});

routes.get('/ConsultarVeiculos/chassi/:pchassi', async (req, resp) => {
    const { pchassi } = req.params;
    console.log(`[CONDICAO_BUSCA]: ${pchassi}`);

    if (pchassi === '0' || pchassi === '') {
        return resp.status(400).send('Falta informações');
    }

    const configuracao = buscarConfiguracaoAtiva();

    if (configuracao.configAtiva.formato === "JSON") {
        await buscarNoFormatoJson(req, resp, "CHASSI", configuracao);
    }
    else {
        await buscarNoFormatoHtml(req, resp, "CHASSI", configuracao);
    }

});

routes.get('/templates', (req, resp) => {

    try {

        let template = JSON.parse(fs.readFileSync(__dirname + '/templates/configuracao.json', 'utf-8'));
        resp.status(200).send(template);

    } catch (error) {
        resp.status(404).send({ erro: "Arquivo de configuração não encontrada!" })
    }

});

routes.post('/templetes', (req, resp) => {
    const listaDeTemplates = req.body;

    if (listaDeTemplates === undefined || listaDeTemplates.length === 0)
        return resp.status(404).send({ erro: "Lista de configurações vazia" });

    try {

        fs.writeFileSync(__dirname + '/templates/configuracao.json', JSON.stringify(listaDeTemplates, null, 4), 'utf-8');
        resp.status(200).send({ Ok: "Configurações salvas com sucesso!" });

    } catch (error) {
        resp.status(404).send({ erro: "Falha ao salvar configurações:" + erro.message })
    }

});

routes.get('/resultados', (req, resp) => {
    try {

        let dados = JSON.parse(fs.readFileSync(__dirname + '/data/data.json', 'utf-8'));
        resp.status(200).send(dados);

    } catch (error) {
        resp.status(404).send({ erro: "Arquivo de dados não encontrado!" })
    }
});

function gravarResultado(resultado) {
    try {

        let dados = JSON.parse(fs.readFileSync(__dirname + '/data/data.json', 'utf-8'));
        if (dados === undefined) dados = [];
        dados.push(resultado);

        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(dados, null, 4), 'utf-8');
        return true;

    } catch (error) {
        console.log(error.message);
        return false;
    }
}

routes.delete('/resultados', (req, resp) => {
    try {

        fs.writeFileSync(__dirname + '/data/data.json', "[]", 'utf-8');
        resp.status(200).send({ Ok: "Dados removidos com sucesso!" });

    } catch (error) {
        resp.status(404).send({ erro: "Falha ao remover registros!" })
    }
});

routes.post('/resultados', (req, resp) => {
    const resultado = req.body

    if (resultado === undefined)
        resp.status(404).send({ erro: "Os dados não podem ser vazios!" });

    try {

        let dados = JSON.parse(fs.readFileSync(__dirname + '/data/data.json', 'utf-8'));
        if (dados === undefined) dados = [];
        dados.push(resultado);

        fs.writeFileSync(__dirname + '/data/data.json', JSON.stringify(dados, null, 4), 'utf-8');
        resp.status(200).send({ Ok: "Resultado gravado com sucesso!" });

    } catch (error) {
        resp.status(404).send({ erro: "Falha ao gravar resultado!" })
    }
});

routes.get('*', (req, resp) => {
    resp.status(404).send({ result: `Rota ${req.url}" não encontrada!` })
});

//----Controllers

function buscarConfiguracaoAtiva() {

    let configuracoes = JSON.parse(fs.readFileSync(__dirname + '/templates/configuracao.json', 'utf-8'));

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

async function buscarNoFormatoHtml(req, resp, tipoDeBusca, configuracao) {

    const browser = await firefox.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    if (tipoDeBusca === "MOTOR") {
        const { pmotor } = req.params;
        let resultado = await obterResultado(page, configuracao, `${configuracao.urlMotor + pmotor}`, pmotor);

        await browser.close();
        return resp.status(200).send(resultado);
    }
    else {
        const { pchassi } = req.params;
        let resultado = await obterResultado(page, configuracao, `${configuracao.urlMotor + pchassi}`, pchassi);

        await browser.close();
        return resp.status(200).send(resultado);
    }

}

async function buscarNoFormatoJson(req, resp, tipoDeBusca, configuracao) {

    if (tipoDeBusca === "MOTOR") {
        const { pmotor } = req.params;

        Api.get(configuracao.urlMotor + pmotor)
            .then(async resposta => {
                if (resposta.status === 200) {

                    let resultado = await extrairResultado(configuracao, resposta.data, pmotor)

                    if (resultado.alvo) {
                        gravarResultado({
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
                return resp.status(200).send({
                    chassi: "Sem resultado ou não consta na base!",
                    placa: "",
                    renavam: "",
                    situacao: "",
                    motor: "",
                    alvo: false,
                    condicaoBusca: pmotor,
                    dataBusca: new Date().toLocaleString()
                })
            })
    }
    else {
        const { pchassi } = req.params;

        Api.get(configuracao.urlChassi + pchassi)
            .then(async resposta => {

                if (resposta.status === 200) {

                    let resultado = await extrairResultado(configuracao, resposta.data, pchassi)

                    if (resultado.alvo) {
                        gravarResultado({
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
                return resp.status(200).send({
                    chassi: "Sem resultado ou não consta na base!",
                    placa: "",
                    renavam: "",
                    situacao: "",
                    motor: "",
                    alvo: false,
                    condicaoBusca: pchassi,
                    dataBusca: new Date().toLocaleString()
                })
            })
    }
}

async function extrairResultado(configuracao, resposta, condicaoBusca) {
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

            resolve(resultado);
            
        } catch (erro) {
            resolve({
                chassi: "Sem resultado ou não consta na base!",
                placa: "",
                renavam: "",
                situacao: "",
                motor: "",
                alvo: false,
                condicaoBusca: condicaoBusca,
                dataBusca: new Date().toLocaleString()
            })
        }
    });
}

async function veiculoEhAlvo(resultado, configuracao) {
    return await new Promise((resolve, reject) => {
        let condicoes = configuracao.alvo.split("|");
        let retorno = true;

        condicoes.forEach(condicao => {
            let campo = condicao.split("=")[0];
            let valor = String(condicao.split("=")[1]).trim();

            if (resultado[campo] !== valor)
                retorno = false;

        });

        resolve(retorno);
    });
}

async function preencherValorResultado(mapeamento, resultado) {
    return await new Promise((resolve, reject) => {
        let niveis = mapeamento.split('|');

        if (niveis.length === 1) {
            resolve(resultado[niveis[0]]);
        }

        if (niveis.length === 2) {
            resolve(resultado[niveis[0]][niveis[1]]);
        }

        if (niveis.length === 3) {
            resolve(resultado[niveis[0]][niveis[1]][niveis[2]]);
        }

        if (niveis.length === 4) {
            resolve(resultado[niveis[0]][niveis[1]][niveis[2]][niveis[3]]);
        }

        if (niveis.length === 5) {
            resolve(resultado[niveis[0]][niveis[1]][niveis[2]][niveis[3]][niveis[4]]);
        }
    })
}

async function obterValorDoCampo(campos, nomeDoCampo) {
    return await new Promise((resolve, reject) => {
        for (let idx = 0; idx < campos.length; idx++) {
            if (campos[idx].nome === nomeDoCampo) {
                resolve(campos[idx].valor);
                break;
            }
        }
    })
}

async function obterResultado(page, configuracao, rota, parametro) {
    try {
        console.log(parametro)
        await page.goto(rota);
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

        let campoAnoModelo = String(obterValorDoCampo(campos, "anoModelo")).trim();
        if (campoAnoModelo !== "")
            anoModelo = await (await page.waitForSelector(campoAnoModelo)).textContent();

        let campoAnoFabricacao = String(obterValorDoCampo(campos, "anoFabricacao")).trim();
        if (campoAnoFabricacao !== "")
            anoFabricacao = await (await page.waitForSelector(campoAnoFabricacao)).textContent();

        let campoMarcaOuModelo = String(obterValorDoCampo(campos, "marcaModeloDescricao")).trim();
        if (campoMarcaOuModelo !== "")
            marcaModeloDescricao = await (await page.waitForSelector(campoMarcaOuModelo)).textContent();

        let campoMotor = String(obterValorDoCampo(campos, "motor")).trim();
        if (campoMotor !== "")
            motor = await (await page.waitForSelector(campoMotor)).textContent();

        dataBusca = new Date().toLocaleString();

        let resultado = {
            placa, chassi, renavam, situacao,
            marcaModeloDescricao,
            anoModelo, anoFabricacao, motor, dataBusca,
            condicaoBusca: parametro, alvo
        };

        resultado.alvo = veiculoEhAlvo(resultado, configuracao)

        if (resultado.alvo) {
            gravarResultado({
                id: new Date().getTime(),
                data: resultado.dataBusca,
                marcaModelo: resultado.marcaModeloDescricao,
                chassi: resultado.chassi,
                anoFabModelo: `${resultado.anoFabricacao}/${resultado.anoModelo}`,
                placa: resultado.placa,
                situacao: resultado.situacao
            })
        }

        return resultado;

    } catch (erro) {
        console.log(erro.message);
        return {
            chassi: "Sem resultado ou não consta na base!",
            placa: "",
            renavam: "",
            situacao: "",
            motor: "",
            alvo: false,
            condicaoBusca: parametro,
            dataBusca: new Date().toLocaleString()
        }
    }
}

module.exports = routes;