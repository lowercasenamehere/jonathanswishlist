const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const slug=g=>(g.url||'').split('/').pop().split('?')[0];
export function groupOptions(gifts){
 const skinner=gifts.find(g=>slug(g)==='15002-saddle-mountain-skinner');
 const rivers=['15080-2','15080bk-04'].map(s=>gifts.find(g=>slug(g)===s)).filter(Boolean);
 if(skinner&&rivers.length){skinner.options=[{...skinner},...rivers.map(g=>({...g,image:'https://jonathanswishlist.com/'+(slug(g)==='15080-2'?'crooked-wood-official.png':'crooked-black-official.png')}))];gifts=gifts.filter(g=>!rivers.includes(g));}
 for(const g of gifts){
  if(!g.name.toLowerCase().includes('adam leather jeans belt'))continue;
  const brown=/brown|bourbon/i.test(g.name+' '+g.variant+' '+g.description);const color=brown?'Whiskey Barrel Brown':'Midnight Black';
  g.options=[{...g},{id:'mainstreet-'+(brown?'brown':'black'),name:'Main Street Forge Classic Belt · '+color,brand:'Main Street Forge',price:44.99,url:'https://mainstreetforge.com/products/classic-everyday-leather-belt-made-in-usa-mens-leather-belt',variant:color,description:'Full-grain leather belt with a removable roller buckle. Made in the USA.',image:'https://jonathanswishlist.com/mainstreet-'+(brown?'brown':'black')+'.jpg'}];
 }
 return gifts;
}
export function attachOptions(card,g,resolveImage){
 if(!g.options)return;
 const panel=document.createElement('details');panel.className='gift-options';const title=document.createElement('summary');title.textContent='Other options';panel.append(title);
 const note=document.createElement('p');note.textContent=g.options[0].name.includes('Skinner')?'Choose one knife.':'Choose one belt.';panel.append(note);
 const choices=document.createElement('div');choices.className='option-choices';panel.append(choices);
 const buttons=[];const body=card.querySelector('.body');let label=body.querySelector('.variant');if(!label){label=document.createElement('p');label.className='variant';body.querySelector('h3').after(label);}
 function choose(i){const picked=g.options[i];g.choice=picked;
  let img=card.querySelector('.art img');if(img){img.src=resolveImage(picked.image);img.alt=picked.name;}
  body.querySelector('h3').textContent=picked.name;
  label.textContent=i?'Option '+(i+1):'First choice';
  body.querySelector('.description').textContent=picked.description||'';body.querySelector('.pricing strong').textContent=money(picked.price);
  const link=body.querySelector('.links a');link.href=picked.url;link.firstChild.textContent=i?'View alternative':'View gift';
  buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));
  try{localStorage.setItem('wishlist-option-'+g.id,String(i));}catch{}
  document.dispatchEvent(new Event('wishlist-option-change'));
 }
 g.options.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(i?'Option '+(i+1)+': ':'First choice: ')+o.name+' · '+money(o.price);b.onclick=()=>choose(i);choices.append(b);buttons.push(b);});
 body.querySelector('.links').after(panel);
 let saved=0;try{saved=Number(localStorage.getItem('wishlist-option-'+g.id)||0);}catch{}choose(Number.isInteger(saved)&&saved>=0&&saved<g.options.length?saved:0);
}
