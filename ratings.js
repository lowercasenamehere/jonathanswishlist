export function attachRating(card,g){
 const box=document.createElement('section');box.className='gift-rating';box.setAttribute('aria-label','Jonathan’s rating');
 const label=document.createElement('span');label.className='rating-label';label.textContent='Jonathan’s rating';box.append(label);
 if(Number.isInteger(g.rating)&&g.rating>=1&&g.rating<=5){const stars=document.createElement('span');stars.className='rating-stars';stars.textContent='★'.repeat(g.rating)+'☆'.repeat(5-g.rating);stars.setAttribute('aria-label',g.rating+' out of 5 stars');box.append(stars);}
 if(g.ratingNote){const note=document.createElement('p');note.className='rating-note';note.textContent=g.ratingNote;box.append(note);}
 const edit=document.createElement('a');edit.className='rating-edit';edit.href='https://jonathan-wishlist-editor.johnshallhoob.chatgpt.site/?gift='+encodeURIComponent(g.id);edit.textContent=g.rating||g.ratingNote?'Edit my rating':'Add my rating';box.append(edit);card.querySelector('.body').append(box);
 const status=document.createElement('section');status.className='gift-rating';status.setAttribute('aria-label','Gift status');
 const state=document.createElement('span');state.className='rating-label';state.textContent=g.bought===true?'✓ Bought':'Gift status';status.append(state);
 if(/^(girlfriend|gf)$/i.test((g.buyerNote||'').trim())){
  card.classList.add('gift-for-girlfriend');
  const badge=document.createElement('span');badge.className='girlfriend-star';badge.textContent='★ Girlfriend';status.append(badge);
 }else if(g.buyerNote){const note=document.createElement('p');note.className='rating-note';note.textContent=g.buyerNote;status.append(note);}
 const manage=edit.cloneNode();manage.textContent='Edit gift';status.append(manage);
 card.querySelector('.body').append(status);
}
