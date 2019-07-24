
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
  }

  applyTo(stats) {
    this.stats = stats;
    Object.keys(this.buff_obj).forEach(key => {
      console.log(key, this.buff_obj[key]/100)
      stats.addBuff(this, key, this.buff_obj[key]/100)
    });
  }
  removeFrom(stats) {
    Object.keys(this.buff_obj).forEach(key => {
      stats.removeBuff(this, key, this.buff_obj[key]/100)
    });
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
    Object.keys(buff.buff_obj).forEach(key => {
      this.buff_obj[key] = Math.max(buff.buff_obj[key], this.buff_obj[key]);
    });
    this.duration = Math.max(buff.duration, this.duration);
    this.applyTo(stats);
  }
}

export class Debuff extends TemporaryStatus {
  constructor(name, buff_obj, duration) {
    super(name, buff_obj, duration);
    this.type = "Debuff";
  }
  applyTo(stats) {
    this.stats = stats;
    Object.keys(this.buff_obj).forEach(key => {
      console.log(key, this.buff_obj[key]/100)
      stats.addBuff(this, key, -1*this.buff_obj[key]/100)
    });
  }
  removeFrom(stats) {
    Object.keys(this.buff_obj).forEach(key => {
      stats.removeBuff(this, key, -1*this.buff_obj[key]/100)
    });
  }
}
export class Buff extends TemporaryStatus {
  constructor(name, buff_obj, duration) {
    super(name, buff_obj, duration);
    this.type = "Buff";
  }
}

export default { Buff, Debuff };
