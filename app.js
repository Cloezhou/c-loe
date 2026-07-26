const toast = document.querySelector("#toast");
const tabs = [...document.querySelectorAll(".tab")];
let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    showToast(`${tab.dataset.tab}功能将在下一版开放`);
  });
});

document.querySelector("#locationButton").addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("当前浏览器不支持定位");
    return;
  }

  showToast("正在获取你的位置…");
  navigator.geolocation.getCurrentPosition(
    () => showToast("定位成功，正在查找附近咖啡店"),
    () => showToast("请允许浏览器使用定位权限"),
    { enableHighAccuracy: true, timeout: 8000 }
  );
});
