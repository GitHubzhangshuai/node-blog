const http = require('http')

function compose(middleList){
    return function(ctx) {
        function dispatch(i){
            var fn = middleList[i]
            try{
                return Promise.resolve(
                    fn(ctx,dispatch.bind(null,i+1))
                    )
            }
            catch(err){
                return Promise.reject(err)
            }
        }
        return dispatch(0)
    }
}

class LikeKoa2{
    constructor(){
        this.middleList = []
    }
    use(fn){
        this.middleList.push(fn)
        return this
    }
    createContent(req,res){
        var ctx = {
            req,res
        }
        ctx.req.query = req.query
        return ctx
    }
    handleRequest(ctx,fn){
        return fn(ctx)
    }
    callback(){
        var fn = compose(this.middleList)
        return (req,res) => {
            var ctx = this.createContent(req,res)
            return this.handleRequest(ctx,fn)
        }
    }
    listen(...args){
        var server = http.createServer(this.callback())
        server.listen(...args)
    }
}

module.exports = LikeKoa2