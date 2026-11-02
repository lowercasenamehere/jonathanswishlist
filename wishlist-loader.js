const resolveImage=value=>{
 try{const u=new URL(value);const prefix='/jonathanswishlist/';if(u.hostname==='lowercasenamehere.github.io'&&u.pathname.startsWith(prefix))return new URL(u.pathname.slice(prefix.length),document.baseURI).href;return value;}catch{return value;}
};

const editorOrigin='https://jonathan-wishlist-editor.johnshallhoob.chatgpt.site';
try {
 const response=await fetch(editorOrigin+'/api/gifts',{signal:AbortSignal.timeout(6000)});
 if(!response.ok)throw Error('Wishlist unavailable');
 let gifts=await response.json();if(!Array.isArray(gifts))throw Error('Invalid wishlist');
 const {attachRating}=await import('./ratings.js?v=1');
 const {groupOptions,attachOptions}=await import('./options.js?v=6');gifts=groupOptions(gifts);
 const knifeOrder=['15002-saddle-mountain-skinner','15080-2','15080bk-04'];
 const rank=g=>{const i=knifeOrder.indexOf((g.url||'').split('/').pop().split('?')[0]);return i<0?99:i;};gifts.sort((a,b)=>rank(a)-rank(b));
 const grid=document.getElementById('gift-grid');const fragment=document.createDocumentFragment();
 for(const [index,g] of gifts.entries()){
  const card=document.createElement('article');card.className='card';card.classList.toggle('knife-card',rank(g)<99);card.dataset.category=g.category||'Other';card.dataset.prices=g.price==null?'':String(g.price);
  const art=document.createElement('div');art.className='art';const num=document.createElement('span');num.className='number';num.textContent=String(index+1).padStart(2,'0');art.append(num);
  if(g.image&&(/^(https:\/\/|data:image\/jpeg;base64,)/.test(g.image))){const img=document.createElement('img');img.src=resolveImage(g.image);img.alt=g.name;img.width=600;img.height=600;img.loading='lazy';art.append(img);}else{const mark=document.createElement('span');mark.textContent=(g.brand||g.name||'G').slice(0,1);mark.style.cssText='font:italic 70px Georgia;color:#b8b0a0';art.append(mark);}
  const body=document.createElement('div');body.className='body';
  for(const [tag,cl,value] of [['p','eyebrow',g.brand],['h3','',g.name],['p','variant',g.variant],['p','description',g.description]]){if(!value)continue;const el=document.createElement(tag);el.className=cl;el.textContent=value;body.append(el);}
  const pricing=document.createElement('div');pricing.className='pricing';const price=document.createElement('strong');price.textContent=g.price==null?'Price TBD':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(g.price);pricing.append(price);body.append(pricing);
  if(/^https?:\/\//.test(g.url)){const links=document.createElement('div');links.className='links';const a=document.createElement('a');a.href=g.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='View gift';const arrow=document.createElement('span');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');a.append(arrow);links.append(a);body.append(links);}
  card.append(art,body);attachOptions(card,g,resolveImage);attachRating(card,g);fragment.append(card);
 }
 grid.replaceChildren(fragment);const categories=document.querySelector('.category-filters');categories.replaceChildren();
 for(const value of ['All',...new Set(gifts.map(g=>g.category||'Other'))]){const chip=document.createElement('button');chip.type='button';chip.className='filter-chip'+(value==='All'?' selected':'');chip.dataset.filter=value;chip.setAttribute('aria-pressed',String(value==='All'));chip.textContent=value==='All'?'All gifts':value;categories.append(chip);}
 document.querySelector('.gift-count').textContent=gifts.length+' gift ideas';
 const {initCart}=await import('./cart.js?v=options-1');initCart(gifts);document.getElementById('load-status').hidden=true;document.querySelector('.filters').hidden=false;
}catch(error){document.getElementById('load-status').textContent='Could not load the wishlist. Please refresh to try again.';}


