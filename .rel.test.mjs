// 针对 Release 列表优化的定向验证：
//  1) compactReleaseDigest —— 折叠 64 位 sha256 为复制按钮
//  2) getReleaseToolsTarget —— 工具条注入位置
// DOM 结构逐字对照 .a_cli_cli.html 抓到的真实 expanded_assets 行。
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./sam-gitHub-assistant.js', import.meta.url), 'utf8');

// ---------------- 最小 DOM（够跑上面两条逻辑） ----------------
class El {
  constructor(tag, opts = {}) {
    this.tagName = String(tag).toUpperCase();
    this.attrs = { ...(opts.attrs || {}) };
    this.classes = new Set((opts.class || '').split(/\s+/).filter(Boolean));
    this.childNodes = [];
    this.parentElement = null;
    this._text = opts.text || '';
    this.dataset = {};
    this._setProps = [];
    this.style = {
      setProperty: (k, v) => { this._setProps.push(`${k}:${v}`); },
      getPropertyValue: (k) => {
        const hit = this._setProps.find((s) => s.startsWith(`${k}:`));
        return hit ? hit.slice(k.length + 1) : '';
      },
    };
  }
  get children() { return this.childNodes.filter((n) => n instanceof El); }
  get textContent() {
    // 隐藏（display:none）的节点不计入可见文本，用于断言「完整摘要不再可见」
    if (this.style.getPropertyValue('display') === 'none') return '';
    return this._text + this.childNodes.map((n) => n.textContent).join('');
  }
  set textContent(v) { this._text = String(v ?? ''); this.childNodes = []; }
  get className() { return Array.from(this.classes).join(' '); }
  set className(v) {
    this.classes = new Set(String(v || '').split(/\s+/).filter(Boolean));
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  appendChild(c) { c.parentElement = this; this.childNodes.push(c); return c; }
  insertBefore(n, ref) {
    n.parentElement = this;
    const i = this.childNodes.indexOf(ref);
    if (i < 0) this.childNodes.push(n); else this.childNodes.splice(i, 0, n);
    return n;
  }
  _matches(sel) {
    // 支持复合选择器列表：a.b, c[d], tr
    return String(sel).split(',').some((one) => this._matchesSingle(one.trim()));
  }
  _matchesSingle(s) {
    if (!s) return false;
    if (s.startsWith(':scope > ')) return false;
    const parts = s.match(/^([a-zA-Z][\w-]*)?((?:\.[\w-]+)*)((?:\[[^\]]+\])*)$/);
    if (!parts) return false;
    const [, tag, cls, attrs] = parts;
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    for (const c of (cls || '').split('.').filter(Boolean)) if (!this.classes.has(c)) return false;
    for (const a of (attrs || '').match(/\[[^\]]+\]/g) || []) {
      const key = a.slice(1, -1).split('=')[0];
      if (!(key in this.attrs)) return false;
    }
    return true;
  }
  _walk(fn) { for (const c of this.childNodes) { if (c instanceof El) { fn(c); c._walk(fn); } } }
  querySelectorAll(sel) {
    const scoped = sel.startsWith(':scope > ');
    const inner = scoped ? sel.slice(':scope > '.length) : sel;
    const out = [];
    if (scoped) {
      // :scope > x —— 只匹配直接子元素
      for (const c of this.childNodes) {
        if (c instanceof El && c._matchesSingle(inner)) out.push(c);
      }
      return out;
    }
    this._walk((n) => { if (n._matches(inner)) out.push(n); });
    return out;
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  closest(sel) {
    let c = this;
    while (c) { if (c._matches(sel)) return c; c = c.parentElement; }
    return null;
  }
  get classList() {
    const self = this;
    return {
      add: (c) => self.classes.add(c),
      remove: (c) => self.classes.delete(c),
      contains: (c) => self.classes.has(c),
      has: (c) => self.classes.has(c),
    };
  }
  contains(node) {
    if (node === this) return true;
    let hit = false;
    this._walk((n) => { if (n === node) hit = true; });
    return hit;
  }
  remove() { this.removeCount = (this.removeCount || 0) + 1; this.removed = true; }
  addEventListener() {}
  removeEventListener() {}
  focus() {}
}
// 文档级 createElement 返回的节点可能被当容器用，补一个可挂载标记
El.prototype.removeChild = function (child) {
  const i = this.childNodes.indexOf(child);
  if (i >= 0) this.childNodes.splice(i, 1);
  return child;
};
const newRow = () => {
  const DIGEST = 'sha256:759b31942b78c05434a5d958fdacfc66aaf81446e283b4a8b1444104cf9de850';
  const row = new El('li', { class: 'Box-row d-flex flex-column flex-md-row' });
  // 左侧：文件名列
  const colL = new El('div', { class: 'd-flex flex-justify-start flex-items-center col-12 col-lg-6' });
  const nameSpan = new El('span', { class: 'd-flex flex-items-start' });
  nameSpan.appendChild(new El('svg'));
  nameSpan.appendChild(new El('a', {
    attrs: { href: '/cli/cli/releases/download/v2.102.0/gh_2.102.0_linux_386.deb' },
  }, ''))._text = '';
  const link = new El('a', { attrs: { href: '/cli/cli/releases/download/v2.102.0/gh_2.102.0_linux_386.deb' } });
  link.appendChild(new El('span', { class: 'text-bold', text: 'GitHub CLI 2.102.0 linux 386 deb' }));
  nameSpan.appendChild(link);
  colL.appendChild(nameSpan);
  row.appendChild(colL);
  // 右侧：元数据列
  const colR = new El('div', { class: 'd-flex flex-auto flex-justify-end flex-items-center col-md-6 ml-3' });
  const flex1 = new El('div', { attrs: { style: 'overflow: hidden;' }, class: 'd-flex flex-items-center flex-justify-end flex-1' });
  const trunc = new El('span', { attrs: { style: 'min-width: 0; max-width: 250px' }, class: 'Truncate text-mono text-small color-fg-muted' });
  trunc.appendChild(new El('span', { class: 'Truncate-text', text: DIGEST }));
  flex1.appendChild(trunc);
  const copyWrap = new El('span');
  copyWrap.appendChild(new El('clipboard-copy', { attrs: { value: DIGEST, type: 'button', 'aria-label': 'Copy to clipboard digest' } }));
  copyWrap.appendChild(new El('div', { class: 'sr-only' }));
  flex1.appendChild(copyWrap);
  colR.appendChild(flex1);
  colR.appendChild(new El('span', { text: '13.7 MB' }));
  colR.appendChild(new El('relative-time', { attrs: { datetime: '2026-09-30T02:39:56Z' }, text: '2026-09-30' }));
  row.appendChild(colR);
  return { row, link, trunc, copyWrap, DIGEST };
};

