const discord = require("discord.js")
const client = new discord.Client({"partials": ['CHANNEL', 'MESSAGE', 'REACTION']})
const RBX = require('@mfd/rbxdatastoreservice')
const config = require('./config.json')
const bloxy = require('bloxy')
let db = undefined
let print = console.log
const bClient = new bloxy.Client({
    credentials: {
        cookie: config.systems_token //use your bots one
   } 
})
let group = undefined
const waitFor = (ms) => new Promise(r => setTimeout(r, ms * 1000))
const cache = []
class RankProfile {
    constructor(name, value, id) {
       this.name = name;
       this.value = value;
       this.id = id
    }
}
class User {
    constructor(UserId,Experience,RankLocked) {
       this.Experience = Experience || 0;
       this.RankLocked = RankLocked || false;
       this.UserId = UserId
    }
}

// make json
let RankProfiles = [
    new RankProfile('Cadet', 50, 55565018),
    new RankProfile('Trooper', 100, 55565017),
    new RankProfile('Specialist', 150, 55565086),
    new RankProfile('Corporal', 200, 55565088),
    new RankProfile('Sergeant', 250, 55565105),
    new RankProfile('Sergeant-Major', 300, 55565111)
]
// let RankProfiles = [
//     new RankProfile('Guests', 10, 6371600),
//     new RankProfile('Alts', 100, 26148118),
//     new RankProfile('privete', 150, 59475695)
// ]
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}
async function CreateUser(UserId) {
    var obj = new User(UserId)
    var existingData = await db.GetAsync(UserId)
    if (existingData) {
        obj.Experience = existingData.Experience
        obj.RankLocked = existingData.RankLocked
    } else {
        var rank = await group.getMember(UserId)
        if (rank) {
            if (rank.role.rank > config.max_rank) {
                var set = RankProfiles[RankProfiles.length-1]
                obj.Experience = set.value
            } else {
                for (rank_profile of RankProfiles) {
                    if (rank.role.name == rank_profile.name) {
                        var last = RankProfiles[RankProfiles.indexOf(rank_profile)-1]
                        if (last == undefined) {
                            last = RankProfiles[0]
                        }
                        obj.Experience = last.value + 1
                        break
                    }
                }
            }
        }
    }
    cache.push(obj)
    return obj
}
async function Retrieve(UserId) {
    var Existing = cache.find(x => x.UserId == UserId)
    if (Existing) {
        return Existing
    }
    var newUser = await CreateUser(UserId)
    return newUser
}
async function ViewProfile(Profile) {
    var CurrentRank
    for (rank of RankProfiles) {
        if (Profile.Experience < rank.value) {
            CurrentRank = rank
            break
        } else {
            continue
        }
    }
}
async function ReturnData(current,next,exp) {
    var fill = ":ballot_box_with_check:"
    var unfilled = ":black_large_square:"
    var percentAge = 100
    var percentBar = `${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}`
    var remainingErrorNumber = 0
    var nextRankName = next.name
    var nextRankXp = current.value
    var percentAge = Math.round(((Number(exp))/Number(current.value)) * 100)
    if (Number.isNaN(percentAge)){
        percentAge = 0
    }
    if (percentAge > 100){
        percentAge = 100
    }
    var percentBar = ""
    if (percentAge === 0){
        percentBar = `${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}`
    }else if (0 <= percentAge && percentAge <= 10){
        percentBar = `${fill}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}`
    }else if (10 <= percentAge && percentAge <= 20){
        percentBar = `${fill}${fill}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}`
    }else if (20 <= percentAge && percentAge <= 30){
        percentBar = `${fill}${fill}${fill}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}`
    }else if (30 <= percentAge && percentAge <= 40){
        percentBar = `${fill}${fill}${fill}${fill}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}`
    }else if (40 <= percentAge && percentAge <= 50){
        percentBar = `${fill}${fill}${fill}${fill}${fill}${unfilled}${unfilled}${unfilled}${unfilled}${unfilled}`
    }else if (50 <= percentAge && percentAge <= 60){
        percentBar = `${fill}${fill}${fill}${fill}${fill}${fill}${unfilled}${unfilled}${unfilled}${unfilled}`
    }else if (60 <= percentAge && percentAge <= 70){
        percentBar = `${fill}${fill}${fill}${fill}${fill}${fill}${fill}${unfilled}${unfilled}${unfilled}`
    }else if (70 <= percentAge && percentAge <= 80){
        percentBar = `${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}${unfilled}${unfilled}`
    }else if (80 <= percentAge && percentAge <= 90){
        percentBar = `${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}${unfilled}`
    }else{
        percentBar = `${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}${fill}`
    }
    var remainingErrorNumber = Number(current.value-Number(exp))
    if (remainingErrorNumber < 0) {
        remainingErrorNumber = "DUE FOR PROMOTION"
    }
    return {percentAge,percentBar,remainingErrorNumber,nextRankName,nextRankXp}
}
async function GetFullProfile(Profile) {
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
    var nextRank = RankProfiles[RankProfiles.indexOf(CurrentRank) + 1]
    if (nextRank == undefined) {
        nextRank = CurrentRank
    }
    return {Profile, CurrentRank, nextRank}
}
async function HandleRemoveDiscord(Users,Amount,ChannelId) {
    var channel = await client.channels.fetch(ChannelId)
    var accounts = await bClient.apis.usersAPI.getUsersByUsernames({excludeBannedUsers:true,usernames:Users})
    for (user of Users) {
        var msg = await channel.send(`[**SEARCHING**]: ${user}`)
        var found = accounts.data.find(element => element.requestedUsername == user)
        if (found) {
            var profile = await Retrieve(found.id)
            await RemoveXP(profile,Amount)
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
async function HandleLockDiscord(Users,Value,ChannelId) {
    var channel = await client.channels.fetch(ChannelId)
    var accounts = await bClient.apis.usersAPI.getUsersByUsernames({excludeBannedUsers:true,usernames:Users})
    for (user of Users) {
        var msg = await channel.send(`[**SEARCHING**]: ${user}`)
        var found = accounts.data.find(element => element.requestedUsername == user)
        if (found) {
            var profile = await Retrieve(found.id)
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
async function cooldownCheck() {
    let CoolCache = await ds.GetAsync('ssu')
    if (CoolCache == undefined) {
        await ds.SetAsync("ssu", `${new Date()}`)
        console.log(await ds.GetAsync("ssu"))
    }
    let hourAdd = fns.addHours(new Date(CoolCache),1)
    let diff = fns.differenceInMinutes(hourAdd, new Date())
    if (diff > 0) {
        console.log(`Please wait ${diff} minutes before using?`)
    } else {
        console.log('is obver 1 hour?')
    }
}
async function HandleAddDiscord(Users,Amount,ChannelId) {
    var channel = await client.channels.fetch(ChannelId)
    var accounts = await bClient.apis.usersAPI.getUsersByUsernames({excludeBannedUsers:true,usernames:Users})
    for (user of Users) {
        var msg = await channel.send(`[**SEARCHING**]: ${user}`)
        var found = accounts.data.find(element => element.requestedUsername == user)
        if (found) {
            var profile = await Retrieve(found.id)
            await AddXP(profile,Amount)
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
async function HandleViewDiscord(Users,ChannelId) {
    var channel = await client.channels.fetch(ChannelId)
    var accounts = await bClient.apis.usersAPI.getUsersByUsernames({excludeBannedUsers:true,usernames:Users})
    for (user of Users) {
        var msg = await channel.send(`[**SEARCHING**]: ${user}`)
        var found = accounts.data.find(element => element.requestedUsername == user)
        if (found) {
            var profile = await Retrieve(found.id)
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
async function RemoveXP(Profile, Amount) {
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
async function RankLock(Profile,Value) {
    Profile.RankLocked = Value
    await db.SetAsync(Profile.UserId,Profile)
    var {CurrentRank, nextRank} = await GetFullProfile(Profile)
    var CurrentRankNew = CurrentRank
    return {Profile, CurrentRankNew, nextRank}
}
async function AddXP(Profile, Amount) {
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
    print('cur',CurrentRank)
    Profile.Experience += Amount
    var CurrentRankNew
    for (rank of RankProfiles) {
        if (Profile.Experience < rank.value) {
            CurrentRankNew = rank
            break
        } else {
            continue
        }
    }
    if (CurrentRankNew == undefined) {
        CurrentRankNew = RankProfiles[RankProfiles.length-1]
        Profile.Experience = CurrentRankNew.value
    }
    print('cur2',CurrentRankNew)
    var nextRank = RankProfiles[RankProfiles.indexOf(CurrentRankNew)+ 1]
    if (nextRank == undefined) {
        nextRank = RankProfiles[RankProfiles.length-1]
        CurrentRankNew = nextRank
    }
    print('cur3',nextRank)
    print('TEST')
    print(CurrentRankNew.name, CurrentRank.name)
    if (CurrentRankNew != CurrentRank) {
        try {
            await group.updateMember(Profile.UserId,CurrentRankNew.id)
        } catch (e) {
            print(e)
        }
    }
    await db.SetAsync(Profile.UserId,Profile)
    return {CurrentRankNew, nextRank, Profile}
}
async function Test() {
    // var Profile = await Retrieve(33864148)
    // Profile.Experience = 0
    // var {CurrentRankNew, nextRank, Profile} = await AddXP(Profile,2)
    // print('current',CurrentRankNew)
    // print('next',nextRank)
    // print('profile',Profile)
} 
async function StartApp() {
    await RBX.InitializeAsync(config.systems_token, 8164565751) //place id is a tgr owned place for data
    db = RBX.DataStoreService.GetDataStore('UserProfiles')
    const authenticatedUser = await bClient.login();
    console.log(`Logged in as ${authenticatedUser.id}`) // --> "Logged in as X"
    group = await bClient.getGroup(config.group_id)
    await client.login(config.bot_token)
    WebStart()
    //Test()
}
StartApp()
async function WebStart() {
    const express = require("express")
    const bodyParser = require('body-parser')
    const app = express()
    app.use(bodyParser())
    app.listen(80, () => {
        console.log("Running")
    })

    app.get("/", (req, res) => {
        res.send("I love Javascriptz")
    })
    app.get("/getuser/:user", async (req, res) => {
        var id = Number(req.params.user)
        var user = await Retrieve(id)
        var data = await GetFullProfile(user)
        res.json(data)
    })
    app.post("/update", async(req,res) => {
        var users = req.body.users
        var type = req.body.type
        var amount = req.body.amount
        var returns = []
        for (user of users) {
            var Profile = await Retrieve(Number(user))
            var dis = {UserId: Profile.UserId, Data: []}
            if (type == 'add') {
                var stuff = await AddXP(Profile,amount)
                dis.Data.push(stuff)
            } else if (type == 'remove') {
                var stuff = await RemoveXP(Profile,amount)
                dis.Data.push(stuff)
            } else if (type == 'ranklock') {
                var stuff = await RankLock(Profile,amount)
                dis.Data.push(stuff)
            }
            returns.push(dis)
        }
        res.json(returns)
    })
}
async function hasRolePass(member) {
    if (member.roles.find(x => x == config.guild_role)) {
        return true
    }
    return false
}
client.on('ready', async () =>{
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
    let guild = client.guilds.cache.get(config.guild_id)
    let role = guild.roles.cache.get(config.guild_role)
    client.api.applications(client.user.id).guilds(config.guild_id).commands.post({
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
    client.api.applications(client.user.id).guilds(config.guild_id).commands.post({
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
    client.api.applications(client.user.id).guilds(config.guild_id).commands.post({
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
    client.ws.on('INTERACTION_CREATE', async interaction => {
        //console.log(interaction.member)
        const member = interaction.member
        const command = interaction.data.name.toLowerCase()
        const args = interaction.data.options
        if (command == 'ranklock') {
            var checker = await hasRolePass(member)
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
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5
                    }
                });
                HandleLockDiscord(users,true,interaction.channel_id)
            } else {
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 5
                    }
                });
                HandleLockDiscord(users,false,interaction.channel_id)
            }
        }
        if (command == 'xp') {
            var checker = await hasRolePass(member)
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
process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err)
})
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
})
