const express = require("express")
const bodyParser = require('body-parser')
import { DiscordClient } from "./discord-client";
import { BloxyClient } from "./bloxy-client";
import { RobloxClient } from "./roblox-client";

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
            const id = Number(user)
            const userProfile = await this.retrieve(id)
            const data = await GetFullProfile(userProfile)
            res.json(data)
        })

        this.app.post("/update", async(req,res) => {
            const { body } = req;
            const { amount, type, users } = body;   
            const returnedData = []

            for (user of users) {
                const profile = await this.findOrCreateUserProfile(+user)
                const dis = {
                    userId: profile.userId, 
                    data: []
                };

                if (type == 'add') {
                    const data = await addXP(profile, amount)
                    dis.data.push(data)
                } else if (type == 'remove') {
                    const data = await removeXP(profile, amount)
                    dis.data.push(data)
                } else if (type == 'ranklock') {
                    const data = await rankLock(profile, amount)
                    dis.data.push(data)
                }
                returnedData.push(dis)
            }

            res.json(returnedData)
        })
    }



    async rankLock(value) {
        this.profile.rankLocked = value
        await db.SetAsync(this.profile.userId, this.profile)
        const { currentRank, nextRank } = await getFullProfile()
        return {
            currentRankNew: currentRank, 
            nextRank,
            profile, 
        }
    }

    async removeXP(Profile, Amount) {
        if (Profile.RankLocked == true) {
            var {CurrentRank, nextRank} = await GetFullProfile(Profile)
            var CurrentRankNew = CurrentRank
            return {CurrentRankNew, nextRank, Profile}
        }
        var role = await group.getMember(Profile.UserId)
        if (role) {
            if (role.role.rank > config.max_rank) {
                var CurrentRank = RankProfiles[RankProfiles.length-1]
                var CurrentRankNew = RankProfiles[RankProfiles.length-1]
                var nextRank = RankProfiles[RankProfiles.length-1]
                Profile.Experience = CurrentRankNew.value
                await db.SetAsync(Profile.UserId,Profile)
                return {CurrentRankNew, nextRank, Profile}
            }
        }
        var CurrentRank
        for (rank of RankProfiles) {
            if (Profile.Experience < rank.value) {
                CurrentRank = rank
                break
            } else {
                continue
            }
        }
        if (CurrentRank == undefined) {
            CurrentRank = RankProfiles[RankProfiles.length-1]
        }
        print('crxp',CurrentRank)
        if (Profile.Experience - Amount < 0) {
            Profile.Experience = 0
        } else {
            Profile.Experience -= Amount
        }
        var CurrentRankNew
        for (rank of RankProfiles) {
            if (Profile.Experience < rank.value) {
                CurrentRankNew = rank
                break
            } else {
                continue
            }
        }
        print('crxpnew',CurrentRankNew)
        var nextRank = RankProfiles[RankProfiles.indexOf(CurrentRankNew) + 1]
        print('crxpnext',nextRank)
        if (CurrentRank == undefined) {
            //prob at max, cant really promote him
        } else { 
            print('TEST')
            print(CurrentRankNew.name, CurrentRank.name)
            if (CurrentRankNew != CurrentRank) {
                try {
                    await group.updateMember(Profile.UserId,CurrentRankNew.id)
                } catch (e) {
                    print(e)
                }
            }
        }
        await db.SetAsync(Profile.UserId,Profile)
        return {CurrentRankNew, nextRank, Profile}
    }

    async findOrCreateUserProfile(userId) {
        let profile;

        if (userId) {
            profile = this.profileCache.find(profile => profile.userId === userId)
        }

        if (!profile || !userId) {
            profile = await createUser(UserId)
        }

        return profile;
    }
}

export default WebServer;