import {
  logFactory,
  $
} from "https://cdn.jsdelivr.net/gh/KooiInc/SBHelpers@latest/index.browser.bundled.js";
import {
  default as CreateComponent,
  reporter,
  createOrRetrieveShadowRoot,
  setComponentStyleFor
} from "../Src/WebComponentFactory.js";

let templates = await fetch("./Demo-Templates.html")
  .then(r => r.text())
  .then(doc =>
    Object.assign(document.createElement(`template`), {innerHTML: doc})
      .content);
const { log: print, logTop: printTop } = logFactory();
initialize();

function createComponents() {
  // (dynamic) html
  CreateComponent({
    componentName: `expanding-list`,
    onConnect: expandingListRenderer,
    onAttrChange: { attributes: [`data-hithere`], method: attrChange },
  } );
  
  // in the shadows
  CreateComponent( {
    componentName: `my-counter`,
    onConnect: myCounterRenderer,
    onAttrChange: { attributes: `no sir` },
    //            ∟ onAttrChange bound by contract, so this will have no
    //              no effect, but contract violation reported in console
    extends: `DIV`,
  });
  
  // (dynamic) html and in the shadows
  CreateComponent({
    componentName: `expandable-text`,
    onConnect: expandableTextRenderer,
  } );
  
  // slotted
  CreateComponent( {
    componentName: `copyright-slotted`,
    onConnect(elem) {
      const shadow = createOrRetrieveShadowRoot(elem);
      const componentStyle = Object.assign(
        document.createElement("style"),
        { textContent: `
          :host {
            color: #777;
            display: block;
            position: fixed;
            bottom: 0.5rem;
            right: 2rem;
            z-index: 2;
          }
          ::slotted(span.yr) {
            font-weight: bold;
            color: green;
          }
          ::slotted(a[target]) {
            text-decoration: none;
            font-weight: bold;
          }
          ::slotted(a[target]):before {
            color: rgba(0, 0, 238, 0.7);
            font-size: 1.1rem;
            padding-right: 2px;
            vertical-align: baseline;
          }
          ::slotted(a[target="_blank"]):before { content: "↗"; }
          ::slotted(a[target="_top"]):before { content: "↺"; }
          ::slotted(a[target]):after {
            content: ' | ';
            color: #000;
            font-weight: normal;
          }
          ::slotted(a[target]:last-child):after { content: '';  }`
        } );
      const content = Object.assign(
        document.createElement(`div`), {
          innerHTML: `&copy; <span><slot name="year"/></span> KooiInc <slot name="link"/>`})
      shadow.append(componentStyle, content);
    }
  });
  
  implement();
}

function insertCopyright() {
  const isSB = /stackblitz/i.test(location.href);
  const isGithub = /github/i.test(location.href)
  const sbLink = isSB ? `<a slot="link" target="${isSB ? `_top` : `_blank`}" href="//stackblitz.com/@KooiInc">All projects</a>` : ``;
  const ghLink = `<a slot="link" target="${isGithub ? `_top` : `_blank`}"
    href="https://github.com/KooiInc/es-webcomponent-factory">${isGithub ? `Back to ` : `@`}Github</a>`;
  document.body.insertAdjacentHTML(`afterbegin`,
    `<copyright-slotted>&copy;
        <span slot="year" class="yr">${new Date().getFullYear()}</span>
        KooiInc ${sbLink} | ${ghLink}
    </copyright-slotted>`);
}

function initialize() {
  // add favicon
  $.link_jql({rel: `icon`, href: `./KooiInc.png`}).appendTo($(`head`));
  
  // preloaded web component styles
  templates.querySelectorAll(`[data-preload]`).forEach(el => document.body.append(el.content));
  
  // style demonstration page
  stylePage();
  
  // handle reportng
  reporter.on();
  reporter.clientOnly = !!(+localStorage.getItem(`clientOnly`));
  const logAscending = !!(+localStorage.getItem(`logAscending`));
  reporter.report = logDemoFactory(!!(+localStorage.getItem(`logAscending`)));
  
  // crete the web components
  createComponents();
  
  // inject (handled) buttons for logging
  addLogButtons();
}

function implement() {
  // add stuff to the DOM
  templates.querySelectorAll(`template:not([data-preload])`)
    .forEach(template => document.body.prepend(template.content));
  
  templates = null;
  
  // create .customContainer and move expanded-list elements to it
  const customContainer = $(`<div class="customContainer">`, $(`#log2screen`), $.at.before)
    .append($(`body > expandable-text`))
    .append($(`expanding-list`));
  
  // check attribute change listener
  $.node(`expanding-list`).setAttribute(`data-hithere`, `Hello World`);
  
  // append counter examples (nested withing a expandable-text component)
  $(`<expandable-text data-from-template="counter-header-text">`)
    .appendTo(customContainer);
  
  // add copyright-slotted component (top of document)
  insertCopyright();
  
  // move log entries to their own container and prepend a header
  // (a expandable-text component)
  $(`<div id="logContainer">`, $(`.customContainer`), $.at.AfterEnd)
    .append($(`#log2screen`))
    .prepend($(`<expandable-text data-from-template="log-header-notes">`));
  
  // popup with small test in callback (not safari)
  $.Popup.show({content: `All done, enjoy`, closeAfter: 2, callback: iWillBeBack});
}

