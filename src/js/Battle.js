import Skills from "./Skills";
import { skillEnum } from "./SkillList";
import  Observer from "./Observer";
import Message from "./Message";
import Stats from "./Stats";
import Player from "./Player";
import { MonsterGeneration } from "./MonsterGeneration";
import { getRndmInteger } from "./random";
import { toEng, ObserverEnum } from "./globals";
import EnemyPlayer from "./EnemyAI.js";
import { NumberContainer } from "./numbers";

/**
 *
 */
class Battle {
  constructor(w) {
    this.EnemyAI = null;
    this.statusParty = {};
    this.statusEnemies = {};
    this.playerAlive = false;
    this.enemyAlive = false;
    this.playerturn = true;
    this.Wind = w;
    this.featureActive = false;
    this.respawnTime = 3000;
    this.update = {};
    this.turn = -1;
    Observer.subscribe("BattleActivate", "Battle", val => this.start(val));
    Observer.subscribe("BattlePlayerUseSkill", "Battle", obj => {
      this.notifyPlayerUseSkill(obj);
    });
    Observer.subscribe("BattleChangeTarget", "Battle", val =>
      this.changeTarget(val)
    );
    Observer.subscribe("BattleSendInfo", "Battle", () => {
      this.add("Party", this.statusParty);
      this.add("Enemies", this.statusEnemies);
      this.add("PlayerTarget", this.statusParty[0].getval("targetIndex"));
      this.add("Battle", true);
      this.sendUpdate();
    });
    Observer.subscribe("BattlePlayerDefeated", "Battle", () => {
      // holding this off so that testing is easier.
      // this.battleEnded = true;
      // setTimeout(() => this.start(true), this.respawnTime);
    });
    Observer.subscribe("BattleEnemyDefeated", "Battle", EnemiesIndex => {
      this.onEnemyDefeated(EnemiesIndex);
    });
    Observer.subscribe("BattleEnemyUseSkill", "Battle", update => {
      this.notifyEnemyUseSkill(update["skillName"], update["index"]);
    });
    Observer.subscribe("BattlePlayerTurn", "Battle", () => {
      Object.keys(this.statusEnemies).forEach(element => {
        this.statusEnemies[element].decrementBuffDurations();
      });
      this.turn = "Player";
      this.statusParty[0].setval(
        "turns_now",
        this.statusParty[0].get("turns_max")
      );
     
      this.add("Party", this.statusParty);
      this.add("turn", this.turn);
      this.sendUpdate();
    });
  }

  onEnemyDefeated(EnemiesIndex) {
    delete this.statusEnemies[EnemiesIndex];
    this.statusParty[0].setval("targetIndex", this.pickNewTarget());
    this.add("PlayerTarget", this.statusParty[0].getval("targetIndex"));
    this.add("Enemies", this.statusEnemies);
    if (Object.keys(this.statusEnemies).length === 0) {
      this.battleEnded = true;
      setTimeout(() => this.start(true), this.respawnTime);
    } else {
      this.sendUpdate();
    }
  }

  changeTarget(val) {
    this.statusParty[0].setval("targetIndex", val);
    this.add("PlayerTarget", val);
    this.sendUpdate();
  }

  pickNewTarget() {
    if (Object.keys(this.statusEnemies).length) {
      return Object.keys(this.statusEnemies)[0];
    }
  }

  sendUpdate() {
    Observer.notify("BattleStateChange", this.update);
    this.update = {};
  }
  add(key, val) {
    this.update[key] = val;
  }
  getState() {
    return this.featureActive;
  }
  start(val) {
    this.featureActive = val;

    if (val) {
      // delete this.EnemyAI;
      // delete this.statusEnemies;
      this.statusEnemies = {};
      this.statusParty = {};
      let statusPlayer = Player.getPlayerStats();
      statusPlayer.setBattleStats();
      this.statusParty[0] = statusPlayer;

      // let temp = Stats.copy(this.statusPlayer);

      let level = statusPlayer.get("level");

      let temp = null;

      let numMonsters = getRndmInteger(4, 4);
      for (var i = 0; i < numMonsters; i++) {
        let leveloffset = getRndmInteger(0, 10);
        temp = MonsterGeneration("Enemy", level + leveloffset, 0, 15);
        temp.setBattleStats();
        temp.set("name", temp.get("name"));
        temp.set("positionIndex", i);
        this.statusEnemies[i] = temp;
        Observer.notify(ObserverEnum.AddMessage, getSpawnMessage(temp));
      }
      this.turn = "Player"; //player goes first

      this.playerAlive = true;
      this.enemyAlive = true;
      this.battleEnded = false;
      this.add("Party", this.statusParty);
      this.add("Enemies", this.statusEnemies);
      this.add("PlayerTarget", statusPlayer.getval("targetIndex"));
      this.add("Battle", true);
      this.add("turn", this.turn);

      this.EnemyAI = new EnemyPlayer(this.statusEnemies);
      this.sendUpdate();
    }
  }

