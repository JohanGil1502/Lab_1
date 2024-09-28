const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config({ path: ".env" });


const port = process.env.PORT;

let servers = [
    { ipServer: process.env.IP_SERVER1, portServer: process.env.PORT_SERVER1, petitions: 0, failed: false },
    { ipServer: process.env.IP_SERVER2, portServer: process.env.PORT_SERVER2, petitions: 0, failed: false }];


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


function resetServers() {
    servers.forEach(element => {
        element.failed = false;
    });
}

let serversFailed = 0;

async function getLeastConnectedServer() {
    let server = null;

    for (let i = 0; i < servers.length; i++) {
        if (!server || (servers[i].petitions < server.petitions && !servers[i].failed)) {
            if (!servers[i].failed) {
                server = servers[i];
            } else {
                server = servers[i + 1];
            }
        }
    }

    if (serversFailed == servers.length) {
        serversFailed = 0;
        resetServers();
        return undefined
    }

    console.log(server)
    let text = "";
    try {
        console.log("Inicio try_catch")
        await fetch(`http://${server.ipServer}:${server.portServer}/isReady`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then((response) => response.json())
            .then((data) => text = data.answer)
        console.log(text)
        resetServers();
        return server;
    } catch (error) {
        console.log("Error, servidor caido")
        serversFailed++;
        server.failed = true;
        return await getLeastConnectedServer();
    }
};


app.post('/countTokens', async (req, res) => {
    let availableServer;
    availableServer = await getLeastConnectedServer();
    console.log(availableServer)
    if (availableServer) {
        availableServer.petitions++;
        console.log("Servidor elegido: ", availableServer)
        try {
            const response = await fetch(`http://${availableServer.ipServer}:${availableServer.portServer}/countTokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: req.body.text })
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
    } else {
        return res.send({ tokenCount: 0 });
    }
});
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});