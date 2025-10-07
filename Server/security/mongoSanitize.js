import mongoSanitize from 'express-mongo-sanitize';

export const mongoSecurity = (app) => {
    app.use(mongoSanitize({
        replaceWith: '_',
        onSanitize: (req, res, next) => {
            console.warn(`[MongoSanitize] Key sanitized: ${key} | Value: ${req.body[key]}`)
        }
    }))
}