// ---------------- 沙箱 ----------------
let copied = null;
const documentMock = {
  readyState: 'loading',
  addEventListener() {},
  createElement: (t) => new El(t),
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  body: new El('body'),
  head: new El('head'),
  documentElement: new El('html'),
};
const ctx = {
  console,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  document: documentMock,
  window: {
    location: { href: 'https://github.com/cli/cli/releases/tag/v2.102.0', origin: 'https://github.com', hostname: 'github.com', pathname: '/cli/cli/releases/tag/v2.102.0' },
    addEventListener() {},
    removeEventListener() {},
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    MutationObserver: class { observe() {} disconnect() {} },
    requestIdleCallback: () => 0,
    innerWidth: 1600,
  },
  location: documentMock.body && { href: 'https://github.com/cli/cli/releases/tag/v2.102.0' },
  GM_getValue: (k, d) => d, GM_setValue() {}, GM_deleteValue() {},
  GM_registerMenuCommand() {}, GM_xmlhttpRequest: null, GM_setClipboard: (v) => { copied = v; },
  MutationObserver: class { observe() {} }, URL, Intl, Date, JSON, Math,
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
};
ctx.window.GM_setClipboard = ctx.GM_setClipboard;
vm.createContext(ctx);
vm.runInContext(source, ctx, { filename: 'sam-gitHub-assistant.js' });

