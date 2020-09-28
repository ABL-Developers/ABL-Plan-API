module.exports = class RequestsHelper {
  static checkParameters(requests, needleParameters) {
    needleParameters.forEach((parameter) => {
      if (!(parameter in requests)) {
        return false
      }
    })
    return true
  }
}
