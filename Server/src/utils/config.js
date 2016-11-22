const RIOTAPI = require('./riot/API');

module.exports = {
    SERVER: {
        DOMAIN: 'http://server',
        PORT: 8000,
        REDIS: {
            KEY : 'secret',
            HOST: 'lolteam-sessions',
            PORT: 6379
        }
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