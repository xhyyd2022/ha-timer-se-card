# Timer SE Card

给 Home Assistant 仪表盘(Lovelace)用的**倒计时卡片**。

前端负责选择时长并显示倒计时;**计时交给 HA 的 Timer 辅助实体在服务端执行**(页面关闭也能准点到点),
到点后的结束动作(如关灯)由本仓库提供的**蓝图自动化**在 HA 端执行。

整套只需要做两件事:**① 导入卡片 ② 用蓝图创建一条自动化**。

---

## 一、导入卡片

### 方式 A:HACS

1. HACS →「…」→ **自定义存储库**:
   - 存储库:`https://github.com/xhyyd2022/ha-timer-se-card`
   - 类别:**Dashboard / Lovelace 前端插件**
2. 点击 **下载**,刷新页面。

### 方式 B:手动

把 `dist/ha-timer-se-card.js` 放到 `<config>/www/` 下,并在仪表盘资源中新增:

```yaml
url: /local/ha-timer-se-card.js
type: module
```

### 添加卡片并配置

仪表盘 → 添加卡片 → 搜索 **Timer SE Card**,填入:

```yaml
type: custom:timer-se-card
card_title: 睡前关灯
timer_entity: timer.bedroom_fan   # 你的 Timer 辅助实体(需先创建,见下)
automation: automation.sleep_light_off   # 可选:蓝图创建的那条自动化(仅关联显示)
presets:
  - 15
  - 30
  - 60
```

> `automation` 为**可选关联项**:把它填成由下方蓝图创建、监听这个 `timer_entity` 的那条自动化,
> 卡片顶部会显示其名称并在找不到时提示——执行仍完全由该自动化完成,卡片只负责把时间参数传给 Timer。

---

## 二、用蓝图创建"结束动作"自动化

### 第 0 步:创建 Timer 辅助元素

HA → 设置 → 设备与服务 → 辅助元素 → **创建辅助元素 → 计时器**,
命名(如 `bedroom_fan`),勾选**恢复**。之后会得到 `timer.bedroom_fan`。

> 蓝图、卡片都用**同一个** `timer.xxx`,靠它把两者关联起来。

### 第 1 步:导入蓝图

1. HA → **设置 → 自动化与场景**;
2. 右下角 **「导入蓝图」**,粘贴地址并**导入**:

```
https://raw.githubusercontent.com/xhyyd2022/ha-timer-se-card/main/blueprints/automation/ha-timer-se-card/finish-action.yaml
```

> **备用加速地址**(当上方地址无法访问时使用,两处导入内容相同):
>
> ```
> https://gh.jasonzeng.dev/https://raw.githubusercontent.com/xhyyd2022/ha-timer-se-card/main/blueprints/automation/ha-timer-se-card/finish-action.yaml
> ```

### 第 2 步:创建自动化

1. 点击 **「创建自动化」**,选择刚导入的 **Timer SE Card:倒计时结束动作**;
2. 填写两项输入:
   - **倒计时 Timer 实体**:选 `timer.bedroom_fan`(与卡片 `timer_entity` 一致);
   - **结束动作目标实体**:选到点要操作的实体(如灯);
   - 「结束动作」默认**关闭**,可改 开启/切换;
3. 保存。

此后:在卡片上设置时长并开始 → 卡片把时间参数传给 `timer.start` → HA 服务端倒数 →
到点时这条自动化(它监听着同一个 `timer.xxx`)自动执行结束动作,页面/浏览器关掉同样生效;
前端只负责显示倒计时和传入时间参数,执行完全由自动化完成。

---

## License

本项目是 [ha-simple-timer](https://github.com/ArikShemesh/ha-simple-timer)
(Arik Shemesh) 的派生作品,卡片布局参考并精简自其 timer-card.ts。

本程序基于 **GNU General Public License v3.0 (GPLv3)** 发布,与上游项目保持相同的开源许可。
完整许可文本见 [LICENSE](./LICENSE)。
