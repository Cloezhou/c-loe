const fallbackCenter = [28.1987, 112.9709];
const fallbackCafes = [
  {name:"山止川行 Coffee",lat:28.2035,lng:112.9728,address:"潮宗街历史文化街区",tags:["独立咖啡","安静","手冲"],type:"specialty"},
  {name:"浮生半日",lat:28.1978,lng:112.9784,address:"五一广场附近",tags:["创意特调","城市景观"],type:"stamp"},
  {name:"止间书店咖啡",lat:28.1916,lng:112.9686,address:"太平老街附近",tags:["书店","甜品","慢生活"],type:"specialty"},
  {name:"湘江边咖啡",lat:28.1888,lng:112.9625,address:"杜甫江阁附近",tags:["江景","日落"],type:"stamp"},
  {name:"岳麓山下",lat:28.1908,lng:112.9472,address:"岳麓山景区东门附近",tags:["户外","手冲"],type:"specialty"}
];
const badges = [
  ["爱晚亭","岳麓山","亭"],["杜甫江阁","湘江风光带","阁"],["天心阁","天心古城","城"],
  ["岳麓书院","千年学府","院"],["橘子洲","湘江之心","洲"],["火宫殿","坡子街","火"]
];
let cafes=[...fallbackCafes], selected=null, markers=[], currentPos=null, map;

function initMap(){
  map=L.map("map",{zoomControl:false,attributionControl:true}).setView(fallbackCenter,14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    maxZoom:19,attribution:"© OpenStreetMap"
  }).addTo(map);
  renderMarkers(); renderCards(); locateUser(false);
  map.on("moveend",()=>{ if(map.getZoom()>=13) document.querySelector("#statusText").textContent="拖动地图后可重新定位搜索"; });
}
function distance(a,b){
  const R=6371,toRad=x=>x*Math.PI/180;
  const dLat=toRad(b[0]-a[0]),dLng=toRad(b[1]-a[1]);
  const v=Math.sin(dLat/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(v),Math.sqrt(1-v));
}
function icon(active=false){return L.divIcon({className:"",html:`<div class="coffee-marker ${active?"active":""}">●</div>`,iconSize:[30,30],iconAnchor:[15,15]})}
function renderMarkers(){
  markers.forEach(m=>m.remove()); markers=[];
  cafes.forEach((c,i)=>{
    const m=L.marker([c.lat,c.lng],{icon:icon(selected===i)}).addTo(map).on("click",()=>selectCafe(i));
    markers.push(m);
  });
}
function renderCards(filter="all"){
  const origin=currentPos||fallbackCenter;
  const list=cafes.map((c,i)=>({...c,i,km:distance(origin,[c.lat,c.lng])}))
    .filter(c=>filter==="all"||c.type===filter).sort((a,b)=>a.km-b.km);
  document.querySelector("#cafeRail").innerHTML=list.map(c=>`
    <button class="cafe-card" data-id="${c.i}">
      <div class="top"><h3>${c.name}</h3><b>${c.type==="stamp"?"可盖章":"精选"}</b></div>
      <p>${c.tags.join(" · ")}</p><span class="distance">${c.km<1?Math.round(c.km*1000)+" m":c.km.toFixed(1)+" km"} · ${c.address}</span>
    </button>`).join("");
  document.querySelectorAll(".cafe-card").forEach(b=>b.onclick=()=>selectCafe(+b.dataset.id));
}
function selectCafe(i){
  selected=i; renderMarkers();
  const c=cafes[i],origin=currentPos||fallbackCenter,km=distance(origin,[c.lat,c.lng]);
  map.flyTo([c.lat,c.lng],16,{duration:.7});
  document.querySelector("#shopName").textContent=c.name;
  document.querySelector("#shopMeta").textContent=(km<1?Math.round(km*1000)+" 米":km.toFixed(1)+" 公里")+" · 附近门店";
  document.querySelector("#shopTags").innerHTML=c.tags.map(t=>`<span>${t}</span>`).join("");
  document.querySelector("#shopAddress").textContent="地址："+c.address;
  document.querySelector("#sheet").hidden=false;
}
async function searchNearby(lat,lng){
  const q=`[out:json][timeout:12];(node["amenity"="cafe"](around:3000,${lat},${lng});way["amenity"="cafe"](around:3000,${lat},${lng}););out center 24;`;
  try{
    const res=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",body:q});
    const data=await res.json();
    const found=data.elements.map(e=>({name:e.tags?.name||e.tags?.["name:zh"]||"附近咖啡店",lat:e.lat||e.center?.lat,lng:e.lon||e.center?.lon,address:e.tags?.["addr:street"]||"点击查看地图位置",tags:["实时附近","咖啡"],type:"all"})).filter(x=>x.lat&&x.lng);
    if(found.length){cafes=found; document.querySelector("#statusText").textContent=`已找到 ${found.length} 家实时附近咖啡店`;}
    else document.querySelector("#statusText").textContent="附近暂无公开门店，显示长沙精选示例";
  }catch(e){document.querySelector("#statusText").textContent="实时门店暂未响应，显示长沙精选示例";}
  renderMarkers();renderCards();
}
function locateUser(showToast=true){
  if(!navigator.geolocation){showMsg("当前浏览器不支持定位");return}
  document.querySelector("#statusText").textContent="正在获取你的位置…";
  navigator.geolocation.getCurrentPosition(async p=>{
    currentPos=[p.coords.latitude,p.coords.longitude];
    map.flyTo(currentPos,15,{duration:.8});
    L.marker(currentPos,{icon:L.divIcon({className:"",html:'<div class="user-marker"></div>',iconSize:[18,18],iconAnchor:[9,9]})}).addTo(map);
    if(showToast)showMsg("已定位，正在搜索附近咖啡");
    await searchNearby(...currentPos);
  },()=>{
    map.flyTo(fallbackCenter,14);
    document.querySelector("#statusText").textContent="定位未授权，正在展示长沙市中心";
    if(showToast)showMsg("请在浏览器设置中允许定位");
  },{enableHighAccuracy:true,timeout:8000,maximumAge:60000});
}
function showMsg(msg){const t=document.querySelector("#toast");t.textContent=msg;t.hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.hidden=true,2200)}

