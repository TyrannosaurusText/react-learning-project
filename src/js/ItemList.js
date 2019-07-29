import {Crystal} from './Item.js'
import balrog from '../balrogSMOrc.png'
export var ItemImageEnum ={
    dummy: balrog
};

let ItemList = {
    0: new Crystal("dummy", "equip", balrog, "equip/sword/", 0)
};

export function getItem(index)
{
    return ItemList[index];
}

export default {getItem};