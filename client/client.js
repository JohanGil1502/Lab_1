const { createApp, ref } = Vue;

createApp({
    data() {
        const tokens = "";
        const words = "";
        return {
            tokens,
            words
        };
    },
    methods: {
        async countTokens() {
            fetch(`http://localhost:5000/countTokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({text: this.words})
            })
                .then((response) => response.json())
                .then((text) => this.tokens = text.tokenCount)
        }
    }
}).mount("#app");