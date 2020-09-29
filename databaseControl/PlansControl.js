require('dotenv').config()

const EventEmitter = require('events').EventEmitter
const MongoClient = require('mongodb').MongoClient
const moment = require('moment')
const AccountsControl = require('./AccountsControl')

const uri = `mongodb+srv://abolfazlalz:${process.env.DB_PASSWORD}@cluster0.homvc.mongodb.net/plans?retryWrites=true&w=majority`

module.exports = class PlansControl {

    constructor() {
        this.listener = new EventEmitter()
        this.client = new MongoClient(uri, { useNewUrlParser: true })
    }

    getListener() {
        return this.listener
    }

    createNewPlan(data, userId) {

        let account = new AccountsControl()

        account.isUserIdValid(userId)
        account.getListener().on(AccountsControl.USER_VALIDATION,
            (isUserValid) => {

                if (!isUserValid) {
                    this.listener.emit('insert-error', 'The entered user is invalid')
                    return
                }

                let createdDate = data.createdDate
                if (!this.checkDate(createdDate)) {
                    this.listener.emit('insert-error', 'Created date is not valid')
                    return
                }
                let deadlineDate = createdDate
                if (data.deadlineDate != undefined) {
                    if (!this.checkDate(data.deadlineDate)) {
                        this.listener.emit('insert-error', 'Deadline date is not valid')
                        return
                    }
                    deadlineDate = data.deadlineDate
                }

                if (data.title == '' || data.title == undefined) {
                    this.listener.emit('insert-error', 'Title must have value')
                    return
                }

                let planData = {
                    'title': data.title,
                    'description': data.description,
                    'dates': {
                        'created': data.createdDate,
                        'deadline': deadlineDate,
                        'modified': data.createdDate
                    },
                    "users": {
                        ['user' + userId]: ['creator']
                    }
                }

                this.client.connect(err => {
                    if (err) {
                        this.listener.emit('insert-error', err)
                    } else {
                        const plans = this.client.db("plans").collection("plans")
                        plans.insertOne(planData, callback => {
                            if (callback != undefined && callback.hasErrorLabel)
                                this.listener.emit("insert-error", callback.error)
                            else
                                this.listener.emit("insert-success")
                        }, error => {
                            this.listener.emit("insert-error", error)
                        })
                    }
                    this.client.close()
                })
            })
    }

    checkDate(date) {
        return moment(date, "YYYY-M-D h:m", true).isValid()
    }

    getPlans(uid, limit = 10, skip = 0) {

        this.client.connect(err => {
            if (err) {
                this.listener.emit('get-plans-error', err)
                return
            }
            const collection = this.client.db("plans").collection("plans")
            collection.find({ ['users.user' + uid]: { $exists: true } }).limit(limit).skip(skip).toArray((err, result) => {
                if (err) {
                    this.listener.emit('get-plans-error', err)
                    return
                }
                this.listener.emit('get-plans', result)
            })
            this.client.close()
        })
    }
}