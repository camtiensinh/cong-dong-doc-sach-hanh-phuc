export function readingStats(history:any[],notes:any[]){
 const entries=history.filter(h=>h&&Number(h.seconds)>0);
 return {books:new Set(entries.map(h=>String(h.title||'').trim().toLocaleLowerCase('vi')).filter(Boolean)).size,minutes:Math.round(entries.reduce((sum,h)=>sum+Number(h.seconds),0)/60),sessions:entries.length,notes:notes.length,days:new Set(entries.map(h=>h.day).filter(Boolean)).size};
}
