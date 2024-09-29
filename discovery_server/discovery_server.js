const express = require('express');
const cors = require('cors')
const app = express();
const port = 3000;
let servers = []

app.use(cors());
app.use(express.json());

app.put('/addServer', async (req, res) => {
    const data = req.body;
    const serverFound = servers.find(server => server.ipServer === data.ip && server.portServer === data.port);
    if (!serverFound) {
        servers.push({ipServer:data.ip, portServer: data.port})
    }
    console.log("Enviando conexión al middleware")    

    let answer = "";
    await fetch('http://localhost:5000/addServer', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then((answer) => answer.json())
    .then((data) => answer = data);
    
    console.log("Conexión realizada, ahora los servidores son:\n", show_servers(servers))
    res.send(answer)
});

function show_servers(servers){
    let message = "";
    for (let index = 0; index < servers.length; index++) {
        const element = servers[index];
        message += "servidor " +  (index+1) + ":" + " ip= " + element.ipServer + " puerto= " + element.portServer + "\n"    
    }
    return message;
}

app.get("/servers", (req, res) => {
    res.send(servers);
})

app.listen(port, () => {
    console.log(`discovery_server corriendo en el puerto ${port}`);
});