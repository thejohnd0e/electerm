/**
 * The local asset server answers with `Cache-Control: max-age=1y` and the page
 * URL only carries the app version, so a rebuild of the same version keeps
 * serving the previous renderer bundle from Chromium's HTTP cache. Drop that
 * cache once whenever the bundled assets change.
 */
const fs = require('fs')
const path = require('path')
const { app } = require('electron')

const assetsPath = path.resolve(__dirname, '../assets')

function getAssetStamp () {
  try {
    return String(fs.statSync(path.join(assetsPath, 'index.html')).mtimeMs)
  } catch (e) {
    return ''
  }
}

module.exports = async function clearStaleCache (session) {
  const stamp = getAssetStamp()
  if (!stamp) {
    return
  }
  const stampFile = path.join(app.getPath('userData'), 'asset-stamp.txt')
  try {
    if (fs.readFileSync(stampFile, 'utf8') === stamp) {
      return
    }
  } catch (e) {
    // first run or unreadable stamp: treat as changed
  }
  try {
    await session.clearCache()
    fs.writeFileSync(stampFile, stamp)
  } catch (e) {
    console.error('clear stale cache failed', e)
  }
}
