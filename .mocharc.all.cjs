// Everything, including the TracesDecisions scenarios that `npm test` skips. Needs the combined
// BTMS + Trade Gateway stack (btms-local-environment's compose.tgp.yml).
const base = require('./.mocharc.json')

module.exports = {
  ...base,
  ignore: []
}
