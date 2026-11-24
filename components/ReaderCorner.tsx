'use client';
import {useState} from 'react';
import {BookOpen,Clock,NotebookPen,CalendarDays} from 'lucide-react';
import BookJournal from './BookJournal';
import {readingStats} from '../lib/reading-stats';
export default function ReaderCorner({user,history,notes,total,stage,logout,reflections,write}:{reflections:any[],write:(book:string,text:string)=>Promise<void>,user:any,history:any[],notes:any[],total:number,stage:string,logout:()=>void}){
 const [sample,setSample]=useState(false),[tab,setTab]=useState('history');
 const sessions=sample?['Nhà giả kim','Đắc nhân tâm','Nhà giả kim'].map((title,i)=>({title,id:i,day:'Ngày '+(8-i),seconds:[1500,1800,1200][i],mode:i===1?'ebook':'paper'})):history;
 const entries=sample?[{id:1,book:'Nhà giả kim',time:480,text:'Mình muốn dành mười phút mỗi sáng cho điều quan trọng nhất.'}]:notes;
 const stats=readingStats(sessions,entries);
 return <section className="reader-corner"><header><div><small>HỒ SƠ ĐỌC SÁCH</small><h1>Góc nhỏ của tôi</h1></div><button className="outline" aria-pressed={sample} onClick={()=>setSample(!sample)}>{sample?'Tắt dữ liệu giả lập':'Bật dữ liệu giả lập'}</button></header><div className="reader-pass"><span className="reader-monogram">{user.name.slice(0,1)}</span><div><small>{sample?'HỒ SƠ GIẢ LẬP':'THẺ BẠN ĐỌC'}</small><h2>{user.name}</h2><p>{user.province} · {sample?18:total} giọt nước</p></div><b>{sample?'Hạt giống thức tỉnh':stage}</b></div><div className="reader-numbers">{[[BookOpen,stats.books,'Đầu sách đã đọc'],[Clock,stats.minutes,'Phút đọc'],[CalendarDays,stats.sessions,'Phiên đọc'],[NotebookPen,stats.notes,'Ghi chú']].map(([Icon,n,label]:any)=><div key={label}><Icon size={20}/><strong>{n}</strong><span>{label}</span></div>)}</div><BookJournal key={String(sample)} sessions={sessions} notes={entries} reflections={sample?[{id:'sample',data:{book:'Nhà giả kim',text:'Tôi sẽ dành thời gian mỗi ngày để thực hành một điều đã học.',status:'approved'}}]:reflections} write={sample?undefined:write}/><button className="text-button" onClick={logout}>Đăng xuất</button></section>
}
