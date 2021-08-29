const aws = require("@pulumi/aws");

const ConfigureCertValidation = ({
  region,
  certArn,
  validationRecordFqdn,
  provider,
}) => {
  const certValidation = new aws.acm.CertificateValidation(
    `${region}-certValidation`,
    {
      certificateArn: certArn,
      validationRecordFqdns: [validationRecordFqdn],
    },
    { provider }
  );
  return certValidation;
};

exports.ConfigureCertValidation = ConfigureCertValidation;
