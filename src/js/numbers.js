/**
 * A container for numbers
 * intended to be easily replaced if switching to bignumber.js or similar libs
 *
 */

export class NumberContainer {
  constructor(val, type = "NumberContainer") {
    if (isNaN(val))
    throw new Error("NaN")
    if(val instanceof NumberContainer){
        this.val = val.val
    }
    else{
        this.val = val;
    }
    this.type = type;
  }
  gt(rhs){
    if (rhs instanceof NumberContainer) return this.val > rhs.val
    return this.val > rhs.val
  }
  lte(rhs){
    return !(this.gt(rhs));
  }
  lt(rhs){
    if (rhs instanceof NumberContainer) return this.val < rhs.val
    return this.val < rhs.val
  }
  gte(rhs){
      return !(this.gt(rhs));
  }
  eq(rhs){
    if (rhs instanceof NumberContainer) return this.val === rhs.val
    return this.val === rhs.val
  }
  set(val) {
    if (val instanceof NumberContainer) this.val = val.val;
    else this.val = val;
    return this;
  }
  round(val){
      this.val = Math.round(this.val);
      return this;
  }
  trunc(val){
      this.val = Math.trunc(this.val);
      return this;
  }
  plus(rhs) {
    if (rhs instanceof NumberContainer) this.val += rhs.val;
    else this.val += rhs;
    return this;
  }
  minus(rhs) {
    if (rhs instanceof NumberContainer) this.val -= rhs.val;
    else this.val -= rhs;
    return this;
  }
  multiplyBy(rhs) {
    if (rhs instanceof NumberContainer) this.val *= rhs.val;
    else this.val *= rhs;
    return this;
  }
  divideBy(rhs) {
    if (rhs instanceof NumberContainer) this.val /= rhs.val;
    else this.val /= rhs;
    return this;
  }
  toPower(exp) {
    if (exp instanceof NumberContainer) this.val = Math.pow(this.val, exp.val);
    else this.val = Math.pow(this.val, exp);
    return this;
  }
  copy(){
    return new NumberContainer(this.val);
  }
}

export class constNumberContainer extends NumberContainer
{
    constructor(val, type="Const")
    {
        super(val, type)
    }
    gt(rhs){
        if (rhs instanceof NumberContainer) return this.val > rhs.val
        return this.val > rhs.val
      }
      lte(rhs){
        return !(this.gt(rhs));
      }
      lt(rhs){
        if (rhs instanceof NumberContainer) return this.val < rhs.val
        return this.val < rhs.val
      }
      gte(rhs){
          return !(this.gt(rhs));
      }
      eq(rhs){
        if (rhs instanceof NumberContainer) return this.val === rhs.val
        return this.val === rhs.val
      }
      set(val) {
        throw new Error("Do not modify const");
      }
      round(val){
        throw new Error("Do not modify const");
      }
      trunc(val){
        throw new Error("Do not modify const");
      }
      plus(rhs) {
        throw new Error("Do not modify const");
      }
      minus(rhs) {
        throw new Error("Do not modify const");
      }
      multiplyBy(rhs) {
        throw new Error("Do not modify const");
      }
      divideBy(rhs) {
        throw new Error("Do not modify const");
      }
      toPower(exp) {
        throw new Error("Do not modify const");
      }
      copy(){
          return new NumberContainer(this.val);
      }
}
export default { NumberContainer };
