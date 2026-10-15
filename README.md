# Sam GitHub Assistant

个人 GitHub 油猴脚本：中文化 + 时间中文化 + 高速下载 + 文件列表美化 + 文件/文件夹体量与数量 + Release 增强 + 代码搜索增强。

仓库地址：https://github.com/Sam404s/sam-gitHub-assistant

## 功能

- **GitHub 中文化**：页面文案本地化，可在菜单中开关
- **时间中文化**：把 GitHub 的相对时间改写成中文绝对时间，支持「绝对+相对 / 仅绝对 / 仅相对 / 关闭」四档与自定义 IANA 时区
- **代码搜索增强**：`/search?type=code` 结果行显示仓库 Star、文件最后更新与仓库最后更新，可按三个维度排序、恢复默认，并可跨页扫描汇总
- **镜像加速**：Clone / Raw / Release / ZIP 直接显示多个高速节点，点击即用；7 个节点内置于脚本，启动即自动测速并按可用性排序
- **仓库信息**：仓库体积徽章、文件与文件夹大小、递归文件数量、活跃 Forks 入口
- **文件列表美化**：文件夹强调、按扩展名稳定配色、图片缩略图与紧凑元数据徽章
- **Release 增强**：下载次数、上传者信息、高速下载链接；sha256 摘要折叠为一个复制按钮，完整哈希收在按钮的悬浮提示里
- **快捷操作**：复制仓库路径、一键常用仓库链接
- **多语言 README**：同页切换多语言 README 内容

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/)（或兼容的用户脚本管理器）
2. 点击下方安装链接，或打开脚本源码后安装：

   **[安装脚本](https://raw.githubusercontent.com/Sam404s/sam-gitHub-assistant/main/sam-gitHub-assistant.js)**

3. 打开任意 `https://github.com/*` 页面即可生效

脚本已配置自动更新地址：

```text
https://raw.githubusercontent.com/Sam404s/sam-gitHub-assistant/main/sam-gitHub-assistant.js
```

Tampermonkey 会按 `@updateURL` / `@downloadURL` 检查更新。

## 使用说明

脚本无需面板，所有开关都在 Tampermonkey 的脚本菜单里；下载入口的加速按钮直接贴在 GitHub 原生按钮旁，点击即用。

| 操作 | 说明 |
| --- | --- |
| 中文化开关 | 脚本菜单：`Sam GitHub Assistant: enable/disable Chinese localization` |
| 复制当前仓库 | 脚本菜单：`Sam GitHub Assistant: 复制当前仓库` |
| 切换时间显示 | 脚本菜单：`时间中文化 · 绝对+相对 / 仅绝对 / 仅相对 / 关闭`，并可设置 IANA 时区。中文时间会采样原生时间元素的字号与字色，排版与 GitHub 原样一致 |
| 代码搜索增强 | 脚本菜单：`enable/disable code search star/date enhancement`；排序按钮与扫描按钮在搜索结果列表上方 |
| 设置 API Token | 脚本菜单：`设置 GitHub API Token`，配置后 API 配额从 60 次/小时提升到 5000 次/小时 |
| 排查汉化漏词 | 脚本菜单：`未命中词条收集` + `导出未命中词条到控制台` |

在仓库页、Release 页、代码页等位置会自动注入：

- 多节点高速 Clone / ZIP 直达入口，以及独立 SSH-443 克隆命令
- Raw / Release 资源的多节点直达下载与 GitHub 原链接
- 文件/文件夹大小、递归文件数量与 Release 资源大小
- 文件类型配色、文件夹强调与图片缩略图

在代码搜索页（`/search?type=code`）额外注入：

- 每条结果的 ⭐ Star 数、📄 文件最后更新、🕒 仓库最后更新
- 按 Star / 文件更新 / 仓库更新排序，再次点击切换升降序，「↺ 恢复默认」还原
- 「📊 扫描前 N 页汇总」：抓取前 N 页搜索结果并去重汇总，在浮层面板内排序，点击直达对应文件行（默认 3 页，可配 1–20 页）

## 权限说明

| 权限 | 用途 |
| --- | --- |
| `GM_getValue` / `GM_setValue` | 保存折叠状态、镜像测速缓存、中文化开关、API Token、时间模式、代码搜索缓存等 |
| `GM_registerMenuCommand` | 注册 Tampermonkey 菜单项 |
| `GM_setClipboard` | 复制仓库路径、Clone 命令、Release 校验和等 |
| `GM_xmlhttpRequest` | 请求 GitHub API、镜像节点测速，以及跨页扫描时抓取搜索结果 HTML |

`@connect` 为通用 `*`（用于 `api.github.com` 请求、7 个内置镜像节点的测速与资源请求，以及搜索页抓取）。

### 关于 API Token（可选）

代码搜索增强与跨页扫描需要调用 `api.github.com`，匿名请求只有 60 次/小时，很容易触发限流。通过菜单配置一个仅含 `public_repo` 权限的 Personal Access Token 后：

- 配额提升到 5000 次/小时
- 触发限流时的退避时间按比例缩短

Token 只保存在 Tampermonkey 本地存储，且**只会附加到 `api.github.com` 的请求上**，不会发送给镜像站点等第三方域名。菜单可随时查看（掩码显示）或清除。

## 开发与更新

本地文件：

```text
sam-gitHub-assistant.js
```

发布新版本时：

1. 修改脚本逻辑
2. 提升 `@version`（例如 `1.1.0` → `1.2.0`）
3. 提交并推送到 `main`
4. 用户端 Tampermonkey 会通过 `@updateURL` 自动拉取更新

当前版本：**1.2.0**

### 1.2.0

- **新增功能**：
  - **时间中文化**：接管 `relative-time` / `local-time` / `time[datetime]`，输出「2026年9月30日 10:40（6天前）」式中文时间；提供 abs+rel / abs / rel / off 四档模式与自定义 IANA 时区，相对时间每 30 秒重算，关闭中文化时自动还原 GitHub 原样
  - **代码搜索增强**：`/search?type=code` 结果行注入 Star 数与文件/仓库最后更新时间，数据到达即渲染；支持按 Star / 文件更新 / 仓库更新排序、二次点击切换升降序、恢复默认排序
  - **代码搜索跨页扫描汇总**：抓取前 1–20 页搜索结果并按「仓库 + 文件 + 行号」去重，面板内展示每页命中数、唯一文件/仓库数与所属页码，支持三种排序，点击行直达对应文件行区间
  - **GitHub API Token**：可选配置 PAT，配额 60 → 5000 次/小时，限流退避同步缩短；Token 仅注入 `api.github.com`
  - **汉化未命中词条收集**：可在菜单开关收集未能翻译的原文，并一键导出到控制台，便于补词

- **修复**：
  - **修复仓库页上下文解析失效**：v1.1.0 的输入校验依赖 `instanceof URL`，而浏览器里 `window.location` 是 `Location` 而非 `URL` 实例，导致 `getRepoContext` 恒返回 `null`——助手面板、文件列表美化、高速下载、Release 增强等依赖上下文的增强在真实浏览器中整体不生效。现改为统一按 `href` 取值，同时保留非法输入的告警与拒绝
  - 修复 `/search` 等非仓库页面未注入样式导致新增强元件无样式的问题（`injectStyle` 提前到面板渲染判断之前）
  - **修复时间中文化比原生更「重」**：旁挂 span 原本只用 CSS `color: inherit; font: inherit`，而 GitHub 常把弱化字色与字号直接写在 `relative-time` 元素**自身**（如 `color-fg-muted`、`fz-12`），子元素 `inherit` 拿到的是父级的值，于是中文时间比周围原生时间更粗更重。现改为隐藏宿主前先用 `getComputedStyle` 采样其字色 / 字号 / 行高 / 字距 / 数字字形等并贴为内联样式；主题切换与每 30 秒刷新时重新采样，避免写死明暗主题下的颜色
  - **修复时间中文化出现得晚**：首轮扫描原本延迟 400ms 且用 debounce 调度，而 GitHub 是 React 应用、DOM 变更持续不断，定时器被反复重置，首轮中文时间会被无限推迟。现改为安装时同步扫描一次，后续按 DOM 变更节流（120ms 起步，持续变更时逐步退避到 2s），且只有在上轮扫描后确有变更时才继续排下一轮，安静页面不残留轮询

- **优化**：
  - **移除镜像加速悬浮窗与助手面板**：7 个加速节点（`github.dpik.top`、`ghproxy.net`、`cdn.gh-proxy.com`、`down.mxw.xx.kg`、`github.mxw.qzz.io`、`gh.idayer.com`、`github.chenc.dev`）内置于脚本，启动即自动测速排序，不再依赖外部节点列表站点，也不再向 GitHub 页面注入悬浮面板
  - **修复 Release 列表未注入加速按钮**：原先要求资产行存在 `<details>` / `Box-footer` 才动手，而 GitHub 现行 Release 资产列表没有这些节点，导致加速按钮整体缺失。现只要求资产名链接位于 `li.Box-row` 内，并在其包裹容器上挂载工具条
  - **修复 Release 列表 sha256 占满整行**：原本直接展示 64 位完整哈希，把加速按钮挤成两行且按钮被压扁。现折叠为 `sha256` 短标签按钮，完整哈希收在 `dataset` 与悬浮提示中，点击即复制；原生摘要与原生复制入口一并隐藏，避免一行出现两个复制按钮
  - **修复 Release 工具条挤压**：工具条由 `max-width:300px` + 禁止换行改为 `max-width:100%` + 允许换行，按钮最大宽度 66px → 108px，窄屏下自然折行而不压扁
  - **修复搜索栏点击后出现遮罩锁死交互**：脚本会把顶部搜索框的 `placeholder` 写成中文，而 GitHub 的 React / QueryBuilder 在聚焦与输入时会回写原值；观察器若跟随重写就会形成「我们写 → 框架回写 → 再触发我们」的属性死循环，主线程被打满，表现为遮罩可见但整页无法操作。现从观察属性清单中移除 `placeholder` / `value`、同一元素属性只本地化一次、目标值与当前值相同时不再写入，并把搜索交互态判定从每节点一次提升为每批一次
  - 代码搜索数据统一复用既有的 `requestJson` + API 退避通道，仓库 Star 与文件提交日期各带 6 小时缓存，失败请求 60 秒内不重试
  - 页内注入元件（搜索徽章、排序条）改用 Primer 变量，自动适配 GitHub 明暗主题
  - 搜索结果重排与增强扫描加防抖/节流，避免与自身的 MutationObserver 形成回环
  - 菜单按功能分组（中文化与时间 / 代码搜索 / Token），移除面板开关

### 1.1.0

- **功能改进**：
  - 高速下载控件恢复为 GitHub 原生内嵌布局：高速下载使用绿色、GitHub 原链接使用琥珀色、大小/数量使用蓝色
  - 融合文件列表美化：文件夹强调、扩展名稳定配色、图片文件按需缩略图，且仅作用于仓库目录列表
  - 单次 Git Tree API 数据同时显示普通文件大小、文件夹递归大小和递归文件数量；截断响应会明确提示结果可能不完整
  - 修复搜索栏挂载竞态：从指针、焦点和 `/`、`Ctrl/Cmd+K` 快捷键触发起暂停本地化与增强扫描，搜索关闭后自动恢复

- **安全增强**：
  - 添加 HTML 消毒处理，防止多语言 README 切换时的 XSS 攻击
  - 减少全局 API 暴露面，仅保留必要的公共函数
  - 冻结全局 API 对象，防止外部修改
  - 为 `getRepoContext` 函数添加输入验证

- **代码质量改进**：
  - 提取魔法数字为命名常量（延迟、批处理大小、限制值等）
  - 改进错误处理，添加上下文日志而非空 catch 块
  - 改进 URL 解析函数的错误处理
  - 修复语法错误

### 1.0.2

- 进一步修复 GitHub 首页全局搜索栏偶发消失的问题
- 完整忽略 `#search-suggestions-dialog`、`qbsearch-input.*`、`query-builder-container` 等搜索触发器与弹窗外壳
- 搜索弹窗打开期间暂停本地化队列，并清理已排队的 DOM 翻译任务

### 1.0.1

- 修复首页点击搜索后搜索框立即消失的问题
- 本地化忽略 GitHub QueryBuilder / 顶部搜索区，避免改写 React 控制的搜索 DOM

## 常见问题

**搜索框点开后消失？**  
`1.1.0` 已从搜索交互开始到弹层关闭全程保护 GitHub QueryBuilder。请确认脚本已更新到最新版并强制刷新页面；若仍异常，可先在菜单中关闭中文化对比排查。

**中文化影响某些交互？**  
可随时通过菜单关闭中文化；其他加速与信息增强功能不受影响。

**时间显示不对 / 想换回英文？**  
脚本菜单里可切换到「关闭」档还原 GitHub 原样，也可设置 IANA 时区（例如 `Asia/Shanghai`）。

**中文时间看着比原生更粗、或出现得比预期晚？**  
这属于已修复项。中文时间原本会继承到父级字号与字色而显得更重，且首轮扫描会被页面的持续重渲染不断推迟。现改为隐藏原生时间前采样其自身排版与字色、并同步执行首轮扫描。若个别位置仍显得偏重，把菜单切到「仅相对」档（`6天前`）长度最短、视觉最轻。

**代码搜索的 Star 或时间一直显示「…」？**  
说明 GitHub API 请求失败或命中限流。建议通过菜单配置 API Token；已请求过的缓存 6 小时内不会重复请求，失败项 60 秒内不重试。

**跨页扫描很慢或提示限流？**  
扫描页数越多，需要的 API 调用越多（每个唯一文件一次）。未配置 Token 时脚本会在扫描前提示确认，建议先配置 Token 再扫 3 页以上。

**镜像测速失败？**  
可能是网络或节点临时不可用。7 个节点内置在脚本里，不需要外部列表；测速失败时会沿用上一次的排序结果，可按顺序换其他节点重试。

**Release 页看不到完整的 sha256？**  
这是有意为之。完整 64 位哈希仍在，只是收进了 `sha256` 按钮的悬浮提示与点击复制里，避免占掉整行把加速按钮挤扁。

**顶部搜索栏点开后整页卡住 / 出现无法关闭的遮罩？**  
这属于已修复项。原因是脚本对搜索框 `placeholder` 的中文化与 GitHub React 的回写形成了属性死循环，打满主线程。现已在观察属性清单中排除 `placeholder` / `value`，并限制同一元素的属性只本地化一次。若仍复现，请反馈浏览器版本与页面 URL。

## 许可证

[MIT](LICENSE)

## 致谢

- 镜像加速节点：`github.dpik.top`、`ghproxy.net`、`cdn.gh-proxy.com`、`down.mxw.xx.kg`、`github.mxw.qzz.io`、`gh.idayer.com`、`github.chenc.dev`
- 活跃 Forks 参考：[active-forks](https://techgaun.github.io/active-forks/)
- GitHub 中文文案字典来源参考社区开源本地化项目
