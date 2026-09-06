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
presets:
  - 15
  - 30
  - 60
```

> 一个 Timer 实体同时只能跑一个倒计时,一张卡片对应一个即可。

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

### 第 2 步:创建自动化

1. 点击 **「创建自动化」**,选择刚导入的 **Timer SE Card:倒计时结束动作**;
2. 填写两项输入:
   - **倒计时 Timer 实体**:选 `timer.bedroom_fan`(与卡片 `timer_entity` 一致);
   - **结束动作目标实体**:选到点要操作的实体(如灯);
   - 「结束动作」默认**关闭**,可改 开启/切换;
3. 保存。

此后:在卡片上设置时长并开始 → HA 服务端倒数 → 到点时该自动化自动执行结束动作(页面/浏览器关掉同样生效);
卡片只负责显示倒计时和把时间参数传给 `timer.start`,不需要也无法再触发它——关联靠同一个 `timer.xxx` 自动完成。
