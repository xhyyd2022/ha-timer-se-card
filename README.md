# Timer SE Card

一个为 Home Assistant 仪表盘(Lovelace)设计的**纯前端倒计时定时器卡片**。

- 🎚️ **滑块拖动**:在 `slider_max` 范围内拖动设定分钟数,拖动即生效
- ⌨️ **直接输入时间**:单个输入框,支持 `5`(分钟)/`30s`/`1h 30m` 等格式
- ⏰ **预设时间一键跳转**:内置几个固定时间点,点击标签立刻跳转到对应时间并开始倒计时
- 🔔 **倒计时结束触发实体**:时间到后开启或关闭你指定的实体
- 🛑 **手动操作自动取消**:倒计时期间操作了设备开关,定时自动取消,不会到点误关
- ⚡ **可触发后端事件**:结束后向 HA 触发事件,可搭配自动化(Event 触发器)使用
- 🖥️ **HA 服务端计时模式(可选)**:配置 `timer_entity` 后,倒计时由 HA 的 Timer 实体执行——页面/浏览器关掉也能准确到点,前端只负责显示与控制
- ⚙️ 支持最大时间限制、自定义主题色、深浅色主题自适应;尺寸由 HA 网格自动控制
- ✏️ 提供**图形化配置编辑器**(添加卡片时可直接在 UI 中编辑)

## 安装(HACS)

1. 在 HACS 中点击「…」→ **自定义存储库**,添加:

   - 存储库地址:`https://github.com/xhyyd2022/ha-timer-se-card`
   - 类别:**Dashboard / Lovelace 前端插件**

2. 点击 **下载**,重启 Home Assistant 前端(或刷新页面)。

## 使用方式

### 手动安装(不使用 HACS)

将 `dist/ha-timer-se-card.js` 放到 `<config>/www/` 下,然后在仪表盘资源中添加:

```yaml
url: /local/ha-timer-se-card.js
type: module
```

## 卡片配置

```yaml
type: custom:timer-se-card
entity: button.fan_toggle        # 必填:倒计时结束后要触发的实体
action: off                      # 可选:倒计时结束后的动作,默认 off
                                 #   on = 开启 / off = 关闭
card_title: 睡前关风扇            # 可选:卡片标题
presets:                         # 可选:预设时间(纯数字=分钟,支持 "30s"/"1h" 单位)
  - 15
  - 30
  - 60
  - 90
slider_max: 120                  # 可选:滑块最大值(默认 120)
slider_unit: min                 # 可选:滑块单位 min/sec/hr,默认 min
countdown_display: both          # 可选:时间显示方式 countdown(数字)/ progress(方块)/ both
hide_slider: false               # 可选:隐藏滑块(只用预设/输入框)
show_manual_input: false         # 可选:是否显示底部手动设置输入框(输入+设置+重置),默认关闭
autostart: true                  # 可选:点击预设后是否立即开始,默认 true
color: "#ff8f00"                 # 可选:主题色,默认跟随 HA 主题
```

> 卡片尺寸由 HA 仪表盘网格自动控制(默认 12×4),无需手动配置。
> **默认预设:`[15, 30, 60]`**。

### 预设时间输入方式

编辑器里的预设时间采用与上游一致的方式:**chips 标签 + 文本输入框 + 添加按钮**:

- 纯数字默认是**分钟**:`10` → 10 分钟
- 支持单位后缀(秒/分/时):`30s`、`1h`
- 支持小数: `1.5h` → 90 分钟
- 自动去重、排序(数字在前、带单位在后),点击 ✕ 可删除单个

### 搭配自动化(结束事件)

倒计时结束后,卡片除了直接触发实体,还可以向 HA 后端触发一个事件,
供自动化用 **Event** 触发器监听(例如实现"倒计时结束后关灯"):

```yaml
type: custom:timer-se-card
entity: light.jdjz_cn_xxx          # 可选:结束后直接触发该实体
event_type: timer_finished         # 可选:结束后向 HA 触发该事件
event_data:                        # 可选:事件附带数据
  timer_id: 123456
```