function expandableTextRenderer(elem) {
  unHide(elem);
  const templateId = elem.dataset.fromTemplate;
  const shadow = createOrRetrieveShadowRoot(elem);
  
  if (!elem.state.handler) {
    reporter.report(`[client] Storing embedded handler for &lt;${elem.myName}>`);
    elem.setComponentState( { handler } );
    setComponentStyleFor(elem, `#expandable-text-style`);
  }
  
  shadow.adoptedStyleSheets = [elem.state.styling];
  shadow.innerHTML = templateId
    ? $.node(`#${templateId}`).content.firstElementChild.innerHTML
    : elem.innerHTML;
  
  const header = shadow.querySelector(`[data-expanded]`) ||
    shadow.querySelector(`.fold`).previousElementSibling;
  header.dataset.expanded = header.dataset.expanded ?? '0';
  shadow.addEventListener(`click`, elem.state.handler);
  
  function handler(evt) {
    // only the header element
    const me = evt.target.dataset.expanded
      ? evt.target
      : evt.target.querySelector(`[data-expanded]`);
    
    if (!me) { return; }
    
    me.nextElementSibling.scrollTo(0, 0);
    const expandedState = +me.dataset.expanded;
    return me.dataset.expanded = String(+(!!!(expandedState)));
  }
}

function myCounterRenderer(elem) {
  const shadow = createOrRetrieveShadowRoot(elem);
  shadow.adoptedStyleSheets = [setComponentStyleFor(elem, getCounterComponentStyle())];
  shadow.innerHTML = `
      <div class="content">
        <div class="obligCounter" data-value="0" id="theCounterBttn"></div>
      </div>`;
  shadow
    .querySelector(`.content`)
    .addEventListener(`pointerdown`, counterBttnHandlerFactory(elem));
}

function expandingListRenderer(elem) {
  unHide(elem);
  if (!elem.state.HandledAndStyled) {
    handleExpandingList(elem);
    styleExpandingListComponent(elem);
    elem.setComponentState({HandledAndStyled: true});
  }
  
  [...elem.querySelectorAll(`ul ul`)].forEach((ul) => { ul.classList.add(`hidden`); });
  [...elem.querySelectorAll(`li`)].forEach( li => {
    if (li.querySelectorAll(`ul`).length > 0)  {
      li.classList.add("closed");
      li.firstChild.replaceWith(
        Object.assign( document.createElement("span"), {
          textContent: li.childNodes[0].textContent.trim(),
          className: `point`} ));
    }
  });
}

function logDemoFactory(ascending) {
  const { now } = reporter;
  
  return function(...args) {
    args[0] = `${now()} ${args[0]}`;
    return ascending ? print(...args) : printTop(...args);
  }
}

function counterBttnHandlerFactory() {
  let timer;
  let value;
  let down = false;
  let reset = false;
  const upperLimit = 999;
  const reportStart = _ =>
    reporter.report(`my-counter handler: counting <span class="${down ? `down` : `up`}"></span>`);
  
  return function(evt) {
    const theButton = evt.target.id === `theCounterBttn`
      ? evt.target
      : evt.target.querySelector(`#theCounterBttn`);
    const downState = down;
    down = evt.shiftKey;
    reset = evt.ctrlKey || evt.metaKey;
    
    if (!down && !reset && timer) { return stop(``, theButton); }
    
    if (reset) {
      theButton.dataset.value = '0';
      return stop(`reset requested`, theButton);
    }
    
    if (timer) {
      if (downState !== down) {
        reporter.report(`my-counter handler: SHIFT detected, reversing ...`);
        reportStart();
      }
      return;
    }
    
    theButton.classList.add(`active`);
    timer = setTimeout(timed, 50);
    
    reportStart();
    
    function timed() {
      value = +theButton.dataset.value + (down ? -1 : 1);
      
      if (value === upperLimit) {
        reporter.report(`my-counter handler: limit ${upperLimit} reached, reversing...`);
        down = true;
        reportStart();
      }
      
      if (value <= 0) {
        theButton.dataset.value = 0;
        theButton.dataset.descending = '0';
        return stop(`zero reached`, theButton);
      }
      
      theButton.dataset.value = value < 0 ? 0 : value;
      timer = setTimeout(timed, 50);
    }
  }
  
  function stop(reason, bttn) {
    bttn.classList.remove(`active`);
    timer && reporter.report(`my-counter handler stopped${reason?.trim()?.length ? `:` : ` `} ${reason}`);
    clearTimeout(timer);
    down = false;
    timer = undefined;
  }
}