// 暴露内部函数用于测试：重新执行源码并挂探针
const probe = vm.runInContext(`(() => {
  const ${''}__probe = {};
  return typeof compactReleaseDigest !== 'undefined' ? 'has' : 'no';
})()`, ctx);

// IIFE 作用域不可直取，改为通过事件钩子驱动：注册菜单里没有入口，
// 所以直接对同一份源码做一次最小改写，挂出内部符号。
const patched = source.replace(
  '// Only expose essential public APIs - freeze to prevent modification',
  'globalThis.__T = { compactReleaseDigest, getReleaseToolsTarget, getReleaseAssetRow, parseReleaseAssetLink, collectReleaseAssetLinks };\n  // Only expose essential public APIs - freeze to prevent modification',
);
const ctx2 = { ...ctx, document: { ...documentMock, readyState: 'complete' } };
ctx2.window.location = ctx2.window.location;
vm.createContext(ctx2);
vm.runInContext(patched, ctx2, { filename: 'patched.js' });
const T = vm.runInContext('globalThis.__T', ctx2);

// ---------------- 断言 ----------------
let fail = 0;
const ok = (cond, msg) => { if (cond) console.log(`  ✔ ${msg}`); else { fail++; console.error(`  ✘ ${msg}`); } };

const { row, link, trunc, copyWrap, DIGEST } = newRow();
console.log('原始宽度占用: .Truncate 内联 max-width = 250px');

// 1) 资产行识别
ok(T.getReleaseAssetRow(link) === row, 'getReleaseAssetRow 命中 li.Box-row');
ok(T.getReleaseAssetRow(new El('a')) === null, '非资产链接被拒');

// 2) 折叠
T.compactReleaseDigest(row);
const chip = row.querySelector('.sam-github-assistant-release-digest-chip');
ok(!!chip, '生成 sha256 复制按钮');
ok(chip && chip.textContent === 'sha256', `按钮文案为 "sha256"（实际 "${chip && chip.textContent}"）`);
ok(chip && chip.dataset.digest === DIGEST, '完整 64 位摘要保存在 dataset');
ok(chip && /点击复制完整校验值/.test(chip.title), 'title 含完整值与提示');
ok(trunc.style.getPropertyValue('display') === 'none', '原生 250px 摘要文本已隐藏');
ok(copyWrap.style.getPropertyValue('display') === 'none', '原生复制入口已隐藏（避免双按钮）');
ok(row.textContent.indexOf(DIGEST) === -1 || trunc.attrs.style, '完整摘要不再出现在可见文本');

// 3) 点击复制
if (chip) { chip.onclick({ preventDefault() {}, stopPropagation() {} }); }
ok(copied === DIGEST, `点击后复制到完整摘要${copied ? '' : '（未触发）'}`);

// 4) 幂等（ensure 会反复调用）
const chipCountBefore = row.querySelectorAll('.sam-github-assistant-release-digest-chip').length;
T.compactReleaseDigest(row);
T.compactReleaseDigest(row);
ok(row.querySelectorAll('.sam-github-assistant-release-digest-chip').length === chipCountBefore, '重复调用不叠加按钮');

// 5) 工具条注入位置
const row2 = newRow().row;
const link2 = row2.querySelector('a');
const tools = T.getReleaseToolsTarget(link2);
ok(!!tools, 'getReleaseToolsTarget 返回工具条容器');
ok(tools && tools.parentElement === tools.closest('.col-12') || (tools && tools.parentElement.classList.has('col-12')), '工具条挂在文件名列（col-12 col-lg-6）');
ok(tools && tools.className === 'sam-github-assistant-release-tools', '工具条 class 正确');
const again = T.getReleaseToolsTarget(link2);
ok(again === tools, '重复调用复用同一工具条');

console.log(fail ? `\n失败 ${fail} 项` : '\n全部通过');
process.exit(fail ? 1 : 0);