对应的自动化:

```yaml
triggers:
  - event_type: timer_finished
    event_data:
      timer_id: 123456
    trigger: event
actions:
  - action: light.turn_off
    target:
      entity_id: light.jdjz_cn_xxx
```

> 注意:`event_type` 触发事件需要 HA 管理员权限(默认用户通常是)。

### 直接输入时间

卡片中部有一个输入框,可直接输入时间并回车(或点「设置」)开始倒计时:

- 无后缀的数字默认是**分钟**:`5` → 5 分钟
- 支持 `s` / `m` / `h` 后缀(也支持中文 秒/分/时):`30s`、`1h`
- 可用空格分隔组合: `1h 30m` → 90 分钟、`1小时30分`

### 结束动作(action)

`action` 支持两种模式,通过图形化编辑器下拉或 YAML 配置:

| `action` 值 | 含义     | 执行的服务               |
| ----------- | -------- | ----------------------- |
| `off`(默认) | 关闭     | `homeassistant.turn_off` |
| `on`        | 开启     | `homeassistant.turn_on`  |

部分实体类型有特殊处理(与 `action` 模式无关):

| 实体类型        | 固定执行的动作              |
| --------------- | --------------------------- |
| `button.*`      | `button.press`              |
| `script.*`      | `script.turn_on`            |
| `scene.*`       | `scene.turn_on`             |

如果你需要自定义动作(比如时间到后同时做多件事、或者调用自动化),可以配置 `actions`,配置后**优先于**实体的自动动作:

```yaml
type: custom:timer-se-card
entity: button.fan_toggle
actions:
  - service: button.press
    target:
      entity_id: button.fan_toggle
  - service: notify.mobile_app_phone
    data:
      message: 定时时间到,已关闭风扇
```

> 倒计时结束时会额外在页面上派发一个 DOM 事件 `timer-se-card-finished`,方便前端调试/联动。

## HA 服务端计时模式(timer_entity)

默认情况下计时发生在浏览器里(纯前端),关闭页面/切换视图后计时无法继续。
如果你希望**倒计时在页面关闭后依然准确到点执行**,可以交给 HA 的 **Timer 辅助元素**:

### 1. 创建一个 Timer 辅助元素

HA → 设置 → 设备与服务 → 辅助元素 → 创建辅助元素 → **计时器**,
随便命名(如「睡前风扇」),勾选 **恢复**(HA 重启后也能继续)。得到一个实体,如 `timer.bedroom_fan`。

> 一个 Timer 实体同一时间只能跑一个倒计时;一张卡片对应一个实体即可。

### 2. 卡片里配置 `timer_entity`

```yaml
type: custom:timer-se-card
card_title: 睡前关风扇
timer_entity: timer.bedroom_fan   # 服务端计时
presets:
  - 15
  - 30
  - 60
```

配置后行为变化:

- **开始/暂停/继续/取消**:卡片会镜像调用 `timer.start` / `timer.pause` / `timer.cancel`,时长每次动态传入,任意秒数都行;
- **显示**:卡片只读取该 Timer 实体状态,剩余时间以 HA 的结束时刻为准(自动对齐,不受浏览器节流/锁屏影响);
- **页面关闭也能到点**:到点动作请交给 HA 自动化(见下),不再依赖卡片页面开着;
- **跨端同步**:换一台设备打开仪表盘,卡片会自动采用该 Timer 实体的运行状态继续倒数;
- **状态持久化**:此时不再使用浏览器 localStorage(避免旧记录干扰),状态完全由 HA 实体驱动。

### 3. 到点动作:导入自动化蓝图(推荐)

结束动作交给 HA 执行,页面关闭也能可靠触发。仓库内置了官方**自动化蓝图**,导入时只需选两项:

- **倒计时 Timer 实体**:与卡片 `timer_entity` 填写一致的那个 Timer 辅助元素
- **结束动作目标实体**:到点要操作的实体(如灯光);可再选动作 关闭/开启/切换(默认关闭)

一键导入(会跳转到你的 Home Assistant):

