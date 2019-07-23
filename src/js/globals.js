import {constNumberContainer} from './numbers'
import Stats from './Stats'
export function tupleWord(count) {
  switch (count) {
    case 0:
    case 1:
      return "";
    case 2:
      return "Double ";
    case 3:
      return "Triple ";
    default:
      return count + "-tuple ";
  }
}
export let newJobReincarnator = new Stats({
  name: "Player",
  hp: new constNumberContainer(100),
  level: 1,
  atk: new constNumberContainer(10),
  def: new constNumberContainer(10),
  SP: new constNumberContainer(100),
  MP: new constNumberContainer(50),
  EXP: new constNumberContainer(0),
  turns: new constNumberContainer(1),
  skillLevels: {Strike:1, "Flame Strike":1, "ATK Up":1, "ATK Down":1 },
  isPlayer: true
});

export function Clamp(val,min,max){
  return Math.max(Math.min(val, max), min);
}

export function toEng(val)
{
    
    if(typeof(val) != 'number') return NaN;
    if(Math.abs(val) < 100000) return val
    let e = Math.trunc(Math.log10(Math.abs(val)));
    
    let v = val.toString().substr(0,3);
    v = v.slice(0,1) + '.' + v.slice(1,3);
    if(e > 4)  
      return v+"e"+e;
    return e;
}
export default {tupleWord};