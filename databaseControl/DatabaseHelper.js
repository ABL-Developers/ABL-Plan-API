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

    get Client() {
        return this.client
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

    /**
     * check a value is Exists or not
     * @param {Array} filter 
     * @param {String} collectionName 
     * @param {Function} callback 
     * @param {Function} error 
     */
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
                        const isExists = result != undefined
                        if (this.isVariableFunction(callback))
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