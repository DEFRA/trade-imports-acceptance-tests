import { log } from './logging/logger.js'
import dotenvFlow from 'dotenv-flow'
import 'dotenv/config'
globalThis.testLogger = log

dotenvFlow.config({
  default_node_env: 'dev',
  node_env: process.env.NODE_ENV
})
