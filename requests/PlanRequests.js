const RequestsHelper = require('./RequestsHelper')
const ResponseHelper = require('../utils/ResponseHelper')
const PlansControl = require('../databaseControl/PlansControl')
const RegisterRequests = require('./RegisterRequests')
const express = require('express')

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
}
