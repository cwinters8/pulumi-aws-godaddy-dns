const aws = require("@pulumi/aws");

const ConfigureCert = ({ domain, region, provider }) => {
  const cert = new aws.acm.Certificate(
    `${region}-domainCert`,
    {
      domainName: domain,
      validationMethod: "DNS",
      subjectAlternativeNames: `*.${domain}`,
    },
    { provider }
  );
  return cert;
};

exports.ConfigureCert = ConfigureCert;
