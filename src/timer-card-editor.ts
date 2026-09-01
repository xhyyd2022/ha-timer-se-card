// timer-card-editor.ts
// Timer SE Card 配置编辑器(参考上游 ha-simple-timer 的 timer-card-editor.ts 精简)
//
// 预设时间输入方式与上游一致:chips 标签展示 + 自由文本输入框 + ADD 按钮,
// 支持秒(s)/分钟(m)/小时(h)/天(d),纯数字默认为分钟,可删除、去重、排序。

import { LitElement, html, css } from "lit";
import { property, state } from "lit/decorators.js";

const DEFAULT_PRESETS = [15, 30, 60, 90, 120, 150];

interface TimerSeCardConfig {
  type?: string;
  entity?: string;
  action?: string;
  actions?: Array<{ service: string; target?: Record<string, unknown>; data?: Record<string, unknown> }>;
  card_title?: string;
  timer_buttons?: (number | string)[];
  slider_max?: number;
  slider_unit?: string;
  countdown_display?: string;
  hide_slider?: boolean;
  reverse_mode?: boolean;
  autostart?: boolean;
  color?: string;
  event_type?: string;
  event_data?: Record<string, unknown>;
  [key: string]: unknown;
}

// 校验并规范化预设值(与上游 _getValidatedTimerButtons 一致):
// 纯数字 -> number(分钟);带单位 -> string,如 "30s"、"1.5h"、"1d"
function validateTimerButton(val: string): number | string | null {
  const strVal = String(val).trim().toLowerCase();
  const match = strVal.match(/^(\d+(?:\.\d+)?)\s*(s|sec|seconds|m|min|minutes|h|hr|hours|d|day|days)?$/);
  if (!match) return null;
  const numVal = parseFloat(match[1]);
  if (numVal <= 0 || numVal > 9999) return null;
  const unitStr = match[2] || "";
  if (!unitStr) return numVal; // 纯数字 -> 分钟
  const unitMap: Record<string, string> = {
    s: "s", sec: "s", seconds: "s",
    m: "m", min: "m", minutes: "m",
    h: "h", hr: "h", hours: "h",
    d: "d", day: "d", days: "d",
  };
  return numVal + unitMap[unitStr];
}

