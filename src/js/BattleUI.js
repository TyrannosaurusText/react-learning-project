import React from "react";
import "../css/Battle.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { toEng } from "./globals";
import Observer from "./Observer";
import Skills from "./Skills";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import UIState from "./UIState";
// import Stats from "./Stats";

export function BattleInfoWindow(props) {
  return (
    <div className="battleinfo">
      <div className="turn-indicator">
        current turn:
        <div className="cut-text">{props.turn}</div>
      </div>
      <div className="turn-indicator battleinfo-buttons">
        <Button className="mr-1" variant="warning">
          Escape
        </Button>
        <Button variant="primary">Pass Turn</Button>
      </div>
    </div>
  );
}

function SkillButtons(props) {
  let skill = Skills.getSkill(props.value);
  let color = {
    Fire: "danger",
    Water: "success",
    Light: "warning",
    Physical: "secondary",
    Dark: "Dark",
    Earth: "Success"
  };
  let variant = "secondary";
  if (skill) variant = color[skill.element];
  if (props.value !== "None") {
    let cost_str = null;
    let desc = skill.desc(props.level);
    if (skill.MP_Cost || skill.SP_Cost)
      cost_str = (
        <div>
          Costs: {skill.SP_Cost ? skill.SP_Cost + " SP" : ""}{" "}
          {skill.MP_Cost ? skill.MP_Cost + "% MP" : ""}
        </div>
      );
    return (
      <OverlayTrigger
        trigger="hover"
        placement="bottom"
        arrowProps={{ fontSize: "10px" }}
        overlay={
          <Tooltip className="my-tooltip">
            {props.value + " lvl " + props.level}
            {skill.type ? <div>{skill.type}</div> : ""}
            {skill.distance ? <div>{skill.distance}</div> : ""}
            {cost_str ? <div>{cost_str}</div> : ""}
            {desc}
          </Tooltip>
        }
      >
        <SkillButton
          variant={variant}
          value={props.value}
          onCD={props.onCD}
          onClick={() => {
            props.onClick();
          }}
        />
      </OverlayTrigger>
    );
  } else
    return (
      <SkillButton
        variant={variant}
        value={props.value}
        disabled={true}
        onClick={() => {}}
      />
    );
}
function SkillButton(props) {
  return (
    <Button
      className="ml-1 mt-1 btn-block skillbutton"
      variant={props.variant}
      disabled={props.disabled} //dont disable b/c bug
      onClick={() => {
        props.onClick();
      }}
    >
      {props.value + (props.onCD ? " (" + props.onCD + ")" : "")}
    </Button>
  );
}

export class BattleFunc extends UIState {
  constructor(props) {
    super(props);
    // this._isMounted = false;
    this.state = {
      PlayerTarget: 0,
      Enemies: {},
      Party: {},
      enemyUIVisibility: null,
      turn: "Player",

      // WindowMode: null
    };
    Observer.subscribe("BattleStateChange", "Window", update => {
      this.notifyStateChange(update);
    });
  }

  componentDidMount() {
    if(!this.props.hidden){
      Observer.notify("BattleSendInfo", null);
    }
  }

  updateUIVisibility(newState) {
    let vis = this.state.enemyUIVisibility;
    let PlayerTarget = this.state.PlayerTarget;
    let Enemies = this.state.Enemies;
    if (newState["Enemies"] != null) Enemies = newState.Enemies;
    if (newState["PlayerTarget"] != null) PlayerTarget = newState.PlayerTarget;
    vis = {};
    for (var i = 0; i < 5; i++) {
      if (i !== parseInt(PlayerTarget) && Enemies[i] != null) {
        vis[i] = Enemies[i];
      }
    }

    newState["enemyUIVisibility"] = vis;
  }
  notifyStateChange(update) {
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
  render() {

    if(this.props.hidden) return <div></div>
    console.log(this.state.Enemies);
    console.log(this.state.PlayerTarget)
    let target = this.state.Enemies[this.state.PlayerTarget]
    return (
      <div>
        <div className="pos">
          <BattleInfoWindow turn={this.state.turn} />
          <div className="team0">
            <BattlePlayerUI
              // useSkill={i => this.state.useSkill(i)}
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
    );
  }
}
export class BattlePlayerUI extends UIState {
  useSkill(skillName) {
    Observer.notify("BattlePlayerUseSkill", skillName);
  }
  addButton(i) {
    const statusSheet = this.props.PlayerStats;
    const equippedSkills = statusSheet.getval("equippedSkills");
    const cdc = this.props.PlayerStats.get("cooldownContainer");
    let skillName = equippedSkills[i];
    const cd = cdc[skillName];
    if (!equippedSkills) return null;
    return (
      <div className="btn-group">
        <SkillButtons
          value={skillName}
          stats={this.props.PlayerStats}
          onCD={cd}
          level={statusSheet.getSkillLevel(skillName)}
          onClick={() => {
            this.useSkill(skillName);
          }}
        />
      </div>
    );
  }

