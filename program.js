require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const jwt = require('jsonwebtoken')
const PlansControl = require('./databaseControl/PlansControl')
const AccountRequest = require('./requests/AccountRequest')
const AuthenticatorRequest = require('./requests/AuthenticatorRequest')
const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
    let response = new ResponseHelper()
    res.send(response.getResponse())
})

app.post('/info', AccountRequest.checkAuthToken, (req, res) => {
    res.json(req.user)
})

app.post('/plan/add', AccountRequest.checkAuthToken, (req, res) => {
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

app.post('/login', AuthenticatorRequest.authenticateToken, AccountRequest.login)

app.post('/signup', AuthenticatorRequest.authenticateToken, AccountRequest.createAccount)

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