document.addEventListener("DOMContentLoaded",()=>{
  initMap();
  document.querySelector("#badgeGrid").innerHTML=badges.map((b,i)=>`<article class="badge ${i>1?"locked":""}"><div class="badge-icon">${b[2]}</div><h3>${b[0]}</h3><p>${i>1?"尚未解锁":b[1]+" · 已收藏"}</p></article>`).join("");
  document.querySelector("#locate").onclick=()=>locateUser(true);
  document.querySelectorAll("[data-close]").forEach(b=>b.onclick=()=>{document.querySelector("#sheet").hidden=true;selected=null;renderMarkers()});
  document.querySelector("#navBtn").onclick=()=>{const c=cafes[selected];window.open(`https://uri.amap.com/marker?position=${c.lng},${c.lat}&name=${encodeURIComponent(c.name)}`,"_blank")};
  document.querySelector("#stampBtn").onclick=()=>showMsg("到店 200 米内即可收藏这枚印记");
  document.querySelector("#routeBtn").onclick=()=>showMsg("路线规划将在正式版开放");
  document.querySelector("#expandBtn").onclick=()=>showMsg("左右滑动卡片查看更多门店");
  document.querySelectorAll(".chips button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".chips button").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderCards(b.dataset.filter)});
  document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{
    document.querySelectorAll("nav button").forEach(x=>x.classList.remove("active"));b.classList.add("active");
    document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));
    document.querySelector(`#${b.dataset.page}Page`).classList.add("active");
    if(b.dataset.page==="map")setTimeout(()=>map.invalidateSize(),50);
  });
  document.querySelector("#profileBtn").onclick=()=>document.querySelector('nav button[data-page="me"]').click();
});
