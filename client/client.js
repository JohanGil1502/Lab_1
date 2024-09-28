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
        checkTokens(text){
            if(text.tokenCount == 0){
                this.tokens = text.info
            }else{
                this.tokens = text.tokenCount
            }
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
            /*
            if (this.tokens === 0) {
                this.tokens = "Los servidores están caidos"
            }
            */
        }
    }
}).mount("#app");