const nav = document.querySelector('.nav-link[href*="wishlist-editor."]');
const grid = document.getElementById('gift-grid');
const giovanna = /^(www\.)?giovannaswishlist\.com$/.test(location.hostname);
const onWishlist = giovanna || /^(www\.)?jonathanswishlist\.com$/.test(location.hostname);
const storageKey = 'wishlist-direct-editor-session';

if (nav && grid && onWishlist) {
  const origin = new URL(nav.href).origin;
  let token = '';
  let gifts = [];
  let activeForm;
  let pendingId = '';
  let loginButton;
  try { token = sessionStorage.getItem(storageKey) || ''; } catch {}

  const element = (tag, content) => {
    const el = document.createElement(tag);
    if (content) el.textContent = content;
    return el;
  };
  const button = (label, action) => {
    const el = element('button', label);
    el.type = 'button';
    if (action) el.onclick = action;
    return el;
  };
  const toolbar = element('section');
  toolbar.className = 'inline-edit-toolbar';
  toolbar.hidden = true;
  const status = element('p');
  status.setAttribute('role', 'status');
  grid.before(toolbar, status);

  function remember(value) {
    token = value;
    try {
      if (value) sessionStorage.setItem(storageKey, value);
      else sessionStorage.removeItem(storageKey);
    } catch {}
  }
  async function api(path, {method = 'GET', data} = {}) {
    const headers = {'X-Wishlist-Embed':'1'};
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = 'Bearer ' + token;
    const response = await fetch(origin + '/api/' + path, {
      method, headers, credentials:'omit', cache:'no-store',
      body:data === undefined ? undefined : JSON.stringify(data)
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401 && path !== 'login') {
        remember('');
        showLogin();
      }
      throw new Error(result.error || 'Could not save changes.');
    }
    return result;
  }
  function closeForm() {
    if (!activeForm) return;
    activeForm.parentElement?.classList.remove('inline-editing');
    activeForm.remove();
    activeForm = undefined;
  }
  function leaveEditMode() {
    remember('');
    closeForm();
    toolbar.hidden = true;
    grid.classList.remove('inline-edit-mode');
    nav.textContent = 'Edit wishlist';
    status.textContent = '';
  }
  function field(parent, name, caption, value, type = 'text') {
    const label = element('label', caption);
    const input = element(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type;
    input.name = name;
    if (type === 'checkbox') input.checked = value === true;
    else if (type !== 'file') input.value = value ?? '';
    if (type === 'number') { input.min = '0'; input.step = '0.01'; }
    label.append(input);
    parent.append(label);
    return input;
  }
  function showLogin() {
    toolbar.hidden = false;
    grid.classList.remove('inline-edit-mode');
    const form = element('form');
    const input = field(form, 'password', 'Wishlist password', '', 'password');
    input.autocomplete = 'current-password';
    input.required = true;
    loginButton = button('Unlock editing');
    loginButton.type = 'submit';
    form.append(loginButton, button('Cancel', leaveEditMode));
    toolbar.replaceChildren(form);
    input.focus();
    form.onsubmit = async event => {
      event.preventDefault();
      loginButton.disabled = true;
      status.textContent = 'Signing in…';
      try {
        const session = await api('login', {method:'POST', data:{password:input.value}});
        remember(session.token);
        await enterEditMode();
      } catch (error) {
        status.textContent = error.message;
      } finally {
        loginButton.disabled = false;
      }
    };
  }
  async function enterEditMode() {
    if (!(await api('session')).signedIn) { remember(''); showLogin(); return; }
    gifts = await api('gifts');
    toolbar.hidden = false;
    grid.classList.add('inline-edit-mode');
    nav.textContent = 'Done editing';
    toolbar.replaceChildren(element('strong', 'Editing wishlist'), button('Add gift', () => openForm()), button('Done editing', leaveEditMode));
    status.textContent = '';
    if (pendingId) {
      const id = pendingId;
      pendingId = '';
      openForm(id);
    }
  }
  function refresh(message) {
    closeForm();
    status.textContent = message;
    if (giovanna) document.dispatchEvent(new Event('wishlist-editor-refresh'));
    else {
      try { sessionStorage.setItem('wishlist-editor-scroll', String(scrollY)); } catch {}
      location.reload();
    }
  }
  async function photo(file) {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
    const canvas = element('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', 0.8);
  }
  function openForm(id) {
    const newId = id || crypto.randomUUID();
    const gift = id ? gifts.find(item => item.id === id) : {};
    const card = id ? [...grid.children].find(item => item.dataset.giftId === id) : null;
    if (!gift || (id && !card)) return;
    closeForm();
    const form = element('form');
    form.className = 'inline-gift-form';
    form.append(element('h3', id ? 'Edit gift' : 'Add gift'));
    const name = field(form, 'name', 'Gift name', gift.name);
    name.required = true;
    name.maxLength = 150;
    field(form, 'brand', 'Brand', gift.brand).maxLength = 80;
    field(form, 'url', 'Product link', gift.url, 'url').required = true;
    field(form, 'price', 'Price in dollars', gift.price, 'number');
    field(form, 'category', 'Category', gift.category || 'Other').maxLength = 60;
    field(form, 'variant', 'Size, color, or version', gift.variant).maxLength = 200;
    field(form, 'description', 'Description', gift.description, 'textarea').maxLength = 500;
    const rating = field(form, 'rating', 'Rating out of 5', gift.rating, 'number');
    rating.min = '1'; rating.max = '5'; rating.step = '1';
    field(form, 'ratingNote', 'Rating note', gift.ratingNote).maxLength = 120;
    field(form, 'bought', 'Bought', gift.bought, 'checkbox');
    field(form, 'buyerNote', 'Who might buy it? (public)', gift.buyerNote).maxLength = 120;
    field(form, 'image', 'Photo link', gift.image?.startsWith('https://') ? gift.image : '', 'url');
    const upload = field(form, 'photo', 'Upload a replacement photo', '', 'file');
    upload.accept = 'image/*';
    const alternatives = element('fieldset');
    if (giovanna) {
      alternatives.append(element('legend', 'Other options'));
      const add = button('Add option', () => {
        if (alternatives.querySelectorAll('.inline-gift-option').length < 5) addOption({});
      });
      alternatives.append(add);
      function addOption(option) {
        const row = element('div');
        row.className = 'inline-gift-option';
        field(row, 'optionName', 'Option name', option.name).required = true;
        field(row, 'optionUrl', 'Product link', option.url, 'url').required = true;
        field(row, 'optionPrice', 'Price', option.price, 'number');
        field(row, 'optionVariant', 'Size, color, or version', option.variant);
        field(row, 'optionDescription', 'Description', option.description, 'textarea');
        field(row, 'optionImage', 'Photo link', option.image?.startsWith('https://') ? option.image : '', 'url');
        if (option.image?.startsWith('data:')) row.dataset.originalPhoto = option.image;
        row.append(button('Remove option', () => row.remove()));
        add.before(row);
      }
      (gift.options || []).forEach(addOption);
      form.append(alternatives);
    }

    const message = element('p');
    message.setAttribute('role', 'status');
    const save = button('Save changes');
    save.type = 'submit';
    async function run(action, success) {
      const controls = [...form.querySelectorAll('button')];
      controls.forEach(control => control.disabled = true);
      message.textContent = 'Saving…';
      try {
        await action();
        gifts = await api('gifts');
        refresh(success);
      } catch (error) {
        message.textContent = error.message;
      } finally {
        controls.forEach(control => control.disabled = false);
      }
    }
    form.append(save, button('Cancel', closeForm));
    if (id) {
      const move = delta => run(async () => {
        const current = await api('gifts');
        const ids = current.map(item => item.id);
        const index = ids.indexOf(id);
        if (index < 0 || index + delta < 0 || index + delta >= ids.length) return;
        ids.splice(index + delta, 0, ...ids.splice(index, 1));
        await api('reorder', {method:'POST', data:{ids}});
      }, 'Order saved.');
      form.append(button('Move up', () => move(-1)), button('Move down', () => move(1)), button('Remove gift', () => {
        if (confirm('Remove ' + gift.name + ' from this wishlist?')) {
          run(() => api('gifts/' + encodeURIComponent(id), {method:'DELETE'}), 'Gift removed.');
        }
      }));
    }
    form.append(message);
    form.onsubmit = event => {
      event.preventDefault();
      run(async () => {
        const fields = new FormData(form);
        const data = {...gift, id:newId};
        for (const key of ['name','brand','url','category','variant','description','ratingNote','buyerNote','image']) {
          data[key] = fields.get(key).trim();
        }
        for (const key of ['price','rating']) {
          const value = fields.get(key);
          data[key] = value === '' ? null : Number(value);
        }
        data.bought = fields.has('bought');
        if (giovanna) data.options = [...alternatives.querySelectorAll('.inline-gift-option')].map(row => {
          const value = key => row.querySelector('[name="option'+key+'"]').value.trim();
          return {name:value('Name'),url:value('Url'),price:value('Price') === '' ? null : Number(value('Price')),
            variant:value('Variant'),description:value('Description'),image:value('Image') || row.dataset.originalPhoto || ''};
        });
        if (upload.files[0]) data.image = await photo(upload.files[0]);
        else if (!data.image && gift.image?.startsWith('data:')) data.image = gift.image;
        await api('gifts', {method:'POST',data});
      }, 'Gift saved.');
    };
    const target = card?.querySelector('.body') || toolbar;
    target.classList.add('inline-editing');
    target.append(form);
    activeForm = form;
    form.scrollIntoView({block:'nearest'});
    name.focus({preventScroll:true});
  }
  document.addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link) return;
    const target = new URL(link.href);
    if (target.origin !== origin || target.pathname !== '/') return;
    event.preventDefault();
    if (link === nav && grid.classList.contains('inline-edit-mode')) { leaveEditMode(); return; }
    pendingId = target.searchParams.get('gift') || '';
    if (!token) { showLogin(); return; }
    try {
      if (grid.classList.contains('inline-edit-mode')) { openForm(pendingId); pendingId = ''; }
      else await enterEditMode();
    } catch (error) {
      status.textContent = error.message;
      link.focus();
    }
  });
  if (token) {
    const restore = () => enterEditMode().catch(error => { status.textContent = error.message; });
    if (grid.children.length) restore();
    else {
      const observer = new MutationObserver(() => {
        if (!grid.children.length) return;
        observer.disconnect();
        restore();
      });
      observer.observe(grid, {childList:true});
    }
  }
}
