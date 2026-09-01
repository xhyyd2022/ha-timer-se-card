// timer-se-card.ts
// Timer SE Card - 纯前端倒计时定时器卡片(通用实体触发)
//
// 本项目是 ha-simple-timer (https://github.com/ArikShemesh/ha-simple-timer)
// 的派生作品,原作者: Arik Shemesh <ninelive@gmail.com>。
// 卡片布局(倒计时显示 + 进度块条 + 滑块拖动 + 预设按钮)参考并精简自其 timer-card.ts。
//
// 相对上游的主要精简:
//   - 移除对 simple_timer 集成的依赖(不再调用 start_timer/cancel_timer 等服务)
//   - 实体改为通用实体:倒计时结束时仅触发配置的实体(切换/开启/关闭或自定义动作)
//   - 删除冗余功能:每日运行时长(daily usage)、定时面板(schedule)、看门狗(watchdog)、
//     独立电源按钮、服务器时间同步、长按重置等
//   - 仅保留:倒计时显示、进度块条、滑块拖动、预设按钮、输入框与控制按钮
//
// 许可: GPL-3.0-only(与上游一致)

import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./timer-card-editor"; // 注册 timer-se-card-editor(预设 chips + 文本输入)

// 最小 HomeAssistant 接口(自定义卡片常用写法,避免依赖前端内部类型)
interface HAState {
  entity_id: string;
  state: string;
  attributes: { [key: string]: any; friendly_name?: string };
}
interface HomeAssistant {
  states: { [entityId: string]: HAState };
  themes?: { darkMode?: boolean; theme?: string };
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>
  ): Promise<void>;
  connection?: {
    sendMessagePromise<T = unknown>(msg: Record<string, unknown>): Promise<T>;
  };
}

const CARD_VERSION = "1.5.0";
const TOTAL_BLOCKS = 16; // 进度块条分段数
const DEFAULT_MAX_MINUTES = 120; // 与上游一致
const DEFAULT_PRESETS = [15, 30, 60]; // 默认预设(3 个时间,参考上游)

interface TimerButton {
  value: number; // 分钟(或秒)
  label: string;
  unit: string; // "min" | "sec" | "hr"
}

interface TimerSeCardConfig {
  type?: string;
  entity?: string;
  action?: string; // "toggle" | "on" | "off" | 自定义 service 对象
  actions?: Array<{ service: string; target?: Record<string, unknown>; data?: Record<string, unknown> }>;
  card_title?: string; // 卡片标题(与上游一致)
  presets?: (number | string | { minutes?: number; seconds?: number; label?: string })[];
  slider_max?: number; // 滑块最大值(上游默认 120)
  slider_unit?: string; // "min" | "sec" | "hr"(上游默认 min)
  countdown_display?: string; // "countdown" | "progress" | "both"(上游默认 countdown)
  hide_slider?: boolean; // 隐藏滑块
  show_manual_input?: boolean; // 是否显示底部手动设置时间输入行(默认 false)
  autostart?: boolean;
  color?: string;
  event_type?: string; // 倒计时结束后向 HA 后端触发的事件类型(供自动化监听)
  event_data?: Record<string, unknown>; // 事件附带数据
  [key: string]: unknown;
}

console.info(
  `%c TIMER-SE-CARD %c v${CARD_VERSION} `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray",
);

function pad2(n: number): string {
  return n < 10 ? "0" + n : String(n);
}

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

// 解析时间字符串:"5"(分钟)、"30s"、"1h"、"1d"、"1h 30m"、"1小时30分"
function parseDuration(str: string): number | null {
  const s = str.trim();
  if (!s) return null;
  const tokens = s.split(/\s+/);
  let total = 0;
  for (const token of tokens) {
    if (!token) continue;
    const m = token.match(/^(\d+(?:\.\d+)?)\s*(小时|分钟|秒|[hms时分])?$/);
    if (!m) return null;
    const num = parseFloat(m[1]);
    const unit = m[2] || "m";
    switch (unit) {
      case "h":
      case "时":
      case "小时":
        total += num * 3600;
        break;
      case "m":
      case "分":
      case "分钟":
        total += num * 60;
        break;
      case "s":
      case "秒":
        total += num;
        break;
      default:
        return null;
    }
  }
  return Math.max(0, Math.round(total));
}

type PresetInput = number | string | { minutes?: number; seconds?: number; label?: string };

