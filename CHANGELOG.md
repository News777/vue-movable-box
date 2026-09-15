# VueMovableBox 更新日志

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `MovableGroup` 会话因 leader 卸载或强制中止（`disabled`/`initRect`）而解散时，现在会触发 `source: null` 的 `move-cancel`（成员不还原），保证每个 `move-start` 都有终止事件；`memberId` 运行时变化改为原地迁移注册，进行中的会话角色与选中状态跟随同一实例（原先 `memberId` 变化不会迁移注册，会话与选中仍按旧 id 寻址）
- 明确旋转精度契约：指针、键盘与角度吸附产生的旋转输出遵循 `isKeepDecimals`/`decimalPlaces`；父组件传入的 `rotate` 保持权威且不会被子组件按精度配置纠正回写，规则从下一次交互开始应用

### Fixed

- 修复起手重叠的逃逸路径可单帧穿过分离障碍的问题：precise 管线（平移、缩放/旋转）与组合 `groupCollision="all"` 的逃逸判定在端点规则通过后，对起手分离的目标补做连续扫掠/路径行走，把位移夹到最早接触点；落位点（含组合位移经成员 min 混合与 leader 补扫掠收缩后的最终落位）复验"不加深起手穿透"，更深落位整帧拒绝而非物化；被拒绝的帧仍以接触点略后方的状态报告碰撞事件，不再误报"无碰撞"——原先只比较端点，掉帧产生的单帧大位移可整段穿过中途障碍后落在分离区域
- 接触回退量从按位移比例改为绝对 0.5px 上限：单帧大位移（数百 px 以上）贴墙停靠不再残留超过半个像素的可见缝隙
- 修复 `collisionMode="aabb"` 成员在 `groupCollision="all"` 下起手已重叠障碍时整个编队在本手势内冻结的问题：路径区间把入口夹到 0 导致共享位移恒为零，现改用与 aabb 主管线一致的总量逃逸规则，并像主管线一样以旋转后的视觉 AABB 探测（原先按未旋转模型矩形算，旋转成员被放行到压入障碍）
- 组成员注册加入重名守卫：运行时把 `memberId` 改成另一成员占用的值会被拒绝并保留当前身份，两个成员以相同 id 挂载时后者退回实例级身份，不再静默顶掉另一成员的注册
- `sharedBounds=false` 且 `groupCollision="all"` 时，跟随成员先按自身边界夹取位移再做碰撞扫掠（与共享边界路径顺序一致）：原先先扫掠后夹取会把已验证的终点沿单轴滑进障碍
- 共享边界路径在编队约束（并集边界或跟随者接触）改变了位移时，对 leader 从会话起点补做一次扫掠：原先 leader 自身管线只验证当帧线段，指针改向后按起点重算的位置可能落进 leader 已绕开的障碍
- `lastSafeProgress` 对非有限步数改为 fail-closed（返回 0）；受约束旋转角量化后复验一次，量化容差不再让角度越过最后安全角；变更路径采样上界显式计入 transform-origin 位移项（角落 origin 下尺寸变化使远端角点位移翻倍，原公式低估）
- 组合 `all` 模式下成员的初始重叠逃逸改用与主管线一致的逐目标规则：共享位移不再允许"完全脱离障碍 A 的同时压入先前分离的障碍 B"（原先只比较重叠总量，总量下降即放行），并补组级回归用例
- 精确碰撞的路径采样（缩放/旋转）与角度扫描加入缓存 AABB 宽相位预筛：目标分散的大场景下远距目标不再进入完整 SAT；零面积目标在预筛中跳过（纯快路径，SAT 本就判退化目标分离，与平移扫掠对齐）
- 修正 oriented 采样注释中过强的"必有采样落入障碍/下一帧恢复"声称，如实说明步长上限下浅穿越的残余风险与真实兜底边界
- 修复 v3.2–v3.5 全面评审发现的组合会话与几何问题：leader 卸载不再把死 id 残留在选中集合中（解散时的 `move-cancel` 载荷仍列出该 leader 的最后矩形）；组拖拽会话期间成员的指针/键盘 resize、rotate 与键盘移动会被协商阻断（原先被 leader 每帧 `translateTo` 覆盖导致抖动），正被 resize 的成员也不会被新开的会话编入编队；`memberId` 运行时变化会重新注册组成员身份
- 精确碰撞的变更路径（缩放/旋转）改为障碍感知的自适应采样：原先固定 16 个均匀采样可让长距离缩放或大半径旋转的角点扫掠跨过薄障碍（穿墙），现在采样密度按路径长度与最薄目标自适应（16–512 步），旋转手势同时保留 2° 上限
- 修复百分比单位且带旋转的成员首次参与组拖拽时视觉轮廓按 1:1 比例计算的问题：`getVisualRect` 现在与 `getAreaEdges` 一样惰性刷新容器快照
- 四舍五入回退校验（`roundedSafeRect`）复用与交互管线一致的逐目标逃逸规则：不再只比较重叠总量，避免回写后新接触先前分离的目标；`quantizeAngleToward` 的容差随数值幅度缩放，表示噪声（如 179.99999999999997）不再丢失一个整量化单位
- 性能与可维护性：元素吸附的旋转目标 AABB 改用缓存路径（大场景拖拽每帧省去重复三角计算）；移除 `targetGeometryVersion` 死代码
- 修复 `rotationSnapAngles` 的四类约束问题：`Home` 归零不再被角度吸附重定向；`collisionMode="aabb"` 不再绕过父级旋转边界；受约束角度按安全侧量化，避免四舍五入后重新越界或碰撞；越界起点可量化到安全侧完成恢复
- 修复 `fixed-anchor` 缩放的三类约束问题：比例锁定与交叉 min/max 冲突时不再突破最大尺寸；靠近父级边界时优先收缩可行尺寸而非平移固定锚点；旋转后的聚焦手柄按本地轴响应键盘方向键
- 统一 AABB 与 precise 两条碰撞管线的目标校验：忽略非有限坐标和零面积目标，避免连续路径检测被不可见目标阻断，或 precise 模式把无效坐标错误回退到原点
- 修复碰撞诊断页首次启用“安全位置”时没有叠加层、后续安全矩形可能落后一帧的问题，并增加三浏览器回归

