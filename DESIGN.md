# Sam GitHub Assistant Design Contract

## 0. Research Log

- Existing UI: audited the script's current Primer-compatible chips, mirror panel, release controls, Code overlay clones, light/dark tokens, and responsive rules.
- Concrete references: extracted the native inline geometry from `.tmp/Github 增强 - 高速下载.js`, scoped file-type treatment from `.tmp/GitHub 文件列表美化器.js`, and metadata semantics from `.tmp/GitHub 显示文件和文件夹大小，显示文件数量.js`.
- Product constraint: this is a GitHub userscript, so GitHub Primer structure and CSS variables are the visual source of truth; enhancements must remain compact and survive Turbo/React rerenders.
- Second reference batch (`.tmp/GitHub Releases · 中文时间.txt`, `.tmp/GitHub 代码搜索 Star & 更新时间排序助手.txt`, `.tmp/GitHub Clone+Release Proxy Link.txt`, `.tmp/GitHub汉化脚本.txt`): audited the time-element takeover, the `codeResultWrapper` badge/sort model, the cross-page scan report, and the missed-terms feedback loop.
- Adoption decision from that batch: localization time takeover and code-search ranking are capabilities the script did not have at all, so they are adopted; the mirror-cycle menu from the proxy script duplicates the existing assistant panel mirror selector and is deliberately not adopted; the clone/release proxy actions are already covered by the mirror panel and Release tools.
- Shared shortfall found across all four references (and this script): all call `api.github.com` unauthenticated. Token support was promoted to shared infrastructure before the search features shipped, rather than bolted on per feature.

## 1. Direction

A GitHub-native utility layer rather than a separate visual skin. Controls inherit GitHub geometry and typography; restrained semantic color makes accelerated, original, and informational actions distinguishable without turning repository rows into cards.

## 2. Tokens

- Prefer Primer variables: `--fgColor-*`, `--bgColor-*`, `--borderColor-*`, with existing script fallbacks.
- Fast actions: GitHub green ramp; original links: amber ramp; size/count metadata: blue ramp.
- File types: stable extension-derived accent colors. Color is supplementary; filename, extension, size, and count remain textual.
- Spacing: 4px base rhythm. Repository rows keep GitHub's native height; controls target 24-32px.
- Radius: inherit native controls where possible, otherwise 6px for compact metadata and 8px for inputs.
- Two-token-system rule: anything injected **inline into GitHub's own DOM** (time spans, search badges, the sort bar) uses Primer variables only, so it follows GitHub's theme with no script-side color decisions. Only script-owned **overlays** (the assistant panel and the scan report panel) use the `--sam-hs-*` namespace. Never mix the two inside one component.
- Search badges reuse the existing blue ramp for repository/folder context, and the amber ramp when the badge is showing a commit time; the two states must remain distinguishable without relying on the glyph alone.
- Localized time must reproduce the typography of the element it replaces, **not** that of the surrounding container. Metrics are sampled with `getComputedStyle` from the native time element itself and applied inline; a CSS `inherit` fallback covers the case where sampling is unavailable. This is a correctness rule, not a preference: GitHub writes the muted color and the smaller size onto the `<relative-time>` element itself, so `inherit` yields the parent's heavier values.

## 3. Component Anatomy

- Raw: up to three direct mirror actions adjacent to the original Raw button, sharing the source button classes and forming one connected group.
- Release asset: up to four direct mirror controls plus one amber GitHub-original control immediately after the asset information, never a detached card. The asset row is identified solely by `link.closest('li.Box-row, [role="row"], tr')` — the toolset mounts on the link's wrapper container. **Do not** require `<details>`, `Box-footer`, or `nextElementSibling`; the current GitHub asset list is a lazily loaded `<include-fragment>` under `/releases/expanded_assets/<tag>` and has none of those nodes, so requiring them silently disables the whole feature.
- Release digest: the 64-char checksum is never shown inline. `span.Truncate[max-width:250px]` and the native `clipboard-copy` wrapper are hidden, and a `sha256` chip is injected instead; the full value lives in `chip.dataset.digest` plus `title`, and clicking it calls the existing `copyText()`. Hiding the native copy control is required — otherwise a row shows two copy buttons.
- Code overlay: up to three mirror-specific cloned native ZIP items and mirror-specific clone-command rows; SSH-over-443 remains one separate row.
- Repository list: original row/link/icon stays authoritative; folder weight, file-type color, optional loaded image thumbnail, and a trailing size/count badge are additive and idempotent.
- Localized time: the native `<relative-time>` / `<local-time>` / `time[datetime]` element is hidden with `display:none !important` and a sibling script-owned `<span class="-localized-time">` carries the Chinese text. The host element is never restructured or replaced, so React reconciliation and any framework re-render stay intact; the `title` carries the absolute timestamp with weekday and offset. Before hiding, the host's computed color / font-size / weight / line-height / letter-spacing / numeric glyph settings are sampled and applied to the span as inline style, so the substitution is typographically invisible. The sample is cached per element behind an epoch counter and re-taken on theme switch and on the 30s refresh, so a dark/light toggle never leaves a frozen literal color behind.
- Search result badge: appended inside the result header host, `pointer-events: none`, no layout shift (reserved padding on the host), and shows `…` before data resolves then a stable text form. Two visual modes — repository stats vs. commit time — driven by the active sort dimension.
- Search sort bar: a script-owned bar inserted above the results list; it only **moves existing nodes** (never clones or rewraps them) and keeps a WeakMap of original order for one-click restore.
- Scan report panel: script-owned floating overlay (`#sam-code-search-scan-panel`) with static structural `innerHTML`; every data row is assembled with `escapeHtmlContent`. Rows are links straight to the file line range on GitHub; the panel never covers the sort bar or the first result row.
- The scan report panel is the **only** script-owned overlay. The assistant panel and the floating mirror selector were removed in 1.2.0; mirror switching is now owned entirely by the inline buttons next to GitHub's own controls, with all seven nodes built into the script. Every setting moved to the Tampermonkey script menu.