  render() {
    const statusSheet = this.props.PlayerStats;
    console.log(statusSheet);
    if (statusSheet)
      return (
        <Container>
          <NameHPWindow statusSheet={statusSheet} />
          <StatusWindow statusSheet={statusSheet} />
          <LevelATKDEFWindow statusSheet={statusSheet} />
          <Row className="window-border">
            <ThreeBoxResource
              name={"SP"}
              val={statusSheet.getval("SP_now")}
              valmax={statusSheet.getval("SP_max")}
            />
            <ThreeBoxResource
              name={"MP"}
              val={statusSheet.getval("MP_now")}
              valmax={statusSheet.getval("MP_max")}
            />
            <Col>
              <ActionsLeft ActionsLeft={statusSheet.getval("turns_now")} />
            </Col>
          </Row>

          <Row>
            <Col className="skillBox">
              <div className="statwin-skills">
                <div className="skills">
                  <div className="skillbar">
                    <div className="btn-block btn-toolbar skill-btn">
                      {this.addButton(0)}
                      {this.addButton(1)}
                      {this.addButton(2)}
                      {this.addButton(3)}
                    </div>
                  </div>
                  <div className="skillbar">
                    <div className="btn-block btn-toolbar skill-btn">
                      {this.addButton(4)}
                      {this.addButton(5)}
                      {this.addButton(6)}
                      {this.addButton(7)}
                    </div>
                  </div>
                  <div className="skillbar">
                    <div className="btn-block btn-toolbar skill-btn">
                      {this.addButton(8)}
                      {this.addButton(9)}
                      {this.addButton(10)}
                      {this.addButton(11)}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      );
    else return null;
  }
}

export class BattleEnemyUI extends React.Component {
  render() {
    if (this.props == null || this.props.statusSheet == null) return <div />;

    const statusSheet = this.props.statusSheet;
    const enemyUIVisibility = this.props.enemyUIVisibility;

    return (
      <Container>
        <NameHPWindow statusSheet={statusSheet} />
        <StatusWindow statusSheet={statusSheet} />
        <LevelATKDEFWindow statusSheet={statusSheet} />
        <Row className="window-border">
          <Col className="bar">
            <Charge
              charge_now={statusSheet.getval("charge_now")}
              charge_max={statusSheet.getval("charge_max")}
            />
          </Col>
          <Col>
            <div />
          </Col>
          <Col>
            <div />
          </Col>
        </Row>
        <Row>
          {enemyUIVisibility ? (
            <Col className="mini-enemy-box">
              {enemyUIVisibility[0] ? (
                miniEnemyDisplay(enemyUIVisibility[0])
              ) : (
                <div />
              )}
              {enemyUIVisibility[1] ? (
                miniEnemyDisplay(enemyUIVisibility[1])
              ) : (
                <div />
              )}
              {enemyUIVisibility[2] ? (
                miniEnemyDisplay(enemyUIVisibility[2])
              ) : (
                <div />
              )}
              {enemyUIVisibility[3] ? (
                miniEnemyDisplay(enemyUIVisibility[3])
              ) : (
                <div />
              )}
              {enemyUIVisibility[4] ? (
                miniEnemyDisplay(enemyUIVisibility[4])
              ) : (
                <div />
              )}
            </Col>
          ) : null}
        </Row>
      </Container>
    );
  }
}
function miniEnemyDisplay(props) {
  if (props == null) return;
  let percent = props
    .get("HP_now")
    .copy()
    .divideBy(props.get("HP_max"))
    .multiplyBy(100).val;
  let hppercent =
    Math.min(100, percent)
      .toFixed(1)
      .toString() + "%";
  let val = props.getval("positionIndex");

  let chargeBlink =
    props.getval("charge_now") === props.getval("charge_max")
      ? "blinker 1s step-start infinite"
      : "";

  return (
    <div
      className="miniEnemyUI"
      onClick={() => {
        Observer.notify("BattleChangeTarget", val);
      }}
    >
      <div className="miniHPBar" style={{ width: hppercent }}>
        {props.getval("name") +
          " HP:" +
          toEng(props.getval("HP_now")) +
          " level: " +
          toEng(props.getval("level")) +
          " ATK: " +
          toEng(props.getval("atk_now")) +
          " DEF: " +
          toEng(props.getval("def_now"))}
        <div className="inline" style={{ animation: chargeBlink }}>
          {" Charge: " +
            props.getval("charge_now") +
            "/" +
            props.getval("charge_max")}
        </div>
      </div>
    </div>
  );
}
function NameHPWindow(props) {
  return (
    <Row className="standard-bar">
      <Col className="window-border">
        <NameHP
          name={props.statusSheet.getval("name")}
          HP_now={props.statusSheet.getval("HP_now")}
          HP={props.statusSheet.getval("HP_max")}
        />
      </Col>
    </Row>
  );
}

function StatusWindow(props) {
  let statusEffects = props.statusSheet.get("buffContainer");
  let text = "";
  Object.keys(statusEffects).forEach(element => {
    let buff = statusEffects[element];
    text += buff.toString();
  });

  return (
    <Row className="window-border status-effects-bar">
      <div className="text-offset-status">{text}</div>
    </Row>
  );
}

function LevelATKDEFWindow(props) {
  return (
    <Row className="window-border">
      <ThreeBox name={"Level"} val={props.statusSheet.getval("level")} />
      <ThreeBoxEng name={"ATK"} val={props.statusSheet.getval("atk_now")} />
      <ThreeBoxEng name={"DEF"} val={props.statusSheet.getval("def_now")} />
    </Row>
  );
}

function ThreeBox(props) {
  return (
    <Col className="bar">
      <div className="statwin-three-box">
        <div className="statwin-text">
          {props.name}: {props.val}
        </div>
      </div>
    </Col>
  );
}
function ThreeBoxEng(props) {
  return (
    <Col className="bar">
      <div className="statwin-three-box">
        <div className="statwin-text">
          {props.name}: {toEng(props.val)}
        </div>
      </div>
    </Col>
  );
}
function ThreeBoxResource(props) {
  return (
    <Col className="bar">
      <div className="statwin-three-box">
        <div className="statwin-text">
          {props.name}: {toEng(props.val)}/{toEng(props.valmax)}
        </div>
      </div>
    </Col>
  );
}

function NameHP(props) {
  let hppercent =
    Math.min(100, (100 * (props.HP_now / props.HP)).toFixed(1)).toString() +
    "%";
  return (
    <div style={{ height: "100%" }}>
      <div className="statwin-namehp">
        <div className="namehp" style={{ width: hppercent }}>
          {/* <div className="HPBar"> */}
          {props.name} HP: {toEng(props.HP_now)}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}
function ActionsLeft(props) {
  return (
    <div className="statwin-three-box">
      <div className="ActionsLeft">Actions: {toEng(props.ActionsLeft)}</div>
    </div>
  );
}

function Charge(props) {
  let chargeColor = "black",
    chargeWeight = "normal",
    chargeBlink = "";
  if (props.charge_now === props.charge_max) {
    chargeColor = "red";
    chargeWeight = "bold";
    chargeBlink = "blinker 1s step-start infinite";
  }

  return (
    <div className="statwin-three-box">
      <div
        className="charge"
        style={{
          color: chargeColor,
          fontWeight: chargeWeight,
          animation: chargeBlink
        }}
      >
        Charge: {toEng(props.charge_now)}/{toEng(props.charge_max)}
      </div>
    </div>
  );
}

export default { BattleFunc };
