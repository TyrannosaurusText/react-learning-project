// import Stats from "./Stats";
// import Observer from "./Observer";

/**
 * todo: add buff icons on ui
 * expected input:
 * obj: {
 *  stat_to_buff: number, (int)
 *  stat_to_buff: number, (int)
 *  ...
 *
 * }
 */
class TemporaryStatus {
  constructor(name, duration, buff_obj) {
    this.name = name;
    this.duration = duration;
    this.buff_obj = buff_obj;
    this.sign = 1;
  }

  applyTo(stats) {
    Object.keys(this.buff_obj).forEach(key => {
      stats.handleBuff(key, this.sign*this.buff_obj[key]/100)
    });
    stats.addBuff(this) 

  }
  removeFrom(stats) {
    Object.keys(this.buff_obj).forEach(key => { //remove effects
      stats.handleBuff(key, -1*this.sign*this.buff_obj[key]/100)
    });
    stats.removeBuff(this)//remove from container

  }

  decrement(){
    this.duration -=1;
    if(this.duration <= 0){
      return true
    }
    return false;
  }
  reapply(stats, buff) {
    this.removeFrom(stats);
    Object.keys(buff.buff_obj).forEach(key => { //update to higher vals
      this.buff_obj[key] = Math.max(buff.buff_obj[key], this.buff_obj[key]);
    });
    this.duration = Math.max(buff.duration, this.duration);
    this.applyTo(stats);
  }
}

export class Debuff extends TemporaryStatus {
  constructor(name, duration, buff_obj) {
    super(name, duration, buff_obj);
    this.type = "Debuff";
    this.sign = -1;
  }
  toString(){
    let text = ""
    Object.keys(this.buff_obj).forEach(key => {
      text += ( " " + key + " -" + this.buff_obj[key]+"%");
    });
    return text + " (" + this.duration + ") ";
  }
}
export class Buff extends TemporaryStatus {
  constructor(name, duration, buff_obj) {
    super(name, duration, buff_obj);
    this.type = "Buff";
  }
  toString(){
    let text = ""
    Object.keys(this.buff_obj).forEach(key => {
      text += ( " " + key + " +" + this.buff_obj[key]+"%");
    });
    return text + " (" + this.duration + ") ";
  }
}

export class DoT extends Debuff{
  constructor(name, duration, buff_obj, nameED, isPercent=false){
    super(name, duration, buff_obj)
    this.nameED = nameED;
    this.isPercent = isPercent;
  }
  applyTo(stats){
    stats.addBuff(this);
  }
  removeFrom(stats){
    stats.removeBuff(this);
  }
  decrement(stats){
    Object.keys(this.buff_obj).forEach(key => { //remove effects

      stats.handleDoT(this.nameED, key, this.sign*this.buff_obj[key], this.buff_obj.isPercent)
    });
    this.duration -=1;
    if(this.duration <= 0){
      return true
    }
    return false;
  }
  toString()
  {
    return this.name + " (" + this.duration + ")";
  }
}
export class Regen extends DoT{
  constructor(name, duration, buff_obj, nameED, isPercent){
    super(name, duration, buff_obj, nameED, isPercent)
    this.sign=1;
  }
}

export default { Buff, Debuff, DoT, Regen };
