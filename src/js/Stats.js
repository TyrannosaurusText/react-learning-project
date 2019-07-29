import Observer from "./Observer";
import { ObserverEnum } from "./globals";
import Message from "./Message";
import { NumberContainer, constNumberContainer } from "./numbers";
class Stats {
  constructor(StatusObj = {}) {
    this.container = StatusObj;
    this.container["buffContainer"] = {};
    this.container["cooldownContainer"] = {};
  }
  do_damage(target, skill, bonusMult) {
    if (!target instanceof Stats) return;
    let dmgDealt = target.take_damage(
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
    let dmgTaken = 0;
    if (this.get("def_now").gte(damage)) {
      dmgTaken = new NumberContainer(1).multiplyBy(hitCount);
    } else {
      dmgTaken = damage
        .minus(this.get("def_now"))
        .multiplyBy(hitCount)
        .round();
    }
    // Math.round(hitCount * (damage - this.get("def_now").val));
    if (dmgTaken.gte(this.get("HP_now"))) {
      this.get("HP_now").set(0);
      Observer.subscribe("BattleSkillUseEnd", this.get("name"), message => {
        Observer.unsubscribe("BattleSkillUseEnd", this.get("name"));
        Observer.notify(
          ObserverEnum.AddMessage,
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
      this.set("HP_now", this.get("HP_now").minus(dmgTaken));
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
  //     "HP",
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

    return copyStats;
  }
  calcStats() {
    let vals = ["HP", "atk", "def", "SP", "MP", "turns"];
    vals.forEach(element => {
      // console.log(element)
      this.set(
        element,
        new NumberContainer(0).plus(this.getval(element + "_base"))
        //add gear
      );
      // console.log(this.getval(element));
    });
  }
  setBattleStats() {
    if(this.get("isPlayer"))
    this.calcStats()
    //TODO: probably add equipment effects + multipliers before entering here.
    let vals = ["HP", "atk", "def", "SP", "MP", "turns"];
    vals.forEach(element => {
      // console.log(this.getval(element));
      let val = this.getval(element);
      this.set(element + "_now", val != null ? new NumberContainer(val) : null);
      this.set(element + "_max", val != null ? new NumberContainer(val) : null);
      this.set(element + "_mult", new NumberContainer(1));
    });
    if (this.container["charge"] != null) {
      this.set("charge_now", new NumberContainer(0));
      this.set("charge_max", new NumberContainer(this.getval("charge")));
      this.set("no_charge_attack", new NumberContainer(0));
    }

    this.set("buffContainer", {});
    this.set("cooldownContainer", {});
    this.set("targetIndex", 0);
  }

  /**
   * key = atk, def, mp, sp etc.
   * val = number
   */
  addBuff(buff) {
    let buffContainer = this.get("buffContainer");
    if (buff.name in buffContainer) {
      //dont change this 'in' operator
      //buff already applied, reapply the buff,
      //if it is better increase the value
      //if the duration is longer, reset the duration.
      buff.reapply(this, buff);
    } else {
      // this.handleBuff(buff_stat, val);
      buffContainer[buff.name] = buff;
    }
  }

  removeBuff(buff) {
    let buffContainer = this.get("buffContainer");
    if (buff.name in buffContainer) {
      //dont change this 'in' operator
      // this.handleBuff(key, -1 * val);
      delete buffContainer[buff.name];
    }
    //else do nothing
  }

  handleBuff(buff_stat, val) {
    if (this.get(buff_stat) == null) return;
    let buff_mult = buff_stat + "_mult";
    let buff_max = buff_stat + "_max";
    let buff_now = buff_stat + "_now";
    this.plus(buff_mult, val);
    let new_max_val = this.get(buff_stat)
      .copy()
      .multiplyBy(this.get(buff_mult))
      .ceil();
    let percentChange = new_max_val.copy().divideBy(this.get(buff_max));
    this.set(buff_max, new_max_val);
    this.get(buff_now)
      .multiplyBy(percentChange)
      .round();
  }

  handleDoT(name, buff_stat, val, isPercent) {
    let buff_max = buff_stat + "_max";
    let buff_now = buff_stat + "_now";
    let gainOrLoss = new NumberContainer(val);
    if (isPercent) {
      val = val / 100;
      gainOrLoss = this.get(buff_max)
        .copy()
        .multiplyBy(val)
        .round();
    }
    this.get(buff_now)
      .plus(gainOrLoss)
      .min(this.get(buff_max).copy())
      .round();

    Observer.notify(
      ObserverEnum.AddMessage,
      new Message(
        this.get("name") +
          " is " +
          name +
          (gainOrLoss.eq(0)
            ? ", but nothing happened."
            : " and " +
              (gainOrLoss.gt(0) ? "gained " : "lost ") +
              gainOrLoss.val +
              " " +
              buff_stat) +
          "."
      )
    );

    if (buff_stat === "HP" && this.get(buff_now).lte(0)) {
      Observer.notify(
        ObserverEnum.AddMessage,
        new Message(this.get("name") + " was defeated.")
      );
      let event = "";
      if (this.get("isPlayer")) {
        event = "BattlePlayerDefeated";
      } else {
        event = "BattleEnemyDefeated";
      }
      Observer.notify(event, this.get("positionIndex"));
    }
  }

  decrementBuffDurations() {
    // console.log("enter")
    let buffContainer = this.get("buffContainer");
    Object.keys(buffContainer).forEach(element => {
      let expirationCheck = buffContainer[element].decrement(this);
      if (expirationCheck) {
        buffContainer[element].removeFrom(this);
      }
      // console.log(expirationCheck)
    });
  }

  putOnCooldown(skillName, cd) {
    this.get("cooldownContainer")[skillName] = cd;
  }

  decrementSkillCooldown() {
    let cooldownContainer = this.get("cooldownContainer");
    Object.keys(cooldownContainer).forEach(element => {
      let val = cooldownContainer[element]--;
      if (val === 0) {
        delete cooldownContainer[element];
      }
    });
  }

  setMobStats(mob, level, rarity, HP, atk, def) {
    if (this.isPlayer) return;
    this.set("name", rarity + mob.name);
    this.set("level", Math.max(mob.minLevel, level));
    this.set("rarity", rarity);
    // console.log(HP, atk, def, mob.turns, mob.charge)
    this.set("HP", HP);
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