### Documentation

- 修正 `collisionEnabled` 的 API 描述：优先检测 `collisionTargets`，未传时回退到 `snapTargets`
- 修正双语 README 中组合边界的过时描述：组几何按成员旋转后的视觉 AABB 约束（共享边界取并集、独立边界取各自视觉矩形），而非"使用未旋转矩形、旋转成员可悬出边界"
- `GroupMoveCancelPayload.source` 的注释修正为 leader 卸载（仅 leader 卸载解散会话并发 `source: null` 的 `move-cancel`，跟随者卸载只移出会话与选中集合）
- 明确两个既有语义：组会话进行中对成员设置 `disabled`/`initRect` 不会把它移出编队，leader 每帧 `translateTo` 仍会带动该成员（编队刚性优先，仅 leader 的强制中止会解散会话）；组合位移经碰撞夹取后不做 `isKeepDecimals` 像素取整，保证精确落在接触位置而不取整进障碍
- 明确逃逸拒绝帧的组语义：起手重叠成员的逃逸在端点或最终落位违反逐目标规则时，该帧共享位移归零、编队回到本次会话起点配置（而非保持上一帧位置）——多帧手势中表现为编队跳回起点，属于"只允许逐步脱离"规则的安全侧取舍

## [3.5.0] - 2026-09-10

### Added

- FEAT-35-01 新增碰撞诊断示例（`examples/diagnose.html`）：可切换真实旋转轮廓、AABB 包围盒、接触法线与安全位置叠加层，并支持一键导出当前场景 JSON 用于回归复现
- FEAT-35-02 新增完整接入示例（`examples/integration.html`）：覆盖普通受控布局、旋转碰撞、组合整体移动（groupCollision='all'）与受控数据回写，并标注坐标系与目标数据要求
- FEAT-35-03 e2e 浏览器矩阵扩展到 Chromium、Firefox 与 WebKit；依赖 CDP 输入模拟的用例保留在 Chromium 并显式标记跳过原因；新增 e2e fixture（`examples/e2e-fixture.html`）覆盖精确碰撞、角度吸附、固定锚点缩放与组合整体碰撞的浏览器级回归
- FEAT-35-04 兼容性收敛：`test:package` 新增"已安装 vue 满足声明 peer 范围"检查；双语 README 新增从 v3.1.x 的迁移说明（precise 碰撞默认值、包入口、浏览器全局安装、版本导出）
- FEAT-35-05 发布自动化：CI e2e 安装并运行三浏览器矩阵；build 作业接入快速性能基线（`BENCH_SCENARIOS=100,1000`）并上传 `bench-results.json` 工件；release 作业在发布前执行版本校验与 tarball 消费检查

