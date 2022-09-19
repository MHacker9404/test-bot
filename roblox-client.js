const { DataStoreService, InitializeAsync } = require('@mfd/rbxdatastoreservice')

class RobloxClient {
    db;

    constructor() {
        // noop
    }

    async build() {
        await InitializeAsync(config.systems_token, 8164565751) //place id is a tgr owned place for data
        this.db = DataStoreService.GetDataStore('UserProfiles')
    }
}

module.exports = { RobloxClient };