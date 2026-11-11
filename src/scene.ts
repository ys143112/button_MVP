import Phaser from 'phaser';
import type {Action,State} from './engine';
export class Cockpit extends Phaser.Scene {
 state?:State; reduced=false; paused=true;
 private effect?:Action; private effectLife=0; private flightClock=0;
 private particles:{x:number;y:number;vx:number;vy:number;life:number;size:number}[]=[];
 clearEffects(){this.particles=[];this.effectLife=0;}
 trigger(action:Action){this.effect=action;this.effectLife=1.35;this.particles=[];if(this.reduced)return;
  for(let i=0;i<30;i++)this.particles.push({x:action==='vent'?Math.random()*1200:600+(Math.random()-.5)*400,y:action==='repair'?310:350+Math.random()*40,vx:(Math.random()-.5)*(action==='repair'?420:90),vy:action==='repair'?-70-Math.random()*260:-50-Math.random()*180,life:.5+Math.random()*.85,size:2+Math.random()*6});
 }
 private stars:{x:number;y:number;r:number;speed:number}[]=[]; private ink!:Phaser.GameObjects.Graphics;
 constructor(){super('cockpit');}
 create(){this.ink=this.add.graphics();for(let i=0;i<140;i++)this.stars.push({x:Math.random()*1200,y:Math.random()*400,r:Math.random()*1.5+.3,speed:5+Math.random()*15});}
 update(_t:number,dt:number){const g=this.ink;if(!g)return;g.clear();const w=this.scale.width,h=this.scale.height;g.fillStyle(0x080f1c);g.fillRect(0,0,w,h);const sx=w/1200,sy=h/400;g.save();g.scaleCanvas(sx,sy);
 const moving=this.state?.status==='playing'&&!this.paused;if(moving)this.flightClock+=dt;for(const star of this.stars){if(moving&&!this.reduced)star.x-=star.speed*dt/1000;if(star.x<0)star.x=1200;g.fillStyle(0xb8dfdf,.35+star.r/3);g.fillCircle(star.x,star.y,star.r);}
 // Distant ringed destination, painted with geometric bands.
 g.lineStyle(16,0x365762,.5);g.strokeEllipse(907,176,290,67);g.fillStyle(0x86a798);g.fillCircle(900,159,86);g.fillStyle(0x668f85);g.fillEllipse(899,144,170,37);g.fillStyle(0x476e6b);g.fillEllipse(900,181,159,27);g.fillStyle(0x1c3c45);g.fillEllipse(921,198,112,40);g.lineStyle(4,0xb5c9a3,.7);g.beginPath();g.arc(900,159,87,3.3,4.6);g.strokePath();g.lineStyle(10,0x678e84,.9);g.strokeEllipse(907,176,290,67);
 // Cargo tug on approach.
 const bob=this.reduced?0:Math.sin(this.flightClock/1300)*3;g.fillStyle(0x1d303c);g.fillTriangle(434,260+bob,590,190+bob,672,260+bob);g.fillStyle(0x78908d);g.fillPoints([{x:480,y:227+bob},{x:546,y:195+bob},{x:609,y:213+bob},{x:621,y:252+bob},{x:470,y:252+bob}],true);g.fillStyle(0x324c56);g.fillRect(507,213+bob,85,35);g.fillStyle(0xe4b66f);g.fillRect(517,218+bob,24,17);g.fillStyle(0x9bded1);g.fillRect(550,218+bob,30,9);g.fillStyle(0xc0744f);g.fillRect(468,245+bob,158,13);g.fillStyle(0x243e4b);g.fillRect(476,258+bob,33,16);g.fillRect(587,258+bob,33,16);g.fillStyle(0x75dccc,.6);g.fillTriangle(480,274+bob,505,274+bob,493,305+bob);g.fillTriangle(591,274+bob,617,274+bob,605,305+bob);
 // Viewport ribs and instrument reflections.
 g.lineStyle(12,0x263942);g.beginPath();g.moveTo(0,0);g.lineTo(195,400);g.moveTo(1200,0);g.lineTo(1005,400);g.strokePath();g.lineStyle(3,0x52615e);g.strokeRect(8,8,1184,384);g.fillStyle(0x6dd5c2,.035);g.fillRect(200,330,800,50);
 if(this.state&&this.state.heat>78){g.fillStyle(0xed654b,.10);g.fillRect(0,0,1200,400);}if(this.state&&this.state.hull<40){g.lineStyle(2,0xc8e1db,.5);g.beginPath();g.moveTo(40,10);g.lineTo(122,90);g.lineTo(97,135);g.lineTo(154,176);g.moveTo(122,90);g.lineTo(183,84);g.strokePath();}g.restore();
 if(this.effectLife>0){
  const step=this.paused?0:Math.min(dt/1000,.1);this.effectLife=Math.max(0,this.effectLife-step);
  const color={oxygen:0xa1edcb,cool:0x9cdbff,generate:0xffd16e,repair:0xffa66e,vent:0xc2ebe0,reroute:0xd5aaff}[this.effect!];
  g.save();g.scaleCanvas(sx,sy);g.lineStyle(3,color,this.effectLife*.35);g.strokeRect(14,14,1172,372);
  if(!this.reduced){
   for(const p of this.particles){p.life-=step;if(p.life<=0)continue;p.x+=p.vx*step;p.y+=p.vy*step;if(this.effect==='repair')p.vy+=380*step;
    g.lineStyle(2,color,Math.min(1,p.life));g.fillStyle(color,Math.min(1,p.life));
    if(this.effect==='oxygen')g.strokeCircle(p.x,p.y,p.size);
    else if(this.effect==='cool'){g.lineBetween(p.x-p.size,p.y,p.x+p.size,p.y);g.lineBetween(p.x,p.y-p.size,p.x,p.y+p.size);}
    else if(this.effect==='vent')g.lineBetween(p.x,p.y,p.x+35,p.y-18);
    else if(this.effect==='generate'){g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x+9,p.y-12);g.lineTo(p.x+3,p.y-12);g.lineTo(p.x+12,p.y-28);g.strokePath();}
    else if(this.effect==='reroute')g.strokeRect(p.x,p.y,p.size*2,p.size*2);
    else g.fillCircle(p.x,p.y,p.size*.45);
   }
  }g.restore();
 }
 }
}