## [3.4.0] - 2026-09-10

### Added

- FEAT-34-01 `MovableGroup` 新增 `groupCollision`（`'leader' | 'all'`，默认 `leader`）：`all` 模式把组合统一位移收缩到任一选中成员与外部障碍物的最早接触，组内成员相互排除；leader 自身碰撞仍由其交互管线解析
- FEAT-34-04 `pnpm bench` 扩展为完整性能基准：覆盖 100/500/1000 元素、纯拖拽/吸附+碰撞/业务模型回写/组合整体碰撞（gc=all）场景，预热 1 轮后测量 2 轮，仅统计拖拽窗口内的帧，报告 p50/p95、最大帧与长帧比例及浏览器与设备信息，结果落盘 `bench-results.json`

### Changed

- FEAT-34-02 组合约束循环不再每帧每成员重复解析布局：成员区域边界改为惰性解析一次后复用快照（各自交互开始时刷新），共享模式的边界钳制与成员碰撞限制在同一次遍历内完成
- FEAT-34-03 目标几何缓存：目标的定向矩形与宽相位包围盒按目标对象缓存，目标列表（含就地修改）、`transformOrigin`、`unitType` 或容器尺寸变化时失效；缓存前后碰撞与吸附结果一致

## [3.3.0] - 2026-09-10

### Added

- FEAT-33-01 新增 `resizeMode`（`'local-delta' | 'fixed-anchor'`，默认 `local-delta`）：固定锚点模式把角手柄的对角点、边手柄的对边中点钉在旋转后的世界坐标上，尺寸由指针位置反解，旋转下方框仍保持锚点稳定；覆盖比例锁定与最小/最大尺寸限制
- FEAT-33-02 新增 `canRotate` 旋转前置守卫：拒绝时不激活、不修改模型、不发送 `rotate-start`，覆盖指针与键盘入口
- FEAT-33-03 新增 `rotationSnapAngles` 与 `rotationSnapThreshold`（默认关闭）：候选角度吸附，且吸附结果仍经过边界与碰撞约束，不能借吸附穿过障碍物
- FEAT-33-04 新增 `collisionTargets`：碰撞障碍物与吸附对象可分别配置；未传沿用 `snapTargets`，显式空数组表示没有碰撞目标

## [3.2.0] - 2026-09-10

> 集中修复版本。**破坏性变更：**precise 旋转碰撞成为默认行为（见下），是本计划对既有次版本
> 兼容承诺的明确例外；`collisionMode="aabb"` 提供旧行为迁移入口。

### Added

- FIX-01 新增 `collisionMode`（`'precise' | 'aabb'`，默认 `precise`）：双方以真实旋转矩形（位置、尺寸、角度、变换原点）参与碰撞，平移使用基于闵可夫斯基和的连续碰撞检测，缩放与旋转全程检测变化路径，被旋转边缘挡住的拖拽沿切线继续滑动
- FIX-01 `SnapTarget` 新增可选 `rotate` 与 `transformOrigin`，声明碰撞目标的真实变换信息
- FIX-01 碰撞事件载荷新增可选 `normal`（容器像素坐标系中由障碍物指向当前方框的单位法线），`direction` 按法线主轴映射
- FIX-05 构建新增真正的 CommonJS 入口 `lib/vue-movable-box.cjs`，`main` 与 `exports['.'].require` 指向它；ESM 与既有 UMD 文件地址保持不变
- FIX-06 运行时版本改为构建时从 package.json 注入（单一版本来源），并新增命名导出 `version` 与 `install`
- FIX-08 新增 `pnpm test:package`：从实际 tarball 安装到隔离消费环境，验证 ESM、CJS、浏览器 UMD 全局、组件与插件安装、CSS 子路径、TypeScript 声明及版本一致性，并接入 CI 与 `pnpm release`

### Fixed

