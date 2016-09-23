Docker:
    Build then run containers
        > docker-compose up -d --build

PhpMyAdmin:
    Open the web view to access to the PhpMyAdmin interface.
    > Select the lolteam database
    > Go to Import :
        Browse to the ./SQL/init.sql file
    > Execute

Web :   
    1) Install dependencies :
        > CD config
        > npm install
    2) [Re]Create the bundle :
        > CD ../js
        
        2.1) Static bundle for tests
            > webpack
        2.2) Static performance build
            > webpack -p 
        2.3) Dynamic bundle for dev
            > webpack-dev-server --host IP.OF.THE.HOST --port LISTENING_PORT
            I.E : 192.168.0.10 / 8000