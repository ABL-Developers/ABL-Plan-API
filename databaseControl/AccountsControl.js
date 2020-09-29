require('dotenv').config()

const EventEmitter = require('events').EventEmitter
const mongo = require('mongodb')
const MongoClient = mongo.MongoClient

const DatabaseHelper = require('./DatabaseHelper')

const USER_VALIDATION = 1

module.exports = class AccountsControl extends DatabaseHelper {

    constructor() {
        super()
    }

    static get USER_VALIDATION() {
        return USER_VALIDATION
    }

    isUserIdValid(userId) {
        this.client.connect(err => {
            const collection = this.client.db("accounts").collection("users")
            var o_id = new mongo.ObjectID(userId);
            const filter = { '_id': o_id }
            collection.findOne(filter, (err, callback) => {
                const result = Object.keys(callback).length > 0
                this.getListener().emit(AccountsControl.USER_VALIDATION, result)
            })
            this.client.close()
        })
    }

}