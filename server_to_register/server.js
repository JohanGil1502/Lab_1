const express = require('express');
const natural = require('natural');
const cors = require('cors')
const app = express();
const port = process.env.PORT;
const ip = process.env.IP_CONNECT;
const logs = [];

app.use(cors());
app.use(express.json());

async function connect() {
    console.log("Realizando conexión")
    let answer = "";
    await fetch(`http://${ip}:3000/addServer`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ip: "localhost", port: port })
    })
    .then((answer) => answer.json())
    .then((data) => answer = data);

    addLog(answer.answer, "");
}

connect();

app.post('/countTokens', (req, res) => {
    addLog("El usuario ha enviado: ", req.body.text);
    let words = req.body.text;
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(words);
    addLog("Los tokens del texto son: ", tokens.length);
    res.send({ tokenCount: tokens.length });
});

app.get('/isReady', (req, res) => {
    res.send({ answer: 'yes' });
});

app.get('/sendLogs', (req, res) => {
    addLog("Enviando array de logs","")
    res.send(logs);
});

app.listen(port, () => {
    addLog(`Servidor corriendo en el puerto ${port}`,"");
});

function addLog(message, content) {
    const time = new Date();
    const fecha = time.toLocaleDateString();
    const hora = time.toLocaleTimeString();
    console.log(fecha + " - "  + hora + " " + message + content);
    logs.push(fecha + " - "  + hora + " " + message + content);
}