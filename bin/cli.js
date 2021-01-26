#!/usr/bin/env node

const Deployer = require('./deployer').SinglefinDeployment.Deployer;

var schemasFolderPath = process.argv[2];
var targetsFolderPath = process.argv[3];
var targetsServerFolderPath = process.argv[4];

var deployer = new Deployer();

deployer.make(schemasFolderPath, targetsFolderPath, targetsServerFolderPath);