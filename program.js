require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const jwt = require('jsonwebtoken')
const RegisterHelper = require('./databaseControl/RegisterControl')
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
    let response = new ResponseHelper()
    const token = req.headers['authorization']
    let auth = process.env.ACCESS_TOKEN_SECRET
    if (token != auth) {
        res.sendStatus(403)
    }
    res.send(response.getResponse())
})

app.post('/login/', (req, res) => {
    let response = new ResponseHelper()
    let username = req.body.username
    let password = req.body.password

    if (!checkAuth(req.body.token, res))
        return

    let register = new RegisterHelper()
    register.signin(username, password, req.connection.remoteAddress)
    res.send(response.getResponse())
})

app.post('/signup', (req, res) => {
    let response = new ResponseHelper()
    let register = new RegisterHelper()
    let data = {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname
    }
    register.signup(data, (success) => {
        response.setStatus(true)
        response.putData("msg", "your account successfully has created")
        res.json(response.getResponse())
    }, (error) => {
        response.putData('msg', error)
        res.json(response.getResponse())
    });
})

function checkAuth(token, res) {
    let response = new ResponseHelper()

    let auth = process.env.ACCESS_TOKEN_SECRET
    if (token != auth) {
        console.log('invalid auth')
        res.sendStatus(403)
        response.putData('msg', 'invalid token')
        res.json(response.getResponse())
        return false
    }
    return true
}

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})