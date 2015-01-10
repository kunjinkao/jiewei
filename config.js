var path = require('path')

module.exports = {

  http: {
    port: 8000,
    staticDir: path.join(__dirname, 'app')
  },

  websockets: {},

  osc: {
    port: 9000
  }
}
