module.exports = {
  webpack5: false,
  reactStrictMode: true,
  images: {
    domains: [
      "docs.metamask.io",
      "venturebeat.com",
      "images.newindianexpress.com",
      "files.thefacecdn.com",
      "encrypted-tbn0.gstatic.com",
      "api.sandbox.game",
      "lh3.googleusercontent.com",
      "ipfs.infura.io",
      "aws1.discourse-cdn.com",
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: "empty",
      };
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};
