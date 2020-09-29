const express = require('express')

module.exports = class RequestsHelper {
  /**
   * 
   * @param {express.Express} app Express app for handle requests
   */
  static startRequestsListener(app) {
    console.log('not defiened')
  }

  static checkParameters(requests, needleParameters) {
    needleParameters.forEach((parameter) => {
      if (!(parameter in requests)) {
        return false
      }
    })
    return true
  }
}
