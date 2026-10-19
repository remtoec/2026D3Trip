// Hash routes: #/today · #/days/16 · #/explore/taiki?cat=food · #/stars · #/stays · #/item/<id>
export const VIEWS = ['today', 'days', 'explore', 'stars', 'stays'];

export function parse(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const decode = v => { try { return decodeURIComponent(v); } catch { return v; } };
  const [view = '', param = ''] = path.split('/').map(decode);
  return { view: view || 'today', param, query: new URLSearchParams(qs) };
}

export function href(view, param = '', query = null) {
  const q = query && [...query].length ? '?' + new URLSearchParams(query).toString() : '';
  return `#/${view}${param ? '/' + encodeURIComponent(param) : ''}${q}`;
}

export function go(view, param = '', query = null, { replace = false } = {}) {
  const next = href(view, param, query);
  if (location.hash === next) { window.dispatchEvent(new HashChangeEvent('hashchange')); return; }
  if (replace) history.replaceState(null, '', location.pathname + location.search + next);
  else location.hash = next;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}
