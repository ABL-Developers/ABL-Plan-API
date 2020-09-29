require('dotenv').config()

const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient

const uri = `mongodb+srv://abolfazlalz:${process.env.DB_PASSWORD}@cluster0.homvc.mongodb.net/?retryWrites=true&w=majority`

module.exports = class DatabaseHelper {
    constructor(db_name) {
        this.listener = new EventEmitter()
        this.client = new MongoClient(uri, { useNewUrlParser: true })
        this.db_name = db_name
    }

    getListener() {
        return this.listener
    }

    find(filter, collectionName, callback, error = undefined) {
        this.client.connect(err => {
            if (err) {
                error(err)
            } else {
                const collection = this.client.db(this.db_name).collection(collectionName)
                collection.find(filter).toArray((err, result) => {
                    if (err) {
                        if (error != undefined && typeof (error) == 'function') {
                            error(err.message)
                            return
                        }
                        else
                            throw err
                    }

                    if (this.isVariableFunction(callback)) {
                        callback(result)
                    } else if (this.isVariableFunction(error)) {
                        error('callback must declared')
                    }
                })
            }
            this.client.close()
        })
    }

    checkDataExists(filter, collectionName, callback, error) {
        this.client.connect(err => {
            if (err) {
                error(err)
            } else {
                const collection = this.client.db(this.db_name).collection(collectionName)
                collection.findOne(filter, (err, result) => {
                    if (err) {
                        if (this.isVariableFunction(error))
                            error(err)
                        else
                            throw err
                    } else {
                        const isExists = Object.keys(result).length > 0
                        if (this.isVariableFunction(variable))
                            callback(isExists)
                        else if (this.isVariableFunction(error))
                            error('callback must declared')
                    }
                })
            }
            this.client.close()
        })
    }

    isVariableFunction(variable) {
        return variable != undefined && typeof (variable) == 'function'
    }

}