var httpProxy = require('http-proxy');

var proxy = new httpProxy.createProxyServer({});

proxy.on('proxyReq', function (proxyRequest, request, response, options) {
	proxyRequest.path = proxyRequest.path.slice(4);
});

module.exports = function (host, port) {
	return function(request, response, callback) {
		if (request.url.match(new RegExp('^\/api\/'))) {
			proxy.web(request, response, {
				target: {
					host: host,
					port: port
				}
			});
		} else {
			callback();
		}
	}
}