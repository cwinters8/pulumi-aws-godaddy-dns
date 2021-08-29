const aws = require("@pulumi/aws");

const ConfigureRecord = ({
  resourceName,
  recordName,
  records,
  ttl,
  recordType,
  hostedZoneId,
}) => {
  const record = new aws.route53.Record(resourceName, {
    name: recordName,
    records,
    ttl,
    recordType,
    zoneId: hostedZoneId,
  });
  return record;
};

exports.ConfigureRecord = ConfigureRecord;
