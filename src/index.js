import React from "react";
import ReactDOM from "react-dom";
import "./css/index.css";
import Window from "./js/Window";
import "./css/bootstrap.css";
import Battle from "./js/Battle";
import Player from "./js/Player";
import { newJobReincarnator } from "./js/globals";
// import Stats from "./js/Stats"
import Skills from "./js/Skills";
import { readTextFile } from "./js/SkillList";
import file from "./skills.csv";
import Log from "./js/Log";

// import character from './Combat'
// import './globals'

// import './bootstrap/dist/css/bootstrap-grid.css';
// import './bootstrap/dist/css/bootstrap-reboot.css';

class Game extends React.Component {
  constructor(props) {
    super(props);
    let stats = newJobReincarnator.copy(); //deep clone
    let skills = Skills.fillSkills(
      "Strike",
      "Flame Strike",
      "ATK Up",
      "ATK Down",
      "Firebolt",
      "Regen"
    );
    stats.set("equippedSkills", skills);
    this.Log = new Log();//create log before battle
  
    this.player = new Player(stats);

    this.battle = new Battle();
  }

  render() {
    // let i = new init();
    // return (<Window c1={global[0].state.c1} c2={global[0].state.c2}/>)
    return <Window />;
  }
}

readTextFile(file, () => {
  ReactDOM.render(<Game />, document.getElementById("root"));
});
