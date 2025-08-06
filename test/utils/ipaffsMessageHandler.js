import { ServiceBusClient } from '@azure/service-bus'
import { setLogLevel, AzureLogger } from '@azure/logger'
import { v4 as uuidv4 } from 'uuid'
import { WebSocket } from 'ws'
import proxyAgent from 'proxy-agent'

export async function sendIpaffsMessage(json) {
  AzureLogger.log = (...args) => {
    globalThis.testLogger.debug({ message: '[AZURE]', ...args })
  }
  setLogLevel('verbose')
  globalThis.testLogger.info({ message: 'Starting sendIpaffsMessage function' })

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
    bodyPreview: body.substring(0, 200) + (body.length > 200 ? '...' : '')
  })

  globalThis.testLogger.info({ message: 'Creating ServiceBus client' })

  let sbClient
  if (globalThis.proxy) {
    const agent = proxyAgent(globalThis.proxy)

    globalThis.testLogger.info({
      message: 'Creating ServiceBus client with WebSocket proxy agent',
      proxy: globalThis.proxy
    })

    sbClient = new ServiceBusClient(connectionString, {
      webSocketOptions: {
        webSocket: WebSocket,
        webSocketConstructorOptions: {
          agent
        }
      }
    })
  } else {
    globalThis.testLogger.info({
      message: 'Creating ServiceBus client without proxy'
    })

    sbClient = new ServiceBusClient(connectionString)
  }

  globalThis.testLogger.info({
    message: 'Creating sender',
    queueOrTopicName
  })
  const sender = sbClient.createSender(queueOrTopicName)

  const requestId = uuidv4().replace(/-/g, '')
  globalThis.testLogger.info({
    message: 'Generated request ID',
    requestId
  })

  const message = {
    body: json,
    applicationProperties: {
      'x-cdp-request-id': requestId
    }
  }

  globalThis.testLogger.info({
    message: 'Prepared message for sending',
    requestId,
    messageSize: JSON.stringify(message).length,
    hasBody: !!message.body,
    applicationPropertiesCount: Object.keys(message.applicationProperties)
      .length
  })

  try {
    globalThis.testLogger.info({
      message: 'Attempting to send message to ServiceBus',
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
    globalThis.testLogger.error({
      message: 'Failed to send message to ServiceBus',
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
