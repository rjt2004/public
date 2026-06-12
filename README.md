## 本地预览

运行：

```powershell
./ D:\myblog\preview.ps1
```

然后打开：

```text
http://127.0.0.1:4000/
```

如果 4000 端口被占用，可以指定端口：

```powershell
./ D:\myblog\preview.ps1 -Port 4010
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

## 部署

确认本地预览没问题后，运行：

```powershell
./ D:\myblog\deploy.ps1
```

默认提交说明会自动生成，例如：

```text
update blog 2026-06-03 19:20
```

也可以手动指定：

```powershell
./ D:\myblog\deploy.ps1 -Message "new post"
```

只推 GitHub、不部署服务器：

```powershell
./ D:\myblog\deploy.ps1 -SkipServer
```
