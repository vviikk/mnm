const cheerio = require('cheerio@1.0.0-rc.2')
const requestVanilla = require('request@2.88.0')

const options = {
  jar: true, // save cookies to jar
  rejectUnauthorized: false, // for Dogpile, see https://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
  method: 'GET',
  headers: {
    Accept: 'text/html',
    // set some defaults
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36',
  },
  followAllRedirects: true,
  timeout: 2000,
}

// set some defaults
const request = requestVanilla.defaults(options)

const getDomain = url => {
  let protocol = url.split('/')[0] + '//'
  if (url.indexOf('://') === -1) {
    protocol = 'http://'
  }
  const urlParts = url
    .replace('http://', '')
    .replace('https://', '')
    .split(/\//)

  return protocol + urlParts[0]
}

const getFaviconUrl = (url = process.env.URL_TEST, callback) => {
  let faviconUrl = ''

  const domain = getDomain(url)

  request(domain, (error, response, html) => {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html)

      // Check of there's an apple touch icon
      const appleTouchIcon = $('link[rel="apple-touch-icon"]')

      if (appleTouchIcon.length) {
        faviconUrl = $(appleTouchIcon[0]).attr('href')
      } else {
        $('link').each((i, element) => {
          const rel = $(element).attr('rel')
          const mask = $(element).attr('mask')
          if (
            rel !== undefined &&
            rel.indexOf('icon') > -1 &&
            mask === undefined
          ) {
            faviconUrl = $(element).attr('href')

            return false
          }
          return true
        })
      }

      // If there isn't a favicon detected, check if /favicon.ico is a valid location
      if (faviconUrl === '' || faviconUrl === undefined) {
        request.head({ url: domain + '/favicon.ico' }, (err, resp) => {
          if (resp.statusCode === 200) {
            faviconUrl = domain + '/favicon.ico'
            callback(null, { faviconUrl })
          } else {
            callback(null, { status: resp.statusCode })
          }
        })
      } else {
        // Support urls like this: //yastatic.net/iconostasis/_/KKii9ECKxo3QZnchF7ayZhbzOT8.png
        if (faviconUrl.indexOf('//') === 0) {
          faviconUrl = 'http://' + faviconUrl
        } else {
          // Support urls like this /icon.png
          const onlyFileName = faviconUrl.indexOf('/') === -1
          if (faviconUrl.indexOf('/') === 0 || onlyFileName) {
            // If path returned is relative to root folder
            let responseDomain = getDomain(response.request.uri.href)
            if (onlyFileName) {
              responseDomain += '/'
            }
            faviconUrl = responseDomain + faviconUrl
          }
        }

        callback(null, { faviconUrl })
      }
    } else {
      callback(null, { status: response ? response.statusCode : -1 })
    }
  })
}

/**
 * @param context {WebtaskContext}
 */
module.exports = (context, cb) => {
  getFaviconUrl(context.query.url, cb)
}
