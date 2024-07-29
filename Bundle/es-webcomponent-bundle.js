function u(t,...e){let n=typeof t=="symbol"?Symbol("any"):t;return e.length>1?L(n,...e):P(n,...e)}function P(t,...e){let{compareWith:n,inputIsNothing:o,shouldBeIsNothing:r,inputCTOR:a,is_NAN:c}=j(t,...e);return c&&n?(n=S({trial:l=>String(n),whenError:l=>""}),n===String(t)||e===Number):o||r?r?String(t)===String(n):n?!1:`${t}`:a===Boolean?n?a===n:"Boolean":M(t,n,I(t,a))}function I(t,e){return t===0?Number:t===""?String:t?e:{name:String(t)}}function j(t,...e){let n=e.length>0,o=n&&e.shift(),r=_(t),a=n&&_(o),c=!r&&Object.getPrototypeOf(t)?.constructor,l=S({trial:i=>String(t),whenError:i=>""})==="NaN";return{compareWith:o,inputIsNothing:r,shouldBeIsNothing:a,inputCTOR:c,is_NAN:l}}function M(t,e,n){return S({trial:o=>String(e),whenError:o=>"-"})==="NaN"?String(t)==="NaN":e?S({trial:o=>t instanceof e,whenError:o=>!1})||e===n||e===Object.getPrototypeOf(n)||`${e?.name}`===n?.name:n?.name}function L(t,...e){for(let n of e)if(u(t,n))return!0;return!1}function _(t){return S({trial:e=>/^(undefined|null)$/.test(String(t)),whenError:e=>!1})}function S({trial:t,whenError:e=n=>console.log(n)}={}){if(!t||!(t instanceof Function))return console.info("TypeofAnything {maybe}: trial parameter not a Function or Lambda"),!1;try{return t()}catch(n){return e(n)}}function H({IS:t,tryJSON:e,contractsPrefix:n}={}){return n=n&&`${n}
`||"",{EN:{unknownOrNa:"unknown or n/a",unknown:"unknown",nameOkExpected:"The contract to add needs a name (String)",isMethodExpected:"The contract to add needs a method (Function)",expectedOkExpected:"The contract to add needs an expected value method (String|Function)",addContracts_Contract_Expected:"the parameter for [addContracts] should be at least { [contractName]: { method: Function, expected: String|Function } }",addContract_Contract_Expected:`addContract parameters should at least be {name, method, expected}
(when method is a named function, the name was derived from that)`,report_sorry:(o,r)=>`\u2718 ${n}Contract violation for contract [${o}], input ${r}`,report_forValue:o=>`${o}`,report_Expected:o=>`
${o}`,report_defaultValue:(o,r)=>o?"":`
Using the contract default value (${t(r,Function)?r.toString():t(r,String)?`"${r}"`:e(r)}) instead`},NL:{unknownOrNa:"onbekend of nvt",unknown:"onbekend",nameOkExpected:"Het contract moet een naam hebben (eigenschap name: String)",isMethodExpected:"Het contract moet kunnen worden uitgevoerd (eigenschap method: Function)",expectedOkExpected:"Het contract moet aangeven wat er wordt verwacht (eigenschap expected: String|Function)",addContracts_Contract_Expected:"De parameter for [addContracts] moet tenminste { [contractName]: { method: Function, expected: String|Function } } zijn",addContract_Contract_Expected:`De invoer vooor [addContract] moet tenminste {name, method, expected} zijn
(wanneer de eigenschap [method] een functie met naam was wordt [name] daarvan afgeleid)`,report_sorry:(o,r)=>`\u2718 ${n} Contractbreuk voor contract [${o}], input ${r}`,report_forValue:o=>`${o}`,report_Expected:o=>`
${o}`,report_defaultValue:(o,r)=>o?"":`
In plaats daarvan wordt de voor dit contract toegekende standaardwaarde (${t(r,Function)?r.toString():t(r,String)?`"${r}"`:e(r)}) gebruikt`}}}var s,F=z,v=q(),A=J();function z(t){l(t);let{reporter:e,logViolations:n,alwaysThrow:o,language:r,contractsPrefix:a}=t;s=H({IS:u,tryJSON:N,contractsPrefix:a})[r];let c={addContract:b,addContracts:i};return U(c),Object.freeze({contracts:c,IS:u,tryJSON:N});function l(d){d.reporter=d.reporter||E,d.logViolations=d.logViolations||!1,d.alwaysThrow=d.alwaysThrow||!1,d.language=d.language||"EN"}function i(d){if(!c.addContracts_Contract(d))return;let m=Object.entries(d);for(let[p,h]of m)b({...h,paramsChecked:!0,name:p})}function b(d=v.addContract){let{name:m,method:p,expected:h,defaultValue:y,customReport:g,reportFn:O,shouldThrow:V,reportViolationsByDefault:x,paramsChecked:w}=d;m=m||p?.name;let B=c.addContract_Contract||A.checkSingleContractParameters;if(!w&&!B({name:m,method:p,expected:h}))return;let D=W({name:m,method:p,expected:h,defaultValue:y,reporter:e,reportFn:O,customReport:g,reportViolationsByDefault:x,logViolations:n,shouldThrow:V,alwaysThrow:o});return Object.defineProperty(c,m,{value:D,enumerable:!0})}}function W(t=v.createContract){let{name:e,method:n,expected:o,defaultValue:r,customReport:a,reportFn:c,reporter:l,logViolations:i,shouldThrow:b,reportViolationsByDefault:d,alwaysThrow:m}=t;return function(p,...h){let y=n(p,...h),g=u(h[0],Object)&&{...h[0],value:p}||{value:p};if(c=c??l??E,u(a,Function)&&a(g),$(y)){let O=u(o,Function)?o(g):o;y=!$(g.defaultValue)||r?g.defaultValue||r:y;let[V,x]=[g.reportViolation??d,g.shouldThrow??b];if(V||x||i){let w=K({inputValue:p,defaultValue:y,shouldBe:O,fnName:e||n.name});if(x||m)throw new TypeError(w);l(w)}}return y}}function q(){let[t,e,n,o,r,a,c]=[...Array(7)];return{get reportViolations(){return{inputValue:c,defaultValue:o,shouldBe:s.unknowOrNa,fnName:s.unknown}},get createContract(){return{name:t,method:e,expected:n,defaultValue:o,customReport:r,reportFn:a,reporter:E,logViolations:!1,shouldThrow:!1,alwaysThrow:!1,reportViolationsByDefault:!1}},get addContract(){return{name:t,method:e,expected:n,defaultValue:o,customReport:r,reportFn:a,reporter:E,shouldThrow:!1,reportViolationsByDefault:!1,paramsChecked:!1}}}}function J(){let t=o=>u(o,String)&&o.trim().length,e=o=>u(o,String)&&o.length||u(o,Function),n=o=>u(o,Function);return{nameOk:t,expectedOk:e,isMethod:n,checkSingleContractParameters:({name:o,method:r,expected:a}={})=>o&&t(o)&&r&&n(r)&&a&&e(a)}}function U(t){let{nameOk:e,expectedOk:n,isMethod:o,checkSingleContractParameters:r}=A;t.addContract({method:e,expected:s.nameOkExpected,reportViolationsByDefault:!0}),t.addContract({method:o,expected:s.isMethodExpected,reportViolationsByDefault:!0}),t.addContract({method:n,expected:s.expectedOkExpected,reportViolationsByDefault:!0}),t.addContract({name:"addContracts_Contract",method:a=>u(a,Object)&&[...Object.entries(a)].filter(([,c])=>c.method&&o(c.method)&&c.expected&&n(c.expected)).length>0?a:void 0,expected:s.addContracts_Contract_Expected,reportViolationsByDefault:!0}),t.addContract({name:"addContract_Contract",method:r,expected:s.addContract_Contract_Expected,reportViolationsByDefault:!0})}function K(t=v.reportViolations){let{inputValue:e,defaultValue:n,shouldBe:o,fnName:r}=t,a=s.report_sorry(r,G(e)),c=s.report_forValue(a),l=s.report_Expected(o),i=s.report_defaultValue($(n),n);return Q(`${c}${l}${i}`)}function Q(t,e=3){return t.replace(/\n/g,`
${" ".repeat(e)}`)}function $(t){return u(t,void 0,null,NaN)}function N(t){return X(()=>{let e=JSON.stringify(t);return/Infinity|NaN/.test(e)?e.replace(/"/g,""):e},t)}function G(t){let e=n=>u(n,String)?`"${n}"`:u(n,Object)?N(n):String(n);return u(t,String)?`"${t}"`:u(t,Object)?N(t):/Array\(/.test(t?.constructor.toString())?`[${[...t].map(e)}]`:String(t)}function E(t){console.info(t)}function X(t,e){try{return t()}catch(n){return console.error({isOk:n.name===expected,message:n.message,type:n.name}),e}}var{contracts:k,IS:f,tryJSON:Y}=F({contractsPrefix:"[Web Component creator module]"});Z();function Z(){k.addContracts({componentName:{method:tt,reportViolationsByDefault:!0,expected({customElementName:e}={}){return[`createComponent componentName: '${e??"*no name given*"}' is not a valid custom element name!`,"See https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name"].join(`
`)}},attrChange:{method:t,defaultValue:{attributes:[],method:function(){}},expected:"onAttrChange expected {attributes: Array, method: Function}"}});function t(e){let n=f(e,Object)&&r(e?.attributes)&&f(e?.method,Function);return e&&!n&&o(),n?e:void 0;function o(){let a=f(e?.method,Function)?"Function ok":"nothing or not a Function";console.log(["\u2718 [Web Component creator module]","createComponent onAttrChange: contract for  parameters violated",`Input: { attributes: ${Y(e?.attributes)}, method: ${a} }`,"Input expected: nothing or { attributes: Array[string], method: Function({input}) {...} }","Will use default: { attributes: [], method: () => {} }"].join(`
   `))}function r(a){return f(a,Array)&&a.filter(c=>f(c,String)&&!/\s/g.test(c)).length===a.length&&a||void 0}}}function tt(t){let e=["annotation-xml","color-profile","font-face","font-face-src","font-face-uri","font-face-format","font-face-name","missing-glyph"];return f(t,String)&&/\-{1,}/.test(t)&&t.toLowerCase()===t&&!e.find(n=>n===t)&&t||void 0}var T={};["a","area","audio","br","base","body","button","canvas","dl","data","datalist","div","em","fieldset","font","footer","form","hr","head","header","output","iframe","frameset","img","input","li","label","legend","link","map","mark","menu","media","meta","nav","meter","ol","object","optgroup","option","p","param","picture","pre","progress","quote","script","select","source","span","style","caption","td","col","table","tr","template","textarea","time","title","track","details","ul","video","del","ins","slot","blockquote","svg","dialog","summary","main","address","colgroup","tbody","tfoot","thead","th","dd","dt","figcaption","figure","i","b","code","h1","h2","h3","h4","abbr","bdo","dfn","kbd","q","rb","rp","rt","ruby","s","strike","samp","small","strong","sup","sub","u","var","wbr","nobr","tt","noscript"].forEach(t=>{Object.defineProperty(T,t,{get(){if(!t)return;let e=document.createElement(t)?.constructor;return e!==HTMLUnknownElement?e:void 0}})});var R=Object.freeze(T);var C=dt();function ht(t){t=rt(t);let{componentName:e}=t;if(k.componentName(e)&&!customElements.get(e)){let n=t.extends?.toLowerCase()?.trim(),o=R[n]??HTMLElement,r=et({forElem:o});ot(r,t),!C.clientOnly&&C.report(`[factory] Registered component "${e}"`),customElements.define(e,r,{extends:n})}}function et({forElem:t}={}){let e=t;return function n(){return n.prototype=e.prototype,nt(n),Reflect.construct(e,[],n)}}function nt(t){if(!t.prototype.setComponentState){let e={},n=o=>o.hasAttribute("is")||/-/.test(o.tagName);Object.defineProperties(t.prototype,{myName:{get:function(){return it(this)}},state:{get:function(){return n(this)&&e[this.myName]||{}}},nth:{value:function(o){return f(o,Number,void 0)&&at(this,o)||void 0}},instanceNr:{get(){return n(this)&&getInstancePositionInDom(this)}},setComponentState:{value:function(o){if(n(this)){let r=this.myName;Object.entries(o).forEach(([a,c])=>{e[r]=e[r]??{component:this.myName},e[r][a]=c})}}}})}}function ot(t,e){let{onConnect:n,onDisconnect:o,onAdopted:r,onAttrChange:a}=e,[c,l]=[a.attributes,a.method];t.observedAttributes=c,t.prototype={connectedCallback:function(){if(this.dataset.componentConnected==="1")return;let i=this;n(i),i.dataset.componentConnected=1,!C.clientOnly&&C.report(`[factory] (Re)connected an instance of &lt;${i.myName}>`)},disconnectedCallback(){let i=this;!C.clientOnly&&C.report(`[factory] Removed an instance of &lt;${i.myName}>`),o(this),i.dataset.componentConnected=0},adoptedCallback(){return r(this)},attributeChangedCallback(i,b,d){if(c.length)return c.find(m=>m===i)&&l(this,i,b,d),!0}}}function rt(t){t.onAttrChange=k.attrChange(t.onAttrChange);let e=function(){};return t.onConnect=t.onConnect??e,t.onDisconnect=t.onDisconnect??e,t.onAdopted=t.onAdopted??e,t}function at(t,e=1){return[...t.getRootNode().querySelectorAll(t.myName)].find((n,o)=>e===o+1)}function ct(){let t=new Date;return[t.getHours(),t.getMinutes(),t.getSeconds(),t.getMilliseconds()].reduce((e,n,o)=>`${e}${o<3?":":"."}${`${n}`.padStart(o<3?2:3,"0")}`,"").slice(1)}function it(t){let e=t.getAttribute("is");return`${t.tagName.toLowerCase()}${e?`[is='${e}']`:""}`}function gt(t,e={mode:"open"}){let n=t.shadowRoot;return n||t.attachShadow(e)}function yt(t,e){if(t.state.styling)return t.state.styling;e=e.startsWith("#")?document.querySelector(e).content.querySelector("style").textContent:e,C.report(`[client] Storing embedded style for &lt;${t.myName}>`);let n=new CSSStyleSheet;return n.replaceSync(e),t.setComponentState({styling:n}),t.state.styling}function dt(){let t={"&lt;":"<","&gt;":">"},e=!1,n=function(c){console.info(`\u2714 ${c.replaceAll(/&lt;|&gt;/g,l=>t[l])}`)},o=n,r=function(){},a=!1;return{on(){e=!0},off(){e=!1},get now(){return ct},set clientOnly(c){a=f(c,Boolean)&&c||!1},get clientOnly(){return a},set report(c){o=c||n},get report(){return e&&o||r}}}export{gt as createOrRetrieveShadowRoot,ht as default,C as reporter,yt as setComponentStyleFor};
