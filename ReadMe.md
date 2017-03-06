## Setup Docker
Build then run containers :
    
    > docker-compose up -d --build

---
## PhpMyAdmin
* Open the web view to access to the PhpMyAdmin interface.
* Select the lolteam database
* Go to Import :
    * Browse to the ./SQL/init.sql file
    * Execute
* In the '__const__' table insert 2 rows :
    * id: __empty__
    * name: '__RIOT_API_KEY__'
    * value: '__RGAPI-01234567-0123-0123-0123-012345678901__' *
    ---
    * id: __empty__
    * name: '__RIOT_API_LIMIT__'
    * value: '__1000__'

(*) Example value use your own API Key. You can get yours here : [https://developer.riotgames.com/]()

---
## Server
The '__config.js__' regroup all information to connect to the DB.

It's look like this and it's up to you to add things here :
    
```javascript
const Config = {
    SERVER: {
        PORT: 8000
    },
    MYSQL: {
        host        : 'lolteam-db',
        localAddress: 'lolteam-db',
        user        : 'XXX',
        password    : 'YYY',
        database    : 'lolteam'
    }
}
module.exports = Config;
```

---
## Web
* Install dependencies :
```
CD config
npm install
```
