const config = {
    SERVER: 'server',
    PORT: '8000'
};

export default class API {
    constructor() {
        
    }

    login(username, password) {
        fetch(new Request('http://' + config.SERVER + ':' + config.PORT + '/login',{ 
            method: 'POST',
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            mode: 'cors',
            body: {user: encodeURIComponent(username), pass: encodeURIComponent(password)}

        }))
        .then(function(response) {
            if(response.ok)
                return response.json();       
            else
                console.log('[Login] Wrong network answer');
        })
        .then(function(json){
            console.log("[Login] JSON : ", json);
        })
        .catch(function(error) {
            console.log('[Login][Error] Fetch operation error : ' + error.message);
        });
    }
};