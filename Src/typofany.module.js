export default IS;

function IS(obj, ...shouldBe) {
  const undefs = [`NaN`, `null`, `undefined`];
  const maybeSymbol = something => typeof something === `symbol` ? Symbol : something;

  return shouldBe.length > 1 ? ISOneOf(obj, ...shouldBe) : determineType();

  function determineType() {
    const objOrSymbol = maybeSymbol(obj);
    const shouldBeLen = shouldBe.length > 0;
    shouldBe = shouldBeLen && shouldBe.shift();
    const shouldBeIsNothing = shouldBeLen && isNothing(shouldBe);

    return shouldBeIsNothing
      ? `${objOrSymbol}` === `${shouldBe}` :
      obj === false
        ? shouldBe === Boolean ? true : `Boolean` :
        thisIs()

    function thisIs() {
      const self = obj === 0
        ? Number : obj === ``
          ? String : !objOrSymbol
            ? {name: `${objOrSymbol}`} : Object.getPrototypeOf(obj)?.constructor;

      return shouldBe
        ? shouldBe === self ||
          shouldBe === Object.getPrototypeOf(self) ||
          `${shouldBe}` === self?.name
        : self?.name;
    }
  }

  function isNothing(nothing) {
    for (let nada of undefs) {
      if (nada === `${nothing}`) { return true; }
    }
    return false;
  }

  function ISOneOf(obj, ...params) {
    for (let param of params) {
      if (IS(obj, param))  { return true; }
    }
    return false;
  }
}