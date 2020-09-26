require('dotenv').config()

const axios = require('axios')
const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient
const CryptographyHelper = require('../utils/CryptographyHelper')


const uri = `mongodb+srv://abolfazlalz:${process.env.DB_PASSWORD}@cluster0.homvc.mongodb.net/accounts?retryWrites=true&w=majority`

const client = new MongoClient(uri, { useNewUrlParser: true })

module.exports = class RegisterControl {

    constructor() {
        this.listener = new EventEmitter()
    }

    getListener() {
        return this.listener
    }

    login(username, password, callback, error) {

    }

    signup(data) {
        console.log(data);

        client.connect(err => {
            const collection = client.db("accounts").collection("users")
            try {
                collection.insertOne({
                    name: data.firstname,
                    lastname: data.lastname,
                    username: data.username,
                    password: CryptographyHelper.getCryptoPassword(data.password),
                    email: data.email,
                    dateCreated: new Date()
                }, callbackResult => {
                    if (callbackResult != undefined && callbackResult.hasErrorLabel)
                        this.listener.emit("signup-error")
                    else
                        this.listener.emit("signup-success")
                })
            } catch (exception) {
                this.listener.emit("signup-error")
            }

            client.close()
        })
    }


}