const express = require("express");
const cors = require('cors')
const routes = require('./routes')
const path = require('path');
const app = express();

process.on('uncaughtException', function(erro) {
    if(erro.code === 'EADDRINUSE')
         console.log("Porta 3000 em uso");
    else
         console.log(erro);
});

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, '..', 'frontend', 'build')));
app.use(routes)

app.listen(3000, () => {
    console.log(`Server iniciado na porta ${3000}`)
});