function normalizePreset(p: PresetInput): TimerButton | null {
  let value: number;
  let label: string;
  let unit = "min";
  if (typeof p === "number") {
    value = p;
    label = p + "分";
  } else if (typeof p === "string") {
    const secs = parseDuration(p);
    if (secs === null) return null;
    // 带单位字符串统一换算为秒,点击时不再重复换算
    value = secs;
    unit = "sec";
    label = p;
  } else if (p && typeof p === "object") {
    if (typeof p.minutes === "number") {
      value = p.minutes;
      label = p.label || p.minutes + "分";
    } else if (typeof p.seconds === "number") {
      value = p.seconds;
      label = p.label || p.seconds + "秒";
      unit = "sec";
    } else {
      return null;
    }
  } else {
    return null;
  }
  return { value, label, unit };
}

// 根据实体域生成默认结束动作
function defaultActionFor(entity: string, mode: string) {
  const domain = entity.split(".")[0];
  const m = mode || "toggle";
  switch (domain) {
    case "button":
      return { service: "button.press", target: { entity_id: entity } };
    case "script":
      return { service: "script.turn_on", target: { entity_id: entity } };
    case "scene":
      return { service: "scene.turn_on", target: { entity_id: entity } };
    default: {
      const service = m === "on" ? "turn_on" : m === "off" ? "turn_off" : "toggle";
      return { service: `homeassistant.${service}`, target: { entity_id: entity } };
    }
  }
}

