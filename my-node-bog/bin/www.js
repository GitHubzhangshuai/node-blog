var http = require('http')
var PORT = 8000
var callback = require('../app')

var server = http.createServer(callback)

server.listen(PORT)