# Sam GitHub Assistant

个人 GitHub 油猴脚本：中文化 + 高速下载 + 文件列表美化 + 文件/文件夹体量与数量 + Release 增强。

仓库地址：https://github.com/Sam404s/sam-gitHub-assistant

## 功能

- **GitHub 中文化**：页面文案本地化，可在菜单中开关
- **镜像加速**：Clone / Raw / Release / ZIP 直接显示多个高速节点，点击即用；节点来自 [github.akams.cn](https://github.akams.cn/)，测速与手动选择只影响排序
- **仓库信息**：仓库体积徽章、文件与文件夹大小、递归文件数量、活跃 Forks 入口
- **文件列表美化**：文件夹强调、按扩展名稳定配色、图片缩略图与紧凑元数据徽章
- **Release 增强**：下载次数、上传者信息、高速下载链接
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

安装后右下角会出现助手面板（可折叠）。

| 操作 | 说明 |
| --- | --- |
| 面板折叠 / 展开 | 点击标题栏开关，或使用脚本菜单 |
| 调整镜像排序 | 下载入口可直接选择多个节点；面板中的手动选择与测速结果只决定优先顺序 |
| 中文化开关 | 脚本菜单：`Sam GitHub Assistant: enable/disable Chinese localization` |
| 复制当前仓库 | 脚本菜单：`Sam GitHub Assistant: 复制当前仓库` |

在仓库页、Release 页、代码页等位置会自动注入：

- 多节点高速 Clone / ZIP 直达入口，以及独立 SSH-443 克隆命令
- Raw / Release 资源的多节点直达下载与 GitHub 原链接
- 文件/文件夹大小、递归文件数量与 Release 资源大小
- 文件类型配色、文件夹强调与图片缩略图

## 权限说明

| 权限 | 用途 |
| --- | --- |
| `GM_getValue` / `GM_setValue` | 保存折叠状态、镜像选择、测速缓存、中文化开关等 |
| `GM_registerMenuCommand` | 注册 Tampermonkey 菜单项 |
| `GM_setClipboard` | 复制仓库路径、Clone 命令等 |
| `GM_xmlhttpRequest` | 请求 GitHub API、镜像列表与测速 |

`@connect` 包含 `api.github.com`、`github.akams.cn` 以及通用 `*`（用于镜像节点测速与资源请求）。

## 开发与更新

本地文件：

```text
sam-gitHub-assistant.js
```

发布新版本时：

1. 修改脚本逻辑
2. 提升 `@version`（例如 `1.0.1` → `1.0.2`）
3. 提交并推送到 `main`
4. 用户端 Tampermonkey 会通过 `@updateURL` 自动拉取更新

当前版本：**1.1.0**

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

**镜像测速失败？**  
可能是网络或节点临时不可用，可手动切换其他节点，或稍后重试。

## 许可证

[MIT](LICENSE)

## 致谢

- 镜像节点列表：[github.akams.cn](https://github.akams.cn/)
- 活跃 Forks 参考：[active-forks](https://techgaun.github.io/active-forks/)
- GitHub 中文文案字典来源参考社区开源本地化项目
