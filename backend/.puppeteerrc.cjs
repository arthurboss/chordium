const { join } = require("path");

module.exports = {
  cacheDirectory: join("/opt/render/project/src/.puppeteer-cache"),
  browser: "chrome-headless-shell",
};
