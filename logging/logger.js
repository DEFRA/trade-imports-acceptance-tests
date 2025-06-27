import pino from 'pino'
import pretty from 'pino-pretty'
import { inspect } from 'util'
import { getCurrentTestContext } from '../utils/testContext.js'

let loggerInstance

function getLogger() {
  if (!loggerInstance) {
    const stream =
      process.env.LOG_FORMAT === 'pretty'
        ? pretty({
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'SYS:standard',
            hideObject: true,
            messageFormat(log, messageKey) {
              const level = (log.levelName || 'INFO').toUpperCase()
              const message = log[messageKey] ?? log.message ?? log.xyz ?? ''
              const testName = log.test
              const functionName = log.function
              const mainLineParts = [`[${level}]`]
              if (testName) mainLineParts.push(testName)
              if (functionName) mainLineParts.push(functionName)
              mainLineParts.push(message)
              const mainLine = mainLineParts.join(': ')
              const extra = Object.fromEntries(
                Object.entries(log).filter(
                  ([key]) =>
                    ![
                      'level',
                      'levelName',
                      'time',
                      'test',
                      messageKey,
                      'message',
                      'function',
                      'xyz'
                    ].includes(key)
                )
              )
              if (Object.keys(extra).length === 0) return mainLine
              const formattedLines = Object.entries(extra).map(([key, val]) => {
                if (typeof val === 'string') {
                  const trimmed = val.trim()
                  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                    try {
                      const parsed = JSON.parse(trimmed)
                      return `${key}:\n${inspect(parsed, { depth: null, colors: false })}`
                    } catch {}
                  }
                  if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
                    try {
                      const prettyXml = trimmed
                        .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
                        .replace(/^\s*$/gm, '')
                      return `${key}:\n${prettyXml}`
                    } catch {}
                  }
                  return `${key}: ${val}`
                }
                return `${key}:\n${inspect(val, { depth: null, colors: false })}`
              })
              return `${mainLine}\n${formattedLines.join('\n')}`
            }
          })
        : pino.destination({ dest: 2, sync: true })
    const opts = {
      level: process.env.LOG_LEVEL || 'info',
      base: undefined,
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level(label) {
          return { levelName: label }
        }
      }
    }
    loggerInstance = pino(opts, stream)
  }
  return loggerInstance
}

function formatLog(level, message, extra = {}) {
  const { testId, functionName } = getCurrentTestContext() ?? {}
  let logEntry = {}
  if (typeof message === 'string' || typeof message === 'number')
    logEntry.message = message
  else if (message && typeof message === 'object') logEntry = { ...message }
  if (testId) logEntry.test = testId
  logEntry = { ...logEntry, function: functionName, ...extra }
  getLogger()[level](logEntry)
}

export const log = {
  info: (message, extra) => formatLog('info', message, extra),
  debug: (message, extra) => formatLog('debug', message, extra),
  error: (message, extra) => formatLog('error', message, extra),
  traceIn: (extra = {}) => formatLog('trace', '→ ENTER', extra),
  traceOut: (extra = {}) => formatLog('trace', '← EXIT', extra)
}
