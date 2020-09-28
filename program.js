require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const PlansControl = require('./databaseControl/PlansControl')
const AccountRequest = require('./requests/AccountRequest')
const PlanRequests = require('./requests/PlanRequests')
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

//Plan operators requests
app.post('/plan/add', AccountRequest.checkAuthToken, PlanRequests.addNewPlan)

// Register requests
app.post('/login', AuthenticatorRequest.authenticateToken, AccountRequest.login)
app.post('/signup', AuthenticatorRequest.authenticateToken, AccountRequest.createAccount)

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})