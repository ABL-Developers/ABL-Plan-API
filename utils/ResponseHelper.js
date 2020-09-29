
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

    putData(key, value) {
        this.response.data[key] = value
    }

    removeData(key) {
        delete this.response[key]
    }

    getResponse() {
        return this.response
    }

}