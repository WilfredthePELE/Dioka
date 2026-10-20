"use client";
import React, {Children,isValidElement,type ComponentProps} from "react";
import Image from "next/image";
import Link from "next/link";
import {useSiteContent} from "@/components/EditableContent";
export function CmsText({field,fallback}:{field:string;fallback:string}){const content=useSiteContent();return <span style={{display:"contents"}} data-site-field={field}>{content?.controls?.texts[field]??fallback}</span>;}
function useField(kind:"texts"|"assets",key:string|undefined,fallback:any){const content=useSiteContent();return key?content?.controls?.[kind][key]??fallback:fallback;}
export function CmsImage({srcKey,altKey,...props}:ComponentProps<typeof Image>&{srcKey?:string;altKey?:string}){const src=useField("assets",srcKey,props.src),alt=useField("texts",altKey,props.alt);return <Image {...props} src={src} alt={alt}/>;}
export function CmsImg({srcKey,altKey,...props}:ComponentProps<"img">&{srcKey?:string;altKey?:string}){const src=useField("assets",srcKey,props.src),alt=useField("texts",altKey,props.alt);return <img {...props} src={src} alt={alt}/>;}
export function CmsSource({srcKey,...props}:ComponentProps<"source">&{srcKey?:string}){const src=useField("assets",srcKey,props.src);return <source {...props} src={src}/>;}
export function CmsVideo({srcKey,posterKey,...props}:ComponentProps<"video">&{srcKey?:string;posterKey?:string}){const src=useField("assets",srcKey,props.src),poster=useField("assets",posterKey,props.poster);return <video {...props} src={src} poster={poster}/>;}
export function CmsLink({hrefKey,titleKey,...props}:ComponentProps<typeof Link>&{hrefKey?:string;titleKey?:string}){const href=useField("assets",hrefKey,props.href),title=useField("texts",titleKey,props.title);return <Link {...props} href={href} title={title}/>;}
export function CmsAnchor({hrefKey,titleKey,...props}:ComponentProps<"a">&{hrefKey?:string;titleKey?:string}){const href=useField("assets",hrefKey,props.href),title=useField("texts",titleKey,props.title);return <a {...props} href={href} title={title}/>;}
export function CmsSection({sectionKey,...props}:ComponentProps<"section">&{sectionKey:string}){const content=useSiteContent();if(content?.controls?.sections[sectionKey]===false)return null;return <section {...props} data-site-section={sectionKey}/>;}
export function CmsPage({pageKey,children,...props}:ComponentProps<"main">&{pageKey:string}){const content=useSiteContent(),items=Children.toArray(children),slots=items.filter(child=>isValidElement<{sectionKey?:string}>(child)&&child.props.sectionKey),order=content?.controls?.order[pageKey]||[],rank=(child:typeof slots[number])=>isValidElement<{sectionKey:string}>(child)?order.indexOf(child.props.sectionKey):-1;const sorted=[...slots].sort((a,b)=>{const x=rank(a),y=rank(b);return(x<0?9999:x)-(y<0?9999:y)});let index=0;return <main {...props}>{items.map(child=>isValidElement<{sectionKey?:string}>(child)&&child.props.sectionKey?sorted[index++]:child)}</main>;}
