"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useStore} from "@/lib/store-context";
export function AccountModal(){const router=useRouter();const {accountModalOpen,setAccountModalOpen,accountModalTab,isAuthenticated}=useStore();useEffect(()=>{if(!accountModalOpen)return;setAccountModalOpen(false);router.push(isAuthenticated?"/account":accountModalTab==="register"?"/join":"/sign-in");},[accountModalOpen,accountModalTab,isAuthenticated,router,setAccountModalOpen]);return null;}
