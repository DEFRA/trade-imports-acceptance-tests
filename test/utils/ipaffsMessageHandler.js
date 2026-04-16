import { createRequire } from 'node:module'
import { v4 as uuidv4 } from 'uuid'
import { WebSocket } from 'ws'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { ServiceBusClient } from '@azure/service-bus'
const require = createRequire(import.meta.url)

export async function sendIpaffsMessage(json) {
  const versionsMessage =
    'Dependency versions' +
    ' | @azure/service-bus=' +
    (require('@azure/service-bus/package.json').version ?? 'unknown') +
    ' | ws=' +
    (require('ws/package.json').version ?? 'unknown')

  globalThis.testLogger.info({
    message: versionsMessage
  })
  const connectionString =
    process.env.ServiceBus__Notifications__ConnectionString

  globalThis.testLogger.info({
    message: 'Connection string check',
    hasConnectionString: !!connectionString,
    connectionStringLength: connectionString ? connectionString.length : 0
  })

  if (!connectionString) {
    globalThis.testLogger.error({
      message: 'Connection string is empty or undefined'
    })
    throw new Error('Request failed: Connection string is EMPTY')
  }

  const queueOrTopicName = connectionString.match(/EntityPath=([^;]+)/)[1]
  globalThis.testLogger.info({
    message: 'Extracted queue/topic name',
    queueOrTopicName,
    connectionString: connectionString.substring(0, 50) + '...' // Log first 50 chars for debugging
  })

  const body = typeof json === 'object' ? JSON.stringify(json) : json
  globalThis.testLogger.info({
    message: 'Prepared message body',
    bodyType: typeof json,
    bodyLength: body.length,
    bodyPreview: body
  })

  let sbClient
  if (globalThis.proxy) {
    const agent = new HttpsProxyAgent(globalThis.proxy)

    sbClient = new ServiceBusClient(connectionString, {
      transportType: 'amqpWebSockets',
      webSocketOptions: {
        webSocket: WebSocket,
        webSocketConstructorOptions: {
          agent
        }
      },
      retryOptions: {
        maxRetries: 0
      }
    })
  } else {
    globalThis.testLogger.info({
      message: 'Creating ServiceBus client without proxy'
    })

    sbClient = new ServiceBusClient(connectionString, {
      transportType: 'amqpWebSockets',
      retryOptions: {
        maxRetries: 0
      }
    })
  }

  const sender = sbClient.createSender(queueOrTopicName)

  const requestId = uuidv4().replace(/-/g, '')

  const message = {
    body: json,
    applicationProperties: {
      'x-cdp-request-id': requestId
    }
  }

  try {
    globalThis.testLogger.info({
      message: 'Attempting to send message to ServiceBus: ' + requestId,
      requestId
    })

    await sender.sendMessages(message)

    globalThis.testLogger.info({
      message: 'Successfully sent message to ServiceBus',
      requestId,
      success: true,
      timestamp: new Date().toISOString()
    })

    return {
      requestId,
      ipaffsBody: body,
      success: true,
      timestamp: new Date().toISOString()
    }
  } catch (err) {
    const aggregateDetails = Array.isArray(err?.errors)
      ? err.errors
          .map((e, i) =>
            [
              `inner[${i}].name=${e?.name ?? 'null'}`,
              `inner[${i}].message=${e?.message ?? 'null'}`,
              `inner[${i}].code=${e?.code ?? 'null'}`,
              `inner[${i}].errno=${e?.errno ?? 'null'}`,
              `inner[${i}].syscall=${e?.syscall ?? 'null'}`,
              `inner[${i}].stack=${(e?.stack ?? 'null').replace(/\s+/g, ' ').slice(0, 1000)}`
            ].join(', ')
          )
          .join(' | ')
      : 'no-inner-errors'

    globalThis.testLogger.error({
      message:
        'Failed to send message to ServiceBus' +
        ' | requestId=' +
        requestId +
        ' | err.name=' +
        (err?.name ?? 'null') +
        ' | err.message=' +
        (err?.message ?? 'null') +
        ' | err.code=' +
        (err?.code ?? 'null') +
        ' | err.errno=' +
        (err?.errno ?? 'null') +
        ' | err.syscall=' +
        (err?.syscall ?? 'null') +
        ' | cause.name=' +
        (err?.cause?.name ?? 'null') +
        ' | cause.message=' +
        (err?.cause?.message ?? 'null') +
        ' | cause.code=' +
        (err?.cause?.code ?? 'null') +
        ' | aggregate=' +
        aggregateDetails +
        ' | stack=' +
        (err?.stack ?? 'null').replace(/\s+/g, ' ').slice(0, 3000),
      requestId,
      requestBody: body,
      err: err.message || err,
      success: false,
      errorType: err.constructor.name,
      errorStack: err.stack
    })
    throw new Error(`Request failed: ${err.message || err}`)
  } finally {
    globalThis.testLogger.info({
      message: 'Cleaning up ServiceBus resources',
      requestId
    })

    try {
      await sender.close()
      globalThis.testLogger.info({
        message: 'Successfully closed sender',
        requestId
      })
    } catch (closeErr) {
      globalThis.testLogger.error({
        message: 'Error closing sender',
        requestId,
        error: closeErr.message
      })
    }

    try {
      await sbClient.close()
      globalThis.testLogger.info({
        message: 'Successfully closed ServiceBus client',
        requestId
      })
    } catch (closeErr) {
      globalThis.testLogger.error({
        message: 'Error closing ServiceBus client',
        requestId,
        error: closeErr.message
      })
    }
  }
}
