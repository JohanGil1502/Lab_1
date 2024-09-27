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
        server.petitions = 0
    })
    console.log('Estadísticas de peticiones reiniciadas.');
}, 60000);


async function getLeastConnectedServer() {
    let server = null;
    const serverAvaible= servers.filter(up => !up.failed)
    if (serverAvaible.length===0){
        return null
    }

    for (let i = 0; i < serverAvaible.length; i++) {
        if (!server || serverAvaible[i].petitions < server.petitions ) {
            server = serverAvaible[i]
        }
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
        return server;
    } catch (error) {
        console.log("Error, servidor caido")
        server.failed = true;
        return await getLeastConnectedServer();
    }
};

setInterval(async () => {
    console.log("revisando servidores caidos")
    for (let server of servers) {
        if (server.failed) {
            try {
                const response = await fetch(`http://${server.ipServer}:${server.portServer}/isReady`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                const data = await response.json()
                if (data.answer === 'yes') {
                    console.log(`sevidor ${server.portServer} ha vuelto a estar disponible`);
                    server.failed = false; 
                }
            } catch (error) {
                console.log(`servidor ${server.portServer} sigue caido`)
            }
        }
    }
}, 5000); 

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
        console.log("no hay servidores disponibles")
        return res.send({ info: 'servidores caidos',
                          tokenCount: 0 });
    }
});
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});