const sgMail = require('@sendgrid/mail')
const SENDGRID_API_KEY = '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'

sgMail.setApiKey(SENDGRID_API_KEY)

module.exports.absentMailFunc = async (email, subjects, callback) => {
    try {
        sgMail.send(
            {
                to: email,
                from: 'shivam.zimo@outlook.com',
                subject: subjects,
                html: `<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="utf-8" />
        <link rel="icon" href="zimo-tab.png"/>
        <title>Email</title>
    </head>
    
    <body style="margin: 0px; padding:0px;">
        <div
            style="padding: 0; margin:0 auto; width: 800px !important; height: auto; font-family: Helvetica Neue, Helvetica, Arial, sans-serif; background-color: #ffffff; border: 1px solid rgb(207, 203, 203);">
    
            <center>
            <div style="  background-color:#ed7171;  padding: 15px 0px; border-radius: 10px 10px 0px 0px; ">
            <img src= "https://www.linkpicture.com/q/logo2_14.png" height="60px" width="100px"   alt="">
        </div>
            </center>
                            <center style="width: 100%; position: absolute; top: 26%; left: 0px;">
                                <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600px"
                                    bgcolor="#FFFFFF"
                                    style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: inherit; border-radius: 10px; box-shadow: 1px 1px 20px 1px #ed71712a; padding: 20px;">
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table role="presentation" border="0" cellspacing="0" cellpadding="0"
                                                    width="100%">
                                                    <tbody>
                                                        <tr>
                                                            <td style="padding: 20px 24px 10px 24px; margin: 0px;">
                                                                <table role="presentation" border="0" cellspacing="0"
                                                                    cellpadding="0" width="100%">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td style="padding-bottom: 40px">
                                                                                <h2
                                                                                    style="margin: 0; color: rgb(114, 111, 111); font-weight: 700; font-size: 20px; line-height: 1.2">
                                                                                    Hii</h2>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td style="padding-bottom: 20px">
                                                                                <p
                                                                                    style="color: rgb(114, 111, 111); line-height: 22px;">
                                                                                    We have been notice that you are absent tomorrow
                                                                                    
    
                                                                                </p>
    
                                                                                <p
                                                                                    style="color: rgb(114, 111, 111); margin: 20px 0px; line-height: 22px;">
                                                                                  </p>
    
                                                                                <p
                                                                                    style="color: rgb(114, 111, 111); line-height: 22px;">
                                                                                    So consider this mail
                                                                                    as a  warning and consult with your HR</p>
                                                                            </td>
                                                                        </tr>
    
    
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <hr style="margin: -0px 20px -25px 20px;">
                                                <center>
                                                    <table style="margin-top: 50;">
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <table>
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding-bottom: 20px">
                                                                                    <table border="0"
                                                                                        style="margin-right: 0px"
                                                                                        cellpadding="0" cellspacing="0">
                                                                                        <div style="text-align:center"
                                                                                        <div style="font-size: 30px; padding:0px 0px;">
                                                                                           <a style="text-decoration : none" href= "https://www.facebook.com/zimoinfotech/"> <img src= "https://www.linkpicture.com/q/fb.svg" style="width : 40px; margin: 0px 10px;"></img></a>  
                                                                        
                                                                                            <a href= "https://www.instagram.com/zimo.one/" style="text-decoration : none"><img src ="https://www.linkpicture.com/q/ig.svg" style="width : 40px; margin: 0px 10px;"></a>
                                                                        
                                                                                           <a style="text-decoration : none" href= "https://twitter.com/zimoinfotech"><img src = "https://www.linkpicture.com/q/twitter_3.svg" style="width : 40px; margin: 0px 10px;"></a>
                                                                        
                                                                                        </div>
                                                                                            <div style="padding: 0px  0px 10px 0px; text-align: center; ">
                                                                                                    <p>© 2022 Zimo.one All Right Reserved</p></div>
                                                                                           </div>
                                                </table>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </center>
                        </td>
                    </tr>
        </div>
    </body>
    
    </html>`,
            },
            false,
            async (error, result) => {
                if (result != null) {
                    callback('Send', true)
                } else {
                    if (error.response != null && error.response.body.errors[0].message.indexOf('The subject is required.') > -1) {
                        callback(
                            {
                                message: 'Invalid subject',
                                stack: error.code,
                            },
                            false,
                            '1'
                        )
                    } else {
                        callback(
                            {
                                message: error.response.body.errors[0].message,
                                stack: error.code,
                            },
                            false,
                            '1'
                        )
                    }
                }
            }
        )
    } catch (e) {
        callback({ message: e.message, stack: e.stack }, false, '1')
    }
}
