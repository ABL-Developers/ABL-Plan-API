require('dotenv').config()

const RequestsHelper = require('./RequestsHelper.js')
const AccountControl = require('../databaseControl/AccountsControl')
const ResponseHelper = require('../utils/ResponseHelper')
const express = require('express')

module.exports = class AccountsRequests extends RequestsHelper {
    /**
     * Start requests related to Accounts
     * @param {express.Express} app 
     */
    static startRequestsListener(app) {
        app.get('/accounts/taken/:key/:value', this.isTakenElement)
    }

    static isTakenElement(req, res, next) {
        const account = new AccountControl()
        const key = req.params.key
        const value = req.params.value
        const response = new ResponseHelper()

        if (key == 'username') {
            account.isUsernameExists(value,
                callback => {
                    response.putData('result', callback)
                    response.setStatus(true)
                    res.json(response.getResponse())
                }, err => {
                    response.setMessage(err)
                    res.json(response.getResponse())
                })
        } else if (key == 'email') {
            account.isEmailExists(value,
                callback => {
                    response.putData('result', callback)
                    response.setStatus(true)
                    res.json(response.getResponse())
                }, err => {
                    response.setMessage(err)
                    res.json(response.getResponse())
                })
        } else {
            res.sendStatus(400)
        }
    }
}