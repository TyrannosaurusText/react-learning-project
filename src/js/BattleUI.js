import React from "react";
import "../css/Battle.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { toEng } from "./globals";
import Observer from "./Observer";
import Skills from "./Skills";
import { OverlayTrigger } from "react-bootstrap";
import { Tooltip } from "react-bootstrap";
// import Stats from "./Stats";

function SkillButton(props) {
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
  // console.log(props.cd);
  if (props.value !== "None") {
    let cost_str = null;
    let desc = skill.desc(props.level);
    if(skill.MP_Cost || skill.SP_Cost)
    cost_str = (<div>Costs: {(skill.SP_Cost ? skill.SP_Cost + " SP" : "")} {(skill.MP_Cost?skill.MP_Cost + "% MP" : "")}</div>)
    return (
      <OverlayTrigger
        placement="bottom"
        arrowProps={{fontSize:"10px"}}
        overlay={
          <Tooltip className="my-tooltip"  >
            {props.value + " lvl "+props.level}
            {skill.type?<div>{skill.type}</div> :""}
            {skill.distance?<div>{skill.distance}</div> :""}
            {cost_str?(<div>{cost_str}</div>) : ""}
            {desc}
          </Tooltip>
        }
      >
        <Button
          variant={variant}
          disabled={props.onCD > 0}
          onClick={() => {
            props.onClick();
          }}
        >
          {props.value + (props.onCD ? " (" + props.onCD + ")" : "")}
        </Button>
      </OverlayTrigger>
    );
  } else
    return (
      <Button
        variant={variant}
        disabled={props.onCD > 0}
        onClick={() => {
          props.onClick();
        }}
      >
        None
      </Button>
    );
}

export class BattlePlayerUI extends React.Component {
  addButton(i) {
    const statusSheet = this.props.PlayerStats;
    const equippedSkills = statusSheet.getval("equippedSkills");
    const cdc = this.props.PlayerStats.get("cooldownContainer");
    let skillName = equippedSkills[i];
    const cd = cdc[skillName];
    // console.log(cdc)
    if (!equippedSkills) return null;
    return (
      <SkillButton
        value={skillName}
        stats={this.props.PlayerStats}
        onCD={cd}
        level={statusSheet.getSkillLevel(skillName)}
        onClick={() => {
          this.props.useSkill(skillName);
        }}
      />
    );
  }
  render() {
    const statusSheet = this.props.PlayerStats;
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
                  <div>
                    {this.addButton(0)}
                    {this.addButton(1)}
                    {this.addButton(2)}
                    {this.addButton(3)}
                  </div>{" "}
                  <div>
                    {this.addButton(4)}
                    {this.addButton(5)}
                    {this.addButton(6)}
                    {this.addButton(7)}
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

    if (statusSheet)
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
    else return null;
  }
}
function miniEnemyDisplay(props) {
  if (props == null) return;
  let percent = props
    .get("hp_now")
    .copy()
    .divideBy(props.get("hp_max"))
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
          toEng(props.getval("hp_now")) +
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
          hp_now={props.statusSheet.getval("hp_now")}
          hp={props.statusSheet.getval("hp_max")}
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
    Math.min(100, (100 * (props.hp_now / props.hp)).toFixed(1)).toString() +
    "%";
  return (
    <div style={{ height: "100%" }}>
      <div className="statwin-namehp">
        <div className="namehp" style={{ width: hppercent }}>
          {/* <div className="HPBar"> */}
          {props.name} HP: {toEng(props.hp_now)}
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

export default { BattlePlayerUI, BattleEnemyUI };
