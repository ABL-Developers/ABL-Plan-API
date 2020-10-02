require('dotenv').config()

const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient

const url = `mongodb+srv://abolfazlalz:${process.env.DB_PASSWORD}@cluster0.homvc.mongodb.net/?retryWrites=true&w=majority`

module.exports = class DatabaseHelper {
    constructor(db_name) {
        this.listener = new EventEmitter()
        this.client = new MongoClient(url, { useNewUrlParser: true })
        this.db_name = db_name
    }

    getListener() {
        return this.listener
    }

    get Client() {
        return this.client
    }

    find(filter, collectionName, callback, error = undefined) {
        MongoClient.connect(url, (err, client) => {
            if (err) {
                error(err)
            } else {
                const collection = client.db(this.db_name).collection(collectionName)
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
                    client.close()
                })
            }
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
        MongoClient.connect(url, (err, client) => {
            if (err) {
                error(err)
            } else {
                const db = client.db(this.db_name)
                const collection = db.collection(collectionName)
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
                client.close()
            }
        })
    }

    /**
     * Update a collection by data
     * @param {Array} filter the condition for find and update
     * @param {Array} data a dict valu of the data you want to update
     * @param {String} collection the collection you want to update
     * @param {Function} callback 
     * @param {Function} error 
     */
    updateCollection(filter, data, collectionName, callback, error) {
        MongoClient.connect(url, (err, client) => {
            if (err)
                error(err)
            else {
                const collection = client.db(this.db_name).collection(collectionName)
                collection.updateMany(filter, { $set: data }, (err, result) => {
                    if (err)
                        error(err)
                    else {
                        callback(result)
                    }
                    client.close()
                })
            }
        })
    }

    updateOneCollection(filter, data, collectionName, callback, error) {
        MongoClient.connect(url, (err, client) => {
            if (err) throw err
            var dbo = client.db(this.db_name)
            const updateData = { $set: data }
            dbo.collection(collectionName).updateOne(filter, updateData, (err, result) => {
                if (err)
                    error(err)
                else
                    callback(result)
                client.close()
            })
        })
    }

    deleteOneCollection(filter, collection, callback, error = undefined) {
        MongoClient.connect(url, (err, client) => {
            if (err && error != undefined) {
                error(err)
                return
            }
            let db = client.db(this.db_name)
            db.collection(collection).deleteOne(filter, (err, callback) => {
                if (err && error != undefined)
                    error(err)
                else
                    callback(true)

                client.close()
            })
        })
    }

    deleteManyCollection(filter, collection, callback, error = undefined) {
        MongoClient.connect(url, (err, client) => {
            if (err && error != undefined) {
                error(err)
                return
            }
            let db = client.db(this.db_name)
            db.collection(collection).deleteMany(filter, (err, result) => {
                if (err && error != undefined)
                    error(err)
                else
                    callback(result.result.n)
                client.close()
            })
        })
    }

    isVariableFunction(variable) {
        return variable != undefined && typeof (variable) == 'function'
    }

}