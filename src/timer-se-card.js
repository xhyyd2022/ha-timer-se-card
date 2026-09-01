/*!
 * Timer SE Card - circular rotating countdown timer for Home Assistant Lovelace
 * https://github.com/xhyyd2022/ha-timer-se-card
 *
 * MIT License
 */
"use strict";

(function () {
  const DEFAULT_CONFIG = {
    entity: undefined,
    actions: undefined,
    action: undefined,
    name: undefined,
    presets: [
      { label: "5分", minutes: 5 },
      { label: "10分", minutes: 10 },
      { label: "30分", minutes: 30 },
    ],
    max_minutes: 60,
    autostart: true,
    color: null,
    ring_width: 14,
    size: 260,
    text: {
      status_idle: "待机",
      status_running: "倒计时中",
      status_paused: "已暂停",
      status_finished: "时间到!",
      start: "开始",
      pause: "暂停",
      resume: "继续",
      reset: "重置",
      done: "完成",
    },
  };

  const SVG_SIZE = 220;
  const CENTER = SVG_SIZE / 2;
  const DEFAULT_MAX_SECS = 60 * 60; // 1 hour

  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const pad = (n) => (n < 10 ? "0" + n : "" + n);
    return h > 0 ? h + ":" + pad(m) + ":" + pad(sec) : pad(m) + ":" + pad(sec);
  }

  function normalizePreset(p) {
    if (typeof p === "number") {
      return { label: p + "分钟", seconds: p * 60 };
    }
    if (typeof p === "object" && p !== null) {
      if (typeof p.seconds === "number") {
        return { label: p.label || p.seconds + "秒", seconds: p.seconds };
      }
      if (typeof p.minutes === "number") {
        return { label: p.label || p.minutes + "分", seconds: p.minutes * 60 };
      }
      if (typeof p.duration === "number") {
        return { label: p.label || p.duration + "秒", seconds: p.duration };
      }
    }
    return null;
  }

  function defaultActionFor(entity) {
    const domain = entity.split(".")[0];
    switch (domain) {
      case "button":
        return { service: "button.press", target: { entity_id: entity } };
      case "script":
        return { service: "script.turn_on", target: { entity_id: entity } };
      case "scene":
        return { service: "scene.turn_on", target: { entity_id: entity } };
      default:
        return { service: "homeassistant.toggle", target: { entity_id: entity } };
    }
  }

  class TimerSeCard extends HTMLElement {
    static get version() {
      return "1.2.0";
    }

    static getStubConfig() {
      return {
        entity: "",
        name: "定时器",
        presets: [
          { label: "5分", minutes: 5 },
          { label: "10分", minutes: 10 },
          { label: "30分", minutes: 30 },
        ],
        max_minutes: 60,
        autostart: true,
      };
    }

    static getConfigForm() {
      return {
        schema: [
          { name: "name", selector: { text: {} } },
          {
            name: "entity",
            required: true,
            selector: {
              entity: {
                filter: [
                  {
                    domain: [
                      "button",
                      "switch",
                      "input_boolean",
                      "light",
                      "fan",
                      "cover",
                      "script",
                      "automation",
                      "scene",
                      "media_player",
                      "climate",
                    ],
                  },
                ],
              },
            },
          },
          {
            name: "max_minutes",
            selector: { number: { min: 1, max: 1440, step: 1, unit_of_measurement: "分钟" } },
          },
          {
            name: "presets",
            selector: {
              object: {
                multiple: true,
                label_field: "label",
                fields: {
                  label: { label: "名称", selector: { text: {} } },
                  minutes: { label: "分钟", selector: { number: { min: 1, max: 1440 } } },
                },
              },
            },
          },
          {
            type: "expandable",
            name: "",
            title: "高级选项",
            schema: [
              { name: "autostart", selector: { boolean: {} } },
              {
                type: "grid",
                name: "",
                schema: [
                  { name: "size", selector: { number: { min: 160, max: 600, unit_of_measurement: "px" } } },
                  { name: "ring_width", selector: { number: { min: 4, max: 40, unit_of_measurement: "px" } } },
                ],
              },
              { name: "color", selector: { text: {} } },
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
        computeLabel: (schema) => {
          switch (schema.name) {
            case "name":
              return "卡片标题";
            case "entity":
              return "倒计时结束后触发的实体";
            case "max_minutes":
              return "最大可设置时间";
            case "presets":
              return "预设时间";
            case "autostart":
              return "点击预设后立即开始";
            case "color":
              return "主题色(如 #ff8f00)";
            case "size":
              return "表盘尺寸";
            case "ring_width":
              return "圆环粗细";
            case "actions":
              return "自定义结束动作";
            default:
              return undefined;
          }
        },
        computeHelper: (schema) => {
          switch (schema.name) {
            case "entity":
              return "时间到后自动触发该实体(按钮/开关/灯等)";
            case "presets":
              return "每个预设 = 名称 + 分钟数,点击卡片上的标签可一键跳转";
            case "actions":
              return "填写后优先于实体的自动动作,例如 service 填 button.press";
            case "color":
              return "留空则跟随 HA 主题";
            default:
              return undefined;
          }
        },
      };
    }

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._config = null;
      this._hass = null;

      this._state = "idle"; // idle | running | paused | finished
      this._remaining = 0; // seconds left
      this._total = 0; // seconds originally set for current run
      this._endAt = 0; // timestamp (ms)
      this._dragging = false;
      this._timer = null;
      this._firedAt = null;

      this._storageKey = null;
      this._cacheKey = null;

      const style = document.createElement("style");
      style.textContent = this.constructor._style;
      this.shadowRoot.appendChild(style);
    }

    setConfig(config) {
      if (!config || typeof config !== "object") {
        throw new Error("需要提供配置对象 (config)");
      }

      const merged = Object.assign(
        JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
        config
      );
      merged.text = Object.assign({}, DEFAULT_CONFIG.text, config.text || {});
      merged.presets = (config.presets || DEFAULT_CONFIG.presets)
        .map(normalizePreset)
        .filter(Boolean);
      if (merged.max_minutes && merged.max_minutes > 0) {
        this._maxSecsValue = merged.max_minutes * 60;
      } else {
        this._maxSecsValue = DEFAULT_MAX_SECS;
      }
      if (Array.isArray(merged.color)) {
        merged.color =
          "#" +
          merged.color
            .map((c) =>
              Math.max(0, Math.min(255, Math.round(c)))
                .toString(16)
                .padStart(2, "0")
            )
            .join("");
      }

      this._config = merged;
      this._valid = !!(merged.entity || merged.actions || merged.action);
      this._storageKey = "timer-se-card:" + (merged.entity || "default");
      this._cacheKey = (merged.entity || "none") + "|" + (merged.actions ? JSON.stringify(merged.actions) : "") + "|" + (merged.action ? JSON.stringify(merged.action) : "");

      this._restoreState();
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      if (this._config) {
        this._render();
      }
    }

    connectedCallback() {
      this._attachEvents();
      this._render();
    }

    disconnectedCallback() {
      this._detachEvents();
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
      this._saveState();
    }

    getCardSize() {
      const size = this._config && this._config.size ? this._config.size : 260;
      return Math.round(size / 50 + 2);
    }

    getGridOptions() {
      return {
        rows: 4,
        columns: 4,
        min_rows: 3,
      };
    }

    /* ---------------- state ---------------- */

    _maxSecs() {
      return this._maxSecsValue || DEFAULT_MAX_SECS;
    }

    _presets() {
      return (this._config && this._config.presets) || [];
    }

    _text(key) {
      return (this._config && this._config.text && this._config.text[key]) || "";
    }

    _restoreState() {
      let saved = null;
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
          this._remaining = (saved.endAt - now) / 1000;
          this._total = typeof saved.total === "number" ? saved.total : this._remaining;
          this._endAt = saved.endAt;
          this._firedAt = saved.firedAt || null;
        } else {
          // The countdown finished while the page was closed.
          this._state = "finished";
          this._remaining = 0;
          this._total = typeof saved.total === "number" ? saved.total : 0;
          this._endAt = 0;
          this._firedAt = saved.firedAt || null;
        }
      } else if (saved.state === "paused") {
        this._state = "paused";
        this._remaining = typeof saved.remaining === "number" ? saved.remaining : 0;
        this._total = typeof saved.total === "number" ? saved.total : this._remaining;
        this._endAt = 0;
      } else if (saved.state === "idle") {
        this._state = "idle";
        this._remaining = typeof saved.remaining === "number" ? saved.remaining : 0;
        this._total = typeof saved.total === "number" ? saved.total : this._remaining;
      }
    }

    _saveState() {
      if (!this._storageKey) return;
      const data = {
        state: this._state,
        remaining: Math.round(this._remaining),
        total: this._total,
        endAt: this._endAt,
        firedAt: this._firedAt,
      };
      try {
        localStorage.setItem(this._storageKey, JSON.stringify(data));
      } catch (e) {
        /* ignore storage errors */
      }
    }

    _start() {
      if (this._remaining <= 0) return;
      this._state = "running";
      this._endAt = Date.now() + this._remaining * 1000;
      if (this._timer) clearInterval(this._timer);
      this._timer = setInterval(() => this._tick(), 250);
      this._saveState();
      this._render();
    }

    _pause() {
      if (this._state !== "running") return;
      if (this._timer) clearInterval(this._timer);
      this._timer = null;
      this._state = "paused";
      this._endAt = 0;
      this._saveState();
      this._render();
    }

    _resume() {
      if (this._state !== "paused" || this._remaining <= 0) return;
      this._start();
    }

    _reset() {
      if (this._timer) clearInterval(this._timer);
      this._timer = null;
      this._state = "idle";
      this._remaining = 0;
      this._total = 0;
      this._endAt = 0;
      this._firedAt = null;
      this._saveState();
      this._render();
    }

    _tick() {
      this._remaining = Math.max(0, (this._endAt - Date.now()) / 1000);
      if (this._remaining <= 0) {
        this._finish();
        return;
      }
      this._render();
    }

    _finish() {
      if (this._timer) clearInterval(this._timer);
      this._timer = null;
      this._state = "finished";
      this._remaining = 0;
      this._endAt = 0;
      if (!this._firedAt) {
        this._firedAt = Date.now();
        this._fireActions();
      }
      this._saveState();
      this._render();
    }

    _setPreset(seconds, label) {
      if (this._timer) clearInterval(this._timer);
      this._timer = null;
      this._remaining = Math.max(0, seconds);
      this._total = this._remaining;
      this._endAt = 0;
      this._state = "idle";
      this._saveState();
      if (this._config.autostart && this._remaining > 0) {
        this._start();
      } else {
        this._render();
      }
    }

    _toggleCenter() {
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
          if (this._remaining > 0) this._start();
          break;
      }
    }

    /* ---------------- actions ---------------- */

    _resolveActions() {
      const config = this._config;
      if (Array.isArray(config.actions) && config.actions.length) {
        return config.actions.filter((a) => a && typeof a.service === "string");
      }
      if (config.action && typeof config.action.service === "string") {
        return [config.action];
      }
      if (config.entity) {
        return [defaultActionFor(config.entity)];
      }
      return [];
    }

    _fireActions() {
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
          if (this._hass && typeof this._hass.callService === "function") {
            this._hass.callService(domain, service, a.data || {}, a.target || {});
          } else {
            console.warn("timer-se-card: hass 尚未就绪,跳过动作 " + a.service);
          }
        } catch (e) {
          console.error("timer-se-card: 调用 " + a.service + " 失败", e);
        }
      });
      this.dispatchEvent(
        new CustomEvent("timer-se-card-finished", {
          detail: { config: this._config, actions },
          bubbles: true,
          composed: true,
        })
      );
    }

    /* ---------------- drag / rotate ---------------- */

    _pointerPosFromEvent(e) {
      const rect = this._svg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * SVG_SIZE;
      const y = ((e.clientY - rect.top) / rect.height) * SVG_SIZE;
      return { x, y };
    }

    _secondsFromPos(x, y) {
      const dx = x - CENTER;
      const dy = y - CENTER;
      let angle = Math.atan2(dx, -dy) * (180 / Math.PI); // 12 o'clock = 0, clockwise+
      if (angle < 0) angle += 360;
      return Math.min(this._maxSecs(), Math.round((angle / 360) * this._maxSecs()));
    }

    _onPointerDown(e) {
      if (!this._config) return;
      e.preventDefault();
      this._dragging = true;
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch (err) {
        /* ignore */
      }
      this._applyDrag(e);
    }

    _onPointerMove(e) {
      if (!this._dragging) return;
      this._applyDrag(e);
    }

    _onPointerUp(e) {
      if (!this._dragging) return;
      this._dragging = false;
      if (this._remaining > 0) {
        this._state = "idle";
        this._total = this._remaining;
        this._start();
      } else {
        this._state = "idle";
        this._total = 0;
        this._saveState();
        this._render();
      }
    }

    _applyDrag(e) {
      const { x, y } = this._pointerPosFromEvent(e);
      const secs = this._secondsFromPos(x, y);
      this._remaining = secs;
      this._total = secs;
      this._state = "idle";
      this._updateVisuals();
    }

    /* ---------------- visuals (lightweight drag update) ---------------- */

    _statusText() {
      const text = this._config ? this._config.text : null;
      switch (this._state) {
        case "running":
          return text ? text.status_running : "倒计时中";
        case "paused":
          return text ? text.status_paused : "已暂停";
        case "finished":
          return text ? text.status_finished : "时间到!";
        default:
          if (this._remaining > 0) return "已设 " + formatTime(this._remaining);
          return text ? text.status_idle : "待机";
      }
    }

    _centerButtonLabel() {
      const text = this._config ? this._config.text : null;
      switch (this._state) {
        case "running":
          return text ? text.pause : "暂停";
        case "paused":
          return text ? text.resume : "继续";
        case "finished":
          return text ? text.done : "完成";
        default:
          return text ? text.start : "开始";
      }
    }

    _updateVisuals() {
      const root = this.shadowRoot;
      const svg = root.querySelector(".tse-svg");
      const config = this._config;
      if (!svg || !config) return;

      const ringWidth = config.ring_width;
      const circumference = 2 * Math.PI * (CENTER - ringWidth / 2);
      const progress = this._progress();
      const dashOffset = circumference * (1 - progress);
      const angle = this._knobAngle();
      const rad = (angle * Math.PI) / 180;
      const knobX = CENTER + (CENTER - ringWidth) * Math.sin(rad);
      const knobY = CENTER - (CENTER - ringWidth) * Math.cos(rad);

      const progressEl = svg.querySelector(".tse-progress");
      if (progressEl) progressEl.setAttribute("stroke-dashoffset", String(dashOffset));
      const handEl = svg.querySelector(".tse-hand");
      if (handEl) {
        handEl.setAttribute("x2", String(knobX));
        handEl.setAttribute("y2", String(knobY));
      }
      const knobEl = svg.querySelector(".tse-knob");
      if (knobEl) {
        knobEl.setAttribute("cx", String(knobX));
        knobEl.setAttribute("cy", String(knobY));
      }
      const timeEl = root.querySelector(".tse-time");
      if (timeEl) {
        timeEl.textContent =
          this._state === "finished" ? "00:00" : formatTime(this._remaining);
      }
      const statusEl = root.querySelector(".tse-status");
      if (statusEl) statusEl.textContent = this._statusText();
      const centerLabel = root.querySelector(".tse-center-label");
      if (centerLabel) centerLabel.textContent = this._centerButtonLabel();
      const mainBtn = root.querySelector('.tse-btn[data-action="center"]');
      if (mainBtn) mainBtn.textContent = this._centerButtonLabel();
      root.querySelectorAll(".tse-preset").forEach((btn) => {
        const secs = Number(btn.getAttribute("data-seconds"));
        btn.classList.toggle(
          "is-active",
          this._remaining > 0 && Math.abs(this._remaining - secs) < 1.5
        );
      });
    }

    /* ---------------- rendering ---------------- */

    _entityState() {
      const entity = this._config && this._config.entity;
      if (!entity || !this._hass) return null;
      return this._hass.states[entity] || null;
    }

    _progress() {
      const max = this._maxSecs();
      if (max <= 0) return 0;
      return Math.max(0, Math.min(1, this._remaining / max));
    }

    _knobAngle() {
      return this._progress() * 360;
    }

    _render() {
      const config = this._config;
      if (!config) {
        this.shadowRoot.innerHTML = "";
        return;
      }

      if (!this._valid) {
        this.shadowRoot.innerHTML = `
          <style>
            .tse-hint {
              font-family: var(--primary-font-family, "Roboto", sans-serif);
              background: var(--ha-card-background, var(--card-background-color, #fff));
              color: var(--secondary-text-color, #727272);
              border-radius: var(--ha-card-border-radius, 12px);
              box-shadow: var(--ha-card-box-shadow, 0 2px 4px rgba(0, 0, 0, 0.15));
              padding: 20px;
              font-size: 14px;
              line-height: 1.6;
            }
          </style>
          <div class="tse-hint">请配置「倒计时结束后触发的实体」或「自定义结束动作」后使用本卡片。</div>
        `;
        return;
      }

      const color = config.color || "var(--accent-color, #ff8f00)";
      const ringWidth = config.ring_width;
      const size = config.size;
      const progress = this._progress();
      const knobAngle = this._knobAngle();
      const circumference = 2 * Math.PI * (CENTER - ringWidth / 2);
      const dashOffset = circumference * (1 - progress);
      const text = config.text;

      const statusLabel = this._statusText();

      const timeText =
        this._state === "finished"
          ? "00:00"
          : formatTime(this._remaining);

      const entity = this._entityState();
      const entityName = entity
        ? entity.attributes.friendly_name || config.entity
        : null;

      const headerTitle =
        config.name || entityName || text.status_idle;

      let headerChip = "";
      if (entity) {
        const on = entity.state === "on" || entity.state === "open";
        headerChip =
          '<div class="tse-chip ' +
          (on ? "is-on" : "is-off") +
          '" title="' +
          this._escape(config.entity) +
          '">' +
          (on ? "开" : "关") +
          "</div>";
      }

      const knobRadians = (knobAngle * Math.PI) / 180;
      const knobX = CENTER + (CENTER - ringWidth) * Math.sin(knobRadians);
      const knobY = CENTER - (CENTER - ringWidth) * Math.cos(knobRadians);

      const presetsHtml = this._presets()
        .map((p) => {
          const active =
            this._remaining > 0 && Math.abs(this._remaining - p.seconds) < 1.5;
          return (
            '<button class="tse-preset' +
            (active ? " is-active" : "") +
            '" data-seconds="' +
            p.seconds +
            '">' +
            this._escape(p.label) +
            "</button>"
          );
        })
        .join("");

      const centerButtonLabel = this._centerButtonLabel();

      const showReset = this._state !== "idle" || this._total > 0;
      const showCenter = this._state !== "idle";

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            --tse-accent: ${color};
          }
        </style>
        <ha-card class="tse-card" style="--tse-size:${size}px">
          <div class="tse-header">
            <span class="tse-title">${this._escape(headerTitle)}</span>
            ${headerChip}
            <span class="tse-status">${this._escape(statusLabel)}</span>
          </div>

          <div class="tse-dial">
            <svg class="tse-svg" width="${size}" height="${size}" viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE}">
              <circle class="tse-track" cx="${CENTER}" cy="${CENTER}" r="${CENTER - ringWidth / 2}" stroke-width="${ringWidth}"></circle>
              <circle class="tse-progress ${this._state === 'finished' ? 'is-finished' : ''}" cx="${CENTER}" cy="${CENTER}" r="${CENTER - ringWidth / 2}" stroke-width="${ringWidth}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${dashOffset}" transform="rotate(-90 ${CENTER} ${CENTER})"></circle>
              <line class="tse-hand" x1="${CENTER}" y1="${CENTER}" x2="${knobX}" y2="${knobY}"></line>
              <circle class="tse-knob" cx="${knobX}" cy="${knobY}" r="${Math.max(8, ringWidth * 0.8)}"></circle>
              <circle class="tse-dial-hit" cx="${CENTER}" cy="${CENTER}" r="${CENTER - ringWidth / 2}" stroke-width="${ringWidth * 3}"></circle>
            </svg>

            <button class="tse-center" data-action="center">
              <span class="tse-time">${timeText}</span>
              <span class="tse-center-label">${this._escape(centerButtonLabel)}</span>
            </button>
          </div>

          <div class="tse-presets" ${presetsHtml ? "" : 'style="display:none"'}>
            ${presetsHtml}
          </div>

          <div class="tse-controls">
            <button class="tse-btn tse-btn-main ${showCenter ? "" : "is-hidden"}" data-action="center">${this._escape(centerButtonLabel)}</button>
            <button class="tse-btn ${showReset ? "" : "is-hidden"}" data-action="reset">${this._escape(text.reset)}</button>
          </div>
        </ha-card>
      `;

      this._svg = this.shadowRoot.querySelector(".tse-svg");
    }

    _escape(str) {
      return String(str == null ? "" : str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    _attachEvents() {
      this._clickHandler = (e) => {
        const target = e.target.closest("[data-action]");
        if (target) {
          const action = target.getAttribute("data-action");
          if (action === "center") this._toggleCenter();
          else if (action === "reset") this._reset();
          return;
        }
        const preset = e.target.closest("[data-seconds]");
        if (preset) {
          this._setPreset(Number(preset.getAttribute("data-seconds")), preset.textContent);
        }
      };

      this._pointerDown = (e) => {
        if (e.target.closest(".tse-dial-hit")) this._onPointerDown(e);
      };
      this._pointerMove = (e) => this._onPointerMove(e);
      this._pointerUp = (e) => this._onPointerUp(e);

      this.shadowRoot.addEventListener("click", this._clickHandler);
      this.shadowRoot.addEventListener("pointerdown", this._pointerDown);
      this.shadowRoot.addEventListener("pointermove", this._pointerMove);
      this.shadowRoot.addEventListener("pointerup", this._pointerUp);
      this.shadowRoot.addEventListener("pointercancel", this._pointerUp);
    }

    _detachEvents() {
      this.shadowRoot.removeEventListener("click", this._clickHandler);
      this.shadowRoot.removeEventListener("pointerdown", this._pointerDown);
      this.shadowRoot.removeEventListener("pointermove", this._pointerMove);
      this.shadowRoot.removeEventListener("pointerup", this._pointerUp);
      this.shadowRoot.removeEventListener("pointercancel", this._pointerUp);
    }

    static get _style() {
      return `
        :host {
          display: block;
          --tse-accent: var(--accent-color, #ff8f00);
          --tse-track: var(--divider-color, rgba(128, 128, 128, 0.24));
          --tse-on-accent: var(--text-primary-color, #fff);
        }
        .tse-card {
          font-family: var(--primary-font-family, "Roboto", sans-serif);
          color: var(--primary-text-color, #1c1c1e);
          padding: 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 12px;
          user-select: none;
          -webkit-user-select: none;
          width: 100%;
        }
        .tse-header {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 20px;
        }
        .tse-title {
          font-size: 16px;
          font-weight: 500;
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
        .tse-dial {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .tse-svg {
          display: block;
          overflow: visible;
          touch-action: none;
        }
        .tse-track {
          fill: none;
          stroke: var(--tse-track);
        }
        .tse-progress {
          fill: none;
          stroke: var(--tse-accent);
          stroke-linecap: round;
          transition: stroke-dashoffset 0.2s linear;
        }
        .tse-progress.is-finished {
          animation: tse-pulse 1s ease-in-out infinite;
        }
        .tse-hand {
          stroke: var(--tse-accent);
          stroke-width: 3;
          stroke-linecap: round;
          transition: all 0.2s linear;
        }
        .tse-knob {
          fill: var(--tse-accent);
          stroke: var(--tse-on-accent);
          stroke-width: 2;
          transition: all 0.2s linear;
        }
        .tse-dial-hit {
          fill: none;
          stroke: transparent;
          cursor: pointer;
        }
        @keyframes tse-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .tse-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: calc(var(--tse-size) * 0.54);
          height: calc(var(--tse-size) * 0.54);
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--primary-text-color, #1c1c1e);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 0;
          font-family: inherit;
        }
        .tse-center:hover {
          background: var(--divider-color, rgba(128, 128, 128, 0.12));
        }
        .tse-time {
          font-size: calc(var(--tse-size) * 0.115);
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          letter-spacing: 0.5px;
        }
        .tse-center-label {
          font-size: 12px;
          color: var(--secondary-text-color, #727272);
        }
        .tse-presets {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .tse-preset {
          border: 1px solid var(--tse-accent);
          color: var(--tse-accent);
          background: transparent;
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .tse-preset:hover {
          background: var(--tse-accent);
          color: var(--tse-on-accent);
        }
        .tse-preset.is-active {
          background: var(--tse-accent);
          color: var(--tse-on-accent);
          font-weight: 500;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .tse-controls {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .tse-btn {
          height: 40px;
          min-width: 96px;
          padding: 0 20px;
          border-radius: 20px;
          border: 1px solid var(--tse-accent);
          background: transparent;
          color: var(--tse-accent);
          font-size: 14px;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .tse-btn:hover {
          background: color-mix(in srgb, var(--tse-accent) 10%, transparent);
        }
        .tse-btn-main {
          background: var(--tse-accent);
          color: var(--tse-on-accent);
          border-color: var(--tse-accent);
        }
        .tse-btn-main:hover {
          background: var(--tse-accent);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .is-hidden {
          display: none !important;
        }
      `;
    }
  }

  customElements.define("timer-se-card", TimerSeCard);

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "timer-se-card",
    name: "Timer SE Card",
    description: "圆形旋转倒计时定时器卡片:预设时间一键跳转,倒计时结束自动触发实体/按钮",
    documentationURL: "https://github.com/xhyyd2022/ha-timer-se-card",
    preview: true,
  });
})();
