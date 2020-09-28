require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const jwt = require('jsonwebtoken')
const RegisterHelper = require('./databaseControl/RegisterControl')
const PlansControl = require('./databaseControl/PlansControl')
const { response } = require('express')
const app = express()
const port = 3000

app.use(express.json())

let refreshTokens = []

app.get('/', (req, res) => {
    let response = new ResponseHelper()
    res.send(response.getResponse())
})

app.post('/info', checkAuthToken, (req, res) => {
    res.json(req.user)
})

app.post('/plan/add', checkAuthToken, (req, res) => {
    const needleParams = ['title', 'description', 'createdDate']
    let uid = req.user._id
    if (!checkParameters(req.body, needleParams)) {
        res.send(400)
        return
    }
    if (uid == undefined) {
        res.sendStatus(403)
        return
    }

    const data = {
        title: req.body.title,
        description: req.body.description,
        createdDate: req.body.createdDate,
        deadlineDate: req.body.deadlineDate,
    }

    let responseHelper = new ResponseHelper()
    let planControl = new PlansControl()
    planControl.getListener().on('insert-success', () => {
        responseHelper.setStatus(true)
        res.json(responseHelper.getResponse())
    })
    planControl.getListener().on('insert-error', () => {
        res.json(responseHelper.getResponse())
    })

    planControl.createNewPlan(data, uid)
})

app.post('/login', (req, res) => {
    let response = new ResponseHelper()
    let username = req.body.username
    let password = req.body.password

    let register = new RegisterHelper()
    register.login(username, password,
        (user) => {
            if (user != false) {
                response.setStatus(true)
                const accessToken = generateAccessToken(user)
                const refreshToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
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
    if (token == null) return res.sendStatus(401)
    if (token != process.env.ACCESS_TOKEN_SECRET)
        return res.sendStatus(403)
    next()
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

function checkAuthToken(req, res, next) {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

function checkParameters(requests, needleParameters) {
    needleParameters.forEach(parameter => {
        if (!(parameter in requests)) {
            return false
        }
    })
    return true
}

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})