window.TRIP_APP={setTab(){}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-jump-region]');if(!b)return;const map={niseko:'niseko',furano:'furano',biei:'biei',asahikawa:'biei',sapporo:'sapporo',chitose:'transfer'};window.location.href=map[b.dataset.jumpRegion]?'./index.html?area='+encodeURIComponent(map[b.dataset.jumpRegion]):'./index.html';});
