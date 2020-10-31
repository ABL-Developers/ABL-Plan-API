const RequestsHelper = require('./RequestsHelper')
const ResponseHelper = require('../utils/ResponseHelper')
const PlansControl = require('../databaseControl/PlansControl')
const ToDoControls = require('../databaseControl/ToDoControls')
const RegisterRequests = require('./RegisterRequests')
const express = require('express')
const { checkParameters } = require('./RequestsHelper')
const { response } = require('express')

module.exports = class PlanRequests extends RequestsHelper {

  /**
   * @param {express.Express} app 
   */
  static startRequestsListener(app) {
    app.post('/plan/add', RegisterRequests.checkAuthToken, PlanRequests.addNewPlan)
    app.get('/plan/get/:refreshToken', RegisterRequests.checkAuthTokenParameter, PlanRequests.getPlans)
    app.get('/plan/is-admin/:planId/:refreshToken', RegisterRequests.checkAuthTokenParameter, PlanRequests.isUserAdmin)
    app.put('/plan/update/:planId', RegisterRequests.checkAuthToken, PlanRequests.updatePlan)
    app.delete('/plan/delete/:planId', RegisterRequests.checkAuthToken, PlanRequests.deletePlan)
    app.post('/plan/todo/add', RegisterRequests.checkAuthToken, PlanRequests.addNewToDo)
    app.get('/plan/todo/get/:planId/:refreshToken', RegisterRequests.checkAuthTokenParameter, PlanRequests.getToDo)
    app.delete('/plan/todo/delete/:todoId', RegisterRequests.checkAuthToken, PlanRequests.deleteToDo)
  }

  static addNewPlan(req, res) {
    const needleParams = ["title", "description", "createdDate"]
    let uid = req.user._id
    if (!PlanRequests.checkParameters(req.body, needleParams)) {
      res.send(400)
      return
    }
    if (uid == undefined) {
      res.sendStatus(403)
      return
    }

    const data = {
      title: req.body.title,
      description: req.body.description,
      createdDate: req.body.createdDate,
      deadlineDate: req.body.deadlineDate,
    }

    let responseHelper = new ResponseHelper()
    let planControl = new PlansControl()
    planControl.getListener().on("insert-success", () => {
      responseHelper.setStatus(true)
      res.json(responseHelper.getResponse())
    })
    planControl.getListener().on("insert-error", (error) => {
      responseHelper.putData('msg', error)
      res.json(responseHelper.getResponse())
    })

    planControl.createNewPlan(data, uid)
  }

  static getPlans(req, res) {
    const uid = req.user._id
    if (uid == undefined) {
      res.sendStatus(403)
      return
    }

    let limit = 0
    let skip = 10

    if ("limit" in req.params)
      limit = req.params["limit"]
    if ("skip" in req.params)
      skip = req.params["skip"]

    let responseHelper = new ResponseHelper()
    let planControl = new PlansControl()

    planControl.getListener().on('get-plans', (plans) => {
      responseHelper.putData('plans', plans)
      responseHelper.setStatus(true)
      res.json(responseHelper.getResponse())
    })

    planControl.getListener().on('get-plans-error', (error) => {
      responseHelper.putData('msg', error)
      res.json(responseHelper.getResponse())
    })

    planControl.getPlans(uid, limit, skip)
  }

  /**
   * a request for checking the user is admin of plan or not
   * @param {Express.Request} req
   * @param {Express.Response} res
   */
  static isUserAdmin(req, res) {
    const uid = req.user._id
    const planId = req.params.planId

    const planControl = new PlansControl()
    const responseHelper = new ResponseHelper()
    planControl.isUserPlanAdmin(planId, uid, callback => {
      responseHelper.putData('result', callback)
      responseHelper.setStatus(true)
      res.json(responseHelper.getResponse())
    }, error => {
      responseHelper.putData('msg', error)
      res.json(responseHelper.getResponse())
    })
  }

  /**
   * @param {express.Request} req 
   * @param {express.Response} res 
   */
  static updatePlan(req, res) {
    const response = new ResponseHelper()
    const planId = req.params.planId
    const userId = req.user._id
    const plans = new PlansControl()
    plans.updatePlan(planId, userId, req.body, result => {
      response.putData('result', result)
      res.json(response.getResponse())
    }, (error, code) => {
      response.putData('msg', error)
      if (code != undefined)
        res.status(code).json(response.getResponse())
      else
        res.json(response.getResponse())

    })

  }

  /**
   * @param {express.Request} req 
   * @param {express.Response} res 
   */
  static deletePlan(req, res) {
    const userId = req.user._id
    const planId = req.params.planId
    const plans = new PlansControl()
    const response = new ResponseHelper()
    plans.deletePlan(planId, userId, callback => {
      response.putData('result', callback)
      res.json(response.getResponse())
    }, (error, status) => {
      response.setMessage(error)
      if (status != undefined)
        res.status(status).json(response.getResponse())
      else
        res.send(response.getResponse())
    })
  }


  /**
   * Add new ToDo item to Plan
   * @param {express.Request} req
   * @param {express.Response} res
   */
  static addNewToDo(req, res) {
    const response = new ResponseHelper()
    if (!RequestsHelper.checkParameters(req, ['planId', 'title', 'deadline'])) {
      response.setMessage('Please enter all of the following parameters')
      res.status(400).send(response.getResponse())
      return
    }
    const planId = req.body.planId
    const title = req.body.title
    const deadline = req.body.deadline

    const toDoControls = new ToDoControls()
    toDoControls.addToDo(planId, title, deadline, success => {
      response.putData('result', true)
      response.setStatus(true)
      res.send(response.getResponse())
    }, (error, code) => {
      response.putData('msg', error)
      if (code != undefined) {
        res.status(code).send(response.getResponse())
      } else {
        res.send(response.getResponse())
      }
    })
  }

  /**
   * select a plan's todos
   * @param {express.Request} req
   * @param {express.Response} res
   */
  static getToDo(req, res) {
    const uid = req.user._id
    const planId = req.params.planId
    if (uid == undefined) {
      res.sendStatus(403)
      return
    }

    let limit = 10
    let skip = 0

    if ("limit" in req.query && !isNaN(req.query.limit))
      limit = parseInt(req.query.limit)
    if ("skip" in req.query && !isNaN(req.query.skip))
      skip = parseInt(req.query.skip)

    const responseHelper = new ResponseHelper()
    const todoCtrl = new ToDoControls()
    todoCtrl.selectToDo(uid, planId, limit, skip, result => {
      responseHelper.setStatus(true)
      responseHelper.putData('todos', result)
      res.send(responseHelper.getResponse())
    }, (error, code) => {
      responseHelper.setMessage(error)
      if (code != undefined) {
        res.status(code).send(responseHelper.getResponse())
      } else {
        res.send(responseHelper.getResponse())
      }
    })
  }

  static deleteToDo(req, res) {
    const userId = req.user._id
    const todoId = req.params.todoId
    const todoCtrl = new ToDoControls()
    const response = new ResponseHelper()
    todoCtrl.deleteToDo(userId, todoId, callback => {
      response.putData('result', callback)
      res.json(response.getResponse())
    }, (error, status) => {
      response.setMessage(error)
      if (status != undefined)
        res.status(status).json(response.getResponse())
      else
        res.send(response.getResponse())
    })
  }
}
