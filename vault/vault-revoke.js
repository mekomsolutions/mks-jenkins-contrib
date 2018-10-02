#!/usr/bin/env node
"use strict";
var approle = require('commander');
var config = require('./config');

approle
.option('-c, --common-name <commonName>', 'the Common Name to revoke')

approle.parse(process.argv);
if (approle.commonName) {
  loginApprole(contents.role_id, contents.secret_id)
}

var getSerialFromCN = function (role_id, secret_id) {
  const http = require('http');

const options = {
  hostname: 'vault.mekomsolutions.net',
  port: 8900,
  path: '/v1/mks_vpn_ca',
  method: 'LIST',
  headers: {'X-Vault-Token': "67b93c36-2b93-8d95-b9db-ee4efc24047a"}
};

  http.request(options, (resp) => {
    let data = '';

  // The whole response has been received. Print out the result.
    resp.on('end', () => {
      console.log(JSON.parse(data).explanation);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

}