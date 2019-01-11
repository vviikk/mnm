const cheerio = require('cheerio@1.0.0-rc.2');
const requestVanilla = require('request@2.88.0');
/**
* @param context {WebtaskContext}
*/
module.exports = function(context, cb) {
  getFaviconUrl(context.query.url, cb);
};

let options = {
    jar: true, // save cookies to jar
    rejectUnauthorized: false, // for Dogpile, see https://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
    method: 'GET',
    headers: {
      Accept: 'text/html',
      // set some defaults
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36'  
    },
    followAllRedirects: true,
    timeout: 2000,
  };
// set some defaults
const request = requestVanilla.defaults(options);

function getDomain(url) {
  let protocol = url.split('/')[0] + '//';
  if (url.indexOf('://') === -1) {
    protocol = 'http://';
  }
  let urlParts = url
    .replace('http://', '')
    .replace('https://', '')
    .split(/\//);

  let domain = protocol + urlParts[0];
  console.log('domain for url ' + url + ' is ' + domain);
  return domain;
}

const getFaviconUrl = (url = process.env.URL_TEST, callback) => {
  let faviconUrl = '';

  let domain = getDomain(url);
  

  request(domain, function(error, response, html) {
    if (!error && response.statusCode === 200) {
      const $ = cheerio.load(html);

      $('link').each(function(i, element) {
        //console.log(element);
        var rel = $(element).attr('rel');
        var mask = $(element).attr('mask');
        if (
          rel !== undefined &&
          rel.indexOf('icon') > -1 &&
          mask === undefined
        ) {
          faviconUrl = $(element).attr('href');

          return false;
        }
      });

      console.log('faviconUrl is ' + faviconUrl);

      // Fixes - Ask.com
      if (
        faviconUrl === '' &&
        (domain === 'http://ask.com' || domain === 'https://ask.com')
      ) {
        faviconUrl =
          'https://upload.wikimedia.org/wikipedia/commons/a/a0/AskLogoNew07.PNG';
      }

      if(domain.split('messenger.com').length > 1) faviconUrl = 'https://static.xx.fbcdn.net/rsrc.php/y7/r/O6n_HQxozp9.ico';

      // Fixes - Yahoo!
      if (faviconUrl.indexOf('.png') < faviconUrl.lastIndexOf('.png')) {
        faviconUrl = faviconUrl.replace('.png', '');
      }

      // General
      if (faviconUrl === '' || faviconUrl === undefined) {
        request.head({ url: domain + '/favicon.ico' }, function(
          err,
          resp,
          body
        ) {
          if (resp.statusCode === 200) {
            faviconUrl = domain + '/favicon.ico';
            callback(null, { faviconUrl: faviconUrl });
          } else {
            callback(null, { status: resp.statusCode });
          }
        });
      } else {
        // Support urls like this: //yastatic.net/iconostasis/_/KKii9ECKxo3QZnchF7ayZhbzOT8.png
        if (faviconUrl.indexOf('//') === 0) {
          faviconUrl = 'http://' + faviconUrl;
        } else {
          // Support urls like this /icon.png
          let onlyFileName = faviconUrl.indexOf('/') === -1;
          if (faviconUrl.indexOf('/') === 0 || onlyFileName) {
            // If path returned is relative to root folder
            let responseDomain = getDomain(response.request.uri.href);
            if (onlyFileName) {
              responseDomain = responseDomain + '/';
            }
            faviconUrl = responseDomain + faviconUrl;
          }
        }

        callback(null, { faviconUrl: faviconUrl });
      }
    } else {
      if (response) {
        callback(null, { status: response.statusCode });
      } else {
        console.log(error);
        callback(null, { status: -1 });
      }
    }
  });
};
