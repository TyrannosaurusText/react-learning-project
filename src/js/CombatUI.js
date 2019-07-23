import React from "react";
// import Button from 'react-bootstrap/Button'
import { toEng } from "./globals";

export function NameHP(props) {
  let hppercent =
    Math.min(100, (100 * (props.hp_now / props.hp)).toFixed(1)).toString() +
    "%";
  return (
    <div className="statwin-namehp">
      <div className="namehp">
        <div className="HPBar" style={{ width: hppercent }}>
          {props.name} HP: {toEng(props.hp_now)}
        </div>
      </div>
    </div>
  );
}

export function Level(props) {
  return (
    <div className="statwin-lvl-atk-hp">
      <div className="level">Level: {toEng(props.level)}</div>
    </div>
  );
}

export function Attack(props) {
  return (
    <div className="statwin-lvl-atk-hp">
      <div className="attack">Atk: {toEng(props.attack)}</div>
    </div>
  );
}
export function Defense(props) {
  return (
    <div className="statwin-lvl-atk-hp">
      <div className="defense">Def: {toEng(props.defense)}</div>
    </div>
  );
}

export function SP(props) {
  return (
    <div className="statwin-lvl-atk-hp">
      <div className="sp">
        SP: {toEng(props.SP_now) + "/" + toEng(props.SP)}
      </div>
    </div>
  );
}
export function MP(props) {
  return (
    <div className="statwin-lvl-atk-hp">
      <div className="mp">
        MP: {toEng(props.MP_now) + "/" + toEng(props.MP)}
      </div>
    </div>
  );
}
export function ActionsLeft(props) {
  return (
    <div className="statwin-lvl-atk-hp">
      <div className="ActionsLeft">Actions: {toEng(props.ActionsLeft)}</div>
    </div>
  );
}

export function Charge(props) {
  let chargeColor = "black",
    chargeWeight = "normal",
    chargeBlink = "";
  if (props.charge_now === props.charge_max) {
    chargeColor = "red";
    chargeWeight = "bold";
    chargeBlink = "blinker 1s step-start infinite";
  }

  return (
    <div className="statwin-lvl-atk-hp">
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
export default { NameHP, Attack, Defense, Level, SP, MP, ActionsLeft, Charge };
