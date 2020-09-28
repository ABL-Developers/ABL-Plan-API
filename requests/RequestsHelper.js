module.exports = class RequestsHelper {
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
