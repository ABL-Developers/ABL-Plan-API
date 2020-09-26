require('dotenv').config()

const axios = require('axios')
const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient
const CryptographyHelper = require('../utils/CryptographyHelper')


const uri = `mongodb+srv://abolfazlalz:${process.env.DB_PASSWORD}@cluster0.homvc.mongodb.net/accounts?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true });

module.exports = class RegisterControl {

    constructor() {
        this.listener = new EventEmitter()
    }

    signup(data, callback, error) {
        const listener = new EventEmitter()

        client.connect(err => {
            const collection = client.db("accounts").collection("users");
            collection.insertOne({
                name: data.firstname,
                lastname: data.lastname,
                username: data.username,
                password: CryptographyHelper.getCryptoPassword(data.password),
                email: data.email,
                dateCreated: new Date().toString()
            }, callbackResult => {
                if (callbackResult != undefined && callbackResult.hasErrorLabel && error != undefined) {
                    error(callbackResult.errmsg)
                } else if (callback != undefined) {
                    callback('')
                }
            });

            client.close();
        });

        return listener;
    }


}