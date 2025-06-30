export function registerGlobalFunctions(modulesByName, filter = () => true) {
  for (const [moduleName, mod] of Object.entries(modulesByName)) {
    if (typeof mod !== 'object' || mod === null) continue
    for (const [fnName, fn] of Object.entries(mod)) {
      if (filter(fnName, moduleName)) {
        globalThis[fnName] = fn
      }
    }
  }
}
