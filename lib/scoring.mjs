export const RULES = Object.freeze({zoom:1,exercise:1,reflection:1,community:2,team:1});
export function journeyDay(start, date){return Math.floor((Date.parse(date+'T00:00:00Z')-Date.parse(start+'T00:00:00Z'))/86400000)+1;}
export function validAward(start,date,kind){const day=journeyDay(start,date);return Object.hasOwn(RULES,kind)&&day>=1&&day<=100;}
export function stageFor(total){const thresholds=[5,20,60,120,200,280,380,480];return thresholds.filter(n=>total>=n).length-1;}
