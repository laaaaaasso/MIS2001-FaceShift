# FaceShift：Key Challenges & 解决方法（展开版）

本文档可直接用于 Presentation 第 3 部分（Key Challenges encountered and how you addressed them），也可复用到 Report 的工程实现章节。

---

## 1) 3DDFA_V2 依赖链复杂，环境初始化容易失败

### 挑战现象

- 初次运行 `python backend/export_face_obj.py` 时，经常出现：
  - `ModuleNotFoundError: No module named 'torch'`
  - `No module named Sim3DR_Cython`
  - `Module onnx is not installed`

### 根因分析

- `3DDFA_V2/demo.py` 在 import 阶段就加载多个模块，依赖较重。
- 不同运行路径（onnx / 非 onnx）依赖集合不同。
- Windows 环境下 Cython 扩展编译门槛较高（如 `Sim3DR_Cython`）。

### 解决方法

- 在 `backend/export_face_obj.py` 增强错误提示：自动解析 `No module named ...` 并给出安装建议。
- 将调用策略改为“优先简单可跑路径”：
  - 默认不强制 `--onnx`，减少对 `onnx` 的硬依赖。
- 对 `3DDFA_V2/demo.py` 做按需导入（lazy import）：
  - 仅在需要渲染功能时才导入相关模块，避免 `obj` 导出路径被无关模块阻塞。
- 对 NMS 模块加回退策略：优先 compiled 版，失败时回退 Python 实现。

### 最终效果

- 从“环境稍有差异就失败”变为“多数机器可直接跑通”。
- 失败时也能快速定位到具体缺失依赖，减少排错时间。

### 经验总结

- 学术仓库接入产品原型时，要先做“执行路径最小化”。
- 错误提示本身就是工程能力，能显著降低团队沟通成本。

---

## 2) Windows 中文路径导致 OpenCV 读取失败

### 挑战现象

- 日志显示输入文件存在，但 `cv2.imread(...)` 返回 `None`，后续报错：
  - `'NoneType' object has no attribute 'copy'`

### 根因分析

- 路径包含中文字符（如目录名中的中文），在某些 Windows + OpenCV 组合下会出现编码兼容问题。

### 解决方法

- 在 `export_face_obj.py` 中检测非 ASCII 路径：
  - 自动将输入图复制到仓库内 ASCII 名称文件（如 `faceshift_input.jpg`）。
  - 推理时使用该 ASCII 相对路径。

### 最终效果

- 彻底规避“文件存在但读取失败”的隐蔽问题。
- 用户无需修改本机目录结构。

### 经验总结

- 跨平台脚本应主动处理路径编码风险，不要把环境差异留给用户手工解决。

## 3) 前端依赖 CDN，网络受限时页面白屏

### 挑战现象

- 页面长期停在 Loading 状态，浏览器报错无法加载 Three.js 模块。

### 根因分析

- 初版依赖在线 CDN（jsDelivr / unpkg）。
- 网络策略或连接不稳定时，核心模块无法加载。

### 解决方法

- 将 `three.module.js`、`OrbitControls.js`、`OBJLoader.js` 下载到本地 `frontend/vendor/`。
- 修改 import 全部走本地相对路径。

### 最终效果

- 前端完全离线可运行，演示环境稳定性显著提升。

### 经验总结

- 面向课堂答辩或现场演示，优先去除外部网络依赖。

---

## 4) 浏览器缓存导致“已修复但仍报旧错误”

### 挑战现象

- 代码已更新，但浏览器仍引用旧版 `main.js`，报错行号与当前源码不一致。

### 根因分析

- 静态资源缓存命中，用户看到的是旧 bundle。

### 解决方法

- 入口脚本增加版本参数（cache busting）：
  - `main.js?v=...`
- 在 `index.html` 增加 no-cache 相关 meta。
- 在入口加防御性检查（如 root element 缺失时抛出明确错误）。

### 最终效果

- 更新后可立即生效，避免“伪回归”误判。

### 经验总结

- 静态站点调试阶段应默认启用 cache busting。

---

## 5) 模型显示不完整（只看到局部），不在视窗居中

### 挑战现象

- 用户仅看到脸部局部，模型被裁切或偏移。

### 根因分析

- 渲染尺寸按 `window` 计算，而不是按实际 viewer canvas/card 计算。
- UI 改版后布局变化，旧尺寸逻辑不再成立。

### 解决方法

- 在 `viewer.js` 中改为使用 `canvas.clientWidth/clientHeight`：
  - 动态设置 renderer size
  - 同步更新 camera aspect
- 继续保留 fit-camera 逻辑，加载后自动框选模型。
- 按展示需求调整布局：将控制面板移到 viewer 下方，释放横向空间。

### 最终效果

- 模型稳定居中且完整可见，交互体验显著改善。

### 经验总结

- 3D viewer 不能假设全屏窗口尺寸，必须绑定到容器尺寸。

---

## 6) 从“技术 demo”到“产品化流程”时的状态管理复杂度上升

### 挑战现象

- 需要实现 Capture / Processing / Edit / Export 四步骤流程。
- 同时要保留已有真实功能（3D viewer + 形变）不被破坏。

### 根因分析

- 页面结构从单页功能转向多页面流程后，状态与组件耦合变复杂。

### 解决方法

- 前端模块化重构：
  - `components`：TopBar、StepIndicator
  - `pages`：Capture、Processing、Edit、Export
  - `app.js` 统一路由/步骤状态
- 明确“真实功能 vs 占位功能”边界：
  - Edit 页保留真实 mesh deformation
  - Capture/Processing/Export 先做 UI 完整闭环，后续再绑定真实后端

### 最终效果

- 交付了可展示的产品原型，同时保留技术核心可运行。

### 经验总结

- 课程项目常见路线是“先闭环、后深挖”：先让流程完整，再逐步替换 mock。

---

---

## 总结（可用于一页收尾）

FaceShift 的主要挑战不是单点算法，而是“跨栈整合 + 真实运行环境差异 + 产品化演示质量”。
我们通过“降依赖路径、增强错误诊断、前端本地化、模块化重构、部署自动化”把系统从实验代码推进为可稳定演示的产品原型。
