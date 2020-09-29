
module.exports = class ResponseHelper {

    constructor() {
        this.response = {
            data: {
                status: false
            },
            about: {
                date: Date.now(),
                type: 'Json'
            }
        }
    }

    setStatus(status) {
        this.response.data.status = status
    }

    setMessage(message) {
        this.response.data.message = message
    }

    setValue(value) {
        this.response.data.value = value
    }

    putData(key, value) {
        this.response.data[key] = value
    }

    removeData(key) {
        delete this.response[key]
    }

    getData(key) {
        return this.response[key]
    }

    getResponse() {
        return this.response
    }

}