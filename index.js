"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");
const godaddy = require("./providers/godaddy");

const config = new pulumi.Config();
const stackName = pulumi.getStack();
const zoneStack = new pulumi.StackReference(
  `cwinters8/pulumi-aws-hosted-zone/${stackName}`
);

const domain = config.require("domain");
const apiKey = config.requireSecret("godaddyKey");
const secret = config.requireSecret("godaddySecret");

// GoDaddy Nameservers
const nameservers = new godaddy.Nameservers("nameservers", {
  domain,
  nameservers: zoneStack.getOutput("nameServers"),
  apiKey,
  secret,
});

// AWS records and certificates

exports.nameservers = nameservers;
