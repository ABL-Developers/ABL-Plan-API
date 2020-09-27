require('dotenv').config()

const axios = require('axios')
const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient
const CryptographyHelper = require('../utils/CryptographyHelper')


const uri = `mongodb+srv://abolfazlalz:${process.env.DB_PASSWORD}@cluster0.homvc.mongodb.net/accounts?retryWrites=true&w=majority`

module.exports = class RegisterControl {

    constructor() {
        this.listener = new EventEmitter()
        this.client = new MongoClient(uri, { useNewUrlParser: true })
    }

    getListener() {
        return this.listener
    }

    login(username, password, callback, error) {
        this.client.connect(err => {
            const collection = this.client.db("accounts").collection("users")
            const condition = {
                'username': username,
                'password': CryptographyHelper.getCryptoPassword(password)
            }
            collection.find(condition).toArray(function (err, result) {
                console.log(result);
                if (err) {
                    error(err)
                }
                else if (result.length != 1)
                    callback(false)
                else {
                    let user = result[0]
                    delete user.password
                    callback(user)
                }
            })
            this.client.close()

        })
    }

    signup(data) {
        this.client.connect(err => {
            const collection = this.client.db("accounts").collection("users")
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

            this.client.close()
        })
    }


}