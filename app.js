const places=[
{id:1,name:"时光里咖啡馆",category:"咖啡店",distance:.32,area:"潮宗街",tags:["独立咖啡","老街","手冲"],recommend:"桂花拿铁",description:"藏在潮宗街老房子里的小院咖啡馆，木窗、旧砖和午后的光都很长沙。",x:57,y:50,icon:"☕"},
{id:2,name:"山止川行 Coffee",category:"咖啡店",distance:.68,area:"开福寺",tags:["庭院","安静","特调"],recommend:"橘洲气泡美式",description:"闹中取静的城市庭院，适合慢慢喝一杯。",x:70,y:30,icon:"☕"},
{id:3,name:"岳麓书院",category:"风景名胜",distance:1.1,area:"岳麓山",tags:["古建","人文","山景"],recommend:"千年学府",description:"沿岳麓山脚走进千年书院，在檐角与碑刻之间寻找湖湘故事。",x:22,y:43,icon:"亭"},
{id:4,name:"橘子洲头",category:"风景名胜",distance:1.4,area:"橘子洲",tags:["江景","地标","散步"],recommend:"湘江日落",description:"沿江风一路走到洲头，傍晚是最适合打卡的时间。",x:44,y:57,icon:"洲"},
{id:5,name:"乐之书店",category:"书店",distance:1.6,area:"岳麓区",tags:["阅读","设计","安静"],recommend:"城市书单",description:"一间适合慢慢翻书的城市阅读空间。",x:66,y:63,icon:"书"},
{id:6,name:"太平老街",category:"餐厅甜品",distance:1.8,area:"天心区",tags:["湘味","老街","烟火气"],recommend:"糖油粑粑",description:"从街头小吃一路吃到老字号。",x:61,y:72,icon:"食"},
{id:7,name:"湖南省博物馆",category:"展览场馆",distance:2.2,area:"开福区",tags:["历史","展览","室内"],recommend:"马王堆汉墓",description:"一次走近两千年前的长沙。",x:77,y:35,icon:"博"},
{id:8,name:"烈士公园",category:"公园",distance:2.5,area:"开福区",tags:["散步","湖景","自然"],recommend:"年嘉湖漫步",description:"城市中心的一大片绿意。",x:86,y:48,icon:"树"},
{id:9,name:"杜甫江阁夜游",category:"夜间去处",distance:2.8,area:"湘江中路",tags:["夜景","江风","摄影"],recommend:"湘江灯火",description:"亮灯后的江阁与湘江夜色。",x:52,y:78,icon:"月"},
{id:10,name:"梅溪湖大剧院",category:"展览场馆",distance:5.8,area:"梅溪湖",tags:["建筑","演出","夜景"],recommend:"建筑漫步",description:"流线型白色建筑倒映在湖面。",x:16,y:68,icon:"展"}];
const categories=["全部","咖啡店","风景名胜","书店","餐厅甜品","展览场馆","公园","夜间去处"];
const glyph={全部:"✦",咖啡店:"☕",风景名胜:"亭",书店:"书",餐厅甜品:"食",展览场馆:"展",公园:"树",夜间去处:"月"};
let state={theme:localStorage.getItem("xingji-theme")||((matchMedia("(prefers-color-scheme: dark)").matches)?"night":"day"),tab:"map",category:"全部",radius:10,status:"全部",lit:JSON.parse(localStorage.getItem("xingji-lit")||"[3,4,7]"),sheet:false,filter:false,selected:null,notice:""};
const root=document.querySelector("#app");
const visible=()=>places.filter(p=>(state.category==="全部"||p.category===state.category)&&p.distance<=state.radius&&(state.status==="全部"||(state.status==="已点亮"?state.lit.includes(p.id):!state.lit.includes(p.id))));
const distance=p=>p.distance<1?`${p.distance*1000}m`:`${p.distance}km`;
function render(){
document.documentElement.style.background=state.theme==="night"?"#07131c":"#f8f0e1";
root.innerHTML=`<main class="app theme-${state.theme}">
<header class="topbar"><button class="brand" data-action="home"><b>行迹</b><span>城市打卡地图 · 长沙</span></button><nav class="desktop-nav"><button class="${state.tab==="map"?"active":""}" data-tab="map">探索地图</button><button class="${state.tab==="badges"?"active":""}" data-tab="badges">徽章收藏</button><button class="${state.tab==="me"?"active":""}" data-tab="me">我的行迹</button></nav><button class="mode" data-action="theme"><i>${state.theme==="day"?"☾":"☀"}</i><span>${state.theme==="day"?"夜间":"白天"}</span></button></header>
${state.tab==="map"?mapView():state.tab==="badges"?badgeView():profileView()}
<nav class="mobile-nav"><button class="${state.tab==="map"?"active":""}" data-tab="map"><i>⌖</i><span>地图</span></button><button class="${state.tab==="badges"?"active":""}" data-tab="badges"><i>✦</i><span>徽章</span></button><button class="${state.tab==="me"?"active":""}" data-tab="me"><i>人</i><span>我的</span></button></nav>
${state.selected?detailView(state.selected):""}${state.notice?`<button class="toast" data-action="clear-notice">${state.notice}</button>`:""}</main>`}
function mapView(){let v=visible();return `<section class="map-screen"><div class="map-art"><div class="map-shade"></div><div class="city-label yuelu">岳麓山</div><div class="city-label river-label">湘江</div><div class="city-label kaifu">开福区</div><div class="city-label tianxin">天心区</div><div class="city-label orange">橘子洲</div>
<div class="category-strip">${categories.map(c=>`<button class="${state.category===c?"active":""}" data-category="${c}"><i>${glyph[c]}</i><span>${c==="风景名胜"?"景点":c}</span></button>`).join("")}<button class="more-filter" data-action="filter">筛选⌄</button></div>
${state.filter?`<div class="filter-pop"><div><b>距离</b>${[1,3,5,10].map(n=>`<button class="${state.radius===n?"active":""}" data-radius="${n}">${n}公里</button>`).join("")}</div><div><b>状态</b>${["全部","未点亮","已点亮"].map(s=>`<button class="${state.status===s?"active":""}" data-status="${s}">${s}</button>`).join("")}</div></div>`:""}
${v.map(p=>`<button class="map-pin pin-${p.category} ${state.lit.includes(p.id)?"lit":""}" style="left:${p.x}%;top:${p.y}%" data-place="${p.id}"><span><b>${p.icon}</b></span><em>${p.name}</em></button>`).join("")}<div class="user-dot"><i></i></div><div class="map-tools"><button data-action="locate">◎</button><button>＋</button><button>−</button></div></div>
<aside class="badge-summary"><div><span>已点亮</span><strong>${state.lit.length}</strong><small>/ ${places.length}</small></div><p>继续探索，点亮更多长沙记忆</p><div class="mini-badges">${places.slice(0,6).map(p=>`<i class="${state.lit.includes(p.id)?"lit":""}">${p.icon}</i>`).join("")}</div><button data-tab="badges">查看我的徽章收藏 <span>→</span></button></aside>
<section class="place-sheet ${state.sheet?"open":""}"><button class="sheet-handle" data-action="sheet"><i></i></button><div class="sheet-title"><div><small>DISCOVER NEARBY</small><h2>附近的地点</h2></div><button data-action="sheet">${state.sheet?"收起":"查看全部"} →</button></div><div class="place-grid">${v.slice(0,state.sheet?10:3).map((p,i)=>card(p,i)).join("")}${v.length?"":`<div class="empty"><b>没有符合条件的地点</b><button data-action="reset">清除筛选</button></div>`}</div></section></section>`}
function card(p,i){return `<article class="place-card"><button class="card-photo photo-${(p.id%5)+1}" data-place="${p.id}"><span>${p.category}</span><b>${p.icon}</b>${i===0?"<em>精选</em>":""}</button><div class="card-copy"><small>${p.category} · ${p.area}</small><h3>${p.name}</h3><p>${p.tags.join(" · ")}</p><div><span>${distance(p)} · 步行约 ${Math.ceil(p.distance*12)} 分钟</span><button data-place="${p.id}">${state.lit.includes(p.id)?"已点亮":"去打卡"}</button></div></div></article>`}
function badgeView(){return `<section class="collection-screen"><div class="collection-top"><small>CITY MEMORY COLLECTION</small><h1>我的城市徽章</h1><p>每一次真实抵达，都会在城市里留下一枚属于你的光。</p><div class="progress"><i style="width:${state.lit.length/places.length*100}%"></i></div><b>${state.lit.length} / ${places.length} 已点亮</b></div><div class="collection-filters">${categories.map(c=>`<button class="${state.category===c?"active":""}" data-category="${c}">${c==="风景名胜"?"景点":c}</button>`).join("")}</div><div class="badge-grid">${places.filter(p=>state.category==="全部"||p.category===state.category).map(p=>`<button class="badge-card ${state.lit.includes(p.id)?"lit":"locked"}" data-place="${p.id}"><div class="badge-medal"><i>${p.icon}</i></div><h3>${p.name}</h3><p>${state.lit.includes(p.id)?"徽章已点亮":"去打卡点亮"}</p></button>`).join("")}</div></section>`}
function profileView(){return `<section class="profile-screen"><div class="profile-card"><div class="avatar">行</div><small>CHANGSHA EXPLORER</small><h1>长沙漫游者</h1><p>第 2 级 · 街巷初探</p><div class="profile-stats"><div><b>${state.lit.length}</b><span>点亮徽章</span></div><div><b>6.8km</b><span>探索里程</span></div><div><b>7</b><span>地点类型</span></div></div></div><article class="route-card"><small>今日推荐路线</small><h2>老街咖啡与人文漫步</h2><p>潮宗街 → 五一广场 → 杜甫江阁</p><span>4.2 公里 · 约 2 小时 · 5 个可点亮地点</span><button data-tab="map">开始探索</button></article></section>`}
function detailView(p){return `<div class="modal" data-action="close"><article class="place-detail"><button class="close" data-action="close">×</button><div class="detail-hero photo-${(p.id%5)+1}"><div class="large-pin">${p.icon}</div><span>${p.category} · ${p.area}</span></div><div class="detail-copy"><small>CHANGSHA CHECK-IN PLACE</small><h2>${p.name}</h2><div class="tags">${p.tags.map(t=>`<span>${t}</span>`).join("")}</div><p>${p.description}</p><div class="recommend"><span>到这里别错过</span><b>${p.recommend}</b></div><div class="check-rule">抵达地点附近 200 米内即可打卡，成功后点亮专属徽章。</div><div class="detail-actions"><button data-action="navigate">导航前往</button><button class="primary" data-action="checkin" data-id="${p.id}">${state.lit.includes(p.id)?"✓ 徽章已点亮":"✦ 到店打卡"}</button></div></div></article></div>`}
root.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;
if(t.dataset.tab){state.tab=t.dataset.tab;state.selected=null}
if(t.dataset.category){state.category=t.dataset.category}
if(t.dataset.radius){state.radius=Number(t.dataset.radius)}
if(t.dataset.status){state.status=t.dataset.status}
if(t.dataset.place){state.selected=places.find(p=>p.id===Number(t.dataset.place))}
if(t.dataset.action==="theme"){state.theme=state.theme==="day"?"night":"day";localStorage.setItem("xingji-theme",state.theme)}
if(t.dataset.action==="home"){state.tab="map";state.category="全部"}
if(t.dataset.action==="filter")state.filter=!state.filter;
if(t.dataset.action==="sheet")state.sheet=!state.sheet;
if(t.dataset.action==="reset"){state.category="全部";state.radius=10;state.status="全部"}
if(t.dataset.action==="clear-notice")state.notice="";
if(t.dataset.action==="navigate")state.notice="已为你打开导航";
if(t.dataset.action==="locate"){state.notice="正在定位…";navigator.geolocation?.getCurrentPosition(()=>{state.notice="定位成功，已更新附近地点";render()},()=>{state.notice="暂未获得定位权限，当前显示长沙示例地点";render()},{timeout:5000})}
if(t.dataset.action==="checkin"){const id=Number(t.dataset.id);if(!state.lit.includes(id)){state.lit.push(id);localStorage.setItem("xingji-lit",JSON.stringify(state.lit));state.notice="打卡成功，徽章已点亮"}else state.notice="这枚徽章已经点亮"}
if(t.dataset.action==="close"&&e.target===t)state.selected=null;
render()});
render();
