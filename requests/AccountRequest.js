require('dotenv').config()

const ResponseHelper = require('../utils/ResponseHelper')
const RegisterHelper = require('../databaseControl/RegisterControl')
const RequestsHelper = require('./RequestsHelper')
const AuthenticatorRequest = require('../requests/AuthenticatorRequest')
const jwt = require('jsonwebtoken')

let refreshTokens = []

module.exports = class AccountRequest extends RequestsHelper {

    static startRequestsListener(app) {
        app.post('/login', AuthenticatorRequest.authenticateToken, AccountRequest.login)
        app.post('/signup', AuthenticatorRequest.authenticateToken, AccountRequest.createAccount)
    }

    static login(req, res) {
        let response = new ResponseHelper()
        let username = req.body.username
        let password = req.body.password

        let register = new RegisterHelper()
        register.login(username, password,
            (user) => {
                if (user != false) {
                    response.setStatus(true)
                    const refreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
                    refreshTokens.push(refreshToken)
                    response.putData("refresh-token", refreshToken)
                }
                res.send(response.getResponse())
            }, (err) => {
                response.putData("error", err)
                res.send(response.getResponse())
            })
    }

    static createAccount(req, res) {
        let response = new ResponseHelper()
        let register = new RegisterHelper()
        let data = {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            firstname: req.body.firstname,
            lastname: req.body.lastname
        }

        register.signup(data)

        register.getListener().on('signup-success', () => {
            response.setStatus(true)
            response.putData("msg", "your account successfully has created")
            res.json(response.getResponse())
        })

        register.getListener().on('signup-error', () => {
            response.putData('msg', error)
            res.json(response.getResponse())
        })
    }

    static getRefreshTokens() {
        return refreshTokens
    }

    static checkAuthToken(req, res, next) {
        const refreshToken = req.body.token
        if (refreshToken == null) return res.sendStatus(401)
        if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            req.user = user
            next()
        })
    }

    static generateAccessToken(user) {
        return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    }
}