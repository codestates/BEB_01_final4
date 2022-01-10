module.exports = {
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
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};
