import { getRndmInteger } from "./random";
import { tupleWord } from "./globals";
import { NumberContainer } from "./numbers";
import {Buff, Debuff} from "./Buff";
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
    onUse: (skillLevel = 1) => {
      let min = Math.floor(skillLevel/4) + 1;
      let max = Math.ceil(skillLevel/2) + 2;
      let rand = getRndmInteger(min, max);
      let word = tupleWord(rand) + skillEnum.Strike;
      return { damageMult: 1+(.001*skillLevel), hitCount: rand, skillName: word };
    },
    targets: 1
  },
  Firebolt:{
    name: skillEnum.Firebolt,
    type: "Active",
    MP_Cost: 5,
    element: "Fire",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    onUse: (skillLevel=1, mana_consumed=5)=>
    {
      if(mana_consumed==null) mana_consumed=5;
      return { damageFlat: (1 +(.02*skillLevel))*mana_consumed};
    },
    targets: 1

  },
  "Flame Strike":{
    name: skillEnum.FlameStrike,
    type: "Active",
    MP_Cost: 50,
    SP_Cost: 20,
    element: "Fire",
    upgrade_type: "SkillPoint",
    cost_mult: 50,
    onUse: (skillLevel=1, mana_consumed=50)=>
    {
      if(mana_consumed==null) mana_consumed=50;
      let min = Math.floor(Math.max(1,skillLevel-10) / 5) + 1;
      let max = Math.max(1,skillLevel-10);
      let rand = getRndmInteger(min, max);
      let word = tupleWord(rand) + skillEnum.FlameStrike;
      if(mana_consumed==null) mana_consumed=50;
      return { damageFlat: (1 +(.2*skillLevel))*mana_consumed, hitCount: rand, skillName: word};
    },
    targets: 1

  },
  "SP Mastery": {
    name: skillEnum.SPMastery,
    type: "Passive",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    onUse: (skillLevel = 1, sp_remaining = new NumberContainer(0)) => {
      if (skillLevel == null) return 1;
      return 1 + (sp_remaining.val / 100) * (1 +.02*skillLevel);
    }
  },
  "Full Charge": {
    name: skillEnum.FullCharge,
    type: "Recovery",
    target: "self",
    // restriction: "Enemy_only",
    onUse: (skillLevel = 1, user) => {
      if (user === null) return null;
      let obj = {};
      obj["set"] = [
        ["charge_now", user.get("charge_max")],
        ["no_charge_attack", 1]
      ];
      return obj;
    }
  },
  "ATK Up":
  {
    name: skillEnum.ATKUP,
    type: "Buff",
    duration: 4,
    cooldown: 10,
    target: "self",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    onUse: (skillLevel=1, user)=>{
      if (user===null) return null;
      let obj = {statusEffect: new Buff(skillEnum.ATKUP, 4, {"atk":20+.2*skillLevel})}
      return obj;
    }
  },
  "ATK Down":
  {
    name: skillEnum.ATKUP,
    type: "Debuff",
    duration: 4,
    cooldown: 10,
    target: "single",
    upgrade_type: "SkillPoint",
    cost_mult: 10,
    onUse: (skillLevel=1, user)=>{
      if (user===null) return null;
      
      let obj = {statusEffect: new Debuff(skillEnum.ATKDOWN, 4, {"atk":20+.2*skillLevel})}
      return obj
    }
  }

};

export default { SkillList };
