export function getRndmInteger(min, max) {

  return Math.floor(Math.random() * (max+1 - min) ) + min;
}

export default {getRndmInteger}