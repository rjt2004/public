# Tone Blog

这是 `toneblog.top` 的 Hexo 博客源码仓库。现在只使用一个 GitHub 分支：`main`。

`main` 同时保存：

- Hexo 源码
- 主题与配置
- 文章与图片
- 生成后的 `public` 静态网页
- 本地预览与部署脚本

## 文件结构

```text
D:\myblog
├─ _config.yml                  # Hexo 主配置
├─ source                       # 内容源码
│  ├─ _posts                    # 已发布文章 Markdown
│  ├─ _drafts                   # 草稿，不会默认发布
│  ├─ _data\keep.yml            # Keep 主题主要配置
│  ├─ images                    # 文章和站点图片
│  ├─ categories                # 分类页
│  ├─ photos                    # 相册页
│  └─ tools                     # 工具页
├─ themes\hexo-theme-keep-master # Keep 主题源码
├─ public                       # hexo generate 生成的静态网页
├─ preview.ps1                  # 本地预览脚本
├─ deploy.ps1                   # 生成、提交、推送、部署脚本
├─ package.json                 # Hexo 依赖配置
└─ package-lock.json            # 依赖锁定文件
```

## 本地预览

运行：

```powershell
powershell -ExecutionPolicy Bypass -File D:\myblog\preview.ps1
```

然后打开：

```text
http://127.0.0.1:4000/
```

如果 4000 端口被占用，可以指定端口：

```powershell
powershell -ExecutionPolicy Bypass -File D:\myblog\preview.ps1 -Port 4010
```

## 发布文章

新建文章：

```powershell
cd D:\myblog
hexo new "文章标题"
```

然后编辑生成的 Markdown 文件：

```text
D:\myblog\source\_posts\文章标题.md
```

文章图片建议放在：

```text
D:\myblog\source\images
```

## 修改配置

常用配置位置：

```text
D:\myblog\_config.yml
D:\myblog\source\_data\keep.yml
```

`_config.yml` 主要管 Hexo 本体，例如站点 URL、文章路径、生成规则。

`source\_data\keep.yml` 主要管 Keep 主题，例如菜单、社交入口、首页、搜索、评论、页脚等。

## 部署到 toneblog.top

确认本地预览没问题后，运行：

```powershell
powershell -ExecutionPolicy Bypass -File D:\myblog\deploy.ps1
```

脚本会自动完成：

1. 清空旧的 `public` 生成文件
2. 运行 `hexo generate`
3. 把源码、配置、文章和新的 `public` 静态文件加入 Git
4. 如果有变化，自动创建 commit
5. 推送到 GitHub `main`
6. 把 `public` 打包上传到服务器
7. 解压到 Nginx 容器的 `/home/rjt/public`
8. 更新 `http://www.toneblog.top`

默认提交说明会自动生成，例如：

```text
update blog 2026-06-03 19:20
```

也可以手动指定：

```powershell
powershell -ExecutionPolicy Bypass -File D:\myblog\deploy.ps1 -Message "new post"
```

只推 GitHub、不部署服务器：

```powershell
powershell -ExecutionPolicy Bypass -File D:\myblog\deploy.ps1 -SkipServer
```

## 当前部署结构

```text
本地工作目录: D:\myblog
GitHub 仓库: https://github.com/rjt2004/public
GitHub 分支: main
线上域名: http://www.toneblog.top
服务器别名: myserver
Nginx 容器: mynginx
服务器静态目录: /home/rjt/public
```

服务器不再通过 Git 拉取网页文件。部署脚本会直接上传本地生成的 `public` 静态网页，因此只要本地脚本执行成功，线上站点就会更新。

## 敏感信息说明

当前仓库没有保存 GitHub Token、SSH 私钥、服务器密码、LeanCloud appid/appkey 或其他可用密钥。

仓库中包含以下公开信息：

- 邮箱地址
- GitHub/Bilibili/微博等社交链接
- 微信和 QQ 二维码图片
- 服务器别名 `myserver`
- Nginx 容器名和部署路径

这些不是登录密钥，但邮箱和二维码会作为社交入口公开展示。如果以后不想公开，可以从 `source\_data\keep.yml` 和 `source\images` 中删除或替换。
