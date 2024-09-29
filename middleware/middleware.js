const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

require('dotenv').config({ path: ".env" });

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'monitor')));

const port = process.env.PORT;
let servers = [
    { ipServer: process.env.IP_SERVER1, portServer: process.env.PORT_SERVER1, petitions: 0, failed: false },
    { ipServer: process.env.IP_SERVER2, portServer: process.env.PORT_SERVER2, petitions: 0, failed: false }];
let serversLogs = [];

async function obtainServers(){
    try {
        const response = await fetch("http://localhost:3000/servers");
        console.log("Solicitando servidores al discovery_Server");
        const listServers = await response.json(); 
        listServers.forEach(element => {
            servers.push({ipServer:element.ipServer, portServer: element.portServer, petitions:0, failed: false})
        });
        console.log("Servidores actualizados\n", show_servers(servers));

    } catch (error) {
        console.error("El discovery_Server no está activo");
    }
}

function show_servers(servers){
    let message ="";
    for (let index = 0; index < servers.length; index++) {
        const element = servers[index];
        message += "servidor " +  (index+1) + ":" + " ip= " + element.ipServer + " puerto= " + element.portServer + "\n"    
    }
    return message;
}

obtainServers();

app.put('/addServer', async (req, res) => {
    const data = req.body;
    console.log("Servidor para agregar: " , "ip:" , data.ip, "puerto:" , data.port);
    const serverFound = servers.find(server => server.ipServer === data.ip && server.portServer === data.port);
    if (serverFound) {
        serverFound.failed = false
        res.send({answer: "Conexión realizada"})
        console.log(`Servidor de ip ${data.ip} y de puerto ${data.port} está en linea de nuevo`)
    }else{
        servers.push({ipServer:data.ip, portServer: data.port, petitions:0, failed: false})
        res.send({answer: "Conexión realizada"})
        console.log(`El servidor de ip ${data.ip} y de puerto ${data.port} fue agregado`)
    }
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
    // console.log("revisando servidores caidos")
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
}, 1000); 

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
        return res.send({ info: 'Todos los servidores están caidos :(',
                          tokenCount: 0 });
    }
});

app.get('/sendLogs', async (req, res) => {
    serversLogs = [];
    for (const server of servers) {
        if (!server.failed) {
            try {
                console.log(`haciendo fetch al sevidor ${server.ipServer}:${server.portServer}`)
                const response = await fetch(`http://${server.ipServer}:${server.portServer}/sendLogs`);
                if (!response.ok) {
                    console.error(`Error en la respuesta: ${response.statusText}`);
                    continue;
                }
                const logs = await response.json();
                console.log("Mostrando data",logs)
                serversLogs.push({server, logs: logs});
            } catch (error) {
                console.error(`Error al solicitar logs: ${error.message}`);
            }
        }
    }
    res.send(serversLogs);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});