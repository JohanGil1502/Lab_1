const express = require('express');
const natural = require('natural');
const cors = require('cors')
const app = express();
const port = 4001;

app.use(cors());
app.use(express.json());

app.post('/countTokens', (req, res) => {
    console.log(req.body.text)
    let words = req.body.text;
    if (!words) {
        return res.status(400).send('Error: Campo "text" no proporcionado.');
    }
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(words);
    console.log(tokens.length);
    res.send({ tokenCount: tokens.length });
});

app.get('/isReady', (req, res) => {
    res.send({ answer: 'yes' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