  notifyPlayerUseSkill(skillName) {
    if (typeof skillName !== "string") {
      console.error("not a string");
      return;
    }
    if (skillName === "None" || this.turn !== "Player") {
      return;
    }
    let player = this.statusParty[0];

    if(skillName in player.get('cooldownContainer')){
      return; //on cooldown
    }

    let target = player.getval("targetIndex");
    let enemies = this.statusEnemies;
    let isValid = Object.values(player.get("equippedSkills")).includes(
      skillName
    );
    if (!isValid) {
      console.error("skill not equpped by player");
      return;
    }
    let result = false;
    if (this.turn === "Player") {
      result = this.useSkill(skillName, player, enemies[target]);
      
    }
    // console.log(result);
    let turns = player.getval("turns_now");
    if (result === true) {
      //skill was used
      player.decrement("turns_now");
      let cd = Skills.getSkill(skillName)["cooldown"];
      if(cd != null)
      {
        player.putOnCooldown(skillName, cd);
      }

      if (turns - 1 <= 0) {
        //check for turn end
        this.turn = "Enemy";
        player.decrementBuffDurations();
        player.decrementSkillCooldown();
        // this.add("turn", this.turn);
        // this.sendUpdate();
        Observer.notify("BattleEnemyTurn", true);
      }
    }
  }
  notifyEnemyUseSkill(skillName, enemyIndex) {
    if (typeof skillName !== "string") {
      console.error("not a string");
      return;
    }
    let enemy = this.statusEnemies[enemyIndex];
    let target = this.statusParty[enemy.get("targetIndex")];
    //TODO: add change target index
    // console.log(skillName);
    // console.log(enemy.get("skillLevels"));
    let isValid = Object.keys(enemy.get("skillLevels")).includes(skillName);
    if (!isValid) {
      console.log(enemy);
      console.error("enemy does not have skill");
      return;
    }
    // let result = false;
    if (this.turn === "Enemy") {
      // result =
      this.add("turn", enemy.get("name"));
      this.sendUpdate();
      this.useSkill(skillName, enemy, target);
    }
  }
  useSkill(skillName, user, target) {
    if (
      this.battleEnded ||
      !(user instanceof Stats) ||
      !(target instanceof Stats)
    )
      return false;
    let skill = Skills.getSkill(skillName);
    if (skill == null)
      // skill doesn't exist
      return false;
    //check and consume resources
    let skillLevel = user.getSkillLevel(skillName);
    if (skill.type === "Passive") return false;

    let skillResult = null;

    let skillInputObj = {};
    let bonusMult = new NumberContainer(1);

    if (skill["MP_Cost"] && user.get("MP_max") != null) {
      let mp_spent = user
        .get("MP_max")
        .copy()
        .multiplyBy(skill["MP_Cost"] / 100).round();
      if(user.get("MP") != null && mp_spent.gt(user.get("MP_now"))) return false;
      user.get("MP_now").minus(mp_spent); 
      skillInputObj["MP_Spent"] = mp_spent;
    }

    if (skill["SP_Cost"]  && user.get("SP_now")) {
      let sp_remaining = user
        .get("SP_now")
        .copy()
        .minus(skill["SP_Cost"]);

      bonusMult.multiplyBy(
        Skills.getSkill(skillEnum.SPMastery).onUse(
          user.getSkillLevel(skillEnum.SPMastery),
          sp_remaining
        )
      );
      user.set("SP_now", sp_remaining);
    }
    //check skill type then use
    let allAlly = this.turn > 0 ? this.statusParty : this.statusEnemies;
    let allTarget = this.turn > 0 ? this.statusEnemies : this.statusParty;
 
    skillResult= skill.onUse(skillLevel, skillInputObj);
    if(skillResult[skillName])
      skillName = skillResult[skillName];
    if (skillResult["self"]) {
      loopSkillResult(skillResult["self"], user, user, 1, skillName);
    }
    if (skillResult["AllAlly"] || skillResult["All"]) {
      loopSkillResult(skillResult["All"], user, allAlly, bonusMult, skillName);
    }
    if (skillResult["AllEnemy"] || skillResult["All"]) {
      loopSkillResult(skillResult["All"], user, allTarget, bonusMult, skillName);
    }
    if (skillResult["target"]) {
      loopSkillResult(
        skillResult["target"],
        user,
        target,
        bonusMult,
        skillName
      );
    }

    //update statuses
    
    this.add("Party", this.statusParty);
    this.add("Enemies", this.statusEnemies);
    this.sendUpdate();
    Observer.notify("BattleSkillUseEnd", true);
    return true;
  }
}

