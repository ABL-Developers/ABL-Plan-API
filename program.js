require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const jwt = require('jsonwebtoken')
const RegisterHelper = require('./databaseControl/RegisterControl')
const app = express()
const port = 3000

app.use(express.json())

let refreshTokens = []

app.get('/', (req, res) => {
    let response = new ResponseHelper()
    res.send(response.getResponse())
})

app.post('/login', (req, res) => {
    let response = new ResponseHelper()
    let username = req.body.username
    let password = req.body.password

    let register = new RegisterHelper()
    register.login(username, password,
        (result) => {
            response.setStatus(result)
            if (result != false) {
                const accessToken = generateAccessToken(result)
                const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
                refreshTokens.push(refreshToken)
                response.putData("refresh-token", refreshToken)
                response.putData("access-token", accessToken)
            }
            res.send(response.getResponse())
        }, (err) => {
            response.putData("error", err)
            res.send(response.getResponse())
        })
})

app.post('/signup', authenticateToken, (req, res) => {
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
})

function authenticateToken(req, res, next) {
    const token = req.body.authorizations
    console.log(req.body)
    if (token == null) return res.sendStatus(401)
    if (token != process.env.ACCESS_TOKEN_SECRET)
        return res.sendStatus(403)
    next()
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '365d' })
}

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})