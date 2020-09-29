require('dotenv').config()

const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient
const CryptographyHelper = require('../utils/CryptographyHelper')
const AccountControl = require('./AccountsControl')
const DatabaseHelper = require('./DatabaseHelper')


const
    SIGNUP_ERROR = 'signup-error',
    LOGIN_ERROR = 'login-error'

module.exports = class RegisterControl extends DatabaseHelper {

    constructor() {
        super('accounts')
    }

    login(username, password, callback, error) {
        this.client.connect(err => {
            const collection = this.client.db("accounts").collection("users")
            const condition = {
                'username': username,
                'password': CryptographyHelper.getCryptoPassword(password)
            }
            collection.find(condition).toArray(function (err, result) {
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

    static get signup_error() {
        return SIGNUP_ERROR
    }

    static get login_error() {
        return LOGIN_ERROR
    }

    /**
     * @param {Array} data 
     */
    signup(data) {

        if (data.firstname === '')
            this.getListener().emit(RegisterControl.signup_error, 'Enter firstname')
        else if (data.lastname === '')
            this.getListener().emit(RegisterControl.signup_error, 'Enter lastname for user')
        else if (data.username === '')
            this.getListener().emit(RegisterControl.signup_error, 'Enter Username for user')
        else if (data.password === '')
            this.getListener().emit(RegisterControl.signup_error, 'Enter password, the password must have 8 characters')
        else if (data.password.length < 8)
            this.getListener().emit(RegisterControl.signup_error, 'the entered password is too short, password must have 8 characters or numbers')
        else if (data.email === '')
            this.getListener().emit(RegisterControl.signup_error, 'Enter email for user')
        else {
            AccountControl.newInstance().isUsernameExists(data.username, (result) => {
                if (result) {
                    this.getListener().emit(RegisterControl.signup_error, 'the entered username already use from another user')
                    return
                }
                AccountControl.newInstance().isEmailExists(data.email, (result) => {
                    if (result) {
                        this.getListener().emit(RegisterControl.signup_error, 'the entered email already use from another user')
                        return
                    }

                    signupComplete(data, this.Client, this.getListener())
                })
            })
        }


        /**
         * @param {MongoClient} client 
         * @param {EventEmitter} listener 
         */
        function signupComplete(data, client, listener) {
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
                            listener.emit("signup-error")
                        else
                            listener.emit("signup-success")
                    })
                } catch (exception) {
                    listener.emit("signup-error")
                }

                client.close()
            })
        }

        return this.getListener
    }


}