@customElement("timer-se-card")
export class TimerSeCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config: TimerSeCardConfig = {};
  @state() private _sliderValue = 0;
  @state() private _timeRemaining: string | null = null;
  @state() private _state: "idle" | "running" | "paused" | "finished" = "idle";
  @state() private _totalSeconds = 0;

  private _remainingSeconds = 0;
  private _endAt = 0;
  private _firedAt: number | null = null;
  private _pendingFire = false; // hass 未就绪时待补触发的动作
  private _countdownInterval: ReturnType<typeof setInterval> | null = null;
  private _storageKey = "timer-se-card:default";
  private _valid = false;
  private _presets: TimerButton[] = [];

  static get version() {
    return CARD_VERSION;
  }

  static getStubConfig(): TimerSeCardConfig {
    return {
      entity: "",
      card_title: "定时器",
      action: "toggle",
      timer_buttons: [...DEFAULT_PRESETS],
      slider_max: DEFAULT_MAX_MINUTES,
      slider_unit: "min",
      countdown_display: "countdown",
      autostart: true,
    };
  }

  // 图形化编辑器(参考上游:预设用 chips + 文本输入框)
  static getConfigElement() {
    return document.createElement("timer-se-card-editor");
  }

  static getConfigForm() {
    return {
      schema: [
        { name: "card_title", selector: { text: {} } },
        {
          name: "entity",
          required: true,
          selector: {
            entity: {},
          },
        },
        {
          name: "action",
          selector: {
            select: {
              options: [
                { value: "toggle", label: "切换(toggle):开↔关" },
                { value: "on", label: "开启(turn_on)" },
                { value: "off", label: "关闭(turn_off)" },
              ],
              mode: "dropdown",
            },
          },
        },
        {
          name: "countdown_display",
          selector: {
            select: {
              options: [
                { value: "countdown", label: "仅倒计时" },
                { value: "progress", label: "仅方形进度块" },
                { value: "both", label: "倒计时 + 方形进度块" },
              ],
              mode: "dropdown",
            },
          },
        },
        {
          type: "grid",
          name: "",
          schema: [
            {
              name: "slider_max",
              selector: { number: { min: 1, max: 9999, step: 1, mode: "box" } },
            },
            {
              name: "slider_unit",
              selector: {
                select: {
                  options: [
                    { value: "sec", label: "秒(s)" },
                    { value: "min", label: "分钟(m)" },
                    { value: "hr", label: "小时(h)" },
                  ],
                  mode: "dropdown",
                },
              },
            },
          ],
        },
        {
          name: "presets",
          selector: {
            object: {
              multiple: true,
              label_field: "minutes",
              fields: {
                minutes: { label: "分钟", selector: { number: { min: 1, max: 9999 } } },
              },
            },
          },
        },
        {
          type: "expandable",
          name: "",
          title: "高级选项",
          schema: [
          { name: "hide_slider", selector: { boolean: {} } },
          { name: "autostart", selector: { boolean: {} } },
            { name: "color", selector: { text: {} } },
            { name: "event_type", selector: { text: {} } },
            {
              name: "event_data",
              selector: {
                object: {},
              },
            },
            {
              name: "actions",
              selector: {
                object: {
                  multiple: true,
                  label_field: "service",
                  fields: {
                    service: { label: "服务", selector: { text: {} } },
                    target: { label: "目标", selector: { object: {} } },
                    data: { label: "数据", selector: { object: {} } },
                  },
                },
              },
            },
          ],
        },
      ],
      computeLabel: (schema: any) => {
        switch (schema.name) {
          case "card_title":
            return "卡片标题";
          case "entity":
            return "倒计时结束后触发的实体";
          case "action":
            return "倒计时结束后的动作";
          case "countdown_display":
            return "时间显示方式";
          case "slider_max":
            return "滑块最大值";
          case "slider_unit":
            return "滑块单位";
          case "presets":
            return "预设时间";
          case "hide_slider":
            return "隐藏滑块";
          case "autostart":
            return "点击预设后立即开始";
          case "color":
            return "主题色(如 #ff8f00)";
          case "event_type":
            return "结束事件类型(可选)";
          case "event_data":
            return "结束事件数据(可选)";
          case "actions":
            return "自定义结束动作";
          default:
            return undefined;
        }
      },
      computeHelper: (schema: any) => {
        switch (schema.name) {
          case "entity":
            return "时间到后自动触发该实体(任意类型,不限制设备)";
          case "action":
            return "切换=开↔关互换,也可固定为开启或关闭;按钮/脚本/场景类实体仍按各自动作触发";
          case "countdown_display":
            return "选择倒计时数字、方形进度块或两者同时显示";
          case "slider_max":
            return "拖动滑块可在该范围内设置时间";
          case "slider_unit":
            return "滑块数值的单位(秒/分钟/小时)";
          case "presets":
            return "在编辑器中用 chips 添加预设:纯数字为分钟,支持 30s、1h 等单位";
          case "hide_slider":
            return "隐藏滑块,只用预设按钮和输入框设置时间";
          case "actions":
            return "填写后优先于实体的自动动作,例如 service 填 button.press";
          case "color":
            return "留空则跟随 HA 主题";
          case "event_type":
            return "倒计时结束后向 HA 后端触发该事件(如 timer_finished),自动化可用 event trigger 监听";
          case "event_data":
            return "事件附带数据,例如 { \"timer_id\": \"123456\" }";
          default:
            return undefined;
        }
      },
    };
  }

  setConfig(config: TimerSeCardConfig): void {
    const merged: TimerSeCardConfig = {
      entity: undefined,
      action: "toggle",
      presets: [...DEFAULT_PRESETS],
      slider_max: DEFAULT_MAX_MINUTES,
      slider_unit: "min",
      countdown_display: "countdown",
      hide_slider: false,
      show_manual_input: false,
      autostart: true,
      color: undefined,
      ...config,
    };

    if (typeof merged.action === "string") {
      merged.action = merged.action.toLowerCase();
      if (!["toggle", "on", "off"].includes(merged.action)) {
        merged.action = "toggle";
      }
    }
    if (!(merged.slider_max! > 0)) merged.slider_max = DEFAULT_MAX_MINUTES;
    if (!["sec", "min", "hr"].includes(merged.slider_unit || "")) {
      merged.slider_unit = "min";
    }
    if (!["countdown", "progress", "both"].includes(merged.countdown_display || "")) {
      merged.countdown_display = "countdown";
    }

    // 预设来源:timer_buttons(编辑器写此字段,支持数字分钟/带单位字符串)
    // 向后兼容 presets
    const buttons = merged.timer_buttons ?? merged.presets ?? DEFAULT_PRESETS;
    this._presets = (Array.isArray(buttons) ? buttons : DEFAULT_PRESETS)
      .map(normalizePreset)
      .filter((b): b is TimerButton => b !== null);

    this._config = merged;
    this._valid = !!(
      merged.entity ||
      (Array.isArray(merged.actions) && merged.actions.length) ||
      (merged.action && typeof merged.action === "object" && (merged.action as any).service) ||
      (typeof merged.event_type === "string" && merged.event_type.length > 0)
    );
    this._storageKey = "timer-se-card:" + (merged.entity || "default");

    this._restoreState();
    // 恢复运行中的倒计时后启动计时器(connectedCallback 早于 setConfig,不会启动)
    if (this._state === "running") {
      this._startCountdown();
    } else if (this._state === "finished" && !this._firedAt) {
      // 页面关闭期间倒计时已结束且动作未触发,补触发一次(hass 未就绪则待 hass 到达)
      this._firedAt = Date.now();
      if (this._hass) {
        this._fireActions();
      } else {
        this._pendingFire = true;
      }
      this._saveState();
    }
    this.requestUpdate();
  }

  // 主动应用主题变量,避免编辑预览等场景下卡片全黑
  private _applyTheme(): void {
    const hass = this.hass;
    if (!hass) return;
    try {
      if (typeof (hass as any).applyThemesOnElement === "function") {
        (hass as any).applyThemesOnElement(this, hass.themes, (this._config as any).theme);
        return;
      }
    } catch (e) {
      /* ignore */
    }
    if (hass.themes && hass.themes.darkMode) {
      this.setAttribute("data-theme", "dark");
    } else {
      this.removeAttribute("data-theme");
    }
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>): void {
    if (changedProperties.has("hass")) {
      this._applyTheme();
      // hass 就绪后补触发恢复时未执行的动作
      if (this._pendingFire && this.hass) {
        this._pendingFire = false;
        this._fireActions();
      }
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._applyTheme();
    this._startCountdown();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopCountdown();
    this._saveState();
  }

  getCardSize(): number {
    return 6;
  }

  getGridOptions() {
    return {
      columns: 12,
      rows: 4,
    };
  }

  /* ---------------- state ---------------- */

  private _restoreState(): void {
    let saved: any = null;
    try {
      const raw = localStorage.getItem(this._storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch (e) {
      saved = null;
    }
    if (!saved) return;

    const now = Date.now();
    if (saved.state === "running" && typeof saved.endAt === "number") {
      if (saved.endAt > now) {
        this._state = "running";
        this._remainingSeconds = (saved.endAt - now) / 1000;
        this._totalSeconds = typeof saved.total === "number" ? saved.total : this._remainingSeconds;
        this._endAt = saved.endAt;
        this._firedAt = saved.firedAt || null;
      } else {
        // 页面关闭期间倒计时已结束
        this._state = "finished";
        this._remainingSeconds = 0;
        this._totalSeconds = typeof saved.total === "number" ? saved.total : 0;
        this._firedAt = saved.firedAt || null;
      }
    } else if (saved.state === "paused") {
      this._state = "paused";
      this._remainingSeconds = typeof saved.remaining === "number" ? saved.remaining : 0;
      this._totalSeconds = typeof saved.total === "number" ? saved.total : this._remainingSeconds;
    } else if (saved.state === "idle" || saved.state === "finished") {
      this._state = saved.state;
      this._remainingSeconds = typeof saved.remaining === "number" ? saved.remaining : 0;
      this._totalSeconds = typeof saved.total === "number" ? saved.total : this._remainingSeconds;
    }
    if (typeof saved.sliderValue === "number") {
      const maxValue = (this._config.slider_max as number) || DEFAULT_MAX_MINUTES;
      this._sliderValue = Math.min(saved.sliderValue, maxValue);
    }
  }

  private _saveState(): void {
    const data = {
      state: this._state,
      remaining: Math.round(this._remainingSeconds),
      total: this._totalSeconds,
      endAt: this._endAt,
      firedAt: this._firedAt,
      sliderValue: this._sliderValue,
    };
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(data));
    } catch (e) {
      /* ignore */
    }
  }

  private _setTime(seconds: number): void {
    this._stopCountdown();
    this._remainingSeconds = Math.max(0, seconds);
    this._totalSeconds = this._remainingSeconds;
    this._endAt = 0;
    this._state = "idle";
    this._firedAt = null;
    this._saveState();
    if (this._config.autostart && this._remainingSeconds > 0) {
      this._start();
    } else {
      this._updateRender();
    }
  }

  private _start(): void {
    if (this._remainingSeconds <= 0) return;
    this._state = "running";
    this._endAt = Date.now() + this._remainingSeconds * 1000;
    this._startCountdown();
    this._saveState();
  }

  private _pause(): void {
    if (this._state !== "running") return;
    this._stopCountdown();
    this._state = "paused";
    this._endAt = 0;
    this._saveState();
    this._updateRender();
  }

  private _resume(): void {
    if (this._state !== "paused" || this._remainingSeconds <= 0) return;
    this._start();
  }

  private _reset(): void {
    this._stopCountdown();
    this._state = "idle";
    this._remainingSeconds = 0;
    this._totalSeconds = 0;
    this._endAt = 0;
    this._firedAt = null;
    this._saveState();
    this._updateRender();
  }

  private _toggle(): void {
    switch (this._state) {
      case "running":
        this._pause();
        break;
      case "paused":
        this._resume();
        break;
      case "finished":
        this._reset();
        break;
      default:
        if (this._remainingSeconds > 0) this._start();
        break;
    }
  }

  private _tick(): void {
    this._remainingSeconds = Math.max(0, (this._endAt - Date.now()) / 1000);
    if (this._remainingSeconds <= 0) {
      this._finish();
      return;
    }
    this._updateRender();
  }

  private _finish(): void {
    this._stopCountdown();
    this._state = "finished";
    this._remainingSeconds = 0;
    this._endAt = 0;
    if (!this._firedAt) {
      this._firedAt = Date.now();
      this._fireActions();
    }
    this._saveState();
    this._updateRender();
  }

  private _startCountdown(): void {
    this._stopCountdown();
    if (this._state !== "running") return;
    this._countdownInterval = setInterval(() => this._tick(), 500);
    this._tick();
  }

  private _stopCountdown(): void {
    if (this._countdownInterval) {
      clearInterval(this._countdownInterval);
      this._countdownInterval = null;
    }
  }

  /* ---------------- input ---------------- */

  // 单位换算(与上游一致:滑块数值 × 单位 → 秒)
  private _unitToSeconds(unit: string, value: number): number {
    switch (unit) {
      case "sec":
        return value;
      case "hr":
        return value * 3600;
      case "min":
      default:
        return value * 60;
    }
  }

  // 秒 → 滑块单位值(向上取整,保证剩余非零时滑块不为 0)
  private _secondsToUnit(unit: string, seconds: number): number {
    const perUnit = this._unitToSeconds(unit, 1);
    return perUnit > 0 ? Math.ceil(seconds / perUnit) : 0;
  }

  private _setFromInput(): void {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>(".tse-input");
    if (!input) return;
    const seconds = parseDuration(input.value);
    if (seconds === null || seconds <= 0) {
      input.classList.add("is-invalid");
      setTimeout(() => input.classList.remove("is-invalid"), 800);
      return;
    }
    input.classList.remove("is-invalid");
    this._setTime(seconds);
  }

  private _handleSliderChange(event: Event): void {
    const slider = event.target as HTMLInputElement;
    this._sliderValue = parseInt(slider.value, 10) || 0;
    const unit = (this._config.slider_unit as string) || "min";
    this._setTime(this._unitToSeconds(unit, this._sliderValue));
  }

  /* ---------------- actions ---------------- */

  private _resolveActions(): Array<{ service: string; target?: Record<string, unknown>; data?: Record<string, unknown> }> {
    const config = this._config;
    if (Array.isArray(config.actions) && config.actions.length) {
      return config.actions.filter((a) => a && typeof a.service === "string");
    }
    if (config.action && typeof config.action === "object" && (config.action as any).service) {
      return [config.action as any];
    }
    if (config.entity) {
      let mode = typeof config.action === "string" ? config.action : "toggle";
      return [defaultActionFor(config.entity, mode)];
    }
    return [];
  }

  private _fireActions(): void {
    const actions = this._resolveActions();
    actions.forEach((a) => {
      const dot = a.service.indexOf(".");
      if (dot <= 0) {
        console.error("timer-se-card: 无效的 service " + a.service);
        return;
      }
      const domain = a.service.substring(0, dot);
      const service = a.service.substring(dot + 1);
      try {
        if (this.hass && typeof this.hass.callService === "function") {
          this.hass.callService(domain, service, a.data || {}, a.target || {});
        } else {
          console.warn("timer-se-card: hass 尚未就绪,跳过动作 " + a.service);
        }
      } catch (e) {
        console.error("timer-se-card: 调用 " + a.service + " 失败", e);
      }
    });

    // 可选:向 HA 后端触发事件,供自动化监听(如 event_type: timer_finished)
    const eventType = this._config.event_type;
    if (eventType && this.hass?.connection) {
      try {
        const p = this.hass.connection.sendMessagePromise({
          type: "fire_event",
          event_type: eventType,
          event_data: this._config.event_data || {},
        });
        if (p && typeof p.catch === "function") {
          p.catch((e: unknown) =>
            console.error("timer-se-card: 触发事件 " + eventType + " 失败", e)
          );
        }
      } catch (e) {
        console.error("timer-se-card: 触发事件 " + eventType + " 失败", e);
      }
    }

    this.dispatchEvent(
      new CustomEvent("timer-se-card-finished", {
        detail: { config: this._config, actions },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /* ---------------- visuals ---------------- */

  private _entityState() {
    const entity = this._config.entity;
    if (!entity || !this.hass || !this.hass.states) return null;
    return this.hass.states[entity] || null;
  }

  private _isEntityOn(): boolean {
    const entity = this._entityState();
    if (!entity) return false;
    return entity.state === "on" || entity.state === "open";
  }

  private _statusText(): string {
    switch (this._state) {
      case "running":
        return "倒计时中";
      case "paused":
        return "已暂停";
      case "finished":
        return "时间到!";
      default:
        return this._remainingSeconds > 0 ? formatTime(this._remainingSeconds) : "待机";
    }
  }

  private _activeBlocks(): number {
    if (this._state === "finished") return 0;
    if (this._totalSeconds <= 0) return 0;
    const ratio = Math.max(0, Math.min(1, this._remainingSeconds / this._totalSeconds));
    if (this._state === "running" || this._state === "paused") {
      return ratio > 0 ? Math.max(1, Math.ceil(ratio * TOTAL_BLOCKS)) : 0;
    }
    return Math.ceil(ratio * TOTAL_BLOCKS);
  }

  private _controlIcon(): string {
    switch (this._state) {
      case "running":
        return "mdi:pause";
      case "paused":
        return "mdi:play";
      case "finished":
        return "mdi:restart";
      default:
        return "mdi:play";
    }
  }

  private _updateRender(): void {
    this._timeRemaining = this._state === "finished" ? "00:00:00" : formatTime(this._remainingSeconds);
    // 倒计时运行时滑块跟随剩余时间递减,归零后滑块归零
    const unit = (this._config.slider_unit as string) || "min";
    const maxValue = (this._config.slider_max as number) || DEFAULT_MAX_MINUTES;
    if (this._state === "running" || this._state === "paused" || this._state === "idle") {
      this._sliderValue = Math.min(
        maxValue,
        this._secondsToUnit(unit, this._remainingSeconds)
      );
    } else if (this._state === "finished") {
      this._sliderValue = 0;
    }
    // 直接同步滑块 DOM 的 value,确保 thumb 位置实时跟随(不依赖渲染)
    const slider = this.shadowRoot?.querySelector<HTMLInputElement>(".tse-slider");
    if (slider && slider.value !== String(this._sliderValue)) {
      slider.value = String(this._sliderValue);
    }
    this.requestUpdate();
  }

  /* ---------------- render ---------------- */

  protected render() {
    if (!this._config) {
      return html``;
    }

    const config = this._config;
    const entity = this._entityState();
    const entityName = entity
      ? (entity.attributes.friendly_name as string) || config.entity
      : null;
    const headerTitle = config.card_title || entityName || "定时器";
    const isOn = this._isEntityOn();
    const isActive = this._state === "running";

    const timeText = this._state === "finished" ? "00:00:00" : formatTime(this._remainingSeconds);
    const activeBlocks = this._activeBlocks();
    // 剩余百分比(方形进度块上方/内部显示)
    const percent =
      this._totalSeconds > 0
        ? Math.round(
            Math.max(0, Math.min(1, this._remainingSeconds / this._totalSeconds)) * 100
          )
        : 0;

    const displayMode = (config.countdown_display as string) || "countdown";
    const showCountdown = displayMode !== "progress";
    const showProgress = displayMode !== "countdown";

    const blocks = Array.from({ length: TOTAL_BLOCKS }, (_, i) => {
      const on = i < activeBlocks;
      const lead = isActive && on && i === activeBlocks - 1;
      return html`<div class="tse-block ${on ? "is-on" : ""} ${lead ? "is-lead" : ""}"></div>`;
    });

    const presets = this._presets.map((p) => {
      const seconds = this._unitToSeconds(p.unit, p.value);
      const active =
        this._state === "running" &&
        this._totalSeconds > 0 &&
        Math.abs(this._totalSeconds - seconds) < 1.5;
      return html`<button class="tse-preset ${active ? "is-active" : ""}" @click=${() => this._setTime(seconds)}>${p.label}</button>`;
    });

    const unit = (config.slider_unit as string) || "min";
    const maxValue = (config.slider_max as number) || DEFAULT_MAX_MINUTES;
    const sliderVal = Math.min(this._sliderValue, maxValue);
    const fillPercent = maxValue > 0 ? Math.round((sliderVal / maxValue) * 100) : 0;
    const showSlider = !config.hide_slider;
    const showManualInput = config.show_manual_input === true;
    const showReset = this._state !== "idle" || this._totalSeconds > 0;

    const accentStyle = config.color
      ? `--tse-accent:${config.color}`
      : "";

    return html`
      <ha-card class="tse-card" style="${accentStyle}">
        <div class="tse-header">
          <span class="tse-title">${headerTitle}</span>
          ${entity
            ? html`<span class="tse-chip ${isOn ? "is-on" : "is-off"}" title="${config.entity}">${isOn ? "开" : "关"}</span>`
            : ""}
          <span class="tse-status">${this._statusText()}</span>
        </div>

        ${showCountdown
          ? html`<div class="tse-countdown ${isActive ? "is-active" : ""}">
              <div class="tse-time">${timeText}</div>
            </div>`
          : ""}

        ${showProgress
          ? html`<div class="tse-progress-section">
              <div class="tse-percent">${percent}%</div>
              <div class="tse-blocks">${blocks}</div>
            </div>`
          : ""}

        ${showSlider
          ? html`<div class="tse-slider-row">
              <input class="tse-slider" type="range" min="0" step="1" max="${maxValue}" value="${sliderVal}" style="--tse-fill:${fillPercent}%" @input=${this._handleSliderChange} />
              <div class="tse-slider-right">
                <div class="tse-control-btn ${isActive ? "is-active" : ""}" @click=${() => this._toggle()}>
                  <ha-icon icon="${this._controlIcon()}"></ha-icon>
                </div>
              </div>
            </div>`
          : ""}

        ${presets.length ? html`<div class="tse-presets">${presets}</div>` : ""}

        ${showManualInput
          ? html`<div class="tse-input-row">
              <input class="tse-input" type="text" placeholder="如 5 / 30s / 1h 30m" @keydown=${(e: KeyboardEvent) => e.key === "Enter" && this._setFromInput()} />
              <button class="tse-set-btn" @click=${() => this._setFromInput()}>设置</button>
              ${showReset ? html`<button class="tse-set-btn is-ghost" @click=${() => this._reset()}>重置</button>` : ""}
            </div>`
          : ""}
      </ha-card>
    `;
  }

  static styles = css`
    :host {
      display: block;
      /* 主题色:优先用户自定义 color,否则跟随 HA 主色(--primary-color,与上游一致) */
      --tse-accent: var(--primary-color);
    }
    .tse-card {
      font-family: var(--primary-font-family, "Roboto", sans-serif);
      color: var(--primary-text-color, #1c1c1e);
      background: var(--ha-card-background, var(--card-background-color, #fff));
      border-radius: var(--ha-card-border-radius, 12px);
      border: 1px solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
      box-shadow: var(--ha-card-box-shadow, none);
      padding: 14px 16px 16px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 12px;
      user-select: none;
      -webkit-user-select: none;
      width: 100%;
    }
    :host([data-theme="dark"]) .tse-card {
      background: var(--ha-card-background, var(--card-background-color, #1c1c1e));
      color: var(--primary-text-color, #e1e1e1);
      border-color: var(--ha-card-border-color, var(--divider-color, #3a3a3a));
    }
    .tse-header {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 20px;
    }
    .tse-title {
      font-family: "Roboto", sans-serif;
      font-weight: 500;
      font-size: 1.7rem;
      color: rgba(160, 160, 160, 0.7);
      text-align: left;
      margin: 0;
      padding: 0 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .tse-chip {
      font-size: 11px;
      line-height: 1;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 500;
      color: var(--text-primary-color, #fff);
    }
    .tse-chip.is-on {
      background: var(--success-color, #43a047);
    }
    .tse-chip.is-off {
      background: var(--disabled-text-color, #9e9e9e);
    }
    .tse-status {
      margin-left: auto;
      font-size: 12px;
      color: var(--secondary-text-color, #727272);
    }
    .tse-countdown {
      text-align: center;
    }
    .tse-time {
      font-size: clamp(1.8rem, 10vw, 3.5rem);
      font-weight: bold;
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
      min-height: 3.5rem;
      padding: 4px 44px;
      box-sizing: border-box;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--primary-text-color, #1c1c1e);
    }
    .tse-countdown.is-active .tse-time {
      color: var(--tse-accent);
    }
    .tse-progress-section {
      text-align: center;
    }
    .tse-percent {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--secondary-text-color, #727272);
      margin-bottom: 4px;
    }
    .tse-blocks {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 100%;
      max-width: 280px;
      margin: 0 auto;
      box-sizing: border-box;
      padding: 0 8px;
    }
    .tse-block {
      flex: 1 1 0;
      min-width: 0;
      height: 18px;
      border-radius: 4px;
      background-color: var(--divider-color, rgba(160, 160, 160, 0.25));
      opacity: 0.55;
      transition: background-color 0.4s linear, opacity 0.4s linear;
    }
    .tse-block.is-on {
      background-color: var(--tse-accent);
      opacity: 1;
    }
    .tse-block.is-lead {
      box-shadow: 0 0 12px var(--tse-accent);
    }
    .tse-slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      box-sizing: border-box;
    }
    .tse-slider {
      flex: 1;
      min-width: 100px;
      height: 16px;
      margin: 0;
      -webkit-appearance: none;
      appearance: none;
      /* 左侧已填充区:主题色固定减淡;右侧:灰色底 */
      background: linear-gradient(
        to right,
        color-mix(in srgb, var(--tse-accent) 30%, transparent) 0%,
        color-mix(in srgb, var(--tse-accent) 30%, transparent) var(--tse-fill, 0%),
        var(--secondary-background-color, rgba(128, 128, 128, 0.25)) var(--tse-fill, 0%),
        var(--secondary-background-color, rgba(128, 128, 128, 0.25)) 100%
      );
      border-radius: 20px;
      outline: none;
    }
    .tse-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--tse-accent);
      cursor: pointer;
      border: 2px solid var(--text-primary-color, #fff);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
      transition: transform 0.15s ease;
    }
    .tse-slider::-webkit-slider-thumb:hover {
      transform: scale(1.08);
    }
    .tse-slider::-moz-range-thumb {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: var(--tse-accent);
      cursor: pointer;
      border: 2px solid var(--text-primary-color, #fff);
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
    }
    .tse-slider-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .tse-control-btn {
      width: 50px;
      height: 38px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background-color: var(--secondary-background-color, rgba(128, 128, 128, 0.2));
      color: var(--tse-accent);
      --mdc-icon-size: 24px;
      transition: background-color 0.2s, box-shadow 0.2s;
      flex-shrink: 0;
    }
    .tse-control-btn:hover {
      box-shadow: 0 0 10px var(--tse-accent);
    }
    .tse-control-btn.is-active {
      box-shadow: 0 0 10px var(--tse-accent);
    }
    .tse-presets {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    .tse-preset {
      width: 80px;
      height: 38px;
      padding: 0;
      border: none;
      border-radius: 6px;
      background-color: var(--secondary-background-color, rgba(128, 128, 128, 0.2));
      color: var(--primary-text-color, #1c1c1e);
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      transition: background-color 0.2s, box-shadow 0.2s;
    }
    .tse-preset:hover {
      box-shadow: 0 0 8px var(--tse-accent);
    }
    .tse-preset.is-active {
      background-color: var(--tse-accent);
      color: var(--text-primary-color, #fff);
      box-shadow: 0 0 8px var(--tse-accent);
    }
    .tse-input-row {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
    }
    .tse-input {
      flex: 1;
      max-width: 180px;
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.4));
      border-radius: 8px;
      background: transparent;
      color: var(--primary-text-color, #1c1c1e);
      font-size: 14px;
      font-family: inherit;
      outline: none;
    }
    .tse-input:focus {
      border-color: var(--tse-accent);
    }
    .tse-input.is-invalid {
      border-color: var(--error-color, #db4437);
    }
    .tse-set-btn {
      height: 36px;
      padding: 0 16px;
      border: none;
      border-radius: 8px;
      background: var(--tse-accent);
      color: var(--text-primary-color, #fff);
      font-size: 14px;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .tse-set-btn:hover {
      opacity: 0.88;
    }
    .tse-set-btn.is-ghost {
      background: transparent;
      border: 1px solid var(--divider-color, rgba(128, 128, 128, 0.4));
      color: var(--primary-text-color, #1c1c1e);
    }
  `;
}

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }>;
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "timer-se-card")) {
  window.customCards.push({
    type: "timer-se-card",
    name: "Timer SE Card",
    description: "倒计时定时器卡片:滑块拖动/预设/输入设置时间,倒计时结束自动触发实体",
    preview: true,
    documentationURL: "https://github.com/xhyyd2022/ha-timer-se-card",
  });
}

