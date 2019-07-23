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
    // console.log(this);
    let trigger = this.ai.trigger;
    let hp_percent = 100*stats.getval("hp_now") / stats.getval("hp");
    let skillName = "";

    let keys = Object.keys(trigger);
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let obj = trigger[key];
      if (
        hp_percent <= parseInt(key) &&
        this.trigger_index <= obj.trigger_index
      ) {
        // console.log("trigger");
        skillName = obj.skillName;
        let turn = obj.uses_turn;
        this.trigger_index = obj.trigger_index + 1;
        //some triggers dont consume turn
        if (turn === 0) this.turns_now += 1;
        return skillName;
      }
    }
    let chargeAttack = this.ai.chargeAttack;
    // console.log(
    //   stats,
    //   stats.contains("charge_now"),
    //   stats.getval("charge_now") >= stats.getval("charge_max"),
    //   stats.getval("no_charge_attack") === 0
    // );
    if (
      stats.contains("charge_now") &&
      stats.getval("charge_now") === stats.getval("charge_max") &&
      stats.getval("no_charge_attack") === 0
    ) {
      console.log("charge attack");
      stats.set("charge_now", 0);
      return this.loop(
        hp_percent,
        chargeAttack,
        this.charge_index,
        this.charge_prev
      );

    }
    let strat = this.ai.strat;
    // console.log(stats.getval("charge_now"));
    stats.increment("charge_now");
    if (stats.getval("no_charge_attack")) {
      stats.decrement("no_charge_attack");
    }
    return this.loop(hp_percent, strat, this.strat_index, this.strat_prev);

  }

  loop(hp_percent, object, index, prev) {
    let skillName = "";
    let keys = Object.keys(object);
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let obj = object[key];
      // console.log(key, hp_percent)
      if (hp_percent <= parseInt(key)) {
        
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
    Object.keys(this.enemyParty).forEach(key => {
      let enemy = this.enemyParty[key];
      let ai = enemy.getval("AI");
      let index = enemy.getval("positionIndex");
      if (ai && ai in EnemyAIList) {
        this.enemyAI[index] = new EnemyAI(ai);
      } else {
        throw new Error("No AI");
      }
    });

    Observer.subscribe("BattleEnemyTurn", "EnemyAI", () => {
      this.notifyOnEnemyTurn();
    });
  }

  async notifyOnEnemyTurn() {
    let timeout = 1000;
    let keys = Object.keys(this.enemyParty);
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i];
      let enemy = this.enemyParty[key];
      this.turns_now = enemy.getval("turns");
      let index = enemy.getval("positionIndex");

      if (this.turns_now) {
        // console.log(this.enemyAI)
        let skillName = this.enemyAI[index].getNext(enemy);
        this.turns_now--;
        // console.log("skill: ", skillName);
        let update = {};
        update["skillName"] = skillName;
        update["index"] = index;
        await sleep(timeout);
        Observer.notify("BattleEnemyUseSkill", update);

        // timeout += 500;
      }
    }

    Observer.notify("BattlePlayerTurn", true);
  }
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default EnemyPlayer;
