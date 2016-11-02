const RIOTAPI = require('./riotAPI');

module.exports = {
    SERVER: {
        PORT: 8000
    },
    MYSQL: {
        host        : 'lolteam-db',
        localAddress: 'lolteam-db',
        user        : 'root',
        password    : 'cky_w+IQ@l',
        database    : 'lolteam'
    },
    RIOT: RIOTAPI
};