require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const RegisterRequests = require('./requests/RegisterRequests')
const AccountsRequests = require('./requests/AccountsRequests')
const PlanRequests = require('./requests/PlanRequests')
const mongodb = require('mongodb')

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => {
  let response = new ResponseHelper()
  res.send(response.getResponse())
})

app.post('/info', RegisterRequests.checkAuthToken, (req, res) => {
  res.json(req.user)
})

try {
  start()
} catch (e) {
  if (e instanceof mongodb.MongoNetworkError) {
    console.error('Please check mongodb network')
  } else if (e instanceof mongodb.MongoParseError) {
    console.error("can't parsing the server's response");
  }
  console.error(e);
  start()
}

function start() {
  console.log('start program')
  PlanRequests.startRequestsListener(app)
  RegisterRequests.startRequestsListener(app)
  AccountsRequests.startRequestsListener(app)
}


app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})