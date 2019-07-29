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
import InventoryUI from "./InventoryUI";
// import Stats from "./Stats";
import { BattleFunc } from "./BattleUI";

class Window extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      WindowMode: "Inventory"
    };
  }

  render() {
    return (
      <div className="Window">
        <header className="Window-main">
          <div className="Window-main-content">
            <BattleFunc hidden={this.state.WindowMode !== "Battle"}/> 
            <InventoryUI hidden={this.state.WindowMode !== "Inventory"}/>
            <div />
          </div>
          <div className="Window-footer">
            <div className="btn-group">
              {this.ActivateFeatureButton("Battle")}
              {this.ActivateFeatureButton("Explore", false)}
              {this.ActivateFeatureButton("Inventory", false)}
              {this.ActivateFeatureButton("Skills", false)}
              {this.ActivateFeatureButton("Boss", true)}
            </div>
            <Log />
          </div>
        </header>
      </div>
    );
  }
  ActivateFeatureButton(feature, disabled = false) {
    return (
      <Button
        variant="primary"
        disabled={disabled}
        onClick={() => {
          Observer.notify("ActivateFeature", feature);
          this.setState({ WindowMode: feature });
        }}
      >
        {feature}
      </Button>
    );
  }
}

export default Window;
