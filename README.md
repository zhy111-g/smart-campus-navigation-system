# 校园智能路径导航辅助系统 V1.0（纯前端 / GitHub Pages 版）

> 本目录为**独立新项目**，不修改、不依赖原 `campus-navigator` 的 Java 后端。  
> 界面与算法效果与现有系统对齐：双校区地图、Dijkstra / A*、晋阳街天桥、导航历史。

## 和原版的区别

| | 原版 `campus-navigator` | 本版 `campus-navigator-pages` |
|--|--|--|
| 后端 | Spring Boot + H2 | 无（浏览器内算路） |
| 数据 | data.sql | `public/data/campus-data.json` |
| 历史 | 数据库 | localStorage |
| 部署 | 本机双端口 | 可 GitHub Pages |

原版请继续用原来的启动方式；本版互不影响。

## 本地运行

1. 安装依赖（可用原项目的 Node）：

```bat
cd campus-navigator-pages
npm install --registry=https://registry.npmmirror.com
```

2. 启动：

```bat
npm run serve
```

浏览器打开终端提示的地址（默认 **http://localhost:8088**）。

也可双击 `启动.bat`（需已配置好 `dev-tools\env.bat`）。

## 发布到 GitHub Pages

1. 把本目录推到 GitHub 仓库（例如仓库名 `campus-navigator-pages`）。
2. 构建前设置仓库路径（仓库名改成你的）：

```bat
set PUBLIC_PATH=/campus-navigator-pages/
npm run build
```

若仓库是 `https://用户名.github.io` 这种用户主页仓库，则：

```bat
set PUBLIC_PATH=/
npm run build
```

3. 将生成的 `dist/` 内容推到仓库的 `gh-pages` 分支，或在仓库 Settings → Pages 里选择部署 `dist`。
4. 访问：`https://用户名.github.io/campus-navigator-pages/`

路由使用 **hash 模式**（`#/map`），适合 Pages，无需额外服务器配置。

## 数据同步

校区数据来自原项目 `campus-navigator/backend/.../data.sql`。  
修改原版地图后，在本目录执行：

```bat
npm run data
```

会重新生成 `public/data/campus-data.json`。

## 说明

- 纯前端版适合演示与 GitHub 托管；软著若交「前后端分离」材料，请以原版 `campus-navigator` 为准。
- 导航历史保存在浏览器本地，换设备不会同步。
