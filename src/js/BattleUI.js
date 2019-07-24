import React from "react";
import "../css/Battle.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {
  NameHP,
  Level,
  Attack,
  Defense,
  SP,
  MP,
  ActionsLeft,
  Charge
} from "./CombatUI";
import Button from "react-bootstrap/Button";
import { toEng } from "./globals";
import Observer from "./Observer";
import Skills from "./Skills";
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

  return (
    <Button
      variant={variant}
      onClick={() => {
        props.onClick();
      }}
    >
      {props.value}
    </Button>
  );
}
export class BattlePlayerUI extends React.Component {
  addButton(i) {
    const statusSheet = this.props.PlayerStats;
    const equippedSkills = statusSheet.getval("equippedSkills");
    if (!equippedSkills) return null;
    return (
      <SkillButton
        value={equippedSkills[i]}
        stats={this.props.PlayerStats}
        onClick={() => {
          this.props.useSkill(equippedSkills[i]);
        }}
      />
    );
  }
  render() {
    const statusSheet = this.props.PlayerStats;
    if (statusSheet)
      return (
        <Container>
          <Row className="standard-bar">
            <Col className="window-border">
              <NameHP
                name={statusSheet.getval("name")}
                hp_now={statusSheet.getval("hp_now")}
                hp={statusSheet.getval("hp_max")}
              />
            </Col>
          </Row>
          <Row className="window-border status-effects-bar">
          </Row>
          <Row className="window-border">
            <Col>
              <Level level={statusSheet.getval("level")} />
            </Col>
            <Col>
              <Attack attack={statusSheet.getval("atk_now")} />
            </Col>
            <Col>
              <Defense defense={statusSheet.getval("def_now")} />
            </Col>
          </Row>
          <Row className="window-border">
            <Col>
              <SP
                SP_now={statusSheet.getval("SP_now")}
                SP={statusSheet.getval("SP_max")}
              />
            </Col>
            <Col>
              <MP
                MP_now={statusSheet.getval("MP_now")}
                MP={statusSheet.getval("MP_max")}
              />
            </Col>
            <Col>
              <ActionsLeft ActionsLeft={statusSheet.getval("turns_now")} />
            </Col>
          </Row>

          <Row >
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
          <Row className="standard-bar">
            <Col className="window-border">
              <NameHP
                name={statusSheet.getval("name")}
                hp_now={statusSheet.getval("hp_now")}
                hp={statusSheet.getval("hp_max")}
              />
            </Col>
          </Row>
          <Row className="window-border status-effects-bar">
          </Row>
          <Row className="window-border">
            <Col>
              <Level level={statusSheet.getval("level")} />
            </Col>
            <Col>
              <Attack attack={statusSheet.getval("atk_now")} />
            </Col>
            <Col>
              <Defense defense={statusSheet.getval("def_now")} />
            </Col>
          </Row>
          <Row className="window-border">
            <Col>
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
    props.getval("charge_now") === props.getval("charge_max") ? "blinker 1s step-start infinite" : "";

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
        <div className="inline" style={{animation:chargeBlink}}>
          {" Charge: " +
            props.getval("charge_now") +
            "/" +
            props.getval("charge_max")}
        </div>
      </div>
    </div>
  );
}

export default { BattlePlayerUI, BattleEnemyUI };
