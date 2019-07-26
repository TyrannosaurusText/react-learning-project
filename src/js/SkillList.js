import { getRndmInteger } from "./random";
import { tupleWord } from "./globals";
import { NumberContainer } from "./numbers";
import { Buff, Debuff, DoT, Regen } from "./Buff";
import Papa from "papaparse";
// import Observer from "./Observer";

export const skillEnum = {
  Strike: "Strike",
  Firebolt: "Firebolt",
  FlameStrike: "Flame Strike",
  FullCharge: "Full Charge",
  SPMastery: "SP Mastery",
  ATKUP: "ATK Up",
  ATKDOWN: "ATK Down",
  Regen: "Regen"
};

export let SkillList = {
  Strike: {
    desc: skillLevel => {
      return (
        "Deal " +
        (Math.floor(skillLevel / 4) + 1) +
        " to " +
        (Math.ceil(skillLevel / 2) + 2) +
        " blows to the enemy. Each blow dealing, " +
        (100 + 0.1 * skillLevel) +
        "% damage."
      );
    },
    onUse: (skillLevel = 1) => {
      let min = Math.floor(skillLevel / 4) + 1;
      let max = Math.ceil(skillLevel / 2) + 2;
      let rand = getRndmInteger(min, max);
      let skillName = tupleWord(rand) + skillEnum.Strike;

      let returnObj = returnObjectAppend(
        {},
        "target",
        "damage",
        damage(1 + 0.001 * skillLevel, 0, rand)
      );
      returnObj = modifySkillName(returnObj, skillName);
      return returnObj;
      // return returnObj;
    }
  },
  Firebolt: {
    desc: skillLevel => {
      return "Shoot a firebolt towards the enemy, dealing damage based on mana consuumed.";
    },
    onUse: (skillLevel = 1, mp_consumed) => {
      let mp = checkMP(mp_consumed, 5);
      let returnObj = returnObjectAppend(
        {},
        "target",
        "damage",
        damage(1, mp.multiplyBy(1 + 0.02 * skillLevel))
      );
      let debuffobj = statusEffect(
        new DoT("Burn", 5, { hp: 5 * skillLevel }, "burned", false)
      );

      returnObj = returnObjectAppend(returnObj, "target", "debuff", debuffobj);
      return returnObj;
    },
    targets: 1
  },
  "Flame Strike": {
    desc: skillLevel => {
      return (
        "Deals " +
        (Math.floor(skillLevel / 4) + 1) +
        " to " +
        Math.ceil(skillLevel / 2) +
        " fiery strikes on the enemy."
      );
    },
    onUse: (skillLevel = 1, mp_consumed) => {
      let mp = checkMP(mp_consumed, 50);
      let min = Math.floor(Math.max(1, skillLevel - 10) / 5) + 1;
      let max = Math.max(1, skillLevel - 10);
      let rand = getRndmInteger(min, max);
      let returnObj = returnObjectAppend(
        {},
        "target",
        "damage",
        damage(1, mp.multiplyBy(1 + 0.2 * skillLevel), rand)
      );
      let skillName = tupleWord(rand) + skillEnum.FlameStrike;

      returnObj = modifySkillName(returnObj, skillName);
      return returnObj;
    },
    targets: 1
  },
  "SP Mastery": {
    desc: skillLevel => {
      return "The ability to utilize SP, increases damage using SP skills.";
    },
    onUse: (skillLevel = 1, sp_remaining = new NumberContainer(0)) => {
      if (skillLevel == null) return 1;
      return 1 + (sp_remaining.val / 100) * (1 + 0.02 * skillLevel);
      // return [returnObj, skillEnum.SPMastery];
    }
  },
  "Full Charge": {
    desc: skillLevel => {
      return (
        "Strike\n Deals " +
        (Math.floor(skillLevel / 4) + 1) +
        " to " +
        Math.ceil(skillLevel / 2) +
        "powerful blows on the enemy"
      );
    },
    // restriction: "monster_only",
    onUse: (skillLevel = 1) => {
      // return obj;
      let returnObj = returnObjectAppend({}, "self", "add", {
        key: "charge",
        val: 100
      });
      return returnObj;
    }
  },
  "ATK Up": {
    desc: skillLevel => {
      return "Increases your ATK by " + (20 + 0.2 * skillLevel) + "%";
    },
    onUse: (skillLevel = 1) => {
      let buff = statusEffect(
        new Buff(skillEnum.ATKUP, 4, {
          atk: 20 + 0.2 * skillLevel
        })
      );
      // return obj;
      let returnObj = returnObjectAppend({}, "self", "buff", buff);

      return returnObj;
    }
  },
  "ATK Down": {
    desc: skillLevel => {
      return "Decreases target's ATK by " + (20 + 0.2 * skillLevel) + "%";
    },
    onUse: (skillLevel = 1) => {
      let debuff = statusEffect(
        new Debuff(skillEnum.ATKDOWN, 4, {
          atk: 20 + 0.2 * skillLevel
        })
      );

      // return obj;
      let returnObj = returnObjectAppend({}, "target", "debuff", debuff);

      return returnObj;
    }
  },
  "Regen":{
    desc: skillLevel => {
      return "Regenerate " + (50 +10* skillLevel) + " health every turn.";
    },
    onUse: (skillLevel = 1) => {
      let buff = statusEffect(
        new Regen(skillEnum.Regen, 20, {
          hp: 50 + 10 * skillLevel
        }, "regenerated",false)
      );
      // return obj;
      let returnObj = returnObjectAppend({}, "self", "buff", buff);

      return returnObj;
    }
  }
};

function checkMP(obj, default_cost) {
  if (!obj || !("MP_Spent" in obj)) {
    return new NumberContainer(default_cost);
  }
  return obj["MP_Spent"];
}

function returnObjectAppend(returnObject, target, key, val) {
  let obj = returnObject[target];
  if (obj == null) {
    returnObject[target] = [];
  }
  let arr = [key, val];
  returnObject[target].push(arr);
  return returnObject;
}

function damage(mult = 1, flat = 0, hit = 1) {
  return { damageMult: mult, damageFlat: flat, hitCount: hit };
}

function statusEffect(buffclassobj) {
  return { statusEffect: buffclassobj };
}
function modifySkillName(returnObj, name) {
  returnObj["skillName"] = name;
  return returnObj;
}

function addSkill(
  name,
  type,
  distance,
  element,
  SP_Cost,
  MP_Cost,
  upgrade_type,
  upgrade_cost_mult,
  target,
  duration,
  cooldown,
  can_crit,
  critrate,
  restriction
) {
  let new_skill = SkillList[name];
  new_skill.name = name;
  new_skill.distance = distance;
  new_skill.type = type;
  new_skill.element = element;
  new_skill.SP_Cost = SP_Cost;
  new_skill.MP_Cost = MP_Cost;
  new_skill.upgrade_type = upgrade_type;
  new_skill.upgrade_cost_mult = upgrade_cost_mult;
  new_skill.target = target;
  new_skill.duration = duration;
  new_skill.cooldown = cooldown;
  new_skill.can_crit = can_crit;
  new_skill.critrate = critrate;
  new_skill.restriction = restriction;

}

export function readTextFile(file, callback) {
  let isLoaded = false;
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status === 0) {
        var allText = rawFile.responseText;

        Papa.parse(allText, {
          header: true,
          worker: true,
          dynamicTyping: true,
          skipEmptyLines: "greedy",
          complete: data => {
            // console.log(data.data);
            let keys = Object.keys(data.data);
            for (var i = 0; i < data.data.length; i++) {
              // .map(element => {
              let obj = data.data[keys[i]];
              addSkill(
                obj.name,
                obj.type,
                obj.distance,
                obj.element,
                obj.SP_Cost,
                obj.MP_Cost,
                obj.upgrade_type,
                obj.upgrade_cost_mult,
                obj.target,
                obj.duration,
                obj.cooldown,
                obj.can_crit,
                obj.critrate,
                obj.restriction
              );
              // });
            }
            callback()
          }
        });
      }
    }
  };
  rawFile.send(null);
  return isLoaded;
}

export default { SkillList, readTextFile };
