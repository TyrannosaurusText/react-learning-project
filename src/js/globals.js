import { constNumberContainer } from "./numbers";
import Stats from "./Stats";
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
export let newPlayer = new Stats({
  name: "Player",
  HP_base: new constNumberContainer(100),
  level: 1,
  atk_base: new constNumberContainer(10),
  def_base: new constNumberContainer(10),
  SP_base: new constNumberContainer(100),
  MP_base: new constNumberContainer(50),
  EXP: new constNumberContainer(0),
  turns_base: new constNumberContainer(1),
  skillLevels: {
    Strike: 1,
    "Flame Strike": 20,
    "ATK Up": 1,
    "ATK Down": 1,
    Firebolt: 1,
    Regen: 1
  },
  isPlayer: true
});

export function Clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export function toEng(val) {
  if (typeof val != "number") return NaN;
  if (Math.abs(val) < 100000) return val;
  let e = Math.trunc(Math.log10(Math.abs(val)));

  let v = val.toString().substr(0, 3);
  v = v.slice(0, 1) + "." + v.slice(1, 3);
  if (e > 4) return v + "e" + e;
  return e;
}
export const ObserverEnum = {
  AddMessage: "LogAddMessage"
};
/**
 * search in a sorted array return value if it exists or index where it would be placed
 *
 */
export function binarySearch(arr, value) {
  let lo = 0;
  let hi = arr.length;
  let mid = lo;
  while (lo < hi) {
    mid = Math.trunc((lo + hi) / 2);
    if (arr[mid] === value) return mid;
    if (arr[mid] > value) hi = mid;
    else if (arr[mid] < value) lo = mid + 1;
  }
  if(arr[mid] < value) mid+=1;
  return mid;
}
export default { tupleWord };
