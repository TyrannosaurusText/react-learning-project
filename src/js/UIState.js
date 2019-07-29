import React from "react";
class UIState extends React.Component {

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
}

export default UIState;