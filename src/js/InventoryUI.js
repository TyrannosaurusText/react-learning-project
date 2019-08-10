import React from "react";
import Observer from "./Observer";
import "../css/Inventory.css";
import Button from "react-bootstrap/Button";
import UIState from "./UIState";
import circle from "../circle.png";
import crossX from "../crossX.png";
// import OverlayTrigger from "../x/OverlayTrigger";
import StickyPopover from "../x/StickyPopover"
import { ButtonGroup } from "react-bootstrap";
// import Tooltip from "react-bootstrap/Tooltip";

class InventoryUI extends UIState {
  constructor(props) {
    super(props);
    this.state = {
      content: {},
      numEquipSlots: 3,
      maxEquipSlots: 12,
      numSlots: 100,
      maxSlots: 65 * 36,
      page: 1
    };
    Observer.subscribe("InventoryStateChange", "Window", update => {
      this.notifyStateChange(update);
    });
  }
  componentDidMount() {
    this._isMounted = true;
    if (!this.props.hidden) {
      Observer.notify("InventorySendInfo", null);
    }
  }
  render() {
    if (this.props.hidden) return <div />;
    return (
      <div className="pos">
        <div className="inventory">
          <div className="equipment-window">
            <div className="text inner-window">Equipment</div>
            <EquipmentPage slots={this.state.numEquipSlots} />
          </div>
          {/* <div className="selection-window">
            <div className="selection-page" />
          </div> */}
          <div className="inventory-window">
            <InventoryPage
              inv={this.state.content}
              slots={this.state.numSlots}
              page={this.state.page}
            />
            <div className="btn-toolbar InventoryPageButton">
              <InventoryPageButton
                slots={this.state.numSlots}
                onClick={i => {
                  this.PageChange(i);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
  PageChange(i) {
    this.setState({ page: i });
  }
}
function InventoryPageButton(props) {
  let rows = [];
  let foo = function(i) {
    return () => props.onClick(i);
  };
  for (var i = 1; i < Math.min(props.slots / 65 + 1, 36); i++)
    rows.push(
      <Button key={i} onClick={foo(i)}>
        {i}
      </Button>
    );
  if (props.slots / 65 + 1 < 36) {
    rows.push(
      <Button
        key={"+"}
        //   onClick={foo(i)} //TODO:
      >
        +
      </Button>
    );
  }
  return <div className="btn-group">{rows}</div>;
}

function EquipmentPage(props) {
  return (
    <div>
      <div className="equipment-page">
        {EquipmentRow(props.slots, 0)}
        {EquipmentRow(props.slots, 1)}
        {EquipmentRow(props.slots, 2)}
        {EquipmentRow(props.slots, 3)}
      </div>
    </div>
  );
}
function EquipmentRow(slots, index) {
  return (
    <div className="inventory-row">
      {inventorySlot(slots, index * 3)}
      {inventorySlot(slots, index * 3 + 1)}
      {inventorySlot(slots, index * 3 + 2)}
    </div>
  );
  //   return val;
}
//13x5
function InventoryPage(props) {
  let numSlots = props.slots;
  let page = props.page;
  return (
    <div className="inventory-page">
      {InventoryRow(numSlots, (page - 1) * 65, props.inv)}
      {InventoryRow(numSlots, (page - 1) * 65 + 1 * 13, props.inv)}
      {InventoryRow(numSlots, (page - 1) * 65 + 2 * 13, props.inv)}
      {InventoryRow(numSlots, (page - 1) * 65 + 3 * 13, props.inv)}
      {InventoryRow(numSlots, (page - 1) * 65 + 4 * 13, props.inv)}
    </div>
  );
}
function InventoryRow(numSlots, val, inv) {
  let number = [];
  for (var i = 0; i < 13; i++) {
    number[i] = val + i;
  }
  let list = number.map(i => (
    <li className="inventory-li" key={i}>
      {inventorySlot(numSlots, i, inv[i])}
    </li>
  ));

  return <ul className="inventory-ul inventory-row">{list}</ul>;
  //   return val;
}
function inventorySlot(numSlots, i, item) {
  let name = "";
  let src = circle;
  let trigger = ["hover", "focus"];
  if (numSlots > i) {
    name = "blue-on-hover";
  } else {
    name = "red-on-hover";
    src = crossX;
  }
  if (item != null) {
    src = item.icon;
  }
  name += " box-inner";
  function Overlay() {
    return (
      <StickyPopover
        trigger={trigger}
        placement="right"
        arrowProps={{ fontSize: "10px" }}
        className="inv-tooltip"
        component={
          <div
            className="inv-tooltip-inner"
          >
          <ButtonGroup>
          <Button>Click Me</Button>
          </ButtonGroup>
          <div>{item.name}</div>
          <div>{item.type}</div>
          <div>{item.stack}</div>
          <div>{item.stats}</div>
          </div>
        }
      >
        {Image()}
      </StickyPopover>
    );
  }
  function Image() {
    return (
      <img
        tabIndex="0"
        onClick={() => {
          console.log(i);
        }}
        onMouseDown={onmousedown}
        className={name}
        src={src}
        alt=""
      />
    );
  }
  return (
    <div className="inventoryslot">
      <div className="inner-window box">{item ? Overlay() : Image()}</div>
    </div>
  );
}
export default InventoryUI;
