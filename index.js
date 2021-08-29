"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const godaddy = require("./providers/godaddy");
const { ConfigureCert } = require("./modules/cert");
const { ConfigureRecord } = require("./modules/record");
const { ConfigureCertValidation } = require("./modules/certValidation");

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

// AWS certificates

// parse regions from config value
const regionsString = config.require("regions");
const regions = regionsString.split(",").filter((region) => region.length > 0);
let validationRecord;
regions.forEach((region, index) => {
  const profile = aws.config.profile;
  const provider = new aws.Provider(`${region}-provider`, {
    profile,
    region,
  });
  const cert = ConfigureCert({
    domain,
    region,
    provider,
    dependsOn: [nameservers],
  });
  exports[`${region}-certificateArn`] = cert.arn;
  const domainValidations = cert.domainValidationOptions;
  const { resourceRecordName, resourceRecordType, resourceRecordValue } =
    domainValidations[0];
  // only create the Route 53 record once
  if (index === 0) {
    validationRecord = ConfigureRecord({
      resourceName: "r53Record",
      recordName: resourceRecordName,
      records: [resourceRecordValue],
      ttl: 60,
      recordType: resourceRecordType,
      hostedZoneId: zoneStack.getOutput("hostedZoneId"),
    });
  }
  const validation = ConfigureCertValidation({
    region,
    certArn: cert.arn,
    validationRecordFqdn: validationRecord.fqdn,
    provider,
  });
  exports[`${region}-validationId`] = validation.id;
});
