import {describe,it} from 'vitest';
import assert from 'node:assert/strict';
import {readFlightRecords,saveFlightResult,type RecordStorage} from '../src/records';

function memoryStorage(initial:Record<string,string>={}){
 const values=new Map(Object.entries(initial));
 return {getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>{values.set(key,value);}};
}

describe('flight records across tabs',()=>{
 it('keeps a higher score saved after another tab was opened',()=>{
  const storage=memoryStorage();
  const first=readFlightRecords(storage),second=readFlightRecords(storage);
  saveFlightResult(storage,first,3000,false);
  const displayed=saveFlightResult(storage,second,1000,false);
  assert.equal(displayed.best,3000);
  assert.equal(readFlightRecords(storage).best,3000);
 });
 it('counts sequential wins from tabs that started with the same count',()=>{
  const storage=memoryStorage({'normal-wins':'4'});
  let first=readFlightRecords(storage),second=readFlightRecords(storage);
  first=saveFlightResult(storage,first,3000,true);
  second=saveFlightResult(storage,second,2000,true);
  assert.equal(second.wins,6);
  assert.equal(second.best,3000);
  first=saveFlightResult(storage,first,4000,true);
  assert.deepEqual(first,{best:4000,wins:7});
  assert.deepEqual(readFlightRecords(storage),first);
 });
 it('refreshes the displayed count after a loss without adding a win',()=>{
  const storage=memoryStorage();
  const first=readFlightRecords(storage),second=readFlightRecords(storage);
  saveFlightResult(storage,first,3000,true);
  assert.deepEqual(saveFlightResult(storage,second,1500,false),{best:3000,wins:1});
 });
 it('retains an unsaved in-memory best and count when storage fails',()=>{
  const storage:RecordStorage={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  assert.deepEqual(readFlightRecords(storage),{best:0,wins:0});
  assert.deepEqual(saveFlightResult(storage,{best:4000,wins:2},1000,true),{best:4000,wins:3});
 });
 it('treats corrupt stored records as zero and keeps counts integral',()=>{
  for(const invalid of ['NaN','Infinity','-Infinity','-1','bad']){
   const storage=memoryStorage({'normal-best':invalid,'normal-wins':invalid});
   assert.deepEqual(readFlightRecords(storage),{best:0,wins:0});
   assert.deepEqual(saveFlightResult(storage,{best:0,wins:0},1000,true),{best:1000,wins:1});
  }
  assert.deepEqual(readFlightRecords(memoryStorage({'normal-best':'3.5','normal-wins':'3.5'})),{best:3.5,wins:3});
 });
 it('never writes NaN, infinity or negative records from invalid input',()=>{
  for(const invalid of [NaN,Infinity,-Infinity,-1]){
   const storage=memoryStorage({'normal-best':'2000','normal-wins':'2'});
   const result=saveFlightResult(storage,{best:invalid,wins:invalid},invalid,false);
   assert.deepEqual(result,{best:2000,wins:2});
   assert.deepEqual(readFlightRecords(storage),result);
  }
 });
});
