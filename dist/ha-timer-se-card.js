function t(t,e,s,i){var r,n=arguments.length,o=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,s,o):r(e,s))||o);return n>3&&o&&Object.defineProperty(e,s,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),r=new WeakMap;let n=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&r.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const s=1===t.length?t[0]:e.reduce((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1],t[0]);return new n(s,t,i)},a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:c,defineProperty:l,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,_=globalThis,m=_.trustedTypes,f=m?m.emptyScript:"",g=_.reactiveElementPolyfillSupport,v=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},y=(t,e)=>!c(t,e),$={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&l(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const n=i?.call(this);r?.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(v("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(v("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(v("properties"))){const t=this.properties,e=[...h(t),...u(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const s of i){const i=document.createElement("style"),r=e.litNonce;void 0!==r&&i.setAttribute("nonce",r),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const r=(void 0!==s.converter?.toAttribute?s.converter:b).toAttribute(e,s.type);this._$Em=t,null==r?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=i;const n=r.fromAttribute(e,t.type);this[i]=n??this._$Ej?.get(i)??n,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(void 0!==t){const n=this.constructor;if(!1===i&&(r=this[t]),s??=n.getPropertyOptions(t),!((s.hasChanged??y)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,s))))return;this.C(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},n){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t){const{wrapped:t}=s,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,s,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[v("elementProperties")]=new Map,x[v("finalized")]=new Map,g?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,A=t=>t,S=w.trustedTypes,E=S?S.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,T="?"+k,P=`<${T}>`,M=document,O=()=>M.createComment(""),R=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,H="[ \t\n\f\r]",z=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,j=/-->/g,N=/>/g,I=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,B=/"/g,V=/^(?:script|style|textarea|title)$/i,D=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),q=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),F=new WeakMap,K=M.createTreeWalker(M,129);function J(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const Z=(t,e)=>{const s=t.length-1,i=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=z;for(let e=0;e<s;e++){const s=t[e];let a,c,l=-1,d=0;for(;d<s.length&&(o.lastIndex=d,c=o.exec(s),null!==c);)d=o.lastIndex,o===z?"!--"===c[1]?o=j:void 0!==c[1]?o=N:void 0!==c[2]?(V.test(c[2])&&(r=RegExp("</"+c[2],"g")),o=I):void 0!==c[3]&&(o=I):o===I?">"===c[0]?(o=r??z,l=-1):void 0===c[1]?l=-2:(l=o.lastIndex-c[2].length,a=c[1],o=void 0===c[3]?I:'"'===c[3]?B:L):o===B||o===L?o=I:o===j||o===N?o=z:(o=I,r=void 0);const h=o===I&&t[e+1].startsWith("/>")?" ":"";n+=o===z?s+P:l>=0?(i.push(a),s.slice(0,l)+C+s.slice(l)+k+h):s+k+(-2===l?e:h)}return[J(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class G{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[c,l]=Z(t,e);if(this.el=G.createElement(c,s),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=K.nextNode())&&a.length<o;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(C)){const e=l[n++],s=i.getAttribute(t).split(k),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:s,ctor:"."===o[1]?et:"?"===o[1]?st:"@"===o[1]?it:tt}),i.removeAttribute(t)}else t.startsWith(k)&&(a.push({type:6,index:r}),i.removeAttribute(t));if(V.test(i.tagName)){const t=i.textContent.split(k),e=t.length-1;if(e>0){i.textContent=S?S.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],O()),K.nextNode(),a.push({type:2,index:++r});i.append(t[e],O())}}}else if(8===i.nodeType)if(i.data===T)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=i.data.indexOf(k,t+1));)a.push({type:7,index:r}),t+=k.length-1}r++}}static createElement(t,e){const s=M.createElement("template");return s.innerHTML=t,s}}function Q(t,e,s=t,i){if(e===q)return e;let r=void 0!==i?s._$Co?.[i]:s._$Cl;const n=R(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=r:s._$Cl=r),void 0!==r&&(e=Q(t,r._$AS(t,e.values),r,i)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??M).importNode(e,!0);K.currentNode=i;let r=K.nextNode(),n=0,o=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new Y(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new rt(r,this,t)),this._$AV.push(e),a=s[++o]}n!==a?.index&&(r=K.nextNode(),n++)}return K.currentNode=M,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class Y{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),R(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==q&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=G.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new X(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new G(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new Y(this.O(O()),this.O(O()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=A(t).nextSibling;A(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=W}_$AI(t,e=this,s,i){const r=this.strings;let n=!1;if(void 0===r)t=Q(this,t,e,0),n=!R(t)||t!==this._$AH&&t!==q,n&&(this._$AH=t);else{const i=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=Q(this,i[s+o],e,o),a===q&&(a=this._$AH[o]),n||=!R(a)||a!==this._$AH[o],a===W?t=W:t!==W&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!i&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class st extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class it extends tt{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??W)===q)return;const s=this._$AH,i=t===W&&s!==W||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==W&&(s===W||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const nt=w.litHtmlPolyfillSupport;nt?.(G,Y),(w.litHtmlVersions??=[]).push("3.3.3");const ot=globalThis;class at extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let r=i._$litPart$;if(void 0===r){const t=s?.renderBefore??null;i._$litPart$=r=new Y(e.insertBefore(O(),t),t,void 0,s??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return q}}at._$litElement$=!0,at.finalized=!0,ot.litElementHydrateSupport?.({LitElement:at});const ct=ot.litElementPolyfillSupport;ct?.({LitElement:at}),(ot.litElementVersions??=[]).push("4.2.2");const lt={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:y},dt=(t=lt,e,s)=>{const{kind:i,metadata:r}=s;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),n.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const r=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,r,t,!0,s)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=s;return function(s){const r=this[i];e.call(this,s),this.requestUpdate(i,r,t,!0,s)}}throw Error("Unsupported decorator location: "+i)};function ht(t){return(e,s)=>"object"==typeof s?dt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)}function ut(t){return ht({...t,state:!0,attribute:!1})}const pt=[15,30,60];class _t extends at{constructor(){super(...arguments),this._config={},this._newTimerButtonValue="",this._computeLabel=t=>({card_title:"卡片标题",entity:"倒计时结束后触发的实体",action:"倒计时结束后的动作",countdown_display:"时间显示方式",slider_max:"滑块最大值",slider_unit:"滑块单位",hide_slider:"隐藏滑块",show_manual_input:"显示手动设置输入框",autostart:"点击预设后立即开始",color:"主题色(如 #ff8f00)",event_type:"结束事件类型(可选)",event_data:"结束事件数据(可选)",actions:"自定义结束动作"}[t.name]??""),this._computeHelper=t=>({entity:"时间到后自动触发该实体(任意类型,不限制设备)",action:"切换=开↔关互换,也可固定为开启或关闭",countdown_display:"选择倒计时数字、方形进度块或两者同时显示",slider_max:"拖动滑块可在该范围内设置时间",slider_unit:"滑块数值的单位(秒/分钟/小时/天)",hide_slider:"隐藏滑块,只用预设按钮和输入框设置时间",show_manual_input:"显示底部的输入框与设置/重置按钮(手动输入时间,默认关闭)",event_type:"倒计时结束后向 HA 后端触发该事件(如 timer_finished),自动化可用 event trigger 监听",event_data:'事件附带数据,例如 { "timer_id": "123456" }',color:"留空则跟随 HA 主题"}[t.name]??"")}static get styles(){return o`
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
    `}setConfig(t){this._config={...t}}_updateConfig(t){const e={...this._config,...t};this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_mainSchema(){return[{name:"card_title",selector:{text:{}}},{name:"entity",required:!0,selector:{entity:{}}},{name:"action",selector:{select:{mode:"dropdown",options:[{value:"toggle",label:"切换(toggle):开↔关"},{value:"on",label:"开启(turn_on)"},{value:"off",label:"关闭(turn_off)"}]}}},{name:"countdown_display",selector:{select:{mode:"dropdown",options:[{value:"countdown",label:"仅倒计时"},{value:"progress",label:"仅方形进度块"},{value:"both",label:"倒计时 + 方形进度块"}]}}},{type:"grid",name:"",schema:[{name:"slider_max",selector:{number:{min:1,max:9999,step:1,mode:"box"}}},{name:"slider_unit",selector:{select:{mode:"dropdown",options:[{value:"sec",label:"秒(s)"},{value:"min",label:"分钟(m)"},{value:"hr",label:"小时(h)"}]}}}]}]}_advancedSchema(){return[{name:"hide_slider",selector:{boolean:{}}},{name:"show_manual_input",selector:{boolean:{}}},{name:"autostart",selector:{boolean:{}}},{name:"color",selector:{text:{}}},{name:"event_type",selector:{text:{}}},{name:"event_data",selector:{object:{}}},{name:"actions",selector:{object:{multiple:!0,label_field:"service",fields:{service:{label:"服务",selector:{text:{}}},target:{label:"目标",selector:{object:{}}},data:{label:"数据",selector:{object:{}}}}}}}]}_handleNewTimerInput(t){this._newTimerButtonValue=t.target.value}_addTimerButton(){const t=this._newTimerButtonValue.trim();if(!t)return;const e=function(t){const e=String(t).trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(s|sec|seconds|m|min|minutes|h|hr|hours)?$/);if(!e)return null;const s=parseFloat(e[1]);if(s<=0||s>9999)return null;const i=e[2]||"";return i?s+{s:"s",sec:"s",seconds:"s",m:"m",min:"m",minutes:"m",h:"h",hr:"h",hours:"h"}[i]:s}(t);if(null===e)return void alert("无效的预设时间格式。示例:30s、10、1.5h(纯数字为分钟)");const s=Array.isArray(this._config.timer_buttons)?[...this._config.timer_buttons]:[...pt];if(s.includes(e))return this._newTimerButtonValue="",void this.requestUpdate();s.push(e);const i=s.filter(t=>"number"==typeof t),r=s.filter(t=>"string"==typeof t);i.sort((t,e)=>t-e),r.sort((t,e)=>t.localeCompare(e,void 0,{numeric:!0,sensitivity:"base"})),this._updateConfig({timer_buttons:[...i,...r]}),this._newTimerButtonValue=""}_removeTimerButton(t){const e=Array.isArray(this._config.timer_buttons)?[...this._config.timer_buttons]:[];this._updateConfig({timer_buttons:e.filter(e=>e!==t)})}_formChanged(t){t.stopPropagation();const e={...t.detail?.value||{}};Object.keys(e).forEach(t=>{void 0===e[t]&&delete e[t]}),this._updateConfig(e)}render(){const t=this._config||{},e=Array.isArray(t.timer_buttons)?t.timer_buttons:pt;return D`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${t}
          .schema=${this._mainSchema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._formChanged}
        ></ha-form>

        <div class="config-row">
          <div class="config-label">预设时间(Timer Presets)</div>
          <div class="chips-wrapper">
            ${e.map(t=>D`
                <div class="timer-chip">
                  <span>${"number"==typeof t?t+"m":t}</span>
                  <span class="remove-chip" @click=${()=>this._removeTimerButton(t)}>✕</span>
                </div>
              `)}
          </div>
          <div class="add-timer-row">
            <input
              class="ht-field"
              type="text"
              placeholder="添加预设(如 30s、10、1h)"
              .value=${this._newTimerButtonValue}
              @input=${this._handleNewTimerInput}
              @keypress=${t=>{"Enter"===t.key&&this._addTimerButton()}}
              style="flex: 1;"
            />
            <div class="add-btn" @click=${this._addTimerButton} role="button">添加</div>
          </div>
          <div class="helper-text">支持秒(s)、分钟(m)、小时(h)。示例:30s、10、1.5h。</div>
          ${!e.length&&t.hide_slider?D`<div class="info-text">ℹ️ 没有预设且滑块已隐藏,卡片将无法设置时长。</div>`:""}
        </div>

        <ha-form
          .hass=${this.hass}
          .data=${t}
          .schema=${this._advancedSchema()}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._formChanged}
        ></ha-form>
      </div>
    `}}t([ht({attribute:!1})],_t.prototype,"hass",void 0),t([ut()],_t.prototype,"_config",void 0),t([ut()],_t.prototype,"_newTimerButtonValue",void 0),customElements.define("timer-se-card-editor",_t);const mt="1.5.0",ft=120,gt=[15,30,60];function vt(t){return t<10?"0"+t:String(t)}function bt(t){const e=Math.max(0,Math.floor(t)),s=Math.floor(e/3600),i=Math.floor(e%3600/60),r=e%60;return`${vt(s)}:${vt(i)}:${vt(r)}`}function yt(t){const e=t.trim();if(!e)return null;const s=e.split(/\s+/);let i=0;for(const t of s){if(!t)continue;const e=t.match(/^(\d+(?:\.\d+)?)\s*(小时|分钟|秒|[hms时分])?$/);if(!e)return null;const s=parseFloat(e[1]);switch(e[2]||"m"){case"h":case"时":case"小时":i+=3600*s;break;case"m":case"分":case"分钟":i+=60*s;break;case"s":case"秒":i+=s;break;default:return null}}return Math.max(0,Math.round(i))}function $t(t){let e,s,i="min";if("number"==typeof t)e=t,s=t+"分";else if("string"==typeof t){const r=yt(t);if(null===r)return null;e=r,i="sec",s=t}else{if(!t||"object"!=typeof t)return null;if("number"==typeof t.minutes)e=t.minutes,s=t.label||t.minutes+"分";else{if("number"!=typeof t.seconds)return null;e=t.seconds,s=t.label||t.seconds+"秒",i="sec"}}return{value:e,label:s,unit:i}}function xt(t,e){const s=e||"toggle";switch(t.split(".")[0]){case"button":return{service:"button.press",target:{entity_id:t}};case"script":return{service:"script.turn_on",target:{entity_id:t}};case"scene":return{service:"scene.turn_on",target:{entity_id:t}};default:return{service:`homeassistant.${"on"===s?"turn_on":"off"===s?"turn_off":"toggle"}`,target:{entity_id:t}}}}console.info(`%c TIMER-SE-CARD %c v${mt} `,"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray");let wt=class extends at{constructor(){super(...arguments),this._config={},this._sliderValue=0,this._timeRemaining=null,this._state="idle",this._totalSeconds=0,this._remainingSeconds=0,this._endAt=0,this._firedAt=null,this._countdownInterval=null,this._storageKey="timer-se-card:default",this._valid=!1,this._presets=[]}static get version(){return mt}static getStubConfig(){return{entity:"",card_title:"定时器",action:"toggle",timer_buttons:[...gt],slider_max:ft,slider_unit:"min",countdown_display:"countdown",autostart:!0}}static getConfigElement(){return document.createElement("timer-se-card-editor")}static getConfigForm(){return{schema:[{name:"card_title",selector:{text:{}}},{name:"entity",required:!0,selector:{entity:{}}},{name:"action",selector:{select:{options:[{value:"toggle",label:"切换(toggle):开↔关"},{value:"on",label:"开启(turn_on)"},{value:"off",label:"关闭(turn_off)"}],mode:"dropdown"}}},{name:"countdown_display",selector:{select:{options:[{value:"countdown",label:"仅倒计时"},{value:"progress",label:"仅方形进度块"},{value:"both",label:"倒计时 + 方形进度块"}],mode:"dropdown"}}},{type:"grid",name:"",schema:[{name:"slider_max",selector:{number:{min:1,max:9999,step:1,mode:"box"}}},{name:"slider_unit",selector:{select:{options:[{value:"sec",label:"秒(s)"},{value:"min",label:"分钟(m)"},{value:"hr",label:"小时(h)"}],mode:"dropdown"}}}]},{name:"presets",selector:{object:{multiple:!0,label_field:"minutes",fields:{minutes:{label:"分钟",selector:{number:{min:1,max:9999}}}}}}},{type:"expandable",name:"",title:"高级选项",schema:[{name:"hide_slider",selector:{boolean:{}}},{name:"autostart",selector:{boolean:{}}},{name:"color",selector:{text:{}}},{name:"event_type",selector:{text:{}}},{name:"event_data",selector:{object:{}}},{name:"actions",selector:{object:{multiple:!0,label_field:"service",fields:{service:{label:"服务",selector:{text:{}}},target:{label:"目标",selector:{object:{}}},data:{label:"数据",selector:{object:{}}}}}}}]}],computeLabel:t=>{switch(t.name){case"card_title":return"卡片标题";case"entity":return"倒计时结束后触发的实体";case"action":return"倒计时结束后的动作";case"countdown_display":return"时间显示方式";case"slider_max":return"滑块最大值";case"slider_unit":return"滑块单位";case"presets":return"预设时间";case"hide_slider":return"隐藏滑块";case"autostart":return"点击预设后立即开始";case"color":return"主题色(如 #ff8f00)";case"event_type":return"结束事件类型(可选)";case"event_data":return"结束事件数据(可选)";case"actions":return"自定义结束动作";default:return}},computeHelper:t=>{switch(t.name){case"entity":return"时间到后自动触发该实体(任意类型,不限制设备)";case"action":return"切换=开↔关互换,也可固定为开启或关闭;按钮/脚本/场景类实体仍按各自动作触发";case"countdown_display":return"选择倒计时数字、方形进度块或两者同时显示";case"slider_max":return"拖动滑块可在该范围内设置时间";case"slider_unit":return"滑块数值的单位(秒/分钟/小时)";case"presets":return"在编辑器中用 chips 添加预设:纯数字为分钟,支持 30s、1h 等单位";case"hide_slider":return"隐藏滑块,只用预设按钮和输入框设置时间";case"actions":return"填写后优先于实体的自动动作,例如 service 填 button.press";case"color":return"留空则跟随 HA 主题";case"event_type":return"倒计时结束后向 HA 后端触发该事件(如 timer_finished),自动化可用 event trigger 监听";case"event_data":return'事件附带数据,例如 { "timer_id": "123456" }';default:return}}}}setConfig(t){const e={entity:void 0,action:"toggle",presets:[...gt],slider_max:ft,slider_unit:"min",countdown_display:"countdown",hide_slider:!1,show_manual_input:!1,autostart:!0,color:void 0,...t};"string"==typeof e.action&&(e.action=e.action.toLowerCase(),["toggle","on","off"].includes(e.action)||(e.action="toggle")),e.slider_max>0||(e.slider_max=ft),["sec","min","hr"].includes(e.slider_unit||"")||(e.slider_unit="min"),["countdown","progress","both"].includes(e.countdown_display||"")||(e.countdown_display="countdown");const s=e.timer_buttons??e.presets??gt;this._presets=(Array.isArray(s)?s:gt).map($t).filter(t=>null!==t),this._config=e,this._valid=!!(e.entity||Array.isArray(e.actions)&&e.actions.length||e.action&&"object"==typeof e.action&&e.action.service||"string"==typeof e.event_type&&e.event_type.length>0),this._storageKey="timer-se-card:"+(e.entity||"default"),this._restoreState(),this.requestUpdate()}_applyTheme(){const t=this.hass;if(t){try{if("function"==typeof t.applyThemesOnElement)return void t.applyThemesOnElement(this,t.themes,this._config.theme)}catch(t){}t.themes&&t.themes.darkMode?this.setAttribute("data-theme","dark"):this.removeAttribute("data-theme")}}updated(t){t.has("hass")&&this._applyTheme()}connectedCallback(){super.connectedCallback(),this._applyTheme(),this._startCountdown()}disconnectedCallback(){super.disconnectedCallback(),this._stopCountdown(),this._saveState()}getCardSize(){return 6}getGridOptions(){return{columns:12,rows:4}}_restoreState(){let t=null;try{const e=localStorage.getItem(this._storageKey);e&&(t=JSON.parse(e))}catch(e){t=null}if(!t)return;const e=Date.now();"running"===t.state&&"number"==typeof t.endAt?t.endAt>e?(this._state="running",this._remainingSeconds=(t.endAt-e)/1e3,this._totalSeconds="number"==typeof t.total?t.total:this._remainingSeconds,this._endAt=t.endAt,this._firedAt=t.firedAt||null):(this._state="finished",this._remainingSeconds=0,this._totalSeconds="number"==typeof t.total?t.total:0,this._firedAt=t.firedAt||null):"paused"===t.state?(this._state="paused",this._remainingSeconds="number"==typeof t.remaining?t.remaining:0,this._totalSeconds="number"==typeof t.total?t.total:this._remainingSeconds):"idle"!==t.state&&"finished"!==t.state||(this._state=t.state,this._remainingSeconds="number"==typeof t.remaining?t.remaining:0,this._totalSeconds="number"==typeof t.total?t.total:this._remainingSeconds),"number"==typeof t.sliderValue&&(this._sliderValue=t.sliderValue)}_saveState(){const t={state:this._state,remaining:Math.round(this._remainingSeconds),total:this._totalSeconds,endAt:this._endAt,firedAt:this._firedAt,sliderValue:this._sliderValue};try{localStorage.setItem(this._storageKey,JSON.stringify(t))}catch(t){}}_setTime(t){this._stopCountdown(),this._remainingSeconds=Math.max(0,t),this._totalSeconds=this._remainingSeconds,this._endAt=0,this._state="idle",this._firedAt=null,this._saveState(),this._config.autostart&&this._remainingSeconds>0?this._start():this._updateRender()}_start(){this._remainingSeconds<=0||(this._state="running",this._endAt=Date.now()+1e3*this._remainingSeconds,this._startCountdown(),this._saveState())}_pause(){"running"===this._state&&(this._stopCountdown(),this._state="paused",this._endAt=0,this._saveState(),this._updateRender())}_resume(){"paused"!==this._state||this._remainingSeconds<=0||this._start()}_reset(){this._stopCountdown(),this._state="idle",this._remainingSeconds=0,this._totalSeconds=0,this._endAt=0,this._firedAt=null,this._saveState(),this._updateRender()}_toggle(){switch(this._state){case"running":this._pause();break;case"paused":this._resume();break;case"finished":this._reset();break;default:this._remainingSeconds>0&&this._start()}}_tick(){this._remainingSeconds=Math.max(0,(this._endAt-Date.now())/1e3),this._remainingSeconds<=0?this._finish():this._updateRender()}_finish(){this._stopCountdown(),this._state="finished",this._remainingSeconds=0,this._endAt=0,this._firedAt||(this._firedAt=Date.now(),this._fireActions()),this._saveState(),this._updateRender()}_startCountdown(){this._stopCountdown(),"running"===this._state&&(this._countdownInterval=setInterval(()=>this._tick(),500),this._tick())}_stopCountdown(){this._countdownInterval&&(clearInterval(this._countdownInterval),this._countdownInterval=null)}_unitToSeconds(t,e){switch(t){case"sec":return e;case"hr":return 3600*e;default:return 60*e}}_setFromInput(){const t=this.shadowRoot?.querySelector(".tse-input");if(!t)return;const e=yt(t.value);if(null===e||e<=0)return t.classList.add("is-invalid"),void setTimeout(()=>t.classList.remove("is-invalid"),800);t.classList.remove("is-invalid"),this._setTime(e)}_handleSliderChange(t){const e=t.target;this._sliderValue=parseInt(e.value,10)||0;const s=this._config.slider_unit||"min";this._setTime(this._unitToSeconds(s,this._sliderValue))}_resolveActions(){const t=this._config;if(Array.isArray(t.actions)&&t.actions.length)return t.actions.filter(t=>t&&"string"==typeof t.service);if(t.action&&"object"==typeof t.action&&t.action.service)return[t.action];if(t.entity){let e="string"==typeof t.action?t.action:"toggle";return[xt(t.entity,e)]}return[]}_fireActions(){const t=this._resolveActions();t.forEach(t=>{const e=t.service.indexOf(".");if(e<=0)return void console.error("timer-se-card: 无效的 service "+t.service);const s=t.service.substring(0,e),i=t.service.substring(e+1);try{this.hass&&"function"==typeof this.hass.callService?this.hass.callService(s,i,t.data||{},t.target||{}):console.warn("timer-se-card: hass 尚未就绪,跳过动作 "+t.service)}catch(e){console.error("timer-se-card: 调用 "+t.service+" 失败",e)}});const e=this._config.event_type;if(e&&this.hass?.connection)try{this.hass.connection.sendMessagePromise({type:"fire_event",event_type:e,event_data:this._config.event_data||{}})}catch(t){console.error("timer-se-card: 触发事件 "+e+" 失败",t)}this.dispatchEvent(new CustomEvent("timer-se-card-finished",{detail:{config:this._config,actions:t},bubbles:!0,composed:!0}))}_entityState(){const t=this._config.entity;return t&&this.hass&&this.hass.states&&this.hass.states[t]||null}_isEntityOn(){const t=this._entityState();return!!t&&("on"===t.state||"open"===t.state)}_statusText(){switch(this._state){case"running":return"倒计时中";case"paused":return"已暂停";case"finished":return"时间到!";default:return this._remainingSeconds>0?bt(this._remainingSeconds):"待机"}}_activeBlocks(){if("finished"===this._state)return 0;if(this._totalSeconds<=0)return 0;const t=Math.max(0,Math.min(1,this._remainingSeconds/this._totalSeconds));return"running"===this._state||"paused"===this._state?t>0?Math.max(1,Math.ceil(16*t)):0:Math.ceil(16*t)}_controlIcon(){switch(this._state){case"running":return"mdi:pause";case"paused":default:return"mdi:play";case"finished":return"mdi:restart"}}_updateRender(){this._timeRemaining="finished"===this._state?"00:00:00":bt(this._remainingSeconds),this.requestUpdate()}render(){if(!this._config)return D``;const t=this._config,e=this._valid,s=this._entityState(),i=s?s.attributes.friendly_name||t.entity:null,r=t.card_title||i||"定时器",n=this._isEntityOn(),o="running"===this._state,a="finished"===this._state?"00:00:00":bt(this._remainingSeconds),c=this._activeBlocks(),l=this._totalSeconds>0?Math.round(100*Math.max(0,Math.min(1,this._remainingSeconds/this._totalSeconds))):0,d=t.countdown_display||"countdown",h="progress"!==d,u="countdown"!==d,p=Array.from({length:16},(t,e)=>{const s=e<c;return D`<div class="tse-block ${s?"is-on":""} ${o&&s&&e===c-1?"is-lead":""}"></div>`}),_=this._presets.map(t=>{const e=this._unitToSeconds(t.unit,t.value),s="running"===this._state&&this._totalSeconds>0&&Math.abs(this._totalSeconds-e)<1.5;return D`<button class="tse-preset ${s?"is-active":""}" @click=${()=>this._setTime(e)}>${t.label}</button>`}),m=t.slider_unit||"min",f="sec"===m?"秒":"hr"===m?"小时":"分钟",g=t.slider_max||ft,v=Math.min(this._sliderValue,g),b=!t.hide_slider,y=!0===t.show_manual_input,$="idle"!==this._state||this._totalSeconds>0;return D`
      <ha-card class="tse-card">
        <div class="tse-header">
          <span class="tse-title">${r}</span>
          ${s?D`<span class="tse-chip ${n?"is-on":"is-off"}" title="${t.entity}">${n?"开":"关"}</span>`:""}
          <span class="tse-status">${this._statusText()}</span>
        </div>

        ${e?"":D`<div class="tse-warn">未配置触发实体/事件,倒计时结束将不执行任何动作</div>`}

        ${h?D`<div class="tse-countdown ${o?"is-active":""}">
              <div class="tse-time">${a}</div>
            </div>`:""}

        ${u?D`<div class="tse-progress-section">
              <div class="tse-percent">${l}%</div>
              <div class="tse-blocks">${p}</div>
            </div>`:""}

        ${b?D`<div class="tse-slider-row">
              <input class="tse-slider" type="range" min="0" step="1" max="${g}" value="${v}" @input=${this._handleSliderChange} />
              <div class="tse-slider-right">
                <span class="tse-slider-label">${v} ${f}</span>
                <div class="tse-control-btn ${o?"is-active":""}" @click=${()=>this._toggle()}>
                  <ha-icon icon="${this._controlIcon()}"></ha-icon>
                </div>
              </div>
            </div>`:""}

        ${_.length?D`<div class="tse-presets">${_}</div>`:""}

        ${y?D`<div class="tse-input-row">
              <input class="tse-input" type="text" placeholder="如 5 / 30s / 1h 30m" @keydown=${t=>"Enter"===t.key&&this._setFromInput()} />
              <button class="tse-set-btn" @click=${()=>this._setFromInput()}>设置</button>
              ${$?D`<button class="tse-set-btn is-ghost" @click=${()=>this._reset()}>重置</button>`:""}
            </div>`:""}
      </ha-card>
    `}};wt.styles=o`
    :host {
      display: block;
      --tse-accent: var(--accent-color, #ff8f00);
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
      background: var(--secondary-background-color, rgba(128, 128, 128, 0.2));
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
    .tse-slider-label {
      font-size: 1.05em;
      color: var(--primary-text-color, #1c1c1e);
      min-width: 52px;
      text-align: center;
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
  `,t([ht({attribute:!1})],wt.prototype,"hass",void 0),t([ut()],wt.prototype,"_config",void 0),t([ut()],wt.prototype,"_sliderValue",void 0),t([ut()],wt.prototype,"_timeRemaining",void 0),t([ut()],wt.prototype,"_state",void 0),t([ut()],wt.prototype,"_totalSeconds",void 0),wt=t([(t=>(e,s)=>{void 0!==s?s.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)})("timer-se-card")],wt),window.customCards=window.customCards||[],window.customCards.some(t=>"timer-se-card"===t.type)||window.customCards.push({type:"timer-se-card",name:"Timer SE Card",description:"倒计时定时器卡片:滑块拖动/预设/输入设置时间,倒计时结束自动触发实体",preview:!0,documentationURL:"https://github.com/xhyyd2022/ha-timer-se-card"});export{wt as TimerSeCard};