function iWillBeBack() {
  const tmpElem = $(`<span id="_TMP">
      <span style="color:red;font-weight:bold">I'll be back</span> ...
      <div>test element manipulation within (nested) shadow roots 'from the outside'</div>
      </span>`).first();
  
  $.node(`expandable-text`).nth(3).shadowRoot
    .querySelector(`div[is]`).nth(2)
    .replaceWith(tmpElem);
  setTimeout(_ => tmpElem.replaceWith($(`<div is='my-counter'>`).first()), 4000);
}

function addLogButtons() {
  const states = {
    clientOnly: +(localStorage.getItem(`clientOnly`) || 0),
    ascending: +(localStorage.getItem(`logAscending`) || 0), }
  const toggleState = current => !!!current;
  const title = `Note: reloads document`;
  $(`#log2screen`).beforeMe($(`
    <div class="logBttns" >
      <button
        data-logaction="logDirection"
        data-logascending="${states.ascending}"
        title="${title}"
        >${states.ascending ? `Descending` : `Ascending`}
      </button>
      <button
        data-logaction="clientOnly"
        data-clientonly="${states.clientOnly}"
        title="${title}"
        >${!!states.clientOnly ? `All log messages` : `Client only log messages`}</button>
      <button data-logaction="removeLine">Clear first log line</button>
      <button data-logaction="removeAll">Clear log</button>
    </div>`)
  );
  
  $.delegate(`click`, `[data-logaction]`, evt => {
    const origin = evt.target;
    console.log(origin);
    
    if (origin.dataset.logaction === `removeAll`) {
      return $(`#log2screen`).find$(`li:not(.logBttns)`).remove();
    }
    
    if (origin.dataset.logaction === `logDirection`) {
      const flippedState = toggleState(states.ascending);
      localStorage.setItem(`logAscending`, +flippedState);
      return location.reload();
    }
    
    if (origin.dataset.logaction === `clientOnly`) {
      const flippedState = toggleState(!!states.clientOnly || false)
      localStorage.setItem(`clientOnly`, +flippedState);
      return location.reload();
    }
    
    if (origin.dataset.logaction === `removeLine`) {
      return $(`#log2screen li:not(.logBttns)`).first().remove();
    }
  });
}

function attrChange(elem, name, oldV, newV) {
  reporter.report(`[client] [${name}] for an instance of &lt;${elem.myName}> changed from ${
    oldV || `""`} to "${newV}"`);
}

function handleExpandingList(elem) {
  const handler = evt => {
    const next = evt.target.nextElementSibling;
    
    if (next.classList.contains(`hidden`)) {
      next.classList.remove(`hidden`);
      return next.parentNode.classList.replace(`closed`, `open`);
    }
    
    next.classList.add(`hidden`);
    next.parentNode.classList.replace(`open`, `closed`);
    
  };
  reporter.report(`[client] Handling &lt;${elem.myName}> (delegate, so once)`);
  $.delegate(`click`, `${elem.myName} span`, handler);
}

function getCounterComponentStyle() {
  return [
    `:host {
        display: inline-block;
        cursor: pointer;
        user-select: none;
      }`,
    `.content {
        border: 1px solid #777;
        display: inline-block;
        text-align: center;
        width: 100px;
        margin: 0;
        padding: 5px;
      }`,
    `div.content:hover:after {
        content: 'Click to start/stop counting (0<->999), Shift+click to count downward, Ctrl/Cmd+click to reset';
        color: #444;
        padding: 3px;
        display: block;
        position: absolute;
        width: 250px;
        margin: -1.2rem 0 0 60px;
        font-size: 0.8rem;
        font-weight: normal;
        line-height: 1rem;
        background-color: white;
        border-radius: 5px;
        box-shadow: 1px 1px 6px #777;
      }`,
    `div.obligCounter {
        background-color: rgb(239 239 239);
        display: inline-block;
        width: 80px;
        height: 50px;
        color: #999;
        border: none;
        border-radius: 8px;
        font-weight: bold;
        font-size: 2rem;
        text-align: center;
        line-height: 50px;
        border: 1px solid transparent;
      }`,
    `.content:hover div.obligCounter, div.obligCounter.active {
        color: blue;
        box-shadow: #c0c0c0 1px 1px 6px 2px;
        border-color: #999;
      }`,
    `div.obligCounter:after {content: attr(data-value); }`,
  ].join(``);
}

