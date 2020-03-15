const { exec,escape } = require('../db/mysql')
const { genPassword } = require('../utils/cryp')

const login = (username,password) => {
    username = escape(username)

    password = genPassword(password)
    password = escape(password)

    const sql = `select username,realname from users where username=${username} and password=${password}`
    console.log('sql is',sql)
    return exec(sql).then(rows => {
        return rows[0]||{}
    })
}

const register = (username,password) => {
    username = escape(username)

    password = genPassword(password)
    password = escape(password)

    const sql = `insert users(username,password) values(${username},${password})`
    return exec(sql).then(rows => {
        return rows.insertId || ''
    })
}

module.exports = {
    login,
    register
}