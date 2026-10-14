// The TracesDecisions scenarios need the combined BTMS + Trade Gateway stack (btms-local-environment's
// compose.tgp.yml), so `npm test` skips them. `npm run test:traces` runs only them.
//
// The base spec is kept, so support files under test/ (e.g. test/steps) still load; every other
// scenario folder is ignored instead.
const base = require('./.mocharc.json')

module.exports = {
  ...base,
  ignore: ['test/scenarios/!(TracesDecisions)/**']
}
