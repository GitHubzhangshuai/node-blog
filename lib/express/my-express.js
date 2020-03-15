const http = require('http')
const slice = Array.prototype.slice

class LikeExpress{
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
            info.url = path
            info.stack = slice.call(arguments,1)
        }else{
            info.url = '/'
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
    handle(req,res,stack){
        var next = () => {
            var middleware = stack.shift()
            if(middleware){   
                middleware(req,res,next)
            }
        }
        next()
    }
    match(req,res){
        var middleList = this.router.use
        // console.log(middleList)
        if(req.url === 'favicon.ico'){
            return
        }
        if(req.method === 'POST'){
            middleList = middleList.concat(this.router.post)
        }
        if(req.method === 'GET'){
            middleList = middleList.concat(this.router.get)
        }
        var stack = []
        middleList.forEach(info => {
            if(req.url.indexOf(info.url)=== 0){
                stack = stack.concat(info.stack)
            }
        })
        return stack
    }
    callback(){
        return (req,res) => {
            res.json = function(data){
                res.setHeader('content-type','application/json')
                res.end(JSON.stringify(data))
            }
            var stack = this.match(req,res)
            this.handle(req,res,stack)
        }
        
    }
    listen(...args){
        var server = http.createServer(this.callback())
        console.log(JSON.stringify(this.router))
        return server.listen(...args)
    }
}

module.exports = () => new LikeExpress()
