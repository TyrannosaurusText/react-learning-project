import Skills from "./Skills";
import { skillEnum } from "./SkillList";
import Observer from "./Observer";
import Message from "./Message";
import Stats from "./Stats";
import Player from "./Player";
import { MonsterGeneration } from "./MonsterGeneration";
import { getRndmInteger } from "./random";
import { toEng } from "./globals";
import EnemyPlayer from "./EnemyAI.js";
import { NumberContainer } from "./numbers";

/**
 *
 */
class Battle {
  constructor(w) {
    this.statusPlayer = null;
    this.EnemyAI = null;
    this.playerTarget = null;
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
      this.add("Player", this.statusPlayer);
      this.add("Enemies", this.statusEnemies);
      this.add("PlayerTarget", this.playerTarget);
      this.add("Battle", true);
      this.sendUpdate();
    });
    Observer.subscribe("BattlePlayerDefeated", "Battle", () => {});
    Observer.subscribe("BattleEnemyDefeated", "Battle", EnemiesIndex => {
      this.onEnemyDefeated(EnemiesIndex);
    });
    Observer.subscribe("BattleEnemyUseSkill", "Battle", update => {
      this.notifyEnemyUseSkill(update["skillName"], update["index"]);
    });
    Observer.subscribe("BattlePlayerTurn", "Battle", () => {
      this.turn = "Player";
      console.log("turn changed")
      this.statusPlayer.set("turns_now", this.statusPlayer.get("turns_max").copy());
      this.add("Player", this.statusPlayer);
      this.sendUpdate();
    });
  }

  onEnemyDefeated(EnemiesIndex) {
    delete this.statusEnemies[EnemiesIndex];
    this.playerTarget = this.pickNewTarget();
    this.add("PlayerTarget", this.playerTarget);
    this.add("Enemies", this.statusEnemies);
    if (Object.keys(this.statusEnemies).length === 0) {
      setTimeout(() => this.start(true), this.respawnTime);
    } else {
      this.sendUpdate();
    }
  }

  changeTarget(val) {
    this.playerTarget = val;
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
      delete this.EnemyAI;
      delete this.statusEnemies;
      this.statusEnemies = {};
      this.statusPlayer = Player.getPlayerStats();
      this.statusPlayer.setBattleStats();

      // let temp = Stats.copy(this.statusPlayer);

      let level = this.statusPlayer.get("level");

      let temp = null;

      let numMonsters = getRndmInteger(4, 4);
      for (var i = 0; i < numMonsters; i++) {
        let leveloffset = getRndmInteger(0, 10);
        let rarity = getRndmInteger(0, 1);
        temp = MonsterGeneration("Enemy", level + leveloffset, rarity);
        temp.setBattleStats();
        temp.set("name", temp.get("name"));
        temp.set("positionIndex", i);
        this.statusEnemies[i] = temp;
        Observer.notify("LogAddMessage", getSpawnMessage(temp));
      }
      this.turn = "Player"; //player goes first
      this.playerTarget = 0;

      this.playerAlive = true;
      this.enemyAlive = true;
      this.add("Player", this.statusPlayer);
      this.add("Enemies", this.statusEnemies);
      this.add("PlayerTarget", this.playerTarget);
      this.add("Battle", true);

      this.EnemyAI = new EnemyPlayer(this.statusEnemies);
      this.sendUpdate();
    }
  }

  notifyPlayerUseSkill(skillName) {
    if (typeof skillName !== "string") {
      console.log("not a string");
      return;
    }
    if (skillName === "None") {
      return;
    }
    let player = this.statusPlayer;
    let enemies = this.statusEnemies;
    let target = this.playerTarget;
    let isValid = Object.values(player.get("equippedSkills")).includes(
      skillName
    );
    if (!isValid) {
      console.log("skill not equpped by player");
      return;
    }
    let result = false;
    if (this.turn === "Player") {
      result = this.useSkill(skillName, player, enemies[target]);
    }
    // console.log(result);
    let turns = player.getval("turns_now");
    if (result === true) {
      player.decrement("turns_now");
    }
    if (turns - 1 <= 0) {
      this.turn = "Enemy";
      Observer.notify("BattleEnemyTurn", true);
    }
  }
  notifyEnemyUseSkill(skillName, enemyIndex) {
    if (typeof skillName !== "string") {
      console.log("not a string");
      return;
    }
    let player = this.statusPlayer;
    // console.log(enemyIndex);
    let enemy = this.statusEnemies[enemyIndex];

    // console.log(skillName);
    // console.log(enemy.get("skillLevels"));
    let isValid = Object.keys(enemy.get("skillLevels")).includes(skillName);
    if (!isValid) {
      console.log("enemy does not have skill");
      return;
    }
    // let result = false;
    if (this.turn === "Enemy") {
      // result =
      this.useSkill(skillName, enemy, player);
    }
  }
  useSkill(skillName, user, target) {
    if (!(user instanceof Stats) || !(target instanceof Stats)) return false;
    let skill = Skills.getSkill(skillName);
    if (skill == null)
      // skill doesn't exist
      return false;
    //check and consume resources
    let skillLevel = user.getSkillLevel(skillName);
    let skillResult = null;
    if (skill.type === "Passive") return false;
    else if (skill.type === "Recovery") {
      if (skill.target === "self") {
        skillResult = skill.onUse(skillLevel, user);
        if (!("skillName" in skillResult)) {
          skillResult["skillName"] = skillName;
        }

        let arr = skillResult["set"];
        arr.forEach(key => {
          user.set(arr[0][0], arr[0][1]);
        });
        // console.log(user);
        Observer.notify(
          "LogAddMessage",
          new Message(user.get("name") + " used " + skillResult.skillName + ".")
        );
      } else if (skill.target === "Boss") {
      } else if (skill.target === "All") {
      }
    } else if (skill.type === "Buff") {
      //TODO: Add temporary buff mechanism.
      let target = null;
      if(skill.target === "self")
        target = user;
      else if(skill.target ==="All")
      {
        target = this.statusEnemies; //as of now player is only solo.
      }
      let result = skill.onUse(skillLevel, target);
      if(skill.target === "All")
      {
        //todo
      }
      else
      {
        result.buff.applyTo(target);
        Observer.notify("LogAddMessage", new Message(target.get("name")+ " used " + skillName +"."))
      }

    } else if(skill.type === "Debuff")
    {

    } 
    else {
      let bonusMult = new NumberContainer(1);
      if ("SP_Cost" in skill) {
        let sp_remaining = new NumberContainer(
          Math.max(0, user.getval("SP_now") - skill["SP_Cost"])
        );

        bonusMult.multiplyBy(
          Skills.getSkill(skillEnum.SPMastery).onUse(
            user.getSkillLevel(skillEnum.SPMastery),
            sp_remaining
          )
        );
        user.set("SP_now", sp_remaining);
      }

      //calculate skill use result
      skillResult = skill.onUse(skillLevel);
      if (!("damageMult" in skillResult)) {
        skillResult["damageMult"] = 1;
      }
      if (!("damageFlat" in skillResult)) {
        skillResult["damageFlat"] = 0;
      }

      // let dmgTaken = 0;
      if (!("skillName" in skillResult)) {
        skillResult["skillName"] = skillName;
      }
      user.do_damage(target, skillResult, bonusMult);
    }

    //update statuses
    this.add("Player", this.statusPlayer);
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

export default Battle;
