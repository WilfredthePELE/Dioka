import {rmSync,mkdirSync} from "node:fs";
import path from "node:path";
const distDir=path.join(process.cwd(),"dist");
try{rmSync(distDir,{recursive:true,force:true,maxRetries:3,retryDelay:500});}catch{}
try{mkdirSync(distDir,{recursive:true});}catch{}
console.log("dist cleaned");