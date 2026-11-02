export function initCart(gifts){
 const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
 const known=g=>typeof g.price==='number'&&Number.isFinite(g.price)&&g.price>=0;
 const summary=document.createElement('div');summary.className='wishlist-summary';
 const total=document.createElement('strong');total.className='wishlist-total';total.textContent=money(gifts.reduce((n,g)=>n+(known(g)?g.price:0),0))+' total';
 const count=document.querySelector('.gift-count');count.before(summary);summary.append(total,count);
 
 if(gifts.some(g=>!known(g))){const note=document.createElement('small');note.textContent='Excludes gifts with prices TBD';summary.append(note);}
 const open=document.createElement('button');open.className='cart-open';open.textContent='Cart (0)';document.querySelector('header').append(open);
 const dialog=document.createElement('dialog');dialog.className='cart-dialog';dialog.setAttribute('aria-labelledby','cart-title');dialog.innerHTML='<div class="cart-heading"><h2 id="cart-title">Your cart</h2><button type="button" aria-label="Close cart">×</button></div><p class="cart-intro">Select gifts to plan your total. Buy each gift through its store link.</p><div class="cart-items"></div><div class="cart-footer"><strong aria-live="polite"></strong><button type="button">Clear cart</button></div><p class="cart-note"></p>';document.body.append(dialog);
 const selected=new Set();try{const saved=JSON.parse(localStorage.getItem('jonathan-wishlist-cart')||'[]');if(Array.isArray(saved))saved.forEach(id=>{if(gifts.some(g=>g.id===id))selected.add(id);});}catch{}
 const buttons=new Map();const items=dialog.querySelector('.cart-items');
 function render(){
  try{localStorage.setItem('jonathan-wishlist-cart',JSON.stringify([...selected]));}catch{}
  open.textContent='Cart ('+selected.size+')';items.replaceChildren();let subtotal=0,unknown=0;
  for(const original of gifts){const g=original.choice||original;const on=selected.has(original.id);const b=buttons.get(original.id);b.textContent=on?'Added to cart ✓':'Add to cart';b.setAttribute('aria-pressed',String(on));if(!on)continue;
   if(known(g))subtotal+=g.price;else unknown++;
   const row=document.createElement('div');row.className='cart-item';const info=document.createElement('div');const name=document.createElement('a');name.textContent=g.name;if(/^https?:\/\//.test(g.url)){name.href=g.url;name.target='_blank';name.rel='noopener noreferrer';}const price=document.createElement('span');price.textContent=known(g)?money(g.price):'Price TBD';info.append(name,price);const remove=document.createElement('button');remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+g.name+' from cart');remove.onclick=()=>{selected.delete(original.id);render();};row.append(info,remove);items.append(row);
  }
  if(!selected.size){const p=document.createElement('p');p.textContent='Your cart is empty. Add a gift from the list.';items.append(p);}
  dialog.querySelector('.cart-footer strong').textContent='Total '+money(subtotal);
  dialog.querySelector('.cart-note').textContent=unknown?'Plus '+unknown+' gift'+(unknown===1?'':'s')+' with price TBD.':'Item prices only; tax and shipping aren’t included.';
  dialog.querySelector('.cart-footer button').disabled=!selected.size;
 }
 document.querySelectorAll('#gift-grid .card').forEach((card,i)=>{const g=gifts[i];const b=document.createElement('button');b.type='button';b.className='cart-add';b.onclick=()=>{selected.has(g.id)?selected.delete(g.id):selected.add(g.id);render();};card.querySelector('.body').append(b);buttons.set(g.id,b);});
 document.addEventListener('wishlist-option-change',render);open.onclick=()=>dialog.showModal();dialog.querySelector('.cart-heading button').onclick=()=>dialog.close();dialog.querySelector('.cart-footer button').onclick=()=>{selected.clear();render();};dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});render();
}
