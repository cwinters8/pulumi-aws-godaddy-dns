const aws = require("@pulumi/aws");

const ConfigureCert = ({ domain, region, provider, dependsOn = [] }) => {
  const cert = new aws.acm.Certificate(
    `${region}-domainCert`,
    {
      domainName: domain,
      validationMethod: "DNS",
      subjectAlternativeNames: [`*.${domain}`],
    },
    { provider, dependsOn }
  );
  return cert;
};

exports.ConfigureCert = ConfigureCert;
