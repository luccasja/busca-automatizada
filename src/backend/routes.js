const express = require('express');
const routes = express.Router();
const templatesController = require("./controllers/templatesController");
const resultadosController = require("./controllers/resultadosController");
const veiculosController = require("./controllers/veiculosController");

routes.get('/ConsultarVeiculos/motor/:pmotor', veiculosController.consultarVeiculoPorMotor);
routes.get('/ConsultarVeiculos/chassi/:pchassi', veiculosController.consultarVeiculoPorChassi);
routes.get('/templates', templatesController.consultarTempletes);
routes.post('/templates', templatesController.gravarTemplates);
routes.get('/resultados', resultadosController.retornarResultados);
routes.delete('/resultados', resultadosController.excluirResultados);
routes.post('/resultado', resultadosController.gravarResultado);

routes.get('*', (req, resp) => {
	resp.status(404).send({ result: `Rota ${req.url}" não encontrada!` })
});

module.exports = routes;