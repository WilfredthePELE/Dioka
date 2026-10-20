import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
export async function mediaValidationChecks(){
 const source=(await readFile('lib/media-validation.ts','utf8')).replace('import { HttpError } from "@/lib/http";', 'class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const {inspectUpload,uploadForm,maximumFileSize}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 const png=Buffer.from('89504e470d0a1a0a00000000','hex');
 assert.equal(inspectUpload(png,'image/png','image').bucket,'dioka-products');
 assert.equal(inspectUpload(Buffer.from('%PDF-1.7'),'application/pdf','document').bucket,'dioka-private');
 for(const [bytes,mime,kind] of [[png,'image/jpeg','image'],[Buffer.from('<svg></svg>'),'image/svg+xml','image'],[Buffer.from('%PDF-1.7'),'application/pdf','image'],[new Uint8Array(),'image/png','image'],[new Uint8Array(maximumFileSize+1),'image/png','image']])assert.throws(()=>inspectUpload(bytes,mime,kind));
 const form=new FormData();form.set('file',new File([png],'piece.png',{type:'image/png'}));
 const parsed=await uploadForm(new Request('http://localhost/upload',{method:'POST',body:form}));assert.equal(parsed.get('file').name,'piece.png');
 await assert.rejects(()=>uploadForm(new Request('http://localhost/upload',{method:'POST',body:'x',headers:{'content-type':'multipart/form-data; boundary=x','content-length':String(maximumFileSize+65537)}})),e=>e.status===413);
 let cancelled=false;const stream=new ReadableStream({pull(controller){controller.enqueue(new Uint8Array(65536))},cancel(){cancelled=true}});
 await assert.rejects(()=>uploadForm(new Request('http://localhost/upload',{method:'POST',body:stream,duplex:'half',headers:{'content-type':'multipart/form-data; boundary=x'}})),e=>e.status===413);assert.equal(cancelled,true);
 console.log('PASS media: file signatures, MIME mismatch, SVG rejection, private PDF separation, size limits and bounded multipart streaming');
}
