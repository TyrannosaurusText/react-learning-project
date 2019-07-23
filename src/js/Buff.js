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
  constructor(name, status_obj, duration,) {
    this.name = name;
    this.duration = duration;
    this.status_obj = status_obj;
  }

  applyTo(stats) {
    Object.keys(this.status_obj).forEach(key => {
      stats[key] += this.status_obj[key] / 100;
    });
  }
  removeFrom(stats) {
    Object.keys(this.status_obj).forEach(key => {
      stats[key] -= this.status_obj[key] / 100;
    });
  }
  reapply(stats, status_obj, duration) {
    this.removeFrom(stats);
    Object.keys(status_obj).forEach(key => {
      this.status_obj[key] = Math.max(status_obj[key], this.status_obj[key]);
    });
    this.duration = Math.max(duration, this.duration);
    this.applyTo(stats);
  }
}

export class Debuff extends TemporaryStatus {
  constructor(name, status_obj, duration) {
    super(name, status_obj, duration);
    this.type = "Debuff";
  }
}
export class Buff extends TemporaryStatus {
  constructor(name, status_obj, duration) {
    super(name, status_obj, duration);
    this.type = "Buff";
  }
}

export default { Buff, Debuff };
