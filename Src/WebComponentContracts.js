import contractFactory from "./es-contract.js";

const { contracts, IS } = contractFactory({contractsPrefix: `[Web Component creator module]`});
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
        method: attrChangeObj => IS(attrChangeObj, Object) &&
          validateAttributesParam(attrChangeObj?.attributes) &&
          IS(attrChangeObj?.method, Function)
            ? attrChangeObj : undefined,
        defaultValue: {attributes: [], method: function() {}},
        expected: `{attributes: Array, method: Function}`,
      },
    }
  );
  
  function validateAttributesParam(attrs) {
    return IS(attrs, Array) && attrs.filter(value =>
        IS(value, String) && !/\s/g.test(value)).length === attrs.length &&
      attrs || undefined;
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