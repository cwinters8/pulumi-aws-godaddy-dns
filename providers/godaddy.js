const pulumi = require("@pulumi/pulumi");
const axios = require("axios");

const arrayEquals = (a, b) => {
  return (
    a.length === b.length &&
    a.every((v) => b.includes(v)) &&
    b.every((v) => a.includes(v))
  );
};

const domainUrlPrefix = "https://api.godaddy.com/v1/domains";
const genHeaders = ({ apiKey, secret }) => {
  return {
    headers: {
      "Content-Type": "application/json",
      Authorization: `sso-key ${apiKey}:${secret}`,
    },
  };
};

const getDomain = async ({ domain, apiKey, secret }) => {
  return await axios.get(
    `${domainUrlPrefix}/${domain}`,
    genHeaders({ apiKey, secret })
  );
};

const updateNameservers = async ({ domain, nameservers, apiKey, secret }) => {
  return await axios.patch(
    `${domainUrlPrefix}/${domain}`,
    {
      nameServers: nameservers,
    },
    genHeaders({ apiKey, secret })
  );
};

const successCodes = [200, 204];

const fail = () => {
  throw new Error("Failed to update nameservers");
};

const godaddyNameserversProvider = {
  async create(inputs) {
    const { domain, nameservers, apiKey, secret } = inputs;
    const domainResponse = await getDomain({ domain, apiKey, secret });
    const response = await updateNameservers({
      domain,
      nameservers,
      apiKey,
      secret,
    });
    if (successCodes.includes(response.status)) {
      return { id: domainResponse.data.domainId.toString(), outs: inputs };
    }
    fail();
  },
  async diff(id, olds, news) {
    const replaces = [];
    if (arrayEquals(olds.nameservers, news.nameservers)) {
      return {
        changes: false,
        replaces,
      };
    }
    return {
      changes: true,
      replaces,
    };
  },
  async update(id, olds, news) {
    const inputs = { ...olds, ...news };
    const { domain, nameservers, apiKey, secret } = inputs;
    const response = updateNameservers({ domain, nameservers, apiKey, secret });
    if (successCodes.includes(response.status)) {
      return { outs: inputs };
    }
    fail();
  },
  async delete(id, props) {
    // nothing to do here. we cannot remove all the nameservers from the godaddy domain.
    return;
  },
  async read(id, props) {
    const { domain, apiKey, secret } = props;
    const response = await getDomain({
      domain,
      apiKey,
      secret,
    });
    return {
      id: response.data.domainId.toString(),
      props: { ...props, nameservers: response.data.nameServers },
    };
  },
  async check(olds, news) {
    // nothing to do if inputs all remain the same
    if (
      olds.domain === news.domain &&
      olds.nameservers === news.nameservers &&
      olds.apiKey === news.apiKey &&
      olds.secret === news.secret
    ) {
      return { inputs: news };
    }

    const failures = [];
    if (!news.domain) {
      failures.push({
        property: "domain",
        reason: "domain is required",
      });
    }
    if (
      !news.nameservers ||
      !Array.isArray(news.nameservers) ||
      news.nameservers.length < 2
    ) {
      failures.push({
        property: "nameservers",
        reason: "a list of at least 2 nameservers is required",
      });
    }
    if (!news.apiKey) {
      failures.push({
        property: "apiKey",
        reason: "apiKey is required",
      });
    }
    if (!news.secret) {
      failures.push({
        property: "secret",
        reason: "secret is required",
      });
    }
    if (failures.length > 0) {
      return { failures };
    }
    return { inputs: news };
  },
};

class Nameservers extends pulumi.dynamic.Resource {
  constructor(name, args, opts) {
    super(godaddyNameserversProvider, name, args, opts);
  }
}

exports.Nameservers = Nameservers;
