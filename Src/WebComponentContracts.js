import contractFactory from "./es-contract.min.js";
const { contracts, IS, tryJSON } = contractFactory({contractsPrefix: `[Web Component creator module]`});
registerContracts();

export {contracts as default, IS};

function registerContracts() {
  contracts.addContracts(
    { componentName: {
        method: customElementNameContract,
        reportViolationsByDefault: true,
        expected({customElementName} = {}) {
          return [`createComponent componentName: '${
            customElementName ?? `*no name given*`}' is not a valid custom element name!`,
            `See https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name`]
            .join(`\n`);
          }
      },
      attrChange: {
        method: onAttrChangeContract,
        defaultValue: {attributes: [], method: function() {}},
        expected: `onAttrChange expected {attributes: Array, method: Function}`,
      },
    }
  );
  
  function onAttrChangeContract(attrChangeObj) {
    const cando = IS(attrChangeObj, Object) &&
      validateAttributesParam(attrChangeObj?.attributes) &&
      IS(attrChangeObj?.method, Function);
    
    if (attrChangeObj && !cando) { doReport(); }
    
    return cando ? attrChangeObj : undefined;
    
    function doReport() {
      const meth =  IS(attrChangeObj?.method, Function) ? `Function ok` : `nothing or not a Function`;
      console.log([`✘ [Web Component creator module]`,
        `createComponent onAttrChange: contract for  parameters violated`,
        `Input: { attributes: ${tryJSON(attrChangeObj?.attributes)}, method: ${meth} }`,
        `Input expected: nothing or { attributes: Array[string], method: Function({input}) {...} }`,
        `Will use default: { attributes: [], method: () => {} }`].join(`\n   `));
    }
    
    function validateAttributesParam(attrs) {
      return IS(attrs, Array) && attrs.filter(value =>
          IS(value, String) && !/\s/g.test(value)).length === attrs.length &&
        attrs || undefined;
    }
  }
}

function customElementNameContract(name) {
  const notAllowedCustomElementNames = [
    `annotation-xml`, `color-profile`, `font-face`, `font-face-src`,
    `font-face-uri`, `font-face-format`, `font-face-name`, `missing-glyph` ];
  return IS(name, String) &&
    /\-{1,}/.test(name) &&
    name.toLowerCase() === name &&
    !notAllowedCustomElementNames.find(v => v === name) &&
    name || undefined;
}