const { Client } = require("discord.js")

class DiscordClient {
    client;

    constructor({ bloxyClient }) {
        this.client = new Client({"partials": ['CHANNEL', 'MESSAGE', 'REACTION']})
        this.bloxyClient = bloxyClient;
    }

    async hasRolePass(member) {
        if (member.roles.find(x => x == config.guild_role)) {
            return true
        }
        return false
    }

    async login(botToken) {
        return await this.client.login(botToken)
    }

    async handleLockDiscord(users, value, channelId) {
        const channel = await this.client.channels.fetch(channelId)
        const accounts = await this.bloxyClient.apis.usersAPI.getUsersByUsernames({
            excludeBannedUsers: true,
            usernames: users,
        })

        for (user of users) {
            const msg = await channel.send(`[**SEARCHING**]: ${user}`)
            const found = accounts.data.find(element => element.requestedUsername === user);

            if (found) {
                // TODO: Retrieve and below
                const profile = await Retrieve(found.id)
                
                await RankLock(profile,Value)
                var {CurrentRank, nextRank} = await GetFullProfile(profile)
                var thummy = await bClient.apis.thumbnailsAPI.getUsersAvatarBustImages({format:'png', isCircular:true, size:'75x75', userIds: [found.id]})
                var {percentAge,percentBar,remainingErrorNumber,nextRankName,nextRankXp} = await ReturnData(CurrentRank,nextRank,profile.Experience)
                var embed = new discord.MessageEmbed()
                embed.setTitle(found.name)
                embed.setURL(`https://www.roblox.com/users/${found.id}/profile`)
                embed.setDescription(`${percentBar} **${percentAge}**%`)
                embed.setColor(143588)
                embed.setThumbnail(thummy.data[0].imageUrl)
                embed.setFooter("Galactic Automation","https://t3.rbxcdn.com/a60801bd43000622abe445f47510e741")
                embed.setTimestamp()
                embed.addField("Rank", CurrentRank.name) // grouprank && grouprank.role.name || 'Guest'
                embed.addField("Rank Locked", profile.RankLocked)
                embed.addField(`${config.experience_name}`, profile.Experience)
                embed.addField("Remaining",`**${remainingErrorNumber}** remaining for **${nextRankName} ${nextRankXp}**`)
                channel.send(embed)
                var test = `[**SUCCESS**]: Results posted below`
                await msg.edit(test)
            } else {
                await msg.edit(`[**FAILURE**]: Did not find **${user}**`)
            }
        }
    }

