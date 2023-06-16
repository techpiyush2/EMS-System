const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "gsmtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: "samplemail.noreply@gmail.com",
        pass: "Zimo!1217",
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: "kuljeetdhiman06@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });

    console.log("email sent successfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};

module.exports = sendEmail;


//1 sendgrid/mail

    const sendGridMail = require("@sendgrid/mail")

const sendGridEmail = async (email, subject, text) => {
  try {
    const transporter = sendGridMail.createTransport({
      host: "gsmtp.gmail.com",
      service: "gmail",
      port: 465,
      secure: true,
      auth: {
        user: "samplemail.noreply@gmail.com",
        pass: "Zimo!1217",
      },
      tls: { rejectUnauthorized: false },
    });

    await transporter.sendMail({
      from: "kuljeetdhiman06@gmail.com",
      to: email,
      subject: subject,
      text: text,
    });

    console.log("email sent successfully");
  } catch (error) {
    console.log(error, "email not sent");
  }
};



module.exports = sendGridEmail;
