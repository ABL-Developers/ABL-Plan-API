require('dotenv').config()

const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient

const uri = `mongodb+srv://abolfazlalz:${process.env.DB_PASSWORD}@cluster0.homvc.mongodb.net/?retryWrites=true&w=majority`

module.exports = class DatabaseHelper {
    constructor() {
        this.listener = new EventEmitter()
        this.client = new MongoClient(uri, { useNewUrlParser: true })
    }

    getListener() {
        return this.listener
    }
}