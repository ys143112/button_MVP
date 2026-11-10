export type Action = 'oxygen'|'cool'|'generate'|'repair'|'vent'|'reroute';
export type Incident = 'leak'|'fire'|'short'|'debris'|'frost'|'drone'|'filter'|'surge';
export const controls: Record<Action,{name:string;icon:string;effect:string;cost:string;cd:number;unlock:number}> = {
 oxygen:{name:'산소 주입',icon:'O₂',effect:'산소 +24',cost:'열 +10 · 전력 −5',cd:5,unlock:0},
 cool:{name:'급속 냉각',icon:'❄',effect:'열 −26',cost:'전력 −16',cd:6,unlock:0},
 generate:{name:'비상 발전',icon:'ϟ',effect:'전력 +27',cost:'산소 −12 · 열 +4',cd:6,unlock:0},
 repair:{name:'선체 용접',icon:'✚',effect:'선체 +24',cost:'전력 −10 · 냉각 잠금 4초',cd:9,unlock:0},
 vent:{name:'비상 환기',icon:'≋',effect:'열 −16 · 화재 진압',cost:'산소 −15',cd:7,unlock:24},
 reroute:{name:'회로 우회',icon:'⇄',effect:'전력 +10 · 전기 장애 해제',cost:'열 +9',cd:10,unlock:40}
};
export const incidents:Record<Incident,{name:string;cause:string;fix:Action;quote:string}>={
 leak:{name:'산소 배관 누출',cause:'선체 균열 → 공기가 퇴근 중',fix:'repair',quote:'공기가 먼저 퇴근했습니다. 용접을 권장합니다.'},
 fire:{name:'엔진실 화재',cause:'과열 → 배선 발화',fix:'vent',quote:'엔진실에 작은 태양이 생겼습니다. 환기하세요.'},
 short:{name:'배전반 합선',cause:'전력 과충전 → 배전반 손상',fix:'reroute',quote:'전기가 지름길을 찾았습니다. 회로를 우회하세요.'},
 debris:{name:'우주 쓰레기 충돌',cause:'잔해 지대 진입 → 선체 충격',fix:'repair',quote:'우주 쓰레기와 접촉했습니다. 분리수거는 생략합니다.'},
 frost:{name:'냉각관 결빙',cause:'과도한 냉각 → 냉각관 얼음',fix:'generate',quote:'냉각관이 아이스크림이 됐습니다. 발전 열로 녹이세요.'},
 drone:{name:'수리 드론 파업',cause:'반복 용접 → 드론 과부하',fix:'reroute',quote:'수리 드론이 노동권을 주장합니다. 재부팅하세요.'},
 filter:{name:'산소 필터 막힘',cause:'반복 주입 → 필터 포화',fix:'vent',quote:'필터가 숨 막힌다고 합니다. 환기가 필요합니다.'},
 surge:{name:'발전기 진동',cause:'반복 발전 → 고정부 이완',fix:'cool',quote:'발전기가 탈출을 준비합니다. 냉각으로 진정시키세요.'}
};
export interface Log {at:number;text:string;kind:'action'|'bad'|'good'}
export interface State {time:number;o:number;heat:number;p:number;hull:number;status:'playing'|'won'|'lost';reason:string;seed:number;cooldowns:Record<Action,number>;counts:Record<Action,number>;active:Partial<Record<Incident,number>>;pending:{id:Incident;at:number}[];seen:Incident[];logs:Log[];lock:number;nextEvent:number;danger:number;actions:number;score:number;lastAction:number}
export function create(seed=Date.now()):State {return {time:0,o:68,heat:46,p:64,hull:88,status:'playing',reason:'',seed:seed>>>0,cooldowns:{oxygen:0,cool:0,generate:0,repair:0,vent:0,reroute:0},counts:{oxygen:0,cool:0,generate:0,repair:0,vent:0,reroute:0},active:{},pending:[{id:'leak',at:5}],seen:[],logs:[{at:0,text:'배관 누출 예고. 산소가 줄기 전에 선체 용접으로 막으세요.',kind:'bad'}],lock:0,nextEvent:18,danger:0,actions:0,score:0,lastAction:-100};}
const log=(s:State,text:string,kind:Log['kind'])=>{s.logs.unshift({at:s.time,text,kind});s.logs.length=Math.min(24,s.logs.length);};
function random(s:State){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
export function queue(s:State,id:Incident){if(s.active[id]!==undefined||s.pending.some(e=>e.id===id))return;s.pending.push({id,at:s.time+5});log(s,`5초 후 ${incidents[id].name} / ${incidents[id].cause}`,'bad');}
export function blocked(s:State,a:Action):string {if(s.status!=='playing')return '운항 종료';if(s.time<controls[a].unlock)return `${controls[a].unlock}초에 해제`;if(s.cooldowns[a]>s.time)return '재충전 중';if(a==='cool'&&s.lock>s.time)return '용접 중 냉각 잠금';if(a==='repair'&&s.active.drone!==undefined)return '드론 파업 · 회로 우회 필요';if(s.p<(a==='cool'?16:a==='repair'?10:a==='oxygen'?5:0))return '전력 부족';return '';}
export function act(s:State,a:Action){if(blocked(s,a))return false;s.cooldowns[a]=s.time+controls[a].cd;s.counts[a]++;s.actions++;s.lastAction=s.time;
 if(a==='oxygen'){s.o+=24;s.heat+=10;s.p-=5;if(s.counts[a]%3===0&&s.time>24)queue(s,'filter');}
 if(a==='cool'){s.heat-=26;s.p-=16;if(s.heat<12)queue(s,'frost');}
 if(a==='generate'){s.p+=27;s.o-=12;s.heat+=4;if(s.counts[a]%3===0)queue(s,'surge');}
 if(a==='repair'){s.hull+=24;s.p-=10;s.lock=s.time+4;if(s.counts[a]%3===0&&s.time>40)queue(s,'drone');}
 if(a==='vent'){s.heat-=16;s.o-=15;}
 if(a==='reroute'){s.p+=10;s.heat+=9;}
 for(const id of Object.keys(incidents) as Incident[])if(incidents[id].fix===a){if(s.active[id]!==undefined||s.pending.some(e=>e.id===id)){delete s.active[id];s.pending=s.pending.filter(e=>e.id!==id);log(s,`${incidents[id].name} 해결. 정상 운행의 범위가 넓어졌습니다.`,'good');}}
 log(s,`${controls[a].name} → ${controls[a].effect} / ${controls[a].cost}`,'action');clamp(s);return true;
}
function clamp(s:State){s.o=Math.max(0,Math.min(100,s.o));s.p=Math.max(0,Math.min(100,s.p));s.heat=Math.max(0,Math.min(110,s.heat));s.hull=Math.max(0,Math.min(100,s.hull));}
export function tick(s:State,dt:number){if(s.status!=='playing')return;dt=Math.max(0,Math.min(dt,.25));s.time+=dt;const stress=1+s.time/180;
 s.o-=dt*(.66*stress+(s.p<12?1.1:0)+(s.active.leak!==undefined?1.1:0)+(s.active.filter!==undefined?.6:0));
 s.heat+=dt*(.57*stress+(s.active.fire!==undefined?1.5:0)+(s.active.frost!==undefined?.4:0));
 s.p-=dt*(.34*stress+(s.active.short!==undefined?1.3:0));
 s.hull-=dt*(.065*stress+(s.heat>85?.8:0)+(s.active.debris!==undefined?.85:0)+(s.active.surge!==undefined?.65:0));
 for(const event of [...s.pending])if(s.time>=event.at){s.active[event.id]=s.time+16;s.seen.push(event.id);s.pending=s.pending.filter(e=>e!==event);log(s,incidents[event.id].quote,'bad');}
 for(const id of Object.keys(s.active) as Incident[])if(s.active[id]!<=s.time){delete s.active[id];log(s,`${incidents[id].name} 종료. 보증 기간도 종료.`,'good');}
 if(s.heat>78&&s.time>24)queue(s,'fire');if(s.p>92&&s.time>40)queue(s,'short');if(s.hull<42)queue(s,'leak');
 if(s.time>=s.nextEvent){const pool:Incident[]=s.time<24?['debris','leak']:s.time<40?['debris','leak','surge']:['debris','leak','short','filter','surge','drone'];queue(s,pool[Math.floor(random(s)*pool.length)]);s.nextEvent=s.time+Math.max(10,22-s.time/12)+random(s)*5;}
 clamp(s);const fatal=s.o<=0?'산소 고갈':s.heat>=100?'엔진 폭발':s.hull<=0?'선체 파괴':'';
 s.danger=fatal?s.danger+dt:0;if(s.danger>=3){s.status='lost';s.reason=fatal;}
 else if(s.time>=120){s.time=120;s.status='won';s.reason='목적지 도착';}
 s.score=Math.round(s.time*100+(s.o+s.p+s.hull+100-s.heat)*8-s.actions*10);
}
