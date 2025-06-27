/* ---------- descarga del manual ---------- */
function descargarManual(){
  const link=document.createElement('a');
  link.href='manual-mente-rota.pdf';
  link.download='Manual_Mente_Rota.pdf';
  link.click();
}

/* ---------- registro del Service Worker ---------- */
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));
}

/* ---------- Carrusel ---------- */
window.addEventListener('DOMContentLoaded',()=>{

  const track   = document.querySelector('.carousel-track');
  const slides  = Array.from(track.children);
  const btnPrev = document.querySelector('.prev');
  const btnNext = document.querySelector('.next');
  const dotsBox = document.querySelector('.carousel-dots');

  /* crear los puntitos */
  slides.forEach((_,i)=>{
    const dot=document.createElement('button');
    if(i===0) dot.classList.add('active');
    dotsBox.append(dot);
  });
  const dots=Array.from(dotsBox.children);

  let index=0;
  const moveTo = (newIndex)=>{
    track.style.transform = `translateX(-${newIndex*100}%)`;
    dots[index].classList.remove('active');
    dots[newIndex].classList.add('active');
    index=newIndex;
  };

  btnPrev.addEventListener('click',()=>moveTo( index===0?slides.length-1:index-1 ));
  btnNext.addEventListener('click',()=>moveTo( index===slides.length-1?0:index+1 ));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>moveTo(i)));
});
