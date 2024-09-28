const { createApp, ref } = Vue;

createApp({
    data() {
        const tokens = "";
        const words = "";
        const info = "";
        return {
            tokens,
            words,
            info
        };
    },
    methods: {
        checkTokens(text) {
            text.tokenCount === 0 ? (this.tokens = "", this.info = text.info): (this.tokens = text.tokenCount, this.info = text.info);
        },
        async countTokens() {
            await fetch(`http://localhost:5000/countTokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({text: this.words})
            })
                .then((response) => response.json())
                .then((text) => this.checkTokens(text))
        }
    }
}).mount("#app");