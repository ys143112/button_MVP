export interface FlightRecords {best:number;wins:number}
export interface RecordStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
const BEST='normal-best',WINS='normal-wins';
function valid(value:unknown){const n=Number(value);return Number.isFinite(n)&&n>0?n:0;}
function read(storage:RecordStorage,key:string){try{return valid(storage.getItem(key));}catch{return 0;}}
export function readFlightRecords(storage:RecordStorage):FlightRecords {
 return {best:read(storage,BEST),wins:Math.floor(read(storage,WINS))};
}
// Merge the latest persisted records before saving. This handles sequential
// finishes in different tabs; localStorage read/modify/write is not atomic.
export function saveFlightResult(storage:RecordStorage,current:FlightRecords,score:number,won:boolean):FlightRecords {
 const stored=readFlightRecords(storage);
 const next={best:Math.max(valid(current.best),stored.best,valid(score)),wins:Math.max(Math.floor(valid(current.wins)),stored.wins)+(won?1:0)};
 try{storage.setItem(BEST,String(next.best));}catch{/* Keep the in-memory record when storage is unavailable. */}
 try{storage.setItem(WINS,String(next.wins));}catch{/* Keep the in-memory count when storage is unavailable. */}
 return next;
}