## 4. Interaction and Motion

- Preserve GitHub focus-visible behavior and keyboard navigation.
- Mirror buttons are destinations, not mode selectors: clicking one immediately opens that mirror, while clicking any clone row immediately copies its complete command.
- The selected and fastest mirrors affect ordering only. Users never need to visit the assistant panel before downloading.
- The first ranked mirror receives a stronger green treatment; every action still exposes its mirror label/host textually, and the GitHub-original action remains amber.
- Hover effects are color/border changes only; no layout-shifting transforms in repository lists or native button groups.
- Respect `prefers-reduced-motion`.
- Search/QueryBuilder is a protected React-owned surface: localization and enhancement writes pause from pointer/focus/shortcut intent until the UI is fully inactive.
- **Never localize a controlled form attribute.** `placeholder` / `value` are excluded from the localization MutationObserver's `attributeFilter`, each element's attributes are localized at most once (WeakSet guard), and a write is skipped when the target value already equals the current one. `setAttribute` with an identical value still dispatches a MutationRecord, so without all three guards the script and the framework ping-pong the same attribute: we write Chinese, React writes the English original, the observer fires again, and the main thread saturates — the search modal's backdrop stays visible with the page unresponsive.
- `isGitHubSearchUiActive()` is evaluated once per localization batch, not once per node; at 120 nodes per batch the per-node DOM query dominated the flush budget.
- Localized time has four modes — `abs+rel` (default), `abs`, `rel`, `off` — switchable from the menu; `off` must fully `teardown` and restore native elements, not merely stop repainting. A 30s interval re-renders and re-scans, picking up both relative-time drift and any node a throttled pass missed.
- Localized time takeover must never be starved by the page's own churn. The first pass runs synchronously at install; subsequent passes are **throttled, not debounced** — an already-pending scan is never reset — and back off toward 2s under sustained mutation. The chain stops when a pass finds no pending changes, so a quiet page carries no polling tail. A debounce here reads to the user as "the Chinese times take forever to show up".
- Search badges resolve asynchronously and may show `…`; sorting places not-yet-resolved items last rather than guessing a key, so order never flips unpredictably. Re-applying an identical sort is a no-op (version counter + 700ms debounce) to break the badge/observer feedback loop.
- Cross-page scan is a deliberate, user-triggered cost: it fetches result pages and then API data, requires confirmation when scanning more than two pages without a Token, and supports cancellation via its own teardown path.
- The API Token is masked everywhere it is shown, and is injected only to `api.github.com`; it never reaches a mirror host.

## 5. Responsive and Themes

- Light and dark modes use Primer variables plus tested fallbacks.
- On narrow screens, release tools wrap below the asset name rather than sitting in a horizontally scrollable row; the page itself must never overflow. The toolset is `max-width:100%` + `flex-wrap:wrap` and each control caps at 108px — a fixed `max-width:300px` with `nowrap` and 66px children crushes four buttons into ~376px of content and `flex-shrink:1` flattens every one of them.
- Metadata can wrap or truncate gracefully; it must not obscure the filename or commit information.

## 6. Accessibility Constraints

- Every injected control has a descriptive title/ARIA label.
- Color never carries the only meaning.
- Image thumbnails appear only after successful load and retain the original icon as fallback.
- Focus indicators remain visible at 2px or use GitHub's inherited focus treatment.

## 7. Accepted Debt

- GitHub does not expose slash-containing branch names unambiguously in every file-link URL. The script keeps the existing URL-based ref parser and uses cached/API metadata when a stable ref is available.
- A truncated Git Tree response is displayed with an explicit “可能不完整” title instead of recursively issuing one Contents API request per directory.
- Search enhancement keys off `div[class*="codeResultWrapper"]` and its header host, and the sort bar off the results-list container. These are undocumented GitHub internal hooks and will silently degrade to “no badge / no sort bar” if GitHub renames them; the enhancement is written to fail closed (detect nothing, inject nothing) rather than to inject into the wrong node.
- Time takeover treats an unknown element as leave-alone: if a future GitHub build moves time rendering, native times simply remain untranslated. There is no fallback that would rewrite unrelated text.
- Anonymous API budget is 60 requests/hour. Badges are TTL-cached per repository/file, and backoff is global to the host, so a heavy scan on an anonymous session degrades to progressive slowdown rather than a hard error — the Token menu entry is the documented remedy.
- The script cannot verify GitHub's rendered DOM from a headless run; `codeResultWrapper` geometry and the visual weight of localized times are validated statically and are pending real-browser confirmation.
- The search-overlay lockout fix is likewise unverified in a real browser. The root cause is established from code (an attribute feedback loop, not a z-index or overlay issue), and no injected stylesheet declares a full-viewport backdrop, but reproduction and confirmation still require a browser session.
