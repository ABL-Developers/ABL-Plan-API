require('dotenv').config()

const crypto = require("crypto")

module.exports = class CryptographyHelper {

    constructor() {
    }

    static getCryptoPassword(stringPassword) {
        const hashPass = crypto.createHmac('sha256', process.env.PASSWORD_SECRET_KEY)
            .update(stringPassword)
            .digest('hex')

        return hashPass;
    }
}