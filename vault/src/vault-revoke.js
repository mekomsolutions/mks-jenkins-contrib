#!/usr/bin/env node
"use strict";
const request = require("request");
const _ = require('lodash');
const x509 = require('x509-parser');

const config = require("./config");
const utils = require("./utils");
var revoke = require("commander");

revoke.option('-t, --vault-token <vaultToken>', 'token to authenticate to Vault')
revoke.option('-p, --production', 'use production Vault server')
revoke.arguments('<commonName>', 'Common Name to revoke')
revoke.parse(process.argv);

if (!process.argv.slice(2).length) {
  revoke.outputHelp();
} else {
  utils.setVaultConfig(config.getVaultConfigUrl(revoke.production), function(config) {
    revoke.commonName = process.argv.slice(2)[0]
    getSerialFromCN()
  });
}

function getSerialFromCN () {
  let queryUrl = config.getVaultAddress();
  queryUrl.pathname += config.getListCertsPath();

  var options = {
    url: queryUrl.href,
    method: 'LIST',
    headers: {
      'X-Vault-Token': revoke.vaultToken
    }
  }
  // Retrieve all serial for the PKI
  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var allSerials = JSON.parse(body).data.keys
      allSerials.forEach(function (serial) {

        // Retrieve all Certs
        let queryUrl = config.getVaultAddress();
        queryUrl.pathname += config.getReadCertPath();
        var options = {
          url: queryUrl.href + "/" + serial,
          method: 'GET',
          headers: {
            'X-Vault-Token': '67b93c36-2b93-8d95-b9db-ee4efc24047a'
          }
        }
        request(options, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var certCN = x509.parseCert(JSON.parse(body).data.certificate).subject.commonName;
            if (certCN == revoke.commonName) {
              console.log(revoke.commonName + ": " + serial)

              // Revoke the certificate
              let queryUrl = config.getVaultAddress();
              queryUrl.pathname += config.getRevokeCertPath();
              var options = {
                url: queryUrl.href,
                method: 'POST',
                headers: {
                  'X-Vault-Token': '67b93c36-2b93-8d95-b9db-ee4efc24047a'
                },
                body: JSON.stringify({'serial_number': serial})
              }
              request(options, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                  console.log("Revoked " + serial + ".")
                } else if (error) {
                  console.log(error);
                } else {
                  console.log(response.statusCode);
                  console.log(body);
                }
              })
            }
          } else if (error) {
            console.log(error);
          } else {
            console.log(response.statusCode);
            console.log(body);
          }
        });
      })
    } else if (error) {
      console.log(error);
    } else {
      console.log(response.statusCode);
      console.log(body);
    }
  });
}