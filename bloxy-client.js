const bloxy = require('bloxy')

class BloxyClient {
    client;
    group;

    constructor() {
        this.client = new bloxy.Client({
            credentials: {
                cookie: config.systems_token, // use your bots' token
           } 
        })
    }

    async login() {
        return await this.client.login();
    }

    async initGroup(groupId) {
        this.group = await this.client.getGroup(groupId);
    }
}

module.exports = { BloxyClient };