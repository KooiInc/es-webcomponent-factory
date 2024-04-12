// a lazy html tag mapper
const tagMap = {};
["a","area","audio","br","base","body","button","canvas","dl","data","datalist","div","em","fieldset","font","footer","form","hr","head","header","output","iframe","frameset","img","input","li","label","legend","link","map","mark","menu","media","meta","nav","meter","ol","object","optgroup","option","p","param","picture","pre","progress","quote","script","select","source","span","style","caption","td","col","table","tr","template","textarea","time","title","track","details","ul","video","del","ins","slot","blockquote","svg","dialog","summary","main","address","colgroup","tbody","tfoot","thead","th","dd","dt","figcaption","figure","i","b","code","h1","h2","h3","h4","abbr","bdo","dfn","kbd","q","rb","rp","rt","ruby","s","strike","samp","small","strong","sup","sub","u","var","wbr","nobr","tt","noscript"
].forEach((tagName) => {
  Object.defineProperty(tagMap, tagName, { get() {
      if (!tagName) { return undefined; }
      const elemTrial = document.createElement(tagName)?.constructor;
      return elemTrial !== HTMLUnknownElement ? elemTrial : undefined; } });
});

export default Object.freeze(tagMap);