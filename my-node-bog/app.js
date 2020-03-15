const userRouter = require('./src/router/user')
const blogRouter = require('./src/router/blog')
const querystring = require('querystring')
const {get,set} = require('./src/db/redis')
const {access} = require('./src/utils/log')


const getCookieExpires = ()=>{
    const d = new Date()
    d.setTime(d.getTime()+(24*60*60*1000))
    // console.log('d.toGMTString() is ', d.toGMTString())
    return d.toGMTString()
}

const getPostData = (req) => {
    const promise = new Promise((resolve,reject) => {
        if(req.method !== 'POST'){
            resolve({})
            return
        }
        if(req.headers['content-type']!=='application/json'){
            resolve({})
            return
        }
        let postData = ''
        req.on('data',chunk => {
            postData += chunk.toString()
        })
        req.on('end',()=>{
            if(!postData){
                resolve({})
                return
            }
            resolve(JSON.parse(postData))
        })
    })
    return promise
}

function callback(req,res) {
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`)
    res.setHeader('Content-type','application/json')

   const url = req.url
   req.path = url.split('?')[0]
   req.query = querystring.parse(url.split('?')[1])
   req.cookie = {}
   const cookieStr = req.headers.cookie || ''
   cookieStr.split(';').forEach(item => {
       if(!item){
           return
       }
       const arr = item.split('=')
       const key = arr[0].trim()
       const val = arr[1].trim()
       req.cookie[key] = val
   })
   let needSetCookie = false
   let userId = req.cookie.userid
//    console.log('#',JSON.stringify(req.cookie))
   if(!userId){
       needSetCookie = true
       userId = `${Date.now()}_${Math.random()}`
       set(userId,{})
   }
   req.sessionId = userId
//    console.log(req.url,userId)
   get(req.sessionId).then(sessionData => {
       if(sessionData == null){
           set(req.sessionId,{})
           req.session = {}
       }else{
           req.session = sessionData
        //    console.log(req.url,sessionData)
        //    console.log(req.url,req.session)
       }
       return getPostData(req)
   }).then(postData => {
    //    console.log(postData)
       req.body = postData
       const blogResult = blogRouter(req,res)
       if(blogResult){
           blogResult.then(blogData => {
               if(needSetCookie){
                   res.setHeader('Set-Cookie',`userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                   
               }
               res.end(JSON.stringify(blogData))
           })
           return
       }
       const userResult = userRouter(req,res)
       if(userResult){
            userResult.then(userData => {
                if(needSetCookie){
                    res.setHeader('Set-Cookie',`userid=${userId}; path=/; httpOnly; expires=${getCookieExpires()}`)
                }
                res.end(JSON.stringify(userData))
            })
            return 
       }
       res.writeHead(404,{'Content-type': 'text/plain'})
       res.write('404 Not Found\n')
       res.end()
   })
}

module.exports = callback
