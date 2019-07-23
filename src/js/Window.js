import React from "react";
import "../css/Window.css";
import "../css/Player.css";
// import Button from 'react-bootstrap/Button'
// import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import battleInfo from "./Battle.js";
import Log from "./Log.js";
// import Message from "./Message";
import Observer from "./Observer";
import Stats from "./Stats";
import { BattleEnemyUI, BattlePlayerUI } from "./BattleUI";

class Window extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Battle: true,
      PlayerTarget: 0,
      Enemies: {},
      Player: new Stats(),
      enemyUIVisibility: null
    };

    //game will probably crash if this is misused
    //expected update = {data: (stuff) key:"data"}

    Observer.subscribe("BattleStateChange", "Window", update => {
      this.notifyStateChange(update);
    });
    Observer.notify("BattleActivate", true);
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.state.Battle) {
      Observer.notify("BattleSendInfo", 0);
    }
  }
  componentWillUnmount() {
    this._isMounted = false;
  }
  notifyStateChange(update) {
    if (!this._isMounted) return;
    Object.keys(update).forEach(element => {
      if (!(element in this.state)) {
        console.log(element + "is not a valid key!");
        return;
      }
    });
    if ("PlayerTarget" in update) {
    this.updateUIVisibility(update);
    }
    this.setState(update);
  }

  

  updateUIVisibility(newState) {
    let vis = this.state.enemyUIVisibility;
    let PlayerTarget = this.state.PlayerTarget;
    let Enemies = this.state.Enemies;
    if ("Enemies" in newState) Enemies = newState.Enemies;
    if ("PlayerTarget" in newState) PlayerTarget = newState.PlayerTarget
    // if (vis != null) {
    //   let newTarget = newState["PlayerTarget"];
    //   let oldTarget = this.state.PlayerTarget;
    //   vis[oldTarget] = Enemies[oldTarget];
    //   delete vis[newTarget];
    // } else {
    vis = {};
    for (var i = 0; i < 5; i++) {
      
      if (i !== parseInt(PlayerTarget) && Enemies[i] != null) {
        vis[i] = Enemies[i];
      }
    }
  // }

    newState["enemyUIVisibility"] = vis;
    // console.log(vis);
  }

  useSkill(skillName) {
    Observer.notify("BattlePlayerUseSkill", skillName);
    // battle.useSkill(skillName, this.state.Player, this.state.Enemy);
  }

  render() {
    let target = this.state.Enemies[this.state.PlayerTarget];
    return (
      <div className="Window">
        <header className="Window-main">
          <div className="Window-main-content">
            {/* <div>
              <Button
                variant="primary"
                onClick={() => {
                  this.state.Battle.start();
                }}
              >
                Start
              </Button>
            </div> */}
            {this.state.Battle ? (
              <div className="pos">
                <div className="team0">
                  <BattlePlayerUI
                    useSkill={i => this.useSkill(i)}
                    PlayerStats={this.state.Player}
                  />
                </div>
                <div className="team1">
                  {this.state.Enemies ? (
                    <BattleEnemyUI
                      statusSheet={target}
                      enemyUIVisibility={this.state.enemyUIVisibility}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
            <div />
          </div>
          <div className="Window-footer">
            <Log />
          </div>
        </header>
      </div>
    );
  }
}

export default Window;
