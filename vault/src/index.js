#!/usr/bin/env node
"use strict";

var program = require("commander");
const utils = require("./utils");
const config = require("./config");

program.command("revoke", "revoke a Common Name");
program.parse(process.argv);

