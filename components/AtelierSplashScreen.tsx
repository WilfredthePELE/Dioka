"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import {usePathname} from "next/navigation";
import {ArrowRight} from "lucide-react";
import {CmsImg,CmsVideo} from "@/components/SiteControls";
import "./atelier-intro.css";
export function AtelierSplashScreen(){
 const pathname=usePathname(),dialog=useRef<HTMLDialogElement>(null),video=useRef<HTMLVideoElement>(null);
 const [visible,setVisible]=useState(false),[fading,setFading]=useState(false),[reduced,setReduced]=useState(false),[failed,setFailed]=useState(false),[ready,setReady]=useState(false);
 const enter=useCallback(()=>{try{sessionStorage.setItem("dioka_splash_viewed","true")}catch{}setFading(true);},[]);
 useEffect(()=>{setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches);if(pathname!=="/")return;const timer=setTimeout(()=>{try{if(!sessionStorage.getItem("dioka_splash_viewed"))setVisible(true)}catch{}},10);return()=>clearTimeout(timer);},[pathname]);
 useEffect(()=>{const replay=()=>{setFading(false);setVisible(true);setFailed(false);setReady(false);};window.addEventListener("show-atelier-splash",replay);return()=>window.removeEventListener("show-atelier-splash",replay);},[]);
 useEffect(()=>{if(!visible)return;const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow="hidden";dialog.current?.showModal();video.current?.play().catch(()=>{});const timer=setTimeout(enter,reduced?1800:6500);return()=>{clearTimeout(timer);document.body.style.overflow=overflow;previous?.focus();};},[visible,reduced,enter]);
 useEffect(()=>{if(!fading)return;const timer=setTimeout(()=>{setVisible(false);setFading(false)},450);return()=>clearTimeout(timer);},[fading]);
 if(!visible)return null;
 return <dialog ref={dialog} className={"dioka-intro"+(fading?" is-leaving":"")} aria-label="Dioka atelier introduction" onCancel={event=>{event.preventDefault();enter()}}>
  <CmsImg className="dioka-intro-film is-poster" src="/dioka-white-studio-shoemaker.png" srcKey="splash-studio-poster" width={1672} height={941} alt="" aria-hidden="true" loading="eager" decoding="sync"/>
  {!reduced&&!failed&&<CmsVideo ref={video} className="dioka-intro-film" style={{opacity:ready?1:0}} src="/dioka-white-studio-loop.mp4" srcKey="splash-studio-film" width={1280} height={720} poster="/dioka-white-studio-shoemaker.png" posterKey="splash-studio-poster" muted autoPlay loop playsInline preload="auto" aria-hidden="true" onLoadedData={()=>setReady(true)} onError={()=>setFailed(true)}/>}
  <h1 className="dioka-intro-wordmark">DIOKA</h1>
  <button type="button" className="dioka-intro-enter" aria-label="Enter Dioka" onClick={enter} autoFocus><ArrowRight size={23} strokeWidth={1.2}/></button>
 </dialog>;
}
