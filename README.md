# Timer SE Card

一个为 Home Assistant 仪表盘(Lovelace)设计的**圆形旋转倒计时定时器卡片**。

- 🎡 **圆形旋转表盘**:在最大时间范围内拖动圆环即可设定时间,松手自动开始倒计时
- ⌨️ **直接输入时间**:单个输入框,支持 `5`(分钟)/`30s`/`1h 30m` 等格式
- ⏰ **预设时间一键跳转**:内置几个固定时间点,点击标签立刻跳转到对应时间并开始倒计时
- 🔔 **倒计时结束触发实体**:时间到后自动按下你指定的按钮/开关/灯等实体
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
entity: button.fan_toggle        # 必填:倒计时结束后要触发的实体(按钮/开关/灯/脚本等)
action: toggle                   # 可选:倒计时结束后的动作,默认 toggle
                                 #   toggle = 反转(开↔关) / on = 开启 / off = 关闭
name: 睡前关风扇                  # 可选:卡片标题
presets:                         # 可选:预设时间(仅填分钟数,标签自动生成)
  - 5
  - 10
  - 30
  - 60
max_minutes: 60                  # 可选:表盘最大可旋转时间(分钟),默认 60
autostart: true                  # 可选:点击预设后是否立即开始,默认 true
color: "#ff8f00"                 # 可选:主题色,默认跟随 HA 主题
```

> 卡片尺寸由 HA 仪表盘网格自动控制(默认 6×6),无需手动配置。`presets` 也支持
> `{ minutes: 5 }` 或 `{ label: "5分", minutes: 5 }` 的写法(向后兼容)。

### 直接输入时间

卡片中部有一个输入框,可直接输入时间并回车(或点「设置」)开始倒计时:

- 无后缀的数字默认是**分钟**:`5` → 5 分钟
- 支持 `s` / `m` / `h` 后缀(也支持中文 秒/分/时):`30s`、`1h`
- 可用空格分隔组合: `1h 30m` → 90 分钟、`1小时30分`

### 结束动作(actions)

`action` 支持三种模式,通过图形化编辑器下拉或 YAML 配置:

| `action` 值  | 含义               | 执行的服务              |
| ------------ | ------------------ | ----------------------- |
| `toggle`(默认) | 反转(开↔关)       | `homeassistant.toggle`  |
| `on`         | 开启               | `homeassistant.turn_on` |
| `off`        | 关闭               | `homeassistant.turn_off`|

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

- **拖动圆环**:顺时针增加时间,逆时针减少;在 `max_minutes` 范围内
- **点击预设标签**:立即跳转到该时间并(默认)开始倒计时
- **输入框**:输入 `5`/`30s`/`1h 30m` 等直接设置时间
- **点击圆心**:开始 / 暂停 / 继续 / 重置
- **倒计时结束**:圆环闪烁提示,并自动触发配置的实体

## 状态持久化

卡片会把倒计时状态保存在浏览器 `localStorage` 中,刷新页面后自动恢复;
如果倒计时在页面关闭期间结束,重新打开时会把未触发的动作补触发一次。

## 开发

```bash
npm run build   # 将 src/timer-se-card.js 打包到 dist/ha-timer-se-card.js
```

## 支持

如果卡片对你有帮助,欢迎 Star 或提出 Issue。

## License

MIT
