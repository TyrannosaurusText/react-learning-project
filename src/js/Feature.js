import Observer from './Observer'
class Feature {
  constructor(){
  this.featureActive = false;    
  this.update = {};

  }
  sendUpdate() {
    Observer.notify("BattleStateChange", this.update);
    this.update = {};
  }
  add(key, val) {
    this.update[key] = val;
  }
}

export default Feature;