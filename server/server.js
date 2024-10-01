const express = require('express');
const natural = require('natural');
const cors = require('cors')
const app = express();
const port = process.env.PORT;
const logs = [];

app.use(cors());
app.use(express.json());

app.post('/countTokens', (req, res) => {
    addLog("El usuario ha enviado: ", req.body.text, "POST", req.body);
    let words = req.body.text;
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(words);
    addLog("Los tokens del texto son: ", tokens.length, "POST", req.body);
    res.send({ tokenCount: tokens.length });
});

app.get('/isReady', (req, res) => {
    res.send({ answer: 'yes' });
});

app.get('/sendLogs', (req, res) => {
    addLog("Enviando array de logs","" ,"GET"  )
    res.send(logs);
});

app.listen(port, () => {
    addLog(`Servidor corriendo en el puerto ${port}`,"","LISTEN");
});

function addLog(message, content, method, payload) {
    const time = new Date();
    const fecha = time.toLocaleDateString();
    const hora = time.toLocaleTimeString();
    console.log(fecha + " - "  + hora + " " + "lo"+ message + content + method +"Payload: "+payload);
    logs.push(fecha + " - "  + hora + " " + +message + content + method+"Payload: "+payload);
}