function styleExpandingListComponent(elem) {
  const myName = elem.myName;
  reporter.report(`[client] Styling: &lt;${myName}&gt; (in global css, so once)`);
  const { right, down } = getBGImages();
  $.editCssRules(
    `${myName} { margin-top: 0; display: block; }`,
    `${myName} .point { cursor: pointer; }`,
    `${myName} ul.hidden { display: none; }`,
    `${myName} ul li:first-child h3 { margin: 0; }`,
    `${myName} ul {
      list-style-type: none;
      margin: 0 0 0 -2rem;
     }`,
    `${myName} ul:first-child {
      margin-top: 0.6rem;
     }`,
    `${myName} ul ul li {
      margin-left: -1rem;
    }`,
    `${myName} ul li.open,
     ${myName} ul li.closed {
      background-size: 1rem 1rem;
      padding-left: 1.5rem;
    }`,
    `${myName} li.open {
      background: url(${right}) no-repeat 2px 2px;
    }`,
    `${myName} li.closed {
      background: url(${down}) no-repeat 2px 2px;
    }`,
    `${myName} li:not(.open, .closed, .header)::before {
      text-align: right;
      content: "✓";
      padding-right: 6px;
      margin-left: 0.5rem;
    }`,
  );
}

function stylePage() {
  $.editCssRules(
    `table { display: inline-block; vertical-align: text-top; border-collapse: collapse; }`,
    `td, th { border: 1px solid #c0c0c0}; padding: 0 4px;`,
    `body { line-height: 1.4rem; }`,
    `.logBttns { margin: 0.5rem 0 0 1.4rem; }`,
    `#log2screen li div, #log2screen li p,
     .customContainer div, .customContainer p {
      font-family: 'gill sans',
      system-ui;
      line-height: 1.4rem; }`,
    `button { margin-right: 0.2rem; }`,
    `code.block {
      display: block;
      padding: 6px;
      margin: 0.5rem 0;
      max-width: 90%;
    }`,
    `code .comment{
      color: #999;
    }`,
    `code { font-size: 0.9em; }`,
    `expandable-text { display: none; }`,
    `div.local { font-family: roboto, monospace; }`,
    `.head div, .head p { font-weight: normal; padding-right: 2rem; }`,
    `.head h3 { margin-bottom: 0.3rem; }`,
    `div.q { display: inline-block;
      padding: 0 6rem 0px 2rem;
      font-family: Georgia, verdana;
      font-style: italic;
      color: #777; }`,
    `div.q:before {
      font-family: Georgia, verdana;
      content: '\\201C';
      position: absolute;
      font-size: 2rem;
      color: #c0c0c0;
      margin-left: -2rem;
      margin-top: 0.5rem;
     }`,
    `.center { text-align: center; }`,
    `code, code.inline {
      background-color: rgb(227, 230, 232);
      color: rgb(12, 13, 14);
      padding: 2px 4px;
      display: inline;
      border-radius: 4px;
      margin: 1px 0;
    }`,
    `.testKey { font-family: "courier new"; color: green; font-weight: bold; }`,
    `.testKey.sub, .testKey.sub.error { display: block; }`,
    `.testKey:not(.popup):after { content: " =>" }`,
    `.testKey.error, testKey.sub.error { color: red; }`,
    `.testSubMsg { color: #999; margin-left: 1.5rem; }`,
    `code.language-javascript { background-color: transparent; }`,
    `i.red {color: red}`,
    `.container {
      inset: 0;
      position: absolute;
    }`,
    `span.down:after, span.up:after {
      font-size: 1.5em;
      content: '\\261D';
      transform: rotate(40deg);
      display: inline-block;
    }`,
    `span.down:after {
      vertical-align: middle;
      transform: rotate(220deg);
    }`,
    `#log2screen, .customContainer, #logContainer {
      max-width: 50vw;
      margin: 0 auto;
      @media (max-width: 1024px) {
        max-width: 90vw;
      }
      @media (min-width: 1024px) and (max-width: 1200px) {
        max-width: 70vw;
      }
      @media (min-width: 1200px) and (max-width: 1600px) {
        max-width: 60vw;
      }
      @media (min-width: 1600px) {
        max-width: 40vw;
      }
    }`,
    `.customContainer { margin: 1rem auto;}`,
    `#log2screen li:last-child { padding-bottom: 2rem; }`,
    `.visible { display: revert; }`,
  );
}

function unHide(elem) {
  elem = $(elem);
  if (!elem.is.visible) {
    elem.addClass(`visible`);
  }
}

function getBGImages() {
  // Note: ES6 StackBlitz apps can not address image files, that's why we use base64
  return {
    right: "data:image/png;base64,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",
    down: "data:image/png;base64,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"
  };
}