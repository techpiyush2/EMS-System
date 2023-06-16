'use strict'

const config = {
    local: {
        port: 5000,
        env: 'local',
        email_port: 465,
        db: {
            connectionString: 'mongodb+srv://ZimoOne:Zimo0555@cluster0.efoiw.mongodb.net/zimoInternal?retryWrites=true&w=majority',
        },
        baseUrl: 'http://localhost:5000/',
        frontEndURL: 'http://74.208.25.43:3007/',
        adminUrl: 'http://192.168.1.115:3000/',
        companyAdminUrl: 'http://192.168.1.115:3001/',

        adminBaseUrl: 'http://74.208.25.43:3007/', // live url
        superadminBaseUrl: 'http://74.208.25.43:3008/', //  superadmin live url

        imageBaseUrl: 'http://localhost:8000',
        backendUrl: 'http://74.208.25.43:4004/',
        env: 'local',
        SENDGRID_API_KEY : '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',

        smtp: {
            service: 'Outlook365',
            username: 'info@zimo.one',
            password: 'India@2022@',
            host: 'smtp.office365.com',
            mailUserName: 'info@zimo.one',
            verificationMail: '',
        },
    },
}

module.exports.get = function get(env) {
    return config[env] || config.default
}
