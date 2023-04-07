const axios = require('axios');

const Api = axios.create({
    timeout: 90000
});

module.exports = Api;