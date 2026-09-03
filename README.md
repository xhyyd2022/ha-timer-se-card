# Timer SE Card

一个为 Home Assistant 仪表盘(Lovelace)设计的**纯前端倒计时定时器卡片**。

- 🎚️ **滑块拖动**:在 `slider_max` 范围内拖动设定分钟数,拖动即生效
- ⌨️ **直接输入时间**:单个输入框,支持 `5`(分钟)/`30s`/`1h 30m` 等格式
- ⏰ **预设时间一键跳转**:内置几个固定时间点,点击标签立刻跳转到对应时间并开始倒计时
- 🔔 **倒计时结束触发实体**:时间到后开启或关闭你指定的实体
- 🛑 **手动操作自动取消**:倒计时期间操作了设备开关,定时自动取消,不会到点误关
- ⚡ **可触发后端事件**:结束后向 HA 触发事件,可搭配自动化(Event 触发器)使用
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
