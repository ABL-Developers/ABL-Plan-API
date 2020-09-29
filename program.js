require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const RegisterRequests = require('./requests/RegisterRequests')
const PlanRequests = require('./requests/PlanRequests')

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

PlanRequests.startRequestsListener(app)
RegisterRequests.startRequestsListener(app)


app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})