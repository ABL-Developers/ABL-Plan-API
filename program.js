const express = require('express')
const ResponseHelper = require('./utils/ResponseHelper');
const app = express()
const port = 3000

app.get('/', (req, res) => {
    let response = new ResponseHelper();
    response.setStatus(true);
    response.putData('key', process.env.ACCESS_TOKEN_SECRET);
    res.send(response.getResponse());
})


app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})