"strict mode"

const request = require("request");

module.exports = {
  setVaultConfig: function (configUrl, callback) {
    console.log("Fetching Vault URL from Consul...")
    var vaultConfig = ''
    request(configUrl, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        vaultConfig = Buffer.from(JSON.parse(body)[0].Value, 'base64').toString()
        console.log("Vault URL: " + Buffer.from(JSON.parse(body)[0].Value, 'base64').toString())
        process.argv.push(JSON.stringify({vaultConfig:vaultConfig}))
        callback(vaultConfig)
      } else {
        console.log(configUrl)
        console.log(error)
        console.log(response);
        console.log(body);
        callback(null)
      }
    })
  }
}