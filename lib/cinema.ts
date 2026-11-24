export type Showtime={id:string;title:string;url:string;startsAt:string;minutes:number};
export function youtubeId(raw:string){
 try{const u=new URL(raw);if(!['https:','http:'].includes(u.protocol))return '';const host=u.hostname.toLowerCase().replace(/^www\./,'');const id=host==='youtu.be'?u.pathname.slice(1):['youtube.com','m.youtube.com','youtube-nocookie.com'].includes(host)?(u.searchParams.get('v')||(/^\/(embed|shorts|live)\//.test(u.pathname)?u.pathname.split('/')[2]:'')):'';return /^[\w-]{11}$/.test(id||'')?id!:'';}catch{return '';}
}
export function scheduleError(shows:Showtime[]){
 if(!Array.isArray(shows)||shows.length>150)return 'Mỗi phòng tối đa 150 suất.';
 const intervals:{start:number,end:number}[]=[];
 for(const show of shows){if(!show.title?.trim()||!youtubeId(show.url))return 'Mỗi suất cần tên bài giảng và đường dẫn YouTube hợp lệ.';
 const start=Date.parse(show.startsAt);if(!Number.isFinite(start)||!Number.isInteger(show.minutes)||show.minutes<1||show.minutes>720)return 'Kiểm tra giờ bắt đầu và thời lượng (1–720 phút).';intervals.push({start,end:start+show.minutes*60000});}
 intervals.sort((a,b)=>a.start-b.start);return intervals.some((x,i)=>i>0&&x.start<intervals[i-1].end)?'Hai suất trong cùng phòng đang trùng giờ.':'';
}
export function roomShows(room:any,content:any[]):Showtime[]{
 if(Array.isArray(room?.data.shows))return [...room.data.shows].sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const old=content.find(c=>c.kind==='lecture'&&c.id===room?.data.lectureId);
 return old?[{id:old.id,title:old.data.title,url:old.data.url,startsAt:room.data.startsAt||'',minutes:0}]:[];
}
export const vnTime=(value:string)=>new Date(value).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
