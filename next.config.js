const config = require("./src/config/config.json");
const removeImports = require('next-remove-imports')();
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  basePath: config.base_path !== "/" ? config.base_path : "",
  transpilePackages: ["uploadthing", "@uploadthing/react"],
  trailingSlash: config.site.trailing_slash,
  images: {
    domains: ['lh3.googleusercontent.com', 's.gravatar.com'],
  },
};

module.exports = removeImports({
  ...nextConfig,
});