const express = require("express")
const bodyParser = require('body-parser')
const config = require('./config.json')
import { DiscordClient } from "./discord-client";
import { BloxyClient } from "./bloxy-client";
import { RobloxClient } from "./roblox-client";
import { Profile } from "./profile";

class WebServer {
    app;
    bloxyClient;
    discordClient;
    profile;
    profileCache = [];
    robloxClient;

    constructor({ port }) {
        if (!port) {
            throw new Error("no port specified");
        }

        // init clients
        this.bloxyClient = new BloxyClient();
        this.bloxyClient.login().initGroup(config.group_id)

        this.discordClient = new DiscordClient({ bloxyClient });
        this.discordClient.login(config.bot_token)

        console.log(`Logged in as ${authenticatedUser.id}`) // --> "Logged in as X"

        this.robloxClient = new RobloxClient();
        this.robloxClient.build();

        this.app = express();
        this.app.use(bodyParser())

        this.app.listen(port, () => {
            console.log(`Running on ${port}`)
        })
    
        this.app.get("/", (req, res) => {
            res.send("I love Javascriptz")
        })

        this.app.get("/getuser/:user", async (req, res) => {
            const { user } = req.params;
            const userId = Number(user)
            const userProfile = await this.findUser(userId)

            if (!userProfile) {
                // handle how you want to respond when there's no user in cache
            }

            // can adjust response here if needed too
            res.json(userProfile)
        })

        this.app.post("/update", async(req,res) => {
            const { body } = req;
            const { amount, type, users } = body;   
            const returnedData = []

            for (user of users) {
                const profile = await this.findOrCreateUserProfile(+user)
                const response = {
                    userId: profile.userId, 
                    data: []
                };

                if (type === 'add' || type === 'remove') {
                    await profile.mutateXP(amount)
                    // adjust how you want response to be here
                    // response.data.push(?)
                } else if (type == 'ranklock') {
                    await profile.toggleRankLock();
                    // adjust how you want response to be here
                    // response.data.push(?)
                }
                responseData.push(response)
            }

            res.json(responseData)
        })
    }

    async findOrCreateUserProfile(userId) {
        let profile;

        if (userId) {
            profile = await this.findUser(userId);
        }

        if (!profile) {
            profile = await this.createUser(userId)
        }

        return profile;
    }

    async findUser(userId) {
        return this.profileCache.find(profile => profile.userId === userId);
    }

    async createUser(userId) {
        const props = {
            experience: 0,
            isRankLocked: false,
            groupId: config.group_id,
        };

        const clients = {
            bloxyClient: this.bloxyClient,
        };

        const userProfile = new Profile(userId, props, clients)
        this.profileCache.push(userProfile);
    }
}

export default WebServer;