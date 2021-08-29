# Pulumi AWS GoDaddy DNS

This program is meant to configure the appropriate GoDaddy Nameservers and AWS certificates and records for a given domain. The GoDaddy Nameservers are configured using a [Pulumi Dynamic Provider](https://www.pulumi.com/docs/intro/concepts/resources/#dynamicproviders).

I wanted to write this in Go for type safety and speed but dynamic providers are not supported in Go at this time.

You must configure some values in order for this to work properly.

```sh
pulumi config set aws:region YOUR_AWS_REGION
pulumi config set domain YOUR_DOMAIN
pulumi config set godaddyKey YOUR_GODADDY_API_KEY --secret
pulumi config set godaddySecret YOUR_GODADDY_API_SECRET --secret

# This one must be a comma separated list of regions, or a single region with no commas
# example:
pulumi config set regions us-east-1,us-west-2
# Note that if you intend to configure Cloudfront you will need a certificate in us-east-1 so that region is nearly always necessary
```

These Pulumi stacks depend on the [pulumi-aws-hosted-zone](https://github.com/cwinters8/pulumi-aws-hosted-zone) stacks with the same stack name. For example, cwinters8/pulumi-aws-godaddy-dns/inclusivecareco depends on cwinters8/pulumi-aws-hosted-zone/inclusivecareco, and so on.
