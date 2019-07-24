// import Skills from "./Skills";
import Stats from "./Stats";
import { Clamp } from "./globals";
import {NumberContainer, constNumberContainer} from "./numbers"


let MonsterList = {
  Enemy: {
    name: "Enemy",
    minLevel: 1,
    maxLevel: 100000,
    hp: new constNumberContainer(100),
    atk: new constNumberContainer(10),
    def: new constNumberContainer(0),
    hpScale: new constNumberContainer(0.1),
    atkScale: new constNumberContainer(0.1),
    defScale: new constNumberContainer(0.1),
    type: "normal",
    minRarity: 0,
    maxRarity: 5,
    turns: new constNumberContainer(2),
    desc: "An Enemy!",
    AI: "Enemy",
    charge: new constNumberContainer(3),
    rarityScale: 2,
    skillLevels: level => {
      return {
        Strike: Clamp(Math.floor(level / 10), 1, 10000),
        "Full Charge": 1,
        Firebolt: Clamp(Math.floor(level / 10), 1, 10000),
        "Flame Stike": Clamp(Math.floor(level / 10), 1, 10000)
      };
    }
  }
};
let rarityNames = {
  0: "Weakened ",
  1: "Injured ",
  2: "Lesser ",
  3: "Exhausted ",
  4: "Tired ",
  5: "",
  6: "Unusual ",
  7: "Strong ",
  8: "Giant ",
  9: "Alpha ",
  10: "Omega ",
  11: "Rumored ",
  12: "Nightmare ",
  13: "Legendary ",
  14: "Mythical ",
  15: "Ultimate "
};

export function MonsterGeneration(name, level, rarity) {
  if (name in MonsterList) {
    let mob = MonsterList[name];
    let r = Clamp(rarity, mob.minRarity, mob.maxRarity);
    let stats = new Stats({});

    let hp = calc(mob.hpScale, mob.hp, level, mob.minLevel, r, mob.rarityScale);
    let atk = calc(mob.atkScale, mob.atk, level, mob.minLevel, r, mob.rarityScale);
    let def = calc(mob.defScale, mob.def, level, mob.minLevel, r, mob.rarityScale);
    if (mob.maxLevel !== -1) level = Math.max(level, mob.minLevel);

    let rarename = rarityNames[r];
    stats.setMobStats(mob, level, rarename, hp, atk, def);
    return stats;
  }
  return null;
}
function calc(scale, base, level, minlevel, rarity, rarityScale) {
  // console.log(base, Math.pow(1 + scale, level), Math.pow(2, rarity))
  let val = 
    base.copy().multiplyBy(scale.copy().plus(1).toPower(level-minlevel)).multiplyBy(Math.pow(rarityScale, rarity-5)).trunc()
  if(val.lt(1))
  {
    return new NumberContainer(1)
  }
  else{
    return val;
  }
}

export default { MonsterGeneration };
