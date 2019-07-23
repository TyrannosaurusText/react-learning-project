// import Stats from './Stats'
/* Contains general player data */
// let globalPlayer = null;
class Player
{
    constructor(stats)
    {
        if (!!Player.instance) {
            return Player.instance;
        }
        Player.instance = this;
        this.baseStatus = stats;
        return this;
        
    }
    static getPlayerStats()
    {
        const obj = Player.instance.baseStatus;
        return obj;
    }

}
export default Player;