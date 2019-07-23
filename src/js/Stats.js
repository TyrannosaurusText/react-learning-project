import Observer from "./Observer";
import Message from "./Message";
import { NumberContainer } from "./numbers";
class Stats {
  constructor(StatusObj) {
    this.container = StatusObj;
  }
  do_damage(target, skill, bonusMult) {
    if (!target instanceof Stats) return;
    return target.take_damage(
      this.get("name"),
      skill.skillName,
      this.get("atk_now")
        .copy()
        .multiplyBy(skill.damageMult)
        .plus(skill.damageFlat)
        .multiplyBy(bonusMult),
      skill["hitCount"] ? skill["hitCount"] : 1
    );
  }
  take_damage(userName, skillName, damage, hitCount) {
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
    Observer.notify(
      "LogAddMessage",
      new Message(
        damageMessage(userName, skillName, this.get("name"), dmgTaken.val),
        {
          Battle: "Damage dealt."
        }
      )
    );

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
    return this.get("skillLevels")[key];
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
  static copy(stats) {
    if (!(this instanceof Stats)) return;
    let c = JSON.parse(JSON.stringify(this.container));
    return new Stats(c);
  }
  setBattleStats() {
    let vals = ["hp", "atk", "def", "SP", "MP", "turns"];
    vals.forEach(element => {
      let val = this.get(element);
      this.set(
        element + "_now",
        val > 0 ? new NumberContainer(val) : new NumberContainer(0)
      );
      this.set(
        element + "_max",
        val > 0 ? new NumberContainer(val) : new NumberContainer(0)
      );
    });
    if ("charge" in this.container) {
      this.set("charge_now", new NumberContainer(0));
      this.set("charge_max", new NumberContainer(this.getval("charge")));
      this.set("no_charge_attack", new NumberContainer(0));
    }
  }

  setMobStats(mob, level, rarity, hp, atk, def) {
    if (this.isPlayer) return;
    this.setval("name", rarity + mob.name);
    this.setval("level", Math.max(mob.minLevel, level));
    this.setval("rarity", rarity);
    this.setval("hp", hp);
    this.setval("atk", atk);
    this.setval("def", def);
    this.setval("skillLevels", mob.skillLevels(level));
    this.setval("type", mob.type);
    this.setval("turns", mob.turns);
    this.setval("charge", mob.charge);
    this.setval("AI", mob.AI);
  }
  contains(key) {
    if (key in this.container && this.get(key)) return true;
    return false;
  }
}

function damageMessage(userName, skillName, targetName, dmgTaken) {
  return (
    userName +
    " used " +
    skillName +
    " on " +
    targetName +
    " dealing " +
    dmgTaken +
    " damage!"
  );
}

export default Stats;
