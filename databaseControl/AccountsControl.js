require('dotenv').config()

const EventEmitter = require('events').EventEmitter
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient

const DatabaseHelper = require('./DatabaseHelper')
const moment = require('moment')

const USER_VALIDATION = 1

module.exports = class AccountsControl extends DatabaseHelper {

    constructor() {
        super('accounts')
    }

    static get USER_VALIDATION() {
        return USER_VALIDATION
    }

    static newInstance() {
        return new AccountsControl()
    }

    isUserIdValid(userId, callback, error = undefined) {
        var o_id = new mongo.ObjectID(userId)
        const filter = { '_id': o_id }
        this.checkDataExists(filter, 'users', callback, error)
    }

    isUsernameExists(username, callback, error = undefined) {
        this.checkDataExists({ 'username': username }, 'users', callback, error)
    }

    isEmailExists(email, callback, error = undefined) {
        this.checkDataExists({ 'email': email }, 'users', callback, error)
    }

    updateCollection(filter, data, collectionName, callback, error) {
        data['modified'] = moment().format('YY-MM-DD HH-mm')
        super.updateCollection(filter, data, collectionName, callback, error)
    }

    updateOneCollection(filter, data, collectionName, callback, error) {
        data['date']['modified'] = moment().format('YY-MM-DD HH-mm')
        super.updateOneCollection(filter, data, collectionName, callback, error)
    }
}