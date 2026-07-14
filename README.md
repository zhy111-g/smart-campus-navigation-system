# 校园智能路径导航辅助系统 V1.0

## 项目简介

本系统面向校园场景，提供基于路网模型的路径规划与导航辅助能力。用户可在校园地图上检索地点、选定起终点，系统基于最短路径算法计算步行路线，并展示路径详情与途经信息。系统支持双校区切换，并针对跨区域通行约束（如天桥通道）进行建模。

## 主要功能

- 用户登录与权限访问
- 双校区校园地图浏览与地点检索
- 智能路径规划（Dijkstra / A*）
- 路径详情展示（距离、途经点、关键路段提示）
- 跨区通行约束处理（如晋阳街天桥）
- 导航历史记录查询

## 技术架构

| 项目 | 说明 |
|------|------|
| 前端框架 | Vue 2 |
| UI 组件 | Element UI |
| 路由 | Vue Router（Hash 模式） |
| 算法模块 | Dijkstra、A* 最短路径计算 |
| 地图数据 | JSON 结构化路网与 POI 数据 |
| 构建工具 | Vue CLI |

## 在线访问

GitHub Pages：

https://zhy111-g.github.io/smart-campus-navigation-system/

演示账号：`admin` / `123456`

## 本地运行

### 环境要求

- Node.js 16 及以上版本
- npm

### 安装依赖

```bash
npm install --registry=https://registry.npmmirror.com
```

### 启动开发服务

```bash
npm run serve
```

启动后在浏览器访问终端提示地址（默认 `http://localhost:8088`）。

也可在已配置开发环境的前提下，使用 `启动.bat` 启动。

### 生产构建

```bash
npm run build
```

构建产物输出至 `dist` 目录。

面向 GitHub Pages 子路径部署时，可执行：

```bash
npm run build:gh
```

## 部署说明

### GitHub Pages

1. 执行 `npm run build:gh` 生成静态资源。
2. 将 `dist` 目录内容发布至仓库的 `gh-pages` 分支。
3. 在仓库 Settings → Pages 中启用该分支。
4. 通过 `https://<用户名>.github.io/smart-campus-navigation-system/` 访问。

### 腾讯云 EdgeOne Pages

1. 导入本 Git 仓库（可使用 Gitee 镜像仓库），选择 `main` 分支。
2. 构建配置建议如下：
   - 安装命令：`npm install --registry=https://registry.npmmirror.com`
   - 构建命令：`npm run build`
   - 输出目录：`dist`
3. 完成部署后，使用平台分配的访问域名进行访问。

## 数据说明

校园路网、地点与连通关系保存在 `public/data/campus-data.json`。  
若基础地图数据发生变更，可执行以下命令重新生成数据文件：

```bash
npm run data
```

## 目录结构

```text
├── public/                 # 静态资源与校园数据
├── scripts/                # 数据转换脚本
├── src/                    # 业务源码
│   ├── components/         # 地图等组件
│   ├── services/           # 接口与路径规划服务
│   ├── views/              # 页面视图
│   └── router/             # 路由配置
├── package.json
└── vue.config.js
```

## 许可证

本项目采用木兰宽松许可证第 2 版（Mulan PSL v2），详见 [LICENSE](./LICENSE)。
