import IS from "./typofany.module.js";
import languageFactory from "./Language.js";
let lang;

export default typeContractFactory;

const destructuredPresets = getParams4Destructuring();
const localFactoryContractMethods = getFactoryContractCheckMethods();

function typeContractFactory({
    reporter = defaultViolationReporter,
    logViolations = false,
    alwaysThrow = false,
    language = `EN`,
    contractsPrefix } = {}) {
  lang = languageFactory({IS, tryJSON, contractsPrefix})[language];
  const contracts = { addContract, addContracts };
  addFactoryContracts( contracts );
  
  return Object.freeze({ contracts, IS, tryJSON });
  
  function addContracts(contractLiterals) {
    if (!contracts.addContracts_Contract(contractLiterals)) { return; }
    
    const entries = Object.entries(contractLiterals);
    
    for (let [name, contract] of entries) {
      addContract( { ...contract, paramsChecked: true, name } );
    }
  }
  
  function addContract( params = destructuredPresets.addContract ) {
    let { name, method, expected, defaultValue, customReport, reportFn,
      shouldThrow, reportViolationsByDefault, paramsChecked } = params;
    name = name || method?.name;
    const addContract_Contract = contracts.addContract_Contract ||
      localFactoryContractMethods.checkSingleContractParameters;
    
    if (!paramsChecked && !addContract_Contract({name, method, expected})) { return; }
    
    const embedded = createContractMethod( {
      name, method, expected, defaultValue, reporter,
      reportFn,  customReport, reportViolationsByDefault,
      logViolations, shouldThrow, alwaysThrow } );
    
    return Object.defineProperty( contracts, name, { value: embedded, enumerable: true } );
  }
}

function createContractMethod( params = destructuredPresets.createContract ) {
  let { name, method, expected, defaultValue, customReport, reportFn, reporter,
    logViolations, shouldThrow, reportViolationsByDefault, alwaysThrow } = params;
  return function(value, ...args) {
    let resolved = method(value, ...args);
    const argsWithValue = IS(args[0], Object) && {...args[0], value} || {value};
    reportFn = reportFn ?? reporter ?? defaultViolationReporter;
    
    if (IS(customReport, Function)) { customReport(argsWithValue); }
    
    if (isNothing(resolved)) {
      const expectedValue = IS(expected, Function) ? expected(argsWithValue) : expected;
      
      resolved = !isNothing(argsWithValue.defaultValue) || defaultValue
        ? (argsWithValue.defaultValue || defaultValue) : resolved;
      
      const [doReport, throwIt] = [
        argsWithValue.reportViolation ?? reportViolationsByDefault,
        argsWithValue.shouldThrow ?? shouldThrow ];
      
      if ( doReport || throwIt || logViolations) {
        const aggregatedReport = getViolationReport( {
          inputValue: value,
          defaultValue: resolved,
          shouldBe: expectedValue,
          fnName: name || method.name,
        } );
        
        if (throwIt || alwaysThrow) {
          throw new TypeError(aggregatedReport);
        }
        
        reporter(aggregatedReport);
      }
    }
    
    return resolved;
  };
}

function getParams4Destructuring() {
  const [ name, method, expected, defaultValue, customReport,
    reportFn, inputValue ] = [...Array(7)];
  return {
    get reportViolations() {
      return { inputValue, defaultValue, shouldBe: lang.unknowOrNa, fnName: lang.unknown, };
    },
    get createContract() {
      return { name, method, expected, defaultValue, customReport, reportFn,
        reporter: defaultViolationReporter,
        logViolations: false, shouldThrow: false, alwaysThrow: false,
        reportViolationsByDefault: false };
    },
    get addContract() {
      return { name, method, expected, defaultValue, customReport, reportFn,
        reporter: defaultViolationReporter, shouldThrow: false,
        reportViolationsByDefault: false, paramsChecked: false };
    },
  }
}

function getFactoryContractCheckMethods() {
  const nameOk = name => IS(name, String) && name.trim().length;
  const expectedOk = expected => IS(expected, String) && expected.length || IS(expected, Function);
  const isMethod = method => IS(method, Function);
  const checkSingleContractParameters = ({name, method, expected} = {}) =>
    name && nameOk(name) &&
    method && isMethod(method) &&
    expected && expectedOk(expected);
  
  return { nameOk, expectedOk, isMethod, checkSingleContractParameters  };
}

function addFactoryContracts( contracts ) {
  const {nameOk, expectedOk, isMethod, checkSingleContractParameters} = localFactoryContractMethods;
  contracts.addContract({
    method: nameOk,
    expected: lang.nameOkExpected,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    method: isMethod,
    expected: lang.isMethodExpected,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    method: expectedOk,
    expected: lang.expectedOkExpected,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    name: `addContracts_Contract`,
    method: literals => {
      const checked = IS(literals, Object) &&
        [...Object.entries(literals)].filter( ([, value]) =>
          value.method &&
          isMethod(value.method) &&
          value.expected &&
          expectedOk(value.expected) ).length > 0;
      
      return checked ? literals : undefined;
    },
    expected: lang.addContracts_Contract_Expected,
    reportViolationsByDefault: true,
  });
  contracts.addContract({
    name: `addContract_Contract`,
    method: checkSingleContractParameters,
    expected: lang.addContract_Contract_Expected,
    reportViolationsByDefault: true,
  });
}

function getViolationReport( params = destructuredPresets.reportViolations ) {
  const { inputValue, defaultValue, shouldBe, fnName } = params;
  const sorryDave = lang.report_sorry(fnName, formatInput(inputValue));
  const forValue =  lang.report_forValue(sorryDave);
  const itIsNot = lang.report_Expected(shouldBe);
  const defaultVal = lang.report_defaultValue(isNothing(defaultValue), defaultValue);
  
  return indent(`${forValue}${itIsNot}${defaultVal}`);
}

function indent(str, n = 3) {
  return str.replace(/\n/g, `\n${` `.repeat(n)}`);
}

function isNothing(val) {
  return IS(val, undefined, null, NaN);
}

function tryJSON(value) {
  const trialLambda = () => {
    const trial = JSON.stringify(value);
    return /Infinity|NaN/.test(trial) ? trial.replace(/"/g, ``) : trial;
  };
  
  return tryValue(trialLambda, value);
}

function formatInput(inputValue) {
  const arrayMapper = v =>
    IS(v, String) ? `"${v}"` :
      IS(v, Object) ? tryJSON(v) : String(v);
  return IS(inputValue, String)
    ? `"${inputValue}"`
    : IS(inputValue, Object)
      ? tryJSON(inputValue)
      : /Array\(/.test(inputValue?.constructor.toString())
        ? `[${[...inputValue].map(arrayMapper)}]`
        : String(inputValue);
}

function defaultViolationReporter(violationInfo) {
  console.info(violationInfo);
}

function tryValue(lambda, valueRaw) {
  try { return lambda(); }
  catch(err) {
    console.error({ isOk: err.name === expected, message: err.message, type: err.name });
    return valueRaw;
  }
}