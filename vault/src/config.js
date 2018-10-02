"use strict";

const url = require("url");

module.exports = {
  getVaultAddress: function() {

    let config = JSON.parse(process.argv.find(function (element) {
      try {
        JSON.parse(element).vaultConfig
        return element
      }
      catch (error) {
        return false
      }
    })).vaultConfig

    return new URL(
      config +
      "/" +
      module.exports.getApiVersion()
      );
  },
  getListCertsPath: function() {
    return "/mks_vpn_ca/certs";
  },
  getReadCertPath: function() {
    return "/mks_vpn_ca/cert";
  },
  getRevokeCertPath: function() {
    return "/mks_vpn_ca/revoke";
  },
  getApiVersion: function() {
    return "v1";
  },
  getVaultConfigUrl: function(prod) {
    if (prod) {
      return "http://localhost:8500/v1/kv/config/vault/url"
    } else {
      return "http://localhost:8500/v1/kv/config/vault/test/url"
    }
  }
};
