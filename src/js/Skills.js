// import {getRndmInteger} from './random';
// import {tupleWord} from './globals';
import {SkillList} from './SkillList';
// import Stats from './Stats';
// import Observer from './Observer';
// import Message from './Message';



export function getSkill(skillName)
{
    if( SkillList[skillName] !=null )
        return SkillList[skillName]
    else return null
}


export function fillSkills(...skillName){
    if (skillName.length < 12)
    {
        let obj = {};
        skillName.forEach( (val, index)=>{
            obj[index.toString()] = val;
        });
        for(var i = skillName.length; i < 12; i++){
            obj[i.toString()] = "None"
        }
        return obj;
    }
}


export default {fillSkills, getSkill} 