import React from "react";
import "../css/Window.css";
import "../css/Battle.css";
import Button from "react-bootstrap/Button";
// import ButtonToolbar from 'react-bootstrap/ButtonToolbar'
// import Container from "react-bootstrap/Container";
// import Row from "react-bootstrap/Row";
// import battleInfo from "./Battle.js";
import Log from "./Log.js";
// import Message from "./Message";
import Observer from "./Observer";
// import Stats from "./Stats";
import { BattleEnemyUI, BattlePlayerUI, BattleInfoWindow } from "./BattleUI";

class Window extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Battle: false,
      PlayerTarget: 0,
      Enemies: {},
      // Player: new Stats(),
      Party: {},
      enemyUIVisibility: null,
      turn: "Player"
    };

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
      if (this.state[element] == null) {
        console.error(element + "is not a valid key!");
        return;
      }
    });
    if (update["PlayerTarget"] != null) {
      this.updateUIVisibility(update);
    }
    this.setState(update);
  }

  updateUIVisibility(newState) {
    let vis = this.state.enemyUIVisibility;
    let PlayerTarget = this.state.PlayerTarget;
    let Enemies = this.state.Enemies;
    if (newState["Enemies"] != null) Enemies = newState.Enemies;
    if (newState["PlayerTarget"] != null) PlayerTarget = newState.PlayerTarget;
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
            {this.state.Battle ? (
              <div>
                <div className="pos">
                  <BattleInfoWindow turn={this.state.turn} />
                  <div className="team0">
                    <BattlePlayerUI
                      useSkill={i => this.useSkill(i)}
                      PlayerStats={this.state.Party[0]}
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
              </div>
            ) : null}
            <div />
          </div>
          <div className="Window-footer">
            <div className="btn-group">
              <ActivateFeatureButton feature="Battle"></ActivateFeatureButton>
              <ActivateFeatureButton feature="Explore"></ActivateFeatureButton>
              <ActivateFeatureButton feature="Inventory"></ActivateFeatureButton>
              <ActivateFeatureButton feature="Skills"></ActivateFeatureButton>
              <ActivateFeatureButton feature="Boss" disabled={true}></ActivateFeatureButton>
            </div>
            <Log />
          </div>
        </header>
      </div>
    );
  }
}

function ActivateFeatureButton(props){
  return (<Button
    variant="primary"
    disabled={props.disabled}
    onClick={() => {
      Observer.notify("ActivateFeature", props.feature);
    }}>
    {props.feature}
  </Button>
  )
}

export default Window;
