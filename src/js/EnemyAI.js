import Observer from "./Observer";
import {skillEnum} from "./SkillList";
let EnemyAIList = {
  Enemy: {
    chargeAttack: {
      "100": [skillEnum.Firebolt],
      "50": [skillEnum.FlameStrike]
    },
    strat: {
      "100": [skillEnum.Strike],
      "50": [skillEnum.Firebolt]
    },
    trigger: {
      "100": Trigger(skillEnum.FullCharge, 0, false),
      "50": Trigger(skillEnum.FlameStrike, 1, true)
    }
  }
};
function Trigger(skillName, index, cost) {
  let t = {};
  t["skillName"] = skillName;
  t["trigger_index"] = index;
  t["uses_turn"] = cost;
  return t;
}
class EnemyAI {
  constructor(EnemyAIName) {
    //loads enemy AI
    this.trigger_index = 0;
    this.charge_prev = -1;
    this.charge_index = 0;
    this.strat_prev = -1;
    this.strat_index = 0;
    this.turns_now = 0;
    this.ai = EnemyAIList[EnemyAIName];
  }
  getNext(stats) {
    let trigger = this.ai.trigger;
    let HP_percent = 100*stats.getval("HP_now") / stats.getval("HP");
    let skillName = "";

    let keys = Object.keys(trigger);
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let obj = trigger[key];
      if (
        HP_percent <= parseInt(key) &&
        this.trigger_index <= obj.trigger_index
      ) {
        skillName = obj.skillName;
        let turn = obj.uses_turn;
        this.trigger_index = obj.trigger_index + 1;
        //some triggers dont consume turn
        if (turn === 0) this.turns_now += 1;
        return skillName;
      }
    }
    let chargeAttack = this.ai.chargeAttack;

    if (
      stats.contains("charge_now") &&
      stats.getval("charge_now") === stats.getval("charge_max") &&
      stats.getval("no_charge_attack") === 0
    ) {
      stats.set("charge_now", 0);
      return this.loop(
        HP_percent,
        chargeAttack,
        this.charge_index,
        this.charge_prev
      );

    }
    let strat = this.ai.strat;
    stats.increment("charge_now");
    if (stats.getval("no_charge_attack")) {
      stats.decrement("no_charge_attack");
    }
    return this.loop(HP_percent, strat, this.strat_index, this.strat_prev);

  }

  loop(HP_percent, object, index, prev) {
    let skillName = "";
    let keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let obj = object[key];
      if (HP_percent <= parseInt(key)) {
        
        if (index === prev) {
          index = this.increment(index, obj.length);
        } else {
          prev = i;
          prev = -1;
        }
        skillName = obj[index];
        return skillName;
      }
    }
  }
  increment(a, b) {
    if (a >= b) {
      return 0;
    } else {
      return a + 1;
    }
  }
}
export class EnemyPlayer {
  constructor(party) {
    this.enemyParty = party;
    this.enemyAI = {};
    this.willExit = false;
    Object.keys(this.enemyParty).forEach(key => {
      let enemy = this.enemyParty[key];
      let ai = enemy.getval("AI");
      let index = enemy.getval("positionIndex");
      if (ai && EnemyAIList[ai] != null) {
        this.enemyAI[index] = new EnemyAI(ai);
      } else {
        throw new Error("No AI");
      }
    });

    Observer.subscribe("BattleEnemyTurn", "EnemyAI", () => {
      this.notifyOnEnemyTurn();
    });
    Observer.subscribe("BattlePlayerDefeated", "EnemyAI", ()=>{
      this.willExit = true;
    })
  }

  async notifyOnEnemyTurn() {
    let timeout = 1000;
    let keys = Object.keys(this.enemyParty);
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let enemy = this.enemyParty[key];
      this.turns_now = enemy.get("turns_max").copy();
      let index = enemy.getval("positionIndex");

      while (this.turns_now.gt(0)) {
        if(this.willExit) return;
        let skillName = this.enemyAI[index].getNext(enemy);
        let update = {};
        update["skillName"] = skillName;
        update["index"] = index;
        Observer.notify("BattleEnemyUseSkill", update);
        await sleep(timeout);
        this.turns_now.minus(1);
      }
    }

    Observer.notify("BattlePlayerTurn", true);
  }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default EnemyPlayer;
