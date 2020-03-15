const {login,register} = require('../controller/user')
const {SuccessModel,ErrorModel} = require('../model/resModel')
const {set} = require('../db/redis')

const handleUserRouter = (req,res) => {
    const url = req.url.split('?')[0]
    const method = req.method

    if(method === 'POST'&& url === '/api/user/register'){
        const {username,password} = req.body
        const result = register(username,password)
        return result.then(data=>{
            if(data){
                return new SuccessModel()
            }
            return new ErrorModel('注册失败')
        })
    }

    if(method === 'POST'&&url === '/api/user/login'){
        const {username,password} = req.body
        const result = login(username,password)
        return result.then(data => {
            // console.log(data)
            if(data.username){
                req.session.username = data.username
                req.session.realname = data.realname
                // console.log(1,req.sessionId,req.session)
                set(req.sessionId,req.session)
                return new SuccessModel()
            }
            return new ErrorModel('登录失败')
        })
    }
}

module.exports = handleUserRouter