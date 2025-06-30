import { withFunctionContext } from '../utils/testContext.js'

export function traceModule(moduleObj, namespace = '') {
  const traced = {}

  for (const [key, value] of Object.entries(moduleObj)) {
    const qualifiedName = `${namespace}${key}`

    if (typeof value === 'function') {
      const isClass =
        value.prototype &&
        Object.getOwnPropertyNames(value.prototype).length > 1

      if (isClass) {
        traced[key] = traceClassMethods(value, qualifiedName)
      } else {
        traced[key] = traceFunction(value, qualifiedName)
      }
    } else {
      traced[key] = value
    }
  }

  return traced
}

export function traceModules(modulesByName) {
  const tracedModules = {}

  for (const [name, rawModule] of Object.entries(modulesByName)) {
    tracedModules[name] = traceModule(rawModule, `${name}.`)
  }

  return tracedModules
}

export function traceFunction(fn, nameOverride) {
  const name = nameOverride || fn.name || 'anonymous'

  return function (...args) {
    return withFunctionContext(name, () => {
      global.testLogger.traceIn({
        function: name,
        ...(args.length && { args })
      })

      try {
        const result = fn.apply(this, args)

        if (result && typeof result.then === 'function') {
          return result
            .then((res) => {
              global.testLogger.traceOut({
                function: name,
                ...(res !== undefined && { return: res })
              })
              return res
            })
            .catch((err) => {
              global.testLogger.error({ function: name, error: err })
              throw err
            })
        }

        global.testLogger.traceOut({
          function: name,
          ...(result !== undefined && { return: result })
        })

        return result
      } catch (err) {
        global.testLogger.error({ function: name, error: err })
        throw err
      }
    })
  }
}

function traceClassMethods(clazz, className = clazz.name) {
  const proto = clazz.prototype

  for (const key of Object.getOwnPropertyNames(proto)) {
    const value = proto[key]
    if (typeof value === 'function' && key !== 'constructor') {
      proto[key] = traceFunction(value, `${className}.${key}`)
    }
  }

  return clazz
}
