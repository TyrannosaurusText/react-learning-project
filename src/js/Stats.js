import Observer from "./Observer";
import Message from "./Message";
import { NumberContainer, constNumberContainer } from "./numbers";
class Stats {
  constructor(StatusObj = {}) {
    this.container = StatusObj;
    this.container["buffContainer"] = {};
  }
  do_damage(target, skill, bonusMult) {
    if (!target instanceof Stats) return;

    let dmgDealt =
    target.take_damage(
      this.get("name"),
      this.get("atk_now")
        .copy()
        .multiplyBy(skill.damageMult)
        .plus(skill.damageFlat)
        .multiplyBy(bonusMult),
      skill["hitCount"] ? skill["hitCount"] : 1
    );
    return dmgDealt;
  }
  take_damage(userName, damage, hitCount) {
    let dmgTaken = damage
      .minus(this.get("def_now"))
      .multiplyBy(hitCount)
      .round();
    // Math.round(hitCount * (damage - this.get("def_now").val));
    if (dmgTaken.gt(this.get("hp_now"))) {
      this.get("hp_now").set(0);
      Observer.subscribe("BattleSkillUseEnd", this.get("name"), message => {
        Observer.unsubscribe("BattleSkillUseEnd", this.get("name"));
        Observer.notify(
          "LogAddMessage",
          new Message(this.get("name") + " was defeated.")
        );
        let event = "";
        if (this.get("isPlayer")) {
          event = "BattlePlayerDefeated";
        } else {
          event = "BattleEnemyDefeated";
        }
        Observer.notify(event, this.get("positionIndex"));
      });
    } else {
      this.set("hp_now", this.get("hp_now").minus(dmgTaken));
    }
   
    return dmgTaken;
  }
  getType() {
    return "Stats";
  }

  increment(key) {
    this.plus(key, 1);
  }
  decrement(key) {
    this.sub(key, 1);
  }
  plus(key, val) {
    if (this.container[key] instanceof NumberContainer) {
      this.get(key).plus(val);
    } else this.set(key, this.get(key) + val);
  }
  sub(key, val) {
    this.plus(key, -1 * val);
  }
  get(key) {
    if (this.container == null) return;
    // if(this.container[key] instanceof Number) return this.container[key].val;
    return this.container[key];
  }
  getval(key) {
    let result = this.get(key);
    if (result instanceof NumberContainer) return result.val;
    return result;
  }
  set(key, val) {
    this.container[key] = val;
  }
  setval(key, val) {
    if (this.container[key] instanceof NumberContainer) {
      this.container[key].set(val);
    } else {
      if (val instanceof NumberContainer) {
        this.set(key, val.val);
      } else this.set(key, val);
    }
  }
  getSkillLevel(key) {
    let val = this.get("skillLevels")[key];
    return val ? val : 0;
  }

  // static verifyObj(obj) {
  //   let keys = [
  //     "name",
  //     "hp",
  //     "level",
  //     "atk",
  //     "def",
  //     "skillNames",
  //     "skillLevel",
  //     "isPlayer"
  //   ];
  //   for (var key in keys) if (!(key in obj)) return false;
  //   return true;
  // }
  copy() {
    let copyStats = new Stats({});
    Object.keys(this.container).forEach(element => {
      if (this.container[element] instanceof constNumberContainer) {
        copyStats.set(element, this.container[element].copy());
      } else {
        //will need to change if nested json objects are in container
        copyStats.set(
          element,
          JSON.parse(JSON.stringify(this.container[element]))
        );
      }
    });
    // console.log(copyStats);

    return copyStats;
  }
  setBattleStats() {
    //TODO: probably add equipment effects + multipliers here.
    let vals = ["hp", "atk", "def", "SP", "MP", "turns"];
    vals.forEach(element => {
      // console.log(this.getval(element));
      let val = this.getval(element);
      this.set(
        element + "_now",
        val > 0 ? new NumberContainer(val) : new NumberContainer(0)
      );
      this.set(
        element + "_max",
        val > 0 ? new NumberContainer(val) : new NumberContainer(0)
      );
      this.set(element + "_mult", new NumberContainer(1));
    });
    if ("charge" in this.container) {
      this.set("charge_now", new NumberContainer(0));
      this.set("charge_max", new NumberContainer(this.getval("charge")));
      this.set("no_charge_attack", new NumberContainer(0));
    }
    this.set("targetIndex", 0);
  }

  /**
   * key = atk, def, mp, sp etc.
   * val = number
   */
  addBuff(buff, buff_stat, val) {
    let buffContainer = this.get("buffContainer");
    if (buff.name in buffContainer) {
      //buff already applied, reapply the buff,
      //if it is better increase the value
      //if the duration is longer, reset the duration.
      buff.reapply(this, buff);
    } else {
      this.handleBuff(buff_stat, val);
      buffContainer[buff.name] = buff;
    }
  }

  removeBuff(buff, key, val) {
    let buffContainer = this.get("buffContainer");
    if (buff.name in buffContainer) {
      this.handleBuff(key, -1 * val);
      delete buffContainer[buff.name];
    }
    //else do nothing
  }

  handleBuff(buff_stat, val) {
    let buff_mult = buff_stat + "_mult";
    let buff_max = buff_stat + "_max";
    let buff_now = buff_stat + "_now";
    this.plus(buff_mult, val);
    let new_max_val = this.get(buff_stat)
      .copy()
      .multiplyBy(this.get(buff_mult))
      .round();
    let percentChange = new_max_val.copy().divideBy(this.get(buff_max));
    this.set(buff_max, new_max_val);
    this.get(buff_now)
      .multiplyBy(percentChange)
      .round();
  }

  decrementBuffDurations() {
    // console.log("enter")
    let buffContainer = this.get("buffContainer");
    Object.keys(buffContainer).forEach(element => {
      let expirationCheck = buffContainer[element].decrement();
      if (expirationCheck) {
        buffContainer[element].removeFrom(this);
      }
      // console.log(expirationCheck)
    });
  }

  setMobStats(mob, level, rarity, hp, atk, def) {
    if (this.isPlayer) return;
    this.set("name", rarity + mob.name);
    this.set("level", Math.max(mob.minLevel, level));
    this.set("rarity", rarity);
    // console.log(hp, atk, def, mob.turns, mob.charge)
    this.set("hp", hp);
    this.set("atk", atk);
    this.set("def", def);
    this.set("skillLevels", mob.skillLevels(level));
    this.set("type", mob.type);
    this.set("turns", mob.turns.copy());
    this.set("charge", mob.charge.copy());
    this.set("AI", mob.AI);
  }
  contains(key) {
    if (key in this.container && this.get(key)) return true;
    return false;
  }
}

export default Stats;
