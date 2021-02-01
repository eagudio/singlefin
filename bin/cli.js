#!/usr/bin/env node

const Deployer = require('./deployer').SinglefinDeployment.Deployer;

var schemasFolderPath = process.argv[2];

var deployer = new Deployer();

deployer.make(schemasFolderPath);