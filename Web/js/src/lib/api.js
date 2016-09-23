const config = {
    SERVER: '192.168.99.100',
    PORT: '8000'
};

export default class API {
    constructor() {
        var req = new XMLHttpRequest();
        req.open('GET', 'http://' + config.SERVER + ':' + config.PORT + '/', true);
        req.onreadystatechange = function (e) {
            if (req.readyState == 4) {
                if(req.status == 200)
                    console.log(req.responseText);
                else
                    console.log("Erreur pendant le chargement de la page.\n");
            }
        };
        req.send(null);
    }

    login(username, password) {
        console.log("TODO login (user, pass) :", username, password);
    }
};