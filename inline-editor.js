const nav = document.querySelector('.nav-link[href*="wishlist-editor."]');
const allowedHost = /^(www\.)?(jonathanswishlist|giovannaswishlist)\.com$/;
if (nav && allowedHost.test(location.hostname) && typeof HTMLDialogElement !== 'undefined') {
  const origin = new URL(nav.href).origin;
  const dialog = document.createElement('dialog');
  dialog.setAttribute('aria-label', 'Edit wishlist');
  dialog.style.cssText = 'width:min(760px,calc(100% - 24px));height:min(85dvh,820px);max-height:calc(100% - 24px);padding:0;border:1px solid #d9d4ca;background:#f5f1e8;color:#202d3c;overflow:hidden';
  const header = document.createElement('div');
  header.style.cssText = 'height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-bottom:1px solid #d9d4ca';
  const title = document.createElement('strong');
  title.textContent = 'Edit wishlist';
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Done';
  close.style.cssText = 'font:inherit;padding:5px 12px;cursor:pointer';
  close.onclick = () => dialog.close();
  header.append(title, close);
  const frame = document.createElement('iframe');
  frame.title = 'Password-protected wishlist editor';
  frame.referrerPolicy = 'origin';
  frame.style.cssText = 'display:block;width:100%;height:calc(100% - 48px);border:0';
  dialog.append(header, frame);
  document.body.append(dialog);

  let dirty = false;
  let opener;
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const target = new URL(link.href);
    if (target.origin !== origin || target.pathname !== '/') return;
    event.preventDefault();
    opener = link;
    target.pathname = '/embed';
    if (frame.src !== target.href) frame.src = target.href;
    dialog.showModal();
  });
  window.addEventListener('message', event => {
    if (event.origin !== origin || event.source !== frame.contentWindow) return;
    if (event.data?.type === 'wishlist-editor-saved') dirty = true;
    if (event.data?.type === 'wishlist-editor-close' && dialog.open) dialog.close();
  });
  dialog.addEventListener('close', () => {
    opener?.focus({preventScroll:true});
    if (!dirty) return;
    dirty = false;
    if (location.hostname.endsWith('giovannaswishlist.com')) {
      document.dispatchEvent(new Event('wishlist-editor-refresh'));
    } else {
      try { sessionStorage.setItem('wishlist-editor-scroll', String(scrollY)); } catch {}
      location.reload();
    }
  });
}
