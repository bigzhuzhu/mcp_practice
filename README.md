<!--
 * @Author: bigzhuzhu 1327838903@qq.com
 * @Date: 2026-03-12 10:12:34
 * @LastEditors: bigzhuzhu 1327838903@qq.com
 * @LastEditTime: 2026-03-13 15:31:26
 * @FilePath: \python_ai\README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
### uv 添加镜像地址
1. 在 Powerpowershell 中执行（只在当前窗口有效）：
```powershell
$env:UV_DEFAULT_INDEX = "https://pypi.tuna.tsinghua.edu.cn/simple"
```

2. 设置环境变量(永久生效)
    右键“此电脑” -> “属性” -> “高级系统设置” -> “环境变量”。
    在“用户变量”或“系统变量”里，点击“新建”。
    变量名填 UV_DEFAULT_INDEX，变量值填 https://pypi.tuna.tsinghua.edu.cn/simple。
    一路确定，然后重启你的终端（比如 Powerpowershell 或 CMD）让它生效。

3. 项目级定制（pyproject.toml）

    如果项目需要和团队成员保持镜像源统一，或者有特殊的包源需求，可以把配置写在项目根目录的 pyproject.toml 文件里。
```powershell
[[tool.uv.index]]
url="https://pypi.tuna.tsinghua.edu.cn/simple"
default=true
```


### 1.pip 和 uv 的关系
pip：Python 官方自带的包管理工具，用于安装和管理 PyPI 上的第三方库。
uv：是一个新一代的 Python 包管理工具，速度更快，支持虚拟环境、依赖锁定等功能，类似于 pip + venv + pip-tools 的集合体。

简单来说：
pip 是最基础的依赖安装工具。
uv 是更现代、更高效的依赖和环境管理工具，可以替代 pip 的大部分功能，并且体验更好。

###  2.如何用 uv 管理 Python 依赖
2.1 安装 uv
在终端输入（推荐用 pipx 安装，避免污染全局环境）：
```powershell
pip install pipx
pipx install uv
```
或者直接用 pip 安装：
```powershell
pip install uv
```
2.2 创建虚拟环境
在你的项目目录下：
```powershell
uv venv
```
激活虚拟环境（Windows）：
```powershell
.\.venv\Scripts\activate
```
2.3 安装依赖
比如安装 requests：
```powershell
uv pip install requests
```
或者直接用 uv 安装（推荐）：
```powershell
uv install requests
```
2.4 卸载包
```powershell
uv pip uninstall requests
```
2.4 生成依赖锁定文件
```powershell
uv pip freeze > requirements.txt
```
或者
```powershell
uv pip list
```
2.5 升级依赖
```powershell
uv pip install --upgrade 包名
# 或者
uv update 包名
```
 总结
uv 可以完全替代 pip，且更快更方便。
用 uv 管理虚拟环境和依赖，推荐新项目都用 uv。
pip 依然是底层依赖管理工具，uv 内部也会调用 pip 的部分功能。



### uv下载的依赖
1. 什么是全局依赖、局部依赖？
全局依赖：安装在整个操作系统（或 Python 解释器）范围内，所有项目都能用。比如直接用 pip install xxx 安装的包，任何地方都能 import。
局部依赖（本地/虚拟环境依赖）：只安装在某个项目的虚拟环境里，只有激活该虚拟环境时才能用。不会影响其他项目。
2. uv 下载的依赖是全局还是局部？
uv 默认是局部依赖，即安装在你项目的虚拟环境（.venv 文件夹）里。
只有你激活了该虚拟环境，或者在该环境下运行 Python，才能用这些依赖。
3. 存放位置在哪里？
全局依赖：

    Windows：一般在 C:\Users\你的用户名\AppData\Local\Programs\Python\PythonXX\Lib\site-packages

    Mac/Linux：一般在 /usr/local/lib/pythonX.X/site-packages 或 ~/.local/lib/pythonX.X/site-packages
    
    局部依赖（虚拟环境）：
    在你的项目目录下的 .venv\Lib\site-packages（Windows）
    或 .venv/lib/pythonX.X/site-packages（Mac/Linux）
4. 总结
uv 推荐用虚拟环境（局部依赖），这样项目之间互不影响。
全局依赖容易产生冲突，不推荐用于开发项目。
5. 查看依赖实际存放路径，可以激活虚拟环境后运行：
```powershell
python -c "import site; print(site.getsitepackages())"
```
### uv下载clone项目的依赖
1. 克隆项目
```bash
git clone 仓库地址
cd 项目目录
```
2.  创建虚拟环境（推荐）
```powershell
uv venv
```
3. 安装依赖
- 如果有 requirements.txt 文件：据 requirements.txt 文件安装所有依赖
```powershell
uv pip install -r requirements.txt
```
- 生成依赖文件：把当前环境的依赖写入 requirements.tx

```powershell
uv pip freeze > requirements.txt
```
- 如果有 pyproject.toml 文件（现代项目推荐）：从 pyproject.toml 安装依赖项到虚拟环境中

```powershell
uv pip install .
# 或者
uv sync
```

- 如果项目说明文档有其他依赖文件，按说明使用 uv pip install -r 文件名。

4. 激活虚拟环境（Windows）
```powershell
.\.venv\Scripts\activate
```
5.  验证依赖安装
```powershell
uv pip list
```
6. 运行命令
```powershell
uv run python script.py
uv run pytest
```
7. uv pip install requests和 uv install requests 的区别在于：
- `uv pip install requests` 是使用 UV 的 pip 包管理器来安装 requests 包。这会在 UV 管理的虚拟环境中安装 requests，并且会自动处理依赖关系。
- `uv install requests` 是 UV 的一个更高层次的命令，可能会执行更多的操作，比如更新项目的依赖文件（如 requirements.txt）或者进行其他项目级别的配置。具体行为可能取决于 UV 的版本和配置。

8. 常用命令

|功能|命令|
| ----------- | ----------- |
|初始化新项目|	uv init [项目目录]|
|同步/安装依赖	|uv sync|
|添加依赖|	uv add <包名>|
|移除依赖|	uv remove <包名>|
|更新依赖|	uv pip install --upgrade <包名>|
|运行脚本|	uv run <命令>|
|创建虚拟环境	|uv venv [目录]|
|激活虚拟环境	|source .venv/bin/activate (Linux/Mac) 或 .-venv\Scripts\activate (Windows)|
|安装包|	uv pip install <包名>|
|卸载包|    uv pip uninstall requests|
|导出依赖|	uv pip freeze > requirements.txt|
|查看已安装包|	uv pip list|
|清理缓存|	uv cache clean|
|更新UV自身|	uv self update|

9. 锁文件 (uv.lock)
UV 自动生成和维护一个锁文件（uv.lock），确保依赖版本的可重现性。
使用 uv sync 时，UV 会检查现有锁文件并仅当需要时更新。
要强制重新生成锁文件：
```powershell
uv sync --refresh
```
10. 依赖冲突	
```powershell
运行 uv sync --no-dev 或 uv pip check 检查冲突
```
11. 虚拟环境未自动创建	
```powershell
使用 uv sync --frozen 强制创建，或检查目录权限
```