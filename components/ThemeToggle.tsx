 'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
export default function ThemeToggle(){const [dark,setDark]=useState(false);useEffect(()=>{let value=false;try{value=localStorage.getItem('reading-theme')==='dark'}catch{}setDark(value);document.documentElement.dataset.theme=value?'dark':'light'},[]);return <button className="theme-toggle" type="button" aria-label={dark?'Chuyển giao diện sáng':'Chuyển giao diện tối'} title={dark?'Giao diện sáng':'Giao diện tối'} aria-pressed={dark} onClick={()=>{const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';try{localStorage.setItem('reading-theme',next?'dark':'light')}catch{}}}>{dark?<Sun size={19}/>:<Moon size={19}/>}</button>}