[![在 Home Assistant 中导入此蓝图](https://my.home-assistant.io/badges/blueprint_import.svg)](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https://github.com/xhyyd2022/ha-timer-se-card/raw/main/blueprints/automation/ha-timer-se-card/finish-action.yaml)

或手动导入:HA → 设置 → 自动化与场景 → 右下角「导入蓝图」,粘贴下面的链接(源码文件 `blueprints/automation/ha-timer-se-card/finish-action.yaml`):

```
https://raw.githubusercontent.com/xhyyd2022/ha-timer-se-card/main/blueprints/automation/ha-timer-se-card/finish-action.yaml
```

<details>
<summary>不想用蓝图?也可以手动建一条 automation(等价模板)</summary>

```yaml
alias: Timer SE Card 倒计时结束动作
description: 监听卡片所用 Timer 到点后执行结束动作
triggers:
  - trigger: timer.finished
    entity_id: timer.bedroom_fan   # ← 改成你的 Timer 辅助实体(与卡片 timer_entity 一致)
actions:
  - action: homeassistant.turn_off   # 想换"开启/切换"则改成 turn_on/toggle
    target:
      entity_id: light.bedroom       # ← 改成到点要操作的实体
mode: single
```

在 HA → 设置 → 自动化与场景 → 创建自动化 → 右上角「…」→ 编辑为 YAML(或直接 Ctrl+V 粘贴)中导入即可。
</details>

> timer 模式下卡片本身**不再重复执行** `entity/action/actions`(否则会和 automation 双重触发)。
> 若 `timer_entity` 指向的实体不存在,卡片会提示并退回纯前端计时以便排查。

### 4. 已知边界

- HA 服务端到点时,页面若正好开着,卡片会把「结束动作」留给 automation,自己只更新显示;
- HA 关机期间倒计时到点,重启后不会补触发(Home Assistant Timer 官方限制);
- 暂停后的恢复 = 再调一次 `timer.start`(不传新时长即从剩余继续),卡片已自动处理。

## 交互说明

- **拖动滑块**:在 `slider_max` 范围内拖动设定时间(单位由 `slider_unit` 决定),拖动即生效
- **预设按钮**:点击立即跳转到该时间并(默认)开始倒计时
- **输入框**:输入 `5`/`30s`/`1h 30m` 等直接设置时间
- **控制按钮**:开始 / 暂停 / 继续;倒计时被取消后可点播放重新开始
- **方形进度块**:按剩余比例点亮(可显示百分比),`countdown_display` 可切换 数字/方块/两者
- **倒计时结束**:自动触发配置的实体(开启/关闭),或触发后端事件供自动化使用

## 状态持久化

卡片会把倒计时状态保存在浏览器 `localStorage` 中,刷新页面后自动恢复;
倒计时回到页面后会继续走到零,并在**真正归零**的那一刻触发结束动作。

如果倒计时在页面/浏览器关闭期间已经过期,重新打开时**不会补触发**任何动作,
而是直接回到待机——避免在你已经手动操作过设备之后,又被自动关闭。
（已触发过的结束动作会保留“时间到”展示,但不会重复执行。）

**设备被手动操作时自动取消**:倒计时运行或暂停期间,如果绑定的实体被外部操作
(开关状态翻转,例如你手动开了/关了设备),卡片会自动取消本次倒计时,不再执行结束动作;
页面关闭期间的操作也能通过 `last_changed` 时间戳识别。瞬态状态
(`unavailable`/`unknown`)不会误触发取消。

## 开发

```bash
npm run build   # 将 src/timer-se-card.ts 打包到 dist/ha-timer-se-card.js
```

## 支持

如果卡片对你有帮助,欢迎 Star 或提出 Issue。

## License

本项目是 [ha-simple-timer](https://github.com/ArikShemesh/ha-simple-timer)
(Arik Shemesh) 的派生作品,卡片布局参考并精简自其 timer-card.ts。

本程序基于 **GNU General Public License v3.0 (GPLv3)** 发布,与上游项目保持相同的开源许可。
完整许可文本见 [LICENSE](./LICENSE)。
