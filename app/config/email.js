const sgMail = require('@sendgrid/mail')
const basicConfig = require('../config/emailConfig');
// const basicConfig = require('../config/config');

sgMail.setApiKey(basicConfig.SENDGRID_API_KEY);

const emailSender = async (email, htmlContent, subjects, callback) => {
  try {
    sgMail.send(
      {
        to: email,
        from: 'piyush.zimo@outlook.com',
        subject: subjects,
        html: htmlContent,
      },
      false,
      async (error, result) => {
        if (result != null) {
          callback("Send", true);
        } else {
          if (
            error.response != null &&
            error.response.body.errors[0].message.indexOf(
              "The subject is required."
            ) > -1
          ) {
            callback(
              {
                message: 'Invalid subject',
                stack: error.code,
              },
              false,
              "1"
            );
          } else {
            callback(
              {
                message: error.response.body.errors[0].message,
                stack: error.code,
              },
              false,
              "1"
            );
          }
        }
      }
    );
  } catch (e) {
    callback({ message: e.message, stack: e.stack }, false, "1");
  }
};
module.exports = { emailSender};
