const { Client } = require("discord.js")

class DiscordClient {
    client;

    constructor() {
        this.client = new Client({"partials": ['CHANNEL', 'MESSAGE', 'REACTION']})    
    }

    async login(botToken) {
        return await this.client.login(botToken)
    }
}

module.exports = { DiscordClient }