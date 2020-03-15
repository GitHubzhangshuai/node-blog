const http = require('http')
const slice = Array.prototype.slice

class MyExpress{
    constructor(){
        this.router = {
            use: [],
            get: [],
            post: []
        }
    }
    register(path){
        var info = {}
        if(typeof path === 'string'){
            info.path = path
            info.stack = slice.call(arguments,1)
        }else{
            info.path = '/'
            info.stack = slice.call(arguments,0)
        }
        return info
    }
    use(){
        var info = this.register.apply(this,arguments)
        this.router.use.push(info)
    }
    get(){
        var info = this.register.apply(this,arguments)
        this.router.get.push(info)
    }
    post(){
        var info = this.register.apply(this,arguments)
        this.router.post.push(info)
    }
    match(req,res){
        var arr1 = this.router.use
        if(req.url === 'favicon.ico'){
            return
        }
        if(req.method === 'GET'){
            arr1 = arr1.concat(this.router.get)
        }
        if(req.method === 'POST'){
            arr1 = arr1.concat(this.router.post)
        }
        var stack  = []
        arr1.forEach(info => {
            if(req.url.indexOf(info.path) === 0){
                stack = stack.concat(info.stack)
            }
        })
        return stack
    }
    handleRequest(req,res,stack){
        function next(){
            var fn = stack.shift()
            if(fn){
                fn(req,res,next)
            }
        }
        next()
    }
    callback(){
        return (req,res) => {
            res.json = (data) => {
                res.setHeader('content-type','application/json')
                res.end(JSON.stringify(data))
            }
            var stack = this.match(req,res)
            this.handleRequest(req,res,stack)

        }
    }
    listen(...args){
        var server = http.createServer(this.callback())
        server.listen(...args)
    }
}

module.exports = () => new MyExpress()