function getSpawnMessage(temp) {
  return new Message(
    "A level " +
      temp.get("level") +
      " " +
      temp.get("name") +
      " appeared. (" +
      toEng(temp.get("hp")) +
      ", " +
      toEng(temp.get("atk")) +
      ", " +
      toEng(temp.get("def")) +
      ")"
  );
}

/**
 * example input
 *  obj = {target: {damage:{mult, flat, hits}, debuff: buffobj },
 *   user: {buff: buffobj, add: [key, number (percentage) ]}}
 *  }
 * result:
 *  loopSkillResult(obj["target"], user, target, bonus)
 *  -> applySkillResult({mult, flat, hits}, user, target)
 *  -> applySkillResult(buffobj, user, target, bonus)
 *  ... etc
 */
function loopSkillResult(arr, user, target, bonusMult, skillName) {
  // if (arr[0] === "damage") {
  //   //damage comes first
  //   applySkillResult("damage", arr[1], user, target, bonusMult);
  //   arr = arr.slice(1);
  // }
  arr.forEach((element, index) => {
    applySkillResult(
      arr[index][0],
      arr[index][1],
      user,
      target,
      bonusMult,
      skillName
    );
  });
}

/**
 * set - sets resource at key to val% i.e. charge_now, 100 -> sets charge to 100% capacity
 * add - adds to resource same input as set
 * sub - subtracts
 * damage - calls do_damage
 * buff/debuff - applies a statusEffect
 */
function applySkillResult(
  type,
  obj,
  user,
  target,
  bonusMult = 1,
  skillName = ""
) {
  switch (type) {
    case "set":
      target.setval(obj["key"], obj["val"]);
      break;
    case "subtract":
      obj["val"] = -1 * obj["val"];
      add(target, obj["key"], obj["val"]);
      break;
    case "add":
      add(target, obj["key"], obj["val"]);
      break;
    case "damage":
      let dmgTaken = user.do_damage(target, obj, bonusMult);
      Observer.notify(
        ObserverEnum.AddMessage,
        new Message(
          damageMessage(
            user.get("name"),
            skillName,
            target.get("name"),
            dmgTaken.val
          )
        )
      );
      return;
    // break;
    case "buff":
    case "debuff":
      obj["statusEffect"].applyTo(target);
      break;
    default:
      //do nothing
      break;
  }
  Observer.notify(
    ObserverEnum.AddMessage,
    new Message(user.get("name") + " used " + skillName + ".")
  );
}

function add(target, key, val) {
  let key_now = key + "_now";
  let key_max = key + "_max";
  let val_max = target.get(key_max);
  let val_add = val_max
    .copy()
    .multiplyBy(val / 100)
    .trunc();

  if (
    target
      .get(key_now)
      .copy()
      .plus(val_add)
      .gte(val_max)
  ) {
    target.set(key_now, val_max);
  } else {
    target.plus(key_now, val_add);
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

export default Battle;
