import {default as contracts, IS} from "./WebComponentContracts.js";
import tagMap from "./ElementsMapper.js";
const reporter = reporterFactory();

export {
  createComponent as default,
  reporter,
  createOrRetrieveShadowRoot,
  setComponentStyleFor,
};

function createComponent( specs ) {
  specs = initializeSpecs(specs);
  const { componentName } = specs;
  
  if (contracts.componentName(componentName) && !customElements.get(componentName)) {
    const xtElem = specs.extends?.toLowerCase()?.trim();
    const xtElemCTOR = tagMap[xtElem] ?? HTMLElement;
    const superDuper = SUPER({ forElem: xtElemCTOR, });
    initializeComponentLifecycle(superDuper, specs);
    !reporter.clientOnly &&
      reporter.report(`[factory] Registered component "${componentName}"`);
    customElements.define( componentName, superDuper, { extends: xtElem } );
  }
}

function SUPER({ forElem } = {} ) {
  const ELEM = forElem;
  
  return function CustomElementCtor() {
    CustomElementCtor.prototype = ELEM.prototype;
    enrichSuperPrototype(CustomElementCtor);
    return Reflect.construct( ELEM, [], CustomElementCtor );
  }
}

function enrichSuperPrototype(SuperCtor) {
  if (!SuperCtor.prototype.setComponentState) {
    const stateCache = {};
    const isCustom = me => me.hasAttribute(`is`) || /-/.test(me.tagName);
    Object.defineProperties( SuperCtor.prototype, {
      myName: { get: function() { return getTagName(this); } },
      state:  { get: function()  { return isCustom(this) && stateCache[this.myName] || {}; } },
      nth: { value: function(nth) {
          return IS(nth, Number, undefined) && getInstance(this, nth) || undefined;
        } },
      instanceNr: { get() { return isCustom(this) && getInstancePositionInDom(this); } },
      setComponentState: {
        value: function(keyValueObject) {
          if (isCustom(this)) {
            const instanceKey = this.myName;
            Object.entries(keyValueObject).forEach(([propName, value]) => {
              stateCache[instanceKey] = stateCache[instanceKey] ?? {component: this.myName};
              stateCache[instanceKey][propName] = value;
            });
          }
        }
      },
    } );
  }
}

function initializeComponentLifecycle(Super, specs) {
  const { onConnect, onDisconnect, onAdopted, onAttrChange } = specs;
  const [observedAttributes, attrChangedMethod] = [
    onAttrChange.attributes,
    onAttrChange.method ];
  Super.observedAttributes = observedAttributes;
  Super.prototype = {
    connectedCallback: function() {
      if (this.dataset.componentConnected === `1`) { return; }
      
      let elem = this;
      onConnect(elem);
      elem.dataset.componentConnected = 1;
      !reporter.clientOnly &&
      reporter.report(`[factory] (Re)connected an instance of &lt;${elem.myName}>`);
    },
    disconnectedCallback() {
      const elem = this;
      !reporter.clientOnly &&
      reporter.report(`[factory] Removed an instance of &lt;${elem.myName}>`);
      onDisconnect(this);
      elem.dataset.componentConnected = 0;
    },
    adoptedCallback() { return onAdopted(this); },
    attributeChangedCallback(attributeName, oldValue, newValue) {
      if (!observedAttributes.length) { return; }
      if ( observedAttributes.find(attr => attr === attributeName) ) {
        attrChangedMethod(this, attributeName, oldValue, newValue);
      }
      return true;
    },
  };
}

function initializeSpecs(specs) {
  specs.onAttrChange = contracts.attrChange(specs.onAttrChange);
  const emptyFn = function() {}
  specs.onConnect = specs.onConnect ?? emptyFn;
  specs.onDisconnect = specs.onDisconnect ?? emptyFn;
  specs.onAdopted = specs.onAdopted ?? emptyFn;
  return specs;
}

function getInstance(elem, nth = 1) {
  return [...elem.getRootNode()
    .querySelectorAll(elem.myName)].find((_, i) => nth === i + 1);
}

function now() {
  const d = new Date();
  return [d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()]
    .reduce((acc, n, i) => `${acc}${i < 3 ? `:` : `.`}${`${n}`.padStart(i < 3 ? 2 : 3, `0`)}`, ``).slice(1);
}

function getTagName(elem) {
  const isCustom = elem.getAttribute(`is`);
  return `${elem.tagName.toLowerCase()}${isCustom ? `[is='${isCustom}']` : ``}`;
}

function createOrRetrieveShadowRoot(elem, mode = { mode: `open`} ) {
  let shadow = elem.shadowRoot;
  return !shadow ? elem.attachShadow(mode) : shadow;
}

function setComponentStyleFor(elem, styling) {
  if (elem.state.styling) {
    return elem.state.styling;
  }
  
  styling = styling.startsWith(`#`)
    ? document.querySelector(styling).content.querySelector(`style`).textContent
    : styling;
  reporter.report(`[client] Storing embedded style for &lt;${elem.myName}>`);
  const componentStylesheet = new CSSStyleSheet();
  componentStylesheet.replaceSync(styling);
  elem.setComponentState({styling: componentStylesheet});
  
  return elem.state.styling;
}

function reporterFactory() {
  const HtmlEntities4Replacement = {"&lt;": `<`, "&gt;": `>`};
  let on = false;
  let defaultPrinter = function(txt) {
    console.info(`✔ ${txt.replaceAll(/&lt;|&gt;/g, a => HtmlEntities4Replacement[a])}`);
  };
  let report = defaultPrinter;
  let dontReport = function() {};
  let clientOnly = false;
  
  return {
    on() { on = true; },
    off() { on = false; },
    get now() { return now },
    set clientOnly(value) { clientOnly = IS(value, Boolean) && value || false; },
    get clientOnly() { return clientOnly; },
    set report(printer) { report = printer || defaultPrinter },
    get report() { return on && report || dontReport; }
  }
}