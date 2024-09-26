const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config({path:".env"});


const port = process.env.PORT;

let servers = [
    { ipServer: process.env.IP_SERVER1, portServer: process.env.PORT_SERVER1, petitions: 0, failed:false},
    { ipServer: process.env.IP_SERVER2, portServer: process.env.PORT_SERVER2, petitions: 0, failed:false}];


app.use(express.json());
app.use(cors());

app.put('/addServer', async (req, res) => {

});

setInterval(() => {
    servers.forEach(server => {
        server.petitions = 0;
    });
    console.log('Estadísticas de peticiones reiniciadas.');
}, 60000);

function getLeastConnectedServer() {
    let server = undefined;
    let i = 0;

    for (i = 0; i < servers.length; i++) {
        if (i+1 < servers.length) {
            if (server.petitions > servers[i+1].petitions && !servers[i+1].failed) {
                server = servers[i+1]
            }
        }
    }
    


    return server;
};

app.post('/countTokens', async (req, res) => {
    let availableServer;
    availableServer = getLeastConnectedServer();
    availableServer.petitions++;
    console.log(availableServer)
    try {
        const response = await fetch(`http://${availableServer.ipServer}:${availableServer.portServer}/countTokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({text: req.body.text})
        });

        const data = await response.json();
        
        console.log("respuesta recibida")
        console.log(data)

        return res.send(data);
    } catch (error) {
        console.log("Ocurrió un error")
        console.log(error)
    }
    console.log("Petición NO realizada");
});
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});