- FIX-01 旋转碰撞误报与漏检：AABB 仅用于候选筛选，精确相交按 SAT 判定，边缘接触不算重叠；指针旋转与键盘旋转统一经过边界与碰撞约束（采样整条角度路径，禁止中途扫过障碍物）；初始重叠时只允许逐步脱离
- FIX-02 组合成员旋转后可能越界：共享边界使用成员视觉包围盒（旋转 AABB）并集，独立边界使用各成员自身视觉矩形（计入旋转偏移），最终组合位移保持成员相对位置
- FIX-03 吸附辅助线改在随方框逆旋转的呈现层中渲染：`rotate ≠ 0` 时辅助线仍与容器坐标轴对齐并精确落在目标位置，覆盖缩放、滚动与百分比坐标
- FIX-04 `unitType="%"` 且旋转时，缩放位移先在像素空间完成旋转变换再映射回百分点，不再混用两轴百分点
- FIX-07 吸附策略惰性求值：未列入 `snapPriority` 的策略不再计算，高优先级策略命中后不再计算低优先级策略，同距离候选仍按目标数组顺序选择，`snapFilter` 每目标每轴仍只调用一次
- FIX-08 移除 UMD 环境下 `window.Vue.use` 自动安装副作用（Vue 3 全局构建无 `Vue.use`，曾导致 `window.Vue.use is not a function`）；浏览器全局改为 `Vue.createApp(...).use(VueMovableBox)` 显式安装

## [3.1.0] - 2026-09-10

### Added

- 新增可选 `rotatable` 旋转手柄与 `rotationHandleOffset` 配置，支持指针拖动和键盘调节角度
- 新增 `v-model:rotate`、`rotate-start`、`rotate`、`rotate-stop` 与 `rotate-cancel` 交互 API

### Fixed

- 明确组合内目标通过稳定的 `id === memberId` 排除，避免以可变矩形推断身份而误伤重叠外部目标
- 修复 `rotationHandleOffset` 小于 16 时被静默改写，以及非法键盘步长导致旋转无变化或归零的问题
- 修复旋转手柄阻止默认聚焦后，直接鼠标操作时 `Escape` 无法到达组件并取消旋转的问题
- 修复组合拖动时引导方框仍会对组内成员执行吸附或碰撞，破坏组合相对位置的问题
- 修复 `sharedBounds=false` 时跟随成员错误复用引导方框边界、忽略自身 `boundsMargin` 等配置的问题
- 修复旋转缩放先被未旋转矩形边缘截断、视觉 AABB 尚可容纳时也无法继续放大的问题
- 修复旋转缩放为适配边界而收缩尺寸时，左侧/顶部手柄没有同步回锚、导致固定的右边/下边跳动的问题
- 修复旋转缩放碰撞解析只回写位置、丢失安全尺寸的问题
- 修复旋转吸附后混用本地坐标与 AABB 坐标，导致 `snap` 和辅助线被误清除的问题
- 修复受控 `v-model:selected` 拖动未选成员时批量事件仍携带旧选择的问题
- 修复第二个并发指针拖动已选成员时误用首个引导方框 session、带动或改写其他成员的问题
- 统一 `transformOrigin` 的 CSS 与几何解析结果，避免视觉原点和约束原点分离
- 修复非法 `transformOrigin` token 组合仍被几何层接受的问题，统一回退为 `center`
- 修复 `unitType="%"` 下 px 变换原点被误当成百分点、导致旋转 AABB 偏移的问题
- 补全公开 `MovableBoxProps.memberId` 类型与 API 表格
- 测试页面改用内置 SVG 图标并补全 favicon，避免 Emoji 或缺失资源导致图标不显示
- 修复演示画布高度被最小高度覆盖、状态面板被网格行裁切的问题，并补全控制项的无障碍名称

## [3.0.0] - 2026-09-09

> 主要版本：集中收敛几何模型语义变更（见下方旋转语义）。`rotate` 保持 0 的消费者行为与 2.2.0 完全一致，升级无需改动。

### Added

- 新增 `rotate` 属性（顺时针角度，等同 CSS `rotate()`）与 `transformOrigin` 属性（关键字、百分比及 px 子集），支持方框旋转与变换原点控制
- 旋转下的缩放映射：指针缩放位移自动映射到方框本地坐标系，缩放手柄跟随旋转后的边缘；键盘方向键沿旋转后的手柄轴向缩放
- 新增 `rotate` / `deltaToLocal` / `normalizeAngle` 几何工具（内部使用，含 5 项单元测试）
- `examples` 演示新增"旋转"滑块，实时写入选中方框的自定义 `rotate` 字段并驱动组件

