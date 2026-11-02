const money=n=>n==null?'Price TBD':new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const slug=g=>(g.url||'').split('/').pop().split('?')[0];
export function groupOptions(gifts){
 const skinner=gifts.find(g=>slug(g)==='15002-saddle-mountain-skinner');
 const rivers=['15080-2','15080bk-04'].map(s=>gifts.find(g=>slug(g)===s)).filter(Boolean);
 if(skinner&&rivers.length){skinner.options=[{...skinner},...rivers.map(g=>({...g,image:'https://jonathanswishlist.com/'+(slug(g)==='15080-2'?'crooked-wood-official.png':'crooked-black-official.png')}))];gifts=gifts.filter(g=>!rivers.includes(g));}
 for(const g of gifts){
  if(!g.name.toLowerCase().includes('adam leather jeans belt'))continue;
  const brown=/brown|bourbon/i.test(g.name+' '+g.variant+' '+g.description);const color=brown?'Whiskey Barrel Brown':'Midnight Black';
  g.options=[{...g},{id:'mainstreet-'+(brown?'brown':'black'),name:'Main Street Forge Classic Belt · '+color,brand:'Main Street Forge',price:44.99,url:'https://mainstreetforge.com/products/classic-everyday-leather-belt-made-in-usa-mens-leather-belt',variant:color,description:'Full-grain leather belt with a removable roller buckle. Made in the USA.',image:'https://jonathanswishlist.com/mainstreet-'+(brown?'brown':'black')+'-cutout.png'}];
 }
 for(const g of gifts){if(!(g.url||'').includes('E482766'))continue;g.options=[{...g},{...g,id:g.id+'-gray',name:'Uniqlo Waffle Henley · Dark Gray',variant:'08 Dark Gray',url:'https://www.uniqlo.com/us/en/products/E482766-000/00?colorDisplayCode=08',image:'https://jonathanswishlist.com/uniqlo-henley-gray-cutout.png'}];}
 const hm=gifts.find(g=>(g.url||'').includes('1311239001'));
 const dickies=gifts.find(g=>(g.url||'').includes('247-loose-fit'));
 if(hm){hm.optionKind='pants';hm.options=[{...hm,optionLabel:'First choice'},
 {id:'uniqlo-wide-black',optionLabel:'Alternative 1',name:'UNIQLO Wide Chino Pants · Black',brand:'UNIQLO',price:null,url:'https://www.uniqlo.com/us/en/products/E470549-000/01?colorDisplayCode=09',variant:'Black · Waist 32 · 30-inch hem preferred',description:'Wide tapered chinos with belt loops. 100% cotton.',image:'https://jonathanswishlist.com/uniqlo-wide-black.jpg'},
 {id:'empyre-cool-black',optionLabel:'Alternative 2',name:'Empyre Cool Black Loose Skate Chinos',brand:'Empyre',price:19.99,url:'https://www.zumiez.com/empyre-cool-black-loose-skate-chino-pants.html',variant:'Black · Waist 32',description:'Loose-fit skate chinos with four pockets. 60% cotton, 40% polyester.',image:'https://jonathanswishlist.com/empyre-cool-black.jpg'},
 ...(dickies?[{...dickies,optionLabel:'Alternative 3'}]:[])];gifts=gifts.filter(g=>g!==dickies);}
 for(const g of gifts){if(g.id!=='sedici-waist-black')continue;g.image='https://jonathanswishlist.com/sedici-waist-cutout.png';g.optionKind='bag';g.options=[{...g},{id:'fox-slim-black',name:'Fox Slim Hip Pack · Black',brand:'Fox Racing',price:59.95,url:'https://www.foxracing.com/product/slim-hip-pack/27147.html?dwvar_27147_color=001',variant:'Black · One size',description:'Low-profile waist pack with divided pockets, a key hook, and breathable mesh backing.',image:'https://jonathanswishlist.com/fox-slim-black.png'}];}
 return gifts;
}
export function attachOptions(card,g,resolveImage){
 if(!g.options)return;
 const panel=document.createElement('details');panel.className='gift-options';const title=document.createElement('summary');title.textContent='Other options';panel.append(title);
 const note=document.createElement('p');note.textContent=g.optionKind==='bag'?'Choose one bag.':g.optionKind==='pants'?'Choose one pair.':g.options[0].name.includes('Skinner')?'Choose one knife.':g.options[0].name.includes('Henley')?'Choose one color.':'Choose one belt.';panel.append(note);
 const choices=document.createElement('div');choices.className='option-choices';panel.append(choices);
 const buttons=[];const body=card.querySelector('.body');let label=body.querySelector('.variant');if(!label){label=document.createElement('p');label.className='variant';body.querySelector('h3').after(label);}
 function choose(i){const picked=g.options[i];g.choice=picked;
  let img=card.querySelector('.art img');if(img){img.src=resolveImage(picked.image);img.alt=picked.name;}
  body.querySelector('h3').textContent=picked.name;
  label.textContent=[picked.optionLabel||(i?'Option '+(i+1):'First choice'),picked.variant].filter(Boolean).join(' · ');
  body.querySelector('.description').textContent=picked.description||'';body.querySelector('.pricing strong').textContent=money(picked.price);
  const link=body.querySelector('.links a');link.href=picked.url;link.firstChild.textContent=i?'View alternative':'View gift';
  buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));
  try{localStorage.setItem('wishlist-option-'+g.id,String(i));}catch{}
  document.dispatchEvent(new Event('wishlist-option-change'));
 }
 g.options.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.textContent=(o.optionLabel?o.optionLabel+': ':(i?'Option '+(i+1)+': ':'First choice: '))+o.name+' · '+money(o.price);b.onclick=()=>choose(i);choices.append(b);buttons.push(b);});
 body.querySelector('.links').after(panel);
 let saved=0;try{saved=Number(localStorage.getItem('wishlist-option-'+g.id)||0);}catch{}choose(Number.isInteger(saved)&&saved>=0&&saved<g.options.length?saved:0);
}
