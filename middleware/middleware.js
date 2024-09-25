const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config({path:".env"});


const port = process.env.PORT;

let servers = [
    { ipServer: process.env.IP_SERVER1, portServer: process.env.PORT_SERVER1, petitions: 0 },
    { ipServer: process.env.IP_SERVER2, portServer: process.env.PORT_SERVER2, petitions: 0 }];


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
    return servers[0];
};

app.post('/countTokens', async (req, res) => {
    let availableServer;
    availableServer = getLeastConnectedServer();
    availableServer.petitions++;
    console.log(availableServer)
    text1 = "";
    try {
        // Aquí harías la petición al servidor para contar tokens
        fetch(`http://${availableServer.ipServer}:${availableServer.portServer}/countTokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({text: req.body.text})
        })
        .then((response) => response.json())
        .then((text) => this.text1 = text.tokenCount)
        console.log("respuesta"+text1)
        //return res.send(response.data); // Retorna la respuesta del servidor
    } catch (error) {
        console.log(error)
    }
    console.log("snwede");
    // Si ningún servidor responde
});
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});