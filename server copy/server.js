const express = require('express');
const natural = require('natural');
const cors = require('cors')
const app = express();
const port = 4002;

app.use(cors());
app.use(express.json());

app.post('/countTokens', (req, res) => {
    let words = req.body.text;
    if (!words) {
        return res.status(400).send('Error: Campo "text" no proporcionado.');
    }
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(words);
    res.send({ tokenCount: tokens.length });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
