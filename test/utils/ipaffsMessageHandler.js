import { ServiceBusClient } from '@azure/service-bus'
import { v4 as uuidv4 } from 'uuid'

export async function sendIpaffsMessage(json) {
  const connectionString =
    process.env.ServiceBus__Notifications__ConnectionString ?? ''
  const queueOrTopicName = connectionString.match(/EntityPath=([^;]+)/)[1]
  const body = typeof json === 'object' ? JSON.stringify(json) : json

  globalThis.testLogger.info({ message: 'Sending IPAFFS message', body })

  const sbClient = new ServiceBusClient(connectionString)
  const sender = sbClient.createSender(queueOrTopicName)
  const requestId = uuidv4().replace(/-/g, '')

  const message = {
    body: json,
    applicationProperties: {
      'x-cdp-request-id': requestId
    }
  }

  try {
    await sender.sendMessages(message)
    globalThis.testLogger.info({
      message: 'Sent message with x-cdp-request-id:',
      requestId
    })
    return { requestId, ipaffsBody: body }
  } catch (err) {
    globalThis.testLogger.error(
      { url, requestBody: body, err: err.message || err },
      'Request failed'
    )
    throw new Error(`Request failed: ${err.message || err}`)
  } finally {
    await sender.close()
    await sbClient.close()
  }
}
