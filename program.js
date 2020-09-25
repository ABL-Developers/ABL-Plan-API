require('dotenv').config()

const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper')
const jwt = require('jsonwebtoken')
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

app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})