    init() {
        this.client.on('ready', async () =>{
            // client.api.applications(client.user.id).guilds(config.guild_id).commands.get().then(stuff =>{
            //     console.log(stuff)
            //     stuff.forEach(element => {
            //         client.api.applications(client.user.id).guilds(config.guild_id).commands(element.id).delete()
            //     });
            // })
            // client.api.applications(client.user.id).commands.get().then(stuff =>{
            //     console.log(stuff)
            //     stuff.forEach(element => {
            //         client.api.applications(client.user.id).commands(element.id).delete()
            //     });
            // })
            const guild = this.client.guilds.cache.get(config.guild_id)
            const role = guild.roles.cache.get(config.guild_role)

            this.client.api.applications(client.user.id).guilds(config.guild_id).commands.post({
                data: {
                    name: "xp",
                    description: "Add or remove xp to user(s)",
                    options: [
                        {
                            type: 3,
                            name: 'type',
                            required: true,
                            description: 'Singular or bulk',
                            choices: [
                                {
                                    name: "Add",
                                    value: "add"
                                },
                                {
                                    name: "Remove",
                                    value: "remove"
                                }
                            ]
                        },
                        {
                            name: "users",
                            description: "input user(s) here",
                            type: 3,
                            required: true
                        },
                        {
                            name: "amount",
                            description: "xp amount to add/remove",
                            type: 4,
                            required: true
                        }
                    ]
                }
            })
            this.client.api.applications(client.user.id).guilds(config.guild_id).commands.post({
                data: {
                    name: "ranklock",
                    description: "Enable/disable ranklock on users",
                    options: [
                        {
                            type: 3,
                            name: 'type',
                            required: true,
                            description: 'Enable or disable',
                            choices: [
                                {
                                    name: "Enable",
                                    value: "true"
                                },
                                {
                                    name: "Disable",
                                    value: "false"
                                }
                            ]
                        },
                        {
                            name: "users",
                            description: "input user(s) here",
                            type: 3,
                            required: true
                        }
                    ]
                }
            })
            // client.api.applications(client.user.id).guilds(config.guild_id).commands.post({
            //     data: {
            //         name: "modify",
            //         description: "Modify role data",
        
            //         options: [
            //             {
            //                 type: 3,
            //                 name: 'role',
            //                 required: true,
            //                 description: 'Singular or bulk',
            //                 choices: RankProfiles
            //             },
            //             {
            //                 name: "xp",
            //                 description: "xp amount to add/remove",
            //                 type: 4,
            //                 required: true
            //             }
            //         ]
            //     }
            // })
            this.client.api.applications(client.user.id).guilds(config.guild_id).commands.post({
                data: {
                    name: "view_data",
                    description: "View user data",
                    options: [
                        {
                            name: "users",
                            description: "user(s) to view data of",
                            type: 3,
                            required: true
                        }
                    ]
                }
            })
            this.client.ws.on('INTERACTION_CREATE', async interaction => {
                //console.log(interaction.member)
                const member = interaction.member
                const command = interaction.data.name.toLowerCase()
                const args = interaction.data.options
                if (command == 'ranklock') {
                    const checker = await this.hasRolePass(member)
                    if (checker == false) {
                        this.client.api.interactions(interaction.id, interaction.token).callback.post({
                            data: {
                              type: 2,
                              data: {
                                flags: 64,
                                content: `❌ **Permission denied**\nMissing **XPOFFICER** role`
                              }
                            }
                        })
                        return
                    }
                    let type = args[0].value
                    let users = []
                    if (args[1].value.indexOf(",")) {
                        // multiple
                        var splits = args[1].value.split(",")
                        for (input of splits) {
                            var edit = input
                            var newedit = edit.replace(/\s/g, "")
                            users.push(newedit)
                        }
                    } else {
                        args[1].value.replaceAll(" ","")
                        users.push(args[1].value)
                    }
                    if (type == "true") {
                        this.client.api.interactions(interaction.id, interaction.token).callback.post({
                            data: {
                                type: 5
                            }
                        });
                        this.handleLockDiscord(users,true,interaction.channel_id)
                    } else {
                        this.client.api.interactions(interaction.id, interaction.token).callback.post({
                            data: {
                                type: 5
                            }
                        });
                        this.handleLockDiscord(users,false,interaction.channel_id)
                    }
                }
                if (command == 'xp') {
                    var checker = await this.hasRolePass(member)
                    if (checker == false) {
                        client.api.interactions(interaction.id, interaction.token).callback.post({
                            data: {
                              type: 2,
                              data: {
                                flags: 64,
                                content: `❌ **Permission denied**\nMissing **XPOFFICER** role`
                              }
                            }
                        })
                        return
                    }
                    let type = args[0].value
                    let amount = args[2].value
                    let users = []
                    if (args[1].value.indexOf(",")) {
                        // multiple
                        var splits = args[1].value.split(",")
                        for (input of splits) {
                            var edit = input
                            var newedit = edit.replace(/\s/g, "")
                            users.push(newedit)
                        }
                    } else {
                        args[1].value.replaceAll(" ","")
                        users.push(args[1].value)
                    }
                    if (type == "add") {
                        if (amount > config.max_experience_give) {
                            client.api.interactions(interaction.id, interaction.token).callback.post({
                                data: {
                                  type: 5,
                                  data: {
                                    content: `[**FAILED**]: Tried to give more than max amount allowed which is **${config.max_experience_give}**`
                                  }
                                }
                            })
                            return
                        } else {
                            client.api.interactions(interaction.id, interaction.token).callback.post({
                                data: {
                                    type: 5
                                }
                            });
                            HandleAddDiscord(users,amount,interaction.channel_id)
                        }
                    } else {
                        if (amount > config.max_experience_take) {
                            client.api.interactions(interaction.id, interaction.token).callback.post({
                                data: {
                                  type: 5,
                                  data: {
                                    content: `[**FAILED**]: Tried to take more than max amount allowed which is **${config.max_experience_take}**`
                                  }
                                }
                            })
                            return
                        } else {
                            client.api.interactions(interaction.id, interaction.token).callback.post({
                                data: {
                                    type: 5
                                }
                            });
                            HandleRemoveDiscord(users,amount,interaction.channel_id)
                        }
                    }
                }
                if (command == 'view_data') {
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 5
                        }
                    });
                    let users = []
                    if (args[0].value.indexOf(",")) {
                        // multiple
                        var splits = args[0].value.split(",")
                        for (input of splits) {
                            var edit = input
                            var newedit = edit.replace(/\s/g, "")
                            users.push(newedit)
                        }
                    } else {
                        args[0].value.replaceAll(" ","")
                        users.push(args[0].value)
                    }
                    if (users.length > config.max_users_view) {
                        var channel = await client.channels.fetch(interaction.channel_id)
                        await channel.send(`[**FAILED**]: Too many users given, please lower it to less than ${config.max_users_view} users`)
                        return 
                    }
                    HandleViewDiscord(users,interaction.channel_id)
                }
            })
        })
    }
}

module.exports = { DiscordClient }