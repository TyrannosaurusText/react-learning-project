// import Stats from './Stats'
/* Contains general player data */
// let globalPlayer = null;
import Observer from './Observer';
class Player
{
    constructor(stats)
    {
        if (Player.instance) {
            return Player.instance;
        }
        Player.instance = this;
        this.baseStatus = stats;
        Observer.subscribe("getPlayerStats", "Player", ()=>{
            Observer.notify("sendPlayerStats", Player.instance.baseStatus);
        })
        return this;
        
    }
    
}
export default Player;