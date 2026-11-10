import {act,blocked,create,tick,incidents,type Action,type State} from '../src/engine';
export function pilot(s:State,style=0){
 const emergency=s.o<30?'oxygen':s.heat>77?'cool':s.hull<32?'repair':undefined;
 if(emergency&&!blocked(s,emergency))return act(s,emergency);
 for(const id of [...Object.keys(s.active),...s.pending.map(e=>e.id)] as (keyof typeof incidents)[]){const a=incidents[id].fix;if(!blocked(s,a)&&!(a==='vent'&&s.o<32)&&!(a==='cool'&&s.p<27)&&!(a==='repair'&&s.p<22))return act(s,a);}
 const order:Action[]=style===0?['oxygen','cool','generate','repair']:['generate','repair','cool','oxygen'];
 for(const a of order){const need=a==='oxygen'?s.o<(style?48:57):a==='cool'?s.heat>(style?67:58):a==='generate'?s.p<(style?32:43):s.hull<(style?52:67);if(need&&!blocked(s,a))return act(s,a);}
 if(s.heat>80&&!blocked(s,'vent')&&s.o>40)return act(s,'vent');
 return false;
}
export function run(seed:number,policy:(s:State)=>unknown){const s=create(seed);for(let n=0;n<1300&&s.status==='playing';n++){policy(s);tick(s,.1);}return s;}
if(process.argv[1]?.endsWith('balance.ts')){for(const style of [0,1]){const games=Array.from({length:100},(_,i)=>run(i,s=>pilot(s,style)));console.log(JSON.stringify({strategy:style,runs:games.length,wins:games.filter(s=>s.status==='won').length,averageSeconds:games.reduce((n,s)=>n+s.time,0)/100,buttons:Object.fromEntries(Object.keys(games[0].counts).map(a=>[a,games.reduce((n,s)=>n+s.counts[a as Action],0)]))}));}console.log('idle',run(1,()=>{}).time);}
