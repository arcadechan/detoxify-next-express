module.exports = {
  reactStrictMode: true,
  trailingSlash: false,
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      '/success': { page: '/success' }
    }
  }
}
