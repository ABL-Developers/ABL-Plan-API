const DatabaseHelper = require('./DatabaseHelper.js')
const PlansControl = require('./PlansControl')
const moment = require('moment')

module.exports = class ToDoControls extends DatabaseHelper {
    constructor() {
        super('plans')
    }

    addToDo(planId, title, deadline, success, error) {
        if (title === null) {
            error('Title is empty')
        } else if (moment(deadline, 'YYYY-MM-DD HH:mm:ss').isValid()) {
            error('Deadline is not valid')
        }

        const plansControl = new PlansControl()
        //check planId is valid or not
        plansControl.isValidPlanId(planId, callback => {
            if (callback) {
                const data = {
                    title: toDoData.title,
                    planId: planId,
                    isCompleted: false,
                    dates: {
                        created: moment().format("YYYY-MM-DD HH:mm:ss"),
                        modified: moment().format("YYYY-MM-DD HH:mm:ss"),
                        deadline: deadline
                    }
                }
                this.insertOneCollection(data, 'todo', success, error)
            } else {
                error('the entered plan id was not exists in the database')
            }
        })
    }
}