### Changed

- 旋转方框（`rotate ≠ 0`）的几何语义（本次主要版本收敛的破坏性变更）：
  - 边界约束与 `out-of-bounds` 按旋转矩形的轴对齐包围盒（AABB）判定，AABB 计入 `transformOrigin` 偏移，非 center 原点按真实视觉位置钳制
  - 元素吸附（对齐与等间距）在 AABB 上求值，位移 1:1 映射回未旋转矩形并做像素取整
  - 碰撞检测以 AABB 与未旋转 `snapTargets` 求交
  - 网格吸附继续对齐未旋转左上角；平移（拖拽/键盘/组合移动）不受旋转影响
  - 旋转缩放语义：指针与键盘位移映射到本地坐标系后增量缩放（非逆运动学锚定），旋转下缩放结果额外做 AABB 边界钳制
  - 旋转几何假定 `px` 单位，`%` 单位下按百分比空间近似

### Fixed

- `MovableGroup` 的 `sharedBounds=false` 现按文档语义对每个成员以自身矩形独立钳制（此前成员跟随引导方框整体位移、可能被推出自身边界）
- `MovableGroup` 增加会话并发防护：第二个并发指针无法抢占进行中的组合会话；未选成员仍可单独拖动，活动组合内成员拒绝第二次交互
- 旋转缩放在 AABB 超出区域尺寸时收缩到能放入区域：边手柄仅收缩被拖拽轴（解析解上限并复核 `minWidth` / `minHeight`），角手柄与 `ratioLock` 沿拖拽射线按同一因子等比收缩、不产生轴坍缩；min 下限与"能放入"冲突时保住下限并经 `out-of-bounds` 上报溢出（此前仅平移钳制、无法阻止视觉溢出），指针与键盘路径均生效
- `transformOrigin` 的几何解析支持一到两个关键字/百分比/px token（多余 token 或无法解析的值回退 center），与探针计算保持一致
- 吸附、碰撞与边界钳制的探针位移回写统一做像素取整，避免旋转映射产生亚像素 left/top
- `memberId` 传入空字符串时回退为自动生成的成员标识，避免组内成员互相覆盖
- `scripts/perf-bench.mjs` 丢弃帧测量首帧（rAF 调度间隔），基准数据更准确

## [2.2.0] - 2026-09-09

### Added

- 等间距吸附辅助线：`snapToElements` 开启时，方框移动到两个目标之间会自动吸附到两侧间距相等的位置，`snap` 事件载荷新增 `spacing: [{ axis, gap, targetIds, guides }]`，并在两个锚点边缘绘制辅助线
- 新增 `snapFilter` 属性：按轴过滤吸附目标（返回 false 即排除），不影响碰撞检测
- 新增 `snapPriority` 属性：配置每根轴的吸附策略咨询顺序（`'alignment' | 'spacing'`，默认 alignment 优先），设为 `['alignment']` 可关闭等间距吸附
- 吸附解析确定性规则：每根轴按 `snapPriority` 顺序咨询策略，策略内取阈值内最近候选，距离相等时按 `snapTargets` 数组顺序取胜；等间距配对按目标数组顺序（前锚 × 后锚）确定性遍历

### Changed

- `snapToElements` 开启时等间距吸附默认参与解析（此前仅有对齐吸附）；需要旧行为的消费者可设置 `snap-priority` 为 `['alignment']`

## [2.1.0] - 2026-09-09

### Added

- 新增 `MovableGroup` 无渲染组合组件（含 `MovableGroupProps` / `MovableGroupExpose` 与 `move-start` / `move` / `move-stop` / `move-cancel` 批量事件类型）：拖拽选中成员带动整个选中组合按相同偏移移动，拖拽未选中成员自动切换选中；`v-model:selected` 支持受控选中
- 组合共享边界（`sharedBounds`，默认开启）：以选中矩形并集约束在边界区域内，整个组合一起停在区域边缘；关闭后按成员各自约束
- 确定的组合吸附/碰撞语义：吸附与碰撞仅对引导方框（指针下的方框）求值，组合成员之间互不吸附、互不碰撞
- 不可变批量更新：`move-stop` 载荷包含每个成员的 `rect` 与 `startRect`；引导方框取消时 `move-cancel` 将整个组合还原到交互前矩形，强制中止则与单方框语义一致（不还原）
- `MovableBox` 新增 `memberId` 属性用于组合内标识（缺省自动生成）；未包裹在 `MovableGroup` 内时行为与此前完全一致
- `MovableGroup` 暴露 `getSelected()` / `select(ids?)` / `getMemberRects()` 方法
- `examples` 演示新增多选组合画布；新增 `scripts/perf-bench.mjs`（`pnpm bench`）性能基准，覆盖 100 / 500 / 1000 方框的单框拖拽与全组合移动场景

## [2.0.0] - 2026-09-09

> 正式版本：Pointer Events 迁移、触摸/触控笔兼容性及消费者升级路径已按预发布计划验证完毕。功能范围与 [2.0.0-beta.1] 一致。

## [2.0.0-beta.1] - 2026-08-31

> 预发布版本：用于验证 Pointer Events 迁移、触摸/触控笔兼容性及现有消费者升级。

### Added

- 使用 Pointer Events 统一鼠标、触摸和触控笔交互：单一 `pointerdown` 入口，按 `pointerId` 过滤多指触控，并借助 `setPointerCapture` 与 `lostpointercapture` 保证指针离开窗口后交互不残留监听器
- 新增 `dragHandle` 与 `dragCancel` 属性，可配置拖拽触发区域与排除区域，避免方框内的表单、按钮等内容误触发拖拽；无效选择器按"禁止拖拽"处理而不是抛错
- 新增键盘调整尺寸：`Shift` + 方向键以右下角手柄（或 `resizeDirections` 中第一个允许的手柄）为锚点缩放；聚焦某个缩放手柄后，方向键沿该手柄轴向缩放、`Shift` 反向，复用 `resizeFromHandle`，最小/最大尺寸、比例锁定、边界与碰撞约束继续生效
- 边缘缩放手柄新增 `role="separator"`、方向、当前/最小/最大尺寸与快捷键语义；角落手柄使用 `role="group"` 和双轴缩放描述，所有手柄均提供可访问名称；`keyboardEnabled` 开启时手柄可聚焦，并为方框与手柄增加跟随主题色的 `:focus-visible` 焦点轮廓
- 新增显式取消交互：指针交互进行中按 `Escape`（无需开启 `keyboardEnabled`）、`pointercancel`、丢失指针捕获或调用新增公开方法 `cancelInteraction()`，都会恢复交互前矩形并触发新事件 `drag-cancel` / `resize-cancel`（载荷为 `(source, oldValue, newValue)`，`newValue` 等于 `oldValue`，且不触发 `drag-stop` / `resize-stop`）
- 新增 `canDrag` / `canResize` 前置守卫：交互开始前以当前矩形（及手柄）调用，返回 `false` 即拒绝本次交互——不激活、不发事件、不挂监听、不修改模型
- `examples` 演示新增拖拽把手/排除区、交互守卫、取消交互按钮与键盘提示
- 组件测试迁移为 PointerEvent 模拟并扩充覆盖拖拽触发/排除区域、键盘缩放、手柄无障碍、取消还原、前置守卫、多指过滤与卸载清理；新增 Playwright 浏览器测试，验证原生指针捕获、触摸取消、触控笔、键盘焦点与 RTL 物理边缘行为

### Changed

- 拖拽与缩放事件（`drag-start` / `drag-stop` / `resize-start` / `resize-stop`）的 `source` 参数类型由 `MouseEvent | TouchEvent` 收窄为 `PointerEvent`；`PointerEvent` 继承自 `MouseEvent`，仅影响显式注解为 `TouchEvent` 的回调
- `pointercancel` 由"按正常结束处理"改为"按取消处理"：恢复交互前矩形并触发 `drag-cancel` / `resize-cancel`
- 指针拖拽或缩放进行中时，键盘事件不再介入移动方框，仅 `Escape` 取消生效
- 未激活方框可通过键盘焦点激活；交互式插槽内容中的方向键不再冒泡触发方框移动
- 仅主指针的左键可以开始拖拽或缩放，右键、中键及非主触点不会激活组件或启动交互
- `disabled` / `initRect` / `active` 等属性强制中止交互时保持原有行为（不还原矩形），与显式取消的"还原"语义区分

## [1.1.7] - 2026-08-20

### Changed

- 更新发布版本为 `1.1.7`
- 将主组件样式改为原生 CSS，避免发布构建依赖 Sass 编译

### Fixed

- 将网格、键盘、元素吸附和碰撞能力接入统一交互流程，修复此前仅声明参数但未生效的问题
- 修复直接修改 `modelValue`、方向限制仅对键盘生效、边界间距计算不一致和触摸最后一帧丢失问题
- 修复碰撞阻止整帧回退导致组件在目标边缘前残留 1–2px 间隙的问题
- 修复元素贴合后因指针轻微斜向抖动而难以沿碰撞边缘滑动的问题
- 修复快速拖拽或大步长键盘移动可穿过碰撞目标的问题
- 修复斜向快速拖拽穿透目标及扫掠碰撞方向错误的问题
- 修复吸附坐标变化漏发事件及单轴碰撞错误清空另一轴辅助线的问题
- 修复交互过程中切换禁用/只读状态后仍继续移动，以及零高度比例锁定产生非有限尺寸的问题
- 修复发布包缺少 Vue 组件声明文件的问题

### Added

- 增加元素对齐辅助线、状态化吸附事件、拖拽/缩放碰撞阻止以及初始重叠逃逸行为
- 扩充到 58 项组件、工具和公共类型测试，覆盖触摸、键盘、百分比单位、边界、吸附、碰撞、公开方法和兼容别名
- 新增项目路线图，明确交互基础、多选、增强吸附与变换模型的演进方向和验收原则

---

## [1.1.6] - 2026-08-19

### Changed

- 调整发布版本为 `1.1.6`
- 统一版本声明与包信息，确保发布内容与源码一致

### Fixed

- 统一了公开 API：`resizable` 为首选名称，`resizeable` 仍保留兼容别名
- 修正类型和示例代码中的数值计算问题，避免字符串/数字混用导致的 TS 报错
- 清理了 sass 相关 warning，并移除无用的 Sass 依赖
- 调整了构建输出和文档状态，保证发布包与源码一致

### Added

- 加入 Vitest + Vue Test Utils 的真实交互测试，覆盖拖拽与缩放基础行为
- 增加基础发布前校验脚本，确保 `test` + `build` 运行顺序清晰

---

## [1.1.5-beta.3] - 2026-03-10

### Added

- **代码重构**: 模块化拆分，更好的可维护性
  - `utils/snap.ts` - 对齐吸附逻辑
  - `utils/collision.ts` - 碰撞检测逻辑
  - `composables/useKeyboard.ts` - 键盘控制
  - `composables/useGrid.ts` - 网格吸附
  - `composables/useSnap.ts` - 对齐吸附 composable
  - `composables/useCollision.ts` - 碰撞检测 composable
  - `types.ts` - 类型定义独立文件

### New Features

- **对齐吸附**: 拖拽时自动对齐到其他元素边缘
  - `snapToElements` - 启用对齐
  - `snapThreshold` - 吸附阈值
  - `snapTargets` - 对齐目标元素
  - `@snap` 事件 - 吸附时触发
  - `@guides` 事件 - 辅助线数据

- **碰撞检测**: 防止元素重叠
  - `collisionEnabled` - 启用碰撞检测
  - `allowOverlap` - 允许重叠
  - `@collision` 事件 - 碰撞时触发

---

## [1.1.5-beta.2] - 2026-03-10

### Added

- **网格吸附**: 新增 `snapToGrid` 和 `gridSize` 属性，支持拖拽时自动吸附到网格
- **方向控制**: 新增 `dragDirections` 和 `resizeDirections` 属性，可限制拖拽/调整方向
- **边界边距**: 新增 `edgeDistance` 和 `boundsMargin` 属性，更灵活控制边界
- **键盘支持**: 新增 `keyboardEnabled` 和 `keyboardStep` 属性，支持键盘方向键移动
- **过渡动画**: 新增 `enableTransition` 属性，支持平滑过渡动画
- **GitHub Actions CI**: 自动构建和发布工作流
- **CSS 变量**: 支持通过 CSS 变量自定义主题

### Improved

- **性能优化**: 使用 requestAnimationFrame 批量处理更新，硬件加速
- **代码结构**: 规范化项目目录结构
- **文档完善**: 完整的 API 文档和使用示例

### Fixed

- **Activation Bug**: 修复点击无法激活的问题
- **Ratio Lock**: 修复锁定宽高比无效的问题
- **TypeScript**: 完善的类型定义支持

---

## [1.1.5-beta.1] - 2026-03-10