export class TimerCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config: TimerSeCardConfig = {};
  @state() private _newTimerButtonValue = "";

  static get styles() {
    return css`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 4px 0;
        font-family: var(--primary-font-family, "Roboto", sans-serif);
      }
      .config-row {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .config-label {
        font-size: 12px;
        color: var(--secondary-text-color, #727272);
      }
      .chips-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .timer-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(128, 128, 128, 0.2));
        color: var(--primary-text-color, #1c1c1e);
        font-size: 13px;
      }
      .remove-chip {
        cursor: pointer;
        color: var(--secondary-text-color, #727272);
        font-size: 12px;
        line-height: 1;
      }
      .remove-chip:hover {
        color: var(--error-color, #db4437);
      }
      .add-timer-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .ht-field {
        flex: 1;
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
      .ht-field:focus {
        border-color: var(--primary-color, #03a9f4);
      }
      .add-btn {
        height: 36px;
        padding: 0 18px;
        border-radius: 8px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
        font-weight: 500;
        display: flex;
        align-items: center;
        cursor: pointer;
        user-select: none;
      }
      .helper-text {
        font-size: 0.8em;
        color: var(--secondary-text-color, #727272);
        margin-top: 2px;
      }
      .info-text {
        font-size: 0.85em;
        color: var(--warning-color, #f2b705);
        margin-top: 4px;
      }
    `;
  }

  setConfig(config: TimerSeCardConfig): void {
    this._config = { ...config };
  }

  private _updateConfig(updates: Partial<TimerSeCardConfig>): void {
    const updated = { ...this._config, ...updates };
    this._config = updated;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _computeLabel = (schema: any): string => {
    const labels: Record<string, string> = {
      card_title: "卡片标题",
      entity: "倒计时结束后触发的实体",
      action: "倒计时结束后的动作",
      countdown_display: "时间显示方式",
      slider_max: "滑块最大值",
      slider_unit: "滑块单位",
      hide_slider: "隐藏滑块",
      show_manual_input: "显示手动设置输入框",
      reverse_mode: "反转模式(延迟启动)",
      autostart: "点击预设后立即开始",
      color: "主题色(如 #ff8f00)",
      event_type: "结束事件类型(可选)",
      event_data: "结束事件数据(可选)",
      actions: "自定义结束动作",
    };
    return labels[schema.name] ?? "";
  };

  private _computeHelper = (schema: any): string => {
    const helpers: Record<string, string> = {
      entity: "时间到后自动触发该实体(任意类型,不限制设备)",
      action: "反转=切换开/关,也可固定为开启或关闭",
      countdown_display: "选择倒计时数字、方形进度块或两者同时显示",
      slider_max: "拖动滑块可在该范围内设置时间",
      slider_unit: "滑块数值的单位(秒/分钟/小时/天)",
      hide_slider: "隐藏滑块,只用预设按钮和输入框设置时间",
      show_manual_input: "显示底部的输入框与设置/重置按钮(手动输入时间)",
      reverse_mode: "反转模式:倒计时结束后开启实体(延迟启动),而不是关闭",
      event_type: "倒计时结束后向 HA 后端触发该事件(如 timer_finished),自动化可用 event trigger 监听",
      event_data: "事件附带数据,例如 { \"timer_id\": \"123456\" }",
      color: "留空则跟随 HA 主题",
    };
    return helpers[schema.name] ?? "";
  };

  private _mainSchema() {
    return [
      { name: "card_title", selector: { text: {} } },
      { name: "entity", required: true, selector: { entity: {} } },
      {
        name: "action",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "toggle", label: "反转(toggle):开↔关" },
              { value: "on", label: "开启(turn_on)" },
              { value: "off", label: "关闭(turn_off)" },
            ],
          },
        },
      },
      {
        name: "countdown_display",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "countdown", label: "仅倒计时" },
              { value: "progress", label: "仅方形进度条" },
              { value: "both", label: "倒计时 + 进度条" },
            ],
          },
        },
      },
      {
        type: "grid",
        name: "",
        schema: [
          { name: "slider_max", selector: { number: { min: 1, max: 9999, step: 1, mode: "box" } } },
          {
            name: "slider_unit",
            selector: {
              select: {
                mode: "dropdown",
                options: [
                  { value: "sec", label: "秒(s)" },
                  { value: "min", label: "分钟(m)" },
                  { value: "hr", label: "小时(h)" },
                  { value: "day", label: "天(d)" },
                ],
              },
            },
          },
        ],
      },
    ];
  }

  private _advancedSchema() {
    return [
      { name: "hide_slider", selector: { boolean: {} } },
      { name: "show_manual_input", selector: { boolean: {} } },
      { name: "reverse_mode", selector: { boolean: {} } },
      { name: "autostart", selector: { boolean: {} } },
      { name: "color", selector: { text: {} } },
      { name: "event_type", selector: { text: {} } },
      { name: "event_data", selector: { object: {} } },
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
    ];
  }

  private _handleNewTimerInput(e: Event): void {
    this._newTimerButtonValue = (e.target as HTMLInputElement).value;
  }

  private _addTimerButton(): void {
    const val = this._newTimerButtonValue.trim();
    if (!val) return;
    const validated = validateTimerButton(val);
    if (validated === null) {
      alert("无效的预设时间格式。示例:30s、10、1.5h、1d(纯数字为分钟)");
      return;
    }
    const current = Array.isArray(this._config.timer_buttons)
      ? [...this._config.timer_buttons]
      : [...DEFAULT_PRESETS];
    if (current.includes(validated)) {
      this._newTimerButtonValue = "";
      this.requestUpdate();
      return;
    }
    current.push(validated);
    // 排序:数字在前(升序),字符串在后(自然排序)
    const numbers = current.filter((b) => typeof b === "number") as number[];
    const strings = current.filter((b) => typeof b === "string") as string[];
    numbers.sort((a, b) => a - b);
    strings.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
    this._updateConfig({ timer_buttons: [...numbers, ...strings] });
    this._newTimerButtonValue = "";
  }

  private _removeTimerButton(value: number | string): void {
    const current = Array.isArray(this._config.timer_buttons)
      ? [...this._config.timer_buttons]
      : [];
    this._updateConfig({ timer_buttons: current.filter((b) => b !== value) });
  }

  private _formChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    const value = { ...(ev.detail?.value || {}) };
    this._updateConfig(value as Partial<TimerSeCardConfig>);
  }

  render() {
    const cfg = this._config || {};
    const buttons = Array.isArray(cfg.timer_buttons)
      ? cfg.timer_buttons
      : DEFAULT_PRESETS;

    return html`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${cfg}
          .schema=${this._mainSchema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="config-row">
          <div class="config-label">预设时间(Timer Presets)</div>
          <div class="chips-wrapper">
            ${buttons.map(
              (btn) => html`
                <div class="timer-chip">
                  <span>${typeof btn === "number" ? btn + "m" : btn}</span>
                  <span class="remove-chip" @click=${() => this._removeTimerButton(btn)}>✕</span>
                </div>
              `,
            )}
          </div>
          <div class="add-timer-row">
            <input
              class="ht-field"
              type="text"
              placeholder="添加预设(如 30s、10、1h)"
              .value=${this._newTimerButtonValue}
              @input=${this._handleNewTimerInput}
              @keypress=${(e: KeyboardEvent) => { if (e.key === "Enter") this._addTimerButton(); }}
              style="flex: 1;"
            />
            <div class="add-btn" @click=${this._addTimerButton} role="button">添加</div>
          </div>
          <div class="helper-text">支持秒(s)、分钟(m)、小时(h)、天(d)。示例:30s、10、1.5h、1d。</div>
          ${!buttons.length && cfg.hide_slider
            ? html`<div class="info-text">ℹ️ 没有预设且滑块已隐藏,卡片将无法设置时长。</div>`
            : ""}
        </div>

        <ha-form
          .hass=${this.hass}
          .data=${cfg}
          .schema=${this._advancedSchema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._formChanged}
        ></ha-form>
      </div>
    `;
  }
}

customElements.define("timer-se-card-editor", TimerCardEditor);
