var http = require('http')
var connect = require('connect')
var proxy = require('http-proxy-middleware')
var morgan = require('morgan')
var fs = require('fs')
var path = require('path')
// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })


const domainRewrite = (path, req) => {
  console.log(path)
  return path
}

var apiProxy = proxy('/not', {
	// target: 'https://web.whatsapp.com',
	target: 'http://www.bennish.net/web-notifications.html',
	changeOrigin: true, // for vhosted sites,
  pathRewrite: domainRewrite,
	onProxyReq: function(proxyReq, req, res) {
		// add new header to request
		proxyReq.setHeader(
      "User-Agent", 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36')
      proxyReq.setHeader('x-added', 'foobar')
    console.log(req.headers)
	},
})


var appProxy = connect()
// setup the logger
appProxy.use(morgan('combined', { stream: accessLogStream }))

appProxy.use(apiProxy)

http.createServer(appProxy).listen(3000)
