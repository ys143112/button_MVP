import Phaser from 'phaser';
import type {State} from './engine';
export class Cockpit extends Phaser.Scene {
 state?:State; reduced=false; private stars:{x:number;y:number;r:number;speed:number}[]=[]; private ink!:Phaser.GameObjects.Graphics;
 constructor(){super('cockpit');}
 create(){this.ink=this.add.graphics();for(let i=0;i<140;i++)this.stars.push({x:Math.random()*1200,y:Math.random()*400,r:Math.random()*1.5+.3,speed:5+Math.random()*15});}
 update(_t:number,dt:number){const g=this.ink;if(!g)return;g.clear();const w=this.scale.width,h=this.scale.height;g.fillStyle(0x080f1c);g.fillRect(0,0,w,h);const sx=w/1200,sy=h/400;g.save();g.scaleCanvas(sx,sy);
 const moving=this.state?.status==='playing';for(const star of this.stars){if(moving&&!this.reduced)star.x-=star.speed*dt/1000;if(star.x<0)star.x=1200;g.fillStyle(0xb8dfdf,.35+star.r/3);g.fillCircle(star.x,star.y,star.r);}
 // Distant ringed destination, painted with geometric bands.
 g.lineStyle(16,0x365762,.5);g.strokeEllipse(907,176,290,67);g.fillStyle(0x86a798);g.fillCircle(900,159,86);g.fillStyle(0x668f85);g.fillEllipse(899,144,170,37);g.fillStyle(0x476e6b);g.fillEllipse(900,181,159,27);g.fillStyle(0x1c3c45);g.fillEllipse(921,198,112,40);g.lineStyle(4,0xb5c9a3,.7);g.beginPath();g.arc(900,159,87,3.3,4.6);g.strokePath();g.lineStyle(10,0x678e84,.9);g.strokeEllipse(907,176,290,67);
 // Cargo tug on approach.
 const bob=this.reduced?0:Math.sin(_t/1300)*3;g.fillStyle(0x1d303c);g.fillTriangle(434,260+bob,590,190+bob,672,260+bob);g.fillStyle(0x78908d);g.fillPoints([{x:480,y:227+bob},{x:546,y:195+bob},{x:609,y:213+bob},{x:621,y:252+bob},{x:470,y:252+bob}],true);g.fillStyle(0x324c56);g.fillRect(507,213+bob,85,35);g.fillStyle(0xe4b66f);g.fillRect(517,218+bob,24,17);g.fillStyle(0x9bded1);g.fillRect(550,218+bob,30,9);g.fillStyle(0xc0744f);g.fillRect(468,245+bob,158,13);g.fillStyle(0x243e4b);g.fillRect(476,258+bob,33,16);g.fillRect(587,258+bob,33,16);g.fillStyle(0x75dccc,.6);g.fillTriangle(480,274+bob,505,274+bob,493,305+bob);g.fillTriangle(591,274+bob,617,274+bob,605,305+bob);
 // Viewport ribs and instrument reflections.
 g.lineStyle(12,0x263942);g.beginPath();g.moveTo(0,0);g.lineTo(195,400);g.moveTo(1200,0);g.lineTo(1005,400);g.strokePath();g.lineStyle(3,0x52615e);g.strokeRect(8,8,1184,384);g.fillStyle(0x6dd5c2,.035);g.fillRect(200,330,800,50);
 if(this.state&&this.state.heat>78){g.fillStyle(0xed654b,.10);g.fillRect(0,0,1200,400);}if(this.state&&this.state.hull<40){g.lineStyle(2,0xc8e1db,.5);g.beginPath();g.moveTo(40,10);g.lineTo(122,90);g.lineTo(97,135);g.lineTo(154,176);g.moveTo(122,90);g.lineTo(183,84);g.strokePath();}g.restore();
 }
}
