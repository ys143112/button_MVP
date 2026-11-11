import type {Action} from './engine';
export const deviceLabels:Record<Action,string>={oxygen:'숨 좀 쉽시다',cool:'일단 진정하세요',generate:'자가발전 정신',repair:'대충 붙이면 됩니다',vent:'창문은 없습니다',reroute:'껐다 켜 보셨나요'};
export const dispatch:Record<Action,string>={oxygen:'산소 주입 접수. 깊게 숨 쉬세요. 지금은.',cool:'냉각 요청 접수. 뜨거운 관심은 사양합니다.',generate:'발전기 기상. 기분이 좋지는 않아 보입니다.',repair:'용접 시작. 소리는 정상입니다. 아마도.',vent:'환기 개시. 개인 소지품을 꼭 잡으세요.',reroute:'회로 변경. 남는 전선은 원래 있었습니다.'};
export function instrumentMarkup(a:Action,icon:string){return `<span class="device" aria-hidden="true"><span class="device-ring"></span><span class="control-icon">${icon}</span><span class="device-slats"><i></i><i></i><i></i></span><span class="device-lamp"></span></span>`;}
export function pulse(node:HTMLElement,className:string){node.classList.remove(className);void node.offsetWidth;node.classList.add(className);window.setTimeout(()=>node.classList.remove(className),1600);}
