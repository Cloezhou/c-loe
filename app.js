const cafes=[
 {name:"山止川行 Coffee",distance:"320m",area:"潮宗街",tags:["独立咖啡","安静","手冲"],drink:"桂花拿铁",note:"藏在老街里的小院咖啡馆，木窗、书架与黑胶，适合待上一整个下午。"},
 {name:"浮生半日",distance:"680m",area:"开福寺",tags:["庭院","甜品","拍照"],drink:"橘洲气泡美式",note:"闹中取静的城市庭院，午后阳光落在老砖墙上，很有长沙的松弛感。"},
 {name:"一隅咖啡",distance:"1.1km",area:"太平街",tags:["老街","特调","夜咖"],drink:"烟火长沙",note:"从太平街主路拐进去的小店，适合逛完古街后歇脚。"},
 {name:"未迟咖啡",distance:"1.4km",area:"岳麓山",tags:["山景","手冲","自然"],drink:"岳麓晨雾",note:"靠近岳麓山脚，窗边能看到大片绿意，雨天尤其舒服。"},
 {name:"江畔 Coffee",distance:"1.8km",area:"橘子洲",tags:["江景","日落","特调"],drink:"湘江落日",note:"看湘江日落的轻松位置，适合作为橘子洲步行路线的最后一站。"}
];
const badges=[["爱晚亭","亭",1],["岳麓书院","院",1],["杜甫江阁","阁",1],["天心阁","城",1],["橘子洲·青年","洲",1],["太平老街","街",0],["铜官窑古镇","窑",0],["湖南省博物馆","博",0],["浏阳河","河",0]];
let selected=0,stamped=new Set;
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);
function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(el.timer);el.timer=setTimeout(()=>el.hidden=true,2300)}
function renderList(){ $("#cafeList").innerHTML=cafes.slice(0,3).map((c,i)=>`<button class="cafe" data-id="${i}"><div class="photo">COFFEE</div><div class="copy"><h3>${c.name}</h3><p>${c.tags.join(" · ")}</p><span>⌖ ${c.distance} · ${c.area}</span></div><b>›</b></button>`).join("");$$(".cafe").forEach(x=>x.onclick=()=>openCafe(+x.dataset.id))}
function openCafe(i){selected=i;const c=cafes[i];$("#detailName").textContent=c.name;$("#detailTags").innerHTML=c.tags.map(t=>`<span>${t}</span>`).join("");$("#detailDistance").textContent=`⌖ 距你 ${c.distance} · ${c.area}`;$("#detailNote").textContent=c.note;$("#detailDrink").textContent=c.drink;$("#stamp").textContent=stamped.has(i)?"✓ 已盖章":"✦ 到店盖章";$("#modal").hidden=false}
function updateCount(){const n=8+stamped.size;$("#badgeCount").textContent=n;$("#myCount").textContent=n}
function locate(){toast("正在获取你的位置…");const done=(text)=>{ $("#location").classList.add("pulse");$("#nearbyTitle").textContent="你附近的咖啡";toast(text)};if(!navigator.geolocation)return done("已切换到长沙模拟位置");navigator.geolocation.getCurrentPosition(()=>done("定位成功，已刷新附近咖啡"),()=>done("当前为长沙模拟位置，可继续体验"),{timeout:5000})}
renderList();
$("#badgeGrid").innerHTML=badges.map(b=>`<article class="badge ${b[2]?"":"locked"}"><div class="badge-art"><span>${b[1]}</span></div><h3>${b[0]}</h3><p>${b[2]?"已点亮":"等待探索"}</p></article>`).join("");
$$(".pin").forEach(x=>x.onclick=()=>openCafe(+x.dataset.id));
$("#close").onclick=()=>$("#modal").hidden=true;$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").hidden=true};
$("#locate").onclick=locate;$("#refresh").onclick=locate;
$("#navigate").onclick=()=>toast("已打开导航模拟");
$("#stamp").onclick=()=>{stamped.add(selected);updateCount();$("#stamp").textContent="✓ 已盖章";toast("盖章成功！获得「长沙咖啡印记」+20")};
$("#routeBtn").onclick=()=>{$$("[data-page]").forEach(x=>x.classList.toggle("active",x.dataset.page==="map"));$$(".page").forEach(x=>x.classList.remove("active"));$("#mapPage").classList.add("active");$("#title").textContent="行迹 · 长沙咖啡地图";toast("路线已显示在地图上")};
$$("[data-page]").forEach(btn=>btn.onclick=()=>{$$("[data-page]").forEach(x=>x.classList.toggle("active",x===btn));$$(".page").forEach(x=>x.classList.remove("active"));$(`#${btn.dataset.page}Page`).classList.add("active");$("#title").textContent=btn.dataset.page==="map"?"行迹 · 长沙咖啡地图":btn.dataset.page==="badges"?"长沙印记":"我的行迹"});
