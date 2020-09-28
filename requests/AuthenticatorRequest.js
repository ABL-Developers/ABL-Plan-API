module.exports = class AuthenticatorRequest {
    static authenticateToken(req, res, next) {
        const token = req.body.authorizations
        if (token == null) return res.sendStatus(401)
        if (token != process.env.ACCESS_TOKEN_SECRET)
            return res.sendStatus(403)
        next()
    }
}