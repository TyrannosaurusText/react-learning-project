import { getRndmInteger } from "./random";
import { tupleWord } from "./globals";
import { NumberContainer } from "./numbers";
import { Buff, Debuff } from "./Buff";
// import Observer from "./Observer";

export const skillEnum = {
  Strike: "Strike",
  Firebolt: "Firebolt",
  FlameStrike: "Flame Strike",
  FullCharge: "Full Charge",
  SPMastery: "SP Mastery",
  ATKUP: "ATK Up",
  ATKDOWN: " ATK Down"
};

export let SkillList = {
  Strike: {
    name: skillEnum.Strike,
    type: "Active",
    distance: "Melee",
    SP_Cost: 10,
    element: "Physical",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    targets: 1,
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
      return [returnObj, skillName];
      // return returnObj;
    }
  },
  Firebolt: {
    name: skillEnum.Firebolt,
    type: "Active",
    distance:"Ranged",
    MP_Cost: 5,
    element: "Fire",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    desc: skillLevel => {
      return (
        "Shoot a firebolt towards the enemy, dealing damage based on mana consuumed."
      );
    },
    onUse: (skillLevel = 1, mp_consumed) => {
      let mp = checkMP(mp_consumed, 5);
      let returnObj = returnObjectAppend(
        {},
        "target",
        "damage",
        damage(1, mp.multiplyBy(1 + 0.02 * skillLevel))
      );
      return [returnObj, skillEnum.Firebolt];
    },
    targets: 1
  },
  "Flame Strike": {
    name: skillEnum.FlameStrike,
    type: "Active",
    distance:"Melee",
    MP_Cost: 50,
    SP_Cost: 20,
    element: "Fire",
    upgrade_type: "SkillPoint",
    cost_mult: 50,
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
      return [returnObj, skillName];
    },
    targets: 1
  },
  "SP Mastery": {
    name: skillEnum.SPMastery,
    type: "Passive",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    desc: skillLevel => {
      return (
        "The ability to utilize SP, increases damage using SP skills."
      );
    },
    onUse: (skillLevel = 1, sp_remaining = new NumberContainer(0)) => {
      if (skillLevel == null) return 1;
      return 1 + (sp_remaining.val / 100) * (1 + 0.02 * skillLevel);
      // return [returnObj, skillEnum.SPMastery];
    }
  },
  "Full Charge": {
    name: skillEnum.FullCharge,
    type: "Recovery",
    target: "self",
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
      return [returnObj, skillEnum.FullCharge];
    }
  },
  "ATK Up": {
    name: skillEnum.ATKUP,
    type: "Buff",
    duration: 4,
    cooldown: 10,
    target: "self",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    desc: skillLevel => {
      return (
        "Increases your ATK by " + (20+.2*skillLevel) +"%" 
      );
    },
    onUse: (skillLevel = 1, user) => {
      if (user === null) return null;
      let obj = {
        statusEffect: new Buff(skillEnum.ATKUP, 4, {
          atk: 20 + 0.2 * skillLevel
        })
      };
      // return obj;
      let returnObj = returnObjectAppend({}, "self", "buff", obj);

      return [returnObj, skillEnum.ATKUP];
    }
  },
  "ATK Down": {
    name: skillEnum.ATKUP,
    type: "Debuff",
    duration: 4,
    cooldown: 10,
    target: "single",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    desc: skillLevel => {
      return (
        "Decreases target's ATK by " + (20+.2*skillLevel) +"%" 
      );
    },
    onUse: (skillLevel = 1, user) => {
      if (user === null) return null;

      let obj = {
        statusEffect: new Debuff(skillEnum.ATKDOWN, 4, {
          atk: 20 + 0.2 * skillLevel
        })
      };
      // return obj;
      let returnObj = returnObjectAppend({}, "target", "debuff", obj);
      return [returnObj, skillEnum.ATKDOWN];
    }
  }
};

function checkMP(obj, default_cost) {
  if (!obj || !("MP_Spent" in obj)) {
    return new NumberContainer(default_cost);
  }
  return obj["MP_Spent"];
}
export default { SkillList };

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
