import { rankProfiles } from "./rank-profiles";

class Profile {
    clients;
    experience;

    currentRank;
    nextRank;
    maxRank;

    isRankLocked;
    userId;

    constructor(userId, props, clients) {
        const { experience = 0, groupId, isRankLocked = false } = props;
        this.clients = clients;
        this.userId = userId;
        this.experience = experience;
        this.isRankLocked = isRankLocked;
        this.group = clients.bloxyClient.getGroup(groupId);
        this.maxRank = rankProfiles[rankProfiles.length - 1];
    }

    getProfile() {
        return {
            userId: this.userId,
            experience: this.experience,
            isRankLocked: this.isRankLocked,
            currentRank: this.currentRank,
            nextRank: this.nextRank,
        }
    }

    async toggleRankLock() {
        this.isRankLocked = !this.isRankLocked;
        await this.updateDatabaseProfile();
    }

    async updateDatabaseProfile() {
        const profile = this.getProfile();
        return await db.SetAsync(userId, profile)
    }

    updateExperience(experience) {
        this.experience += experience;
    }

    updateRank() {   
        // rank-up detected
        if (this.rank.value < this.experience) {
            this.rank = this.nextRank;
            
            this.assignNextRank();

            try {
                await this.group.updateMember(userId, this.rank.id)
            } catch (e) {
                console.log(e)
            }
        }
    }

    assignNextRank() {
        const filteredProfiles = rankProfiles.filter((profile) => profile.value > this.experience); 

        if (!filteredProfiles.length) {
            this.updateExperience(this.maxRank.value)
            this.nextRank = maxRank;
        }

        this.nextRank = filteredProfiles[0];
    }

    async mutateXP(experience) {
        if (this.isRankLocked) {
            return;
        }
        const highestRank = rankProfiles[rankProfiles.length - 1];

        const member = await this.group.getMember(this.userId)

        if (member && member.role.rank > config.max_rank) {
            
            this.currentRank = highestRank;
            this.nextRank = highestRank;                
            this.experience = highestRank.value;

            const profile = this.getProfile();

            await db.SetAsync(this.userId, profile)
            return profile;
        }

        // grant xp
        this.updateExperience(experience);

        // grant new rank if needed, if max rank, will update exp to be max xp as well
        this.updateRank();

        // update db for user's new profile state
        this.updateDatabaseProfile();

        return;
    }
}

export { Profile };