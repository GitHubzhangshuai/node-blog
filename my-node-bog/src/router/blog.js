const {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog 
} = require('../controller/blog')
const {SuccessModel,ErrorModel} = require('../model/resModel')

const loginCheck = (req) => {
    // console.log(1,JSON.stringify(req.session))
    if(!req.session.username){
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
}

const handleBlogRouter = (req,res) => {
    const url = req.url.split('?')[0]
    const method = req.method
    const id = req.query.id
    // 获取博客列表
    if (method === 'GET' && url === '/api/blog/list') {
        let author = req.query.author || ''
        const keyword = req.query.keyword || ''
        if(req.query.isadmin){
            const loginCheckResult = loginCheck(req)
            if(loginCheckResult){
                return loginCheckResult
            }
            author = req.session.username
        }
        const result = getList(author,keyword)
        return result.then(listData => {
            return new SuccessModel(listData)
        })
    }

    // 获取博客内容
    if (method === 'GET' && url === '/api/blog/detail') {
        const result = getDetail(id)
        return result.then(data => {
            return new SuccessModel(data)
        })
    }

    // 新建一篇博客
    if (method === 'POST' && url === '/api/blog/new') {
        const loginCheckResult = loginCheck(req)
        if(loginCheckResult){
            return loginCheckResult
        }
        req.body.author = req.session.username
        const result = newBlog(req.body)
        return result.then(data => {
            return new SuccessModel(data)
        })
    }

    // 更新一篇博客
    if (method === 'POST' && url === '/api/blog/update') {
        const loginCheckResult = loginCheck(req)
        if(loginCheckResult){
            return loginCheckResult
        }
        const result = updateBlog(id,req.body)
        return result.then(val => {
            if(val){
                return new SuccessModel()
            }else{
                return new ErrorModel('更新博客失败')
            }
        })
    }

    // 删除一篇博客
    if (method === 'POST' && url === '/api/blog/del') {
        const loginCheckResult = loginCheck(req)
        if(loginCheckResult){
            return loginCheckResult
        }
        const author = req.session.username
        const result = delBlog(id,author)
        return result.then(val => {
            if(val){
                return new SuccessModel()
            }else{
                return new ErrorModel('删除博客失败')
            }
        })
    }
}

module.exports = handleBlogRouter