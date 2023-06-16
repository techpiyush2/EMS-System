const nodemailer = require('nodemailer'),
    constants = require('./constants.js'),
    catchAsync = require('./catchAsync.js'),
    // moment = require('moment'),
    smtpTransport = require('nodemailer-smtp-transport'),
    moment = require('moment'),
    config = require('../config/config.js').get(process.env.NODE_ENV || 'local')

exports.adminForgotPasswordEmail = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>Forgot Password Template</title>
</head>

<body style=" margin: 0 auto;
width: 80%;
font-family: sans-serif;">
   
                <div style=" border: 1px solid #bdbaba;
                padding: 15px;
                border-radius: 10px;">
                    
                <img style src="http://74.208.25.43:4004/uploads/company_logo/thumbnail/acbd192b-2d2c-40a4-9996-33451b11e3f0-1653997058191_Zimo logo.png" width="100px" height="60px">
                <hr>
                
                    <h1 style="text-align: center;">Reset your Password</h1>
                    <hr style="height: 0.5px;
                    opacity: 100;
                    width: 47%;
                    margin:10px auto;
                    background-color: #706f6d;
                    border: 1px solid #706f6d;
                    margin-top: -1em;">
                
                <h3 style="text-align: center; margin-bottom: 0.2em; margin-top: 2em;">Hi ${printContents.userName},</h3>
                <p style="letter-spacing: 1.5px;
                line-height: 1.7em; text-align: center;">To reset your Password, Click the button below.</p>

                <div style=" text-align: center; margin-bottom: 2em; margin-top: 2em;">    
                <a href=${printContents.link} style="text-decoration: none;"><button style="font-size: 18px;
               background-color: #ffffff;
               border: 2px solid #198754;
               border-radius: 7px;
               padding:10px 26px;
               font-weight: 600;
               color: #198754;  
               letter-spacing: 1.8px;" type="button" class="btn btn-info ">Reset Your Password</button></a>
                </div>



            <p style="letter-spacing: 1.5px;
            line-height: 1.7em; text-align: center; ">If you do not want to change your password or didn't request  a reset ,you can ignore and delete this email.</p>
              
                <div style="text-align: center; margin-bottom: 2em; margin-top: 1em;" >
                <strong>Thank You!</strong></div>
                </div>
                
            </div>
       
</body>
</html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}
exports.companyForgotPasswordEmail = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>forgot Password Template</title>
</head>

<body style=" margin: 0 auto;
width: 80%;
font-family: sans-serif;">
   
                <div style=" border: 1px solid #bdbaba;
                padding: 15px;
                border-radius: 10px;">
                    
                <img style src="http://74.208.25.43:4004/uploads/company_logo/thumbnail/acbd192b-2d2c-40a4-9996-33451b11e3f0-1653997058191_Zimo logo.png" width="100px" height="60px">
                <hr>
                
                    <h1 style="text-align: center;">Reset your Password</h1>
                    <hr style="height: 0.5px;
                    opacity: 100;
                    width: 47%;
                    margin:10px auto;
                    background-color: #706f6d;
                    border: 1px solid #706f6d;
                    margin-top: -1em;">
                
                <h3 style="text-align: center; margin-bottom: 0.2em; margin-top: 2em;">Hi ${printContents.companyName},</h3>
                <p style="letter-spacing: 1.5px;
                line-height: 1.7em; text-align: center;">To reset your Password, Click the button below.</p>

                <div style=" text-align: center; margin-bottom: 2em; margin-top: 2em;">    
                <a href="${printContents.link}" style="text-decoration: none;"><button style="
                font-size: 18px;
               background-color: #ffffff;
               border: 2px solid #198754;
               border-radius: 7px;
               padding:10px 26px;
               font-weight: 600;
               color: #198754;  
               letter-spacing: 1.8px;" type="button" class="btn btn-info ">Reset Your Password</button></a>
                </div>



            <p style="letter-spacing: 1.5px;
            line-height: 1.7em; text-align: center; ">If you do not want to change your password or didn't request  a reset ,you can ignore and delete this email.</p>
              
                <div style="text-align: center; margin-bottom: 2em; margin-top: 1em;" >
                <strong>Thank You!</strong></div>
                </div>
                
            </div>
       
</body>
</html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

exports.companyRegisterEmail = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>invitation</title>
   </head>
   <body style=" margin: 0 auto;
      width: 80%;
      font-family: sans-serif;">
      <div style=" border: 1px solid #bdbaba;
         padding: 15px;
         border-radius: 10px;
         background-color: #c4e5d6;">
         <img src="img/zimo.png" width="100px" height="60px">
       
         <hr style="margin-top: 1em !important;
            width: 100%;">
         <h3>Account Created</h3>
         <p style="font-size: 15px;
            line-height: 1.4em;
            color: #4a4444;
            letter-spacing: 1.6px;">Your  account with the username <b>${printContents.email}</b> has been created for <b>${printContents.companyName} Company</b>.</p>
               <p style="font-size: 15px;
               line-height: 1.4em;
               color: #4a4444;
               letter-spacing: 1.6px;">Please click the  below link to generate your password.</p>
           

         <div style="text-align: center; 
            padding-top: 10px;  
            margin-bottom: 2em !important;">
           <a href="${printContents.link}">  <button style="font-size: 18px;
               background-color: #198754;
               border: 2px solid #198754;
               border-radius: 7px;
               padding:10px 26px;
               font-weight: 600;
               color: #fff;  
               letter-spacing: 1.8px;"> Create your password</button></a>
              
         </div>
          
         <p style="font-size: 15px;
         line-height: 1.4em;
         color: #4a4444;
         letter-spacing: 1.6px;">This is your Corporate ID: <b>${printContents.corporateId}</b> </p>
           <p style="font-size: 15px;
           line-height: 1.4em;
           color: #4a4444;
           letter-spacing: 1.6px;"><b>Thank You</b> </p>
      </div>
   </body>
</html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}
exports.softwareCronNotificationEmail = (mailOptions, printContents) => {
    let rows = ''

    for (let i = 0; i < printContents.expiredSoftware.length; i++) {
        let nextPaymentDate = printContents.expiredSoftware[i].nextPaymentDate
        rows += '<tr><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;" >' + printContents.expiredSoftware[i].provider + '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' + moment(nextPaymentDate).format('ll')
    }

    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Shortfall attendance</title>
    </head>
    <body style="margin: 0 auto; width: 100%; font-family: sans-serif">
        <div style="border: 1px solid #bdbaba; padding: 15px; border-radius: 10px">
            <img src="img/zimo.png" width="100px" height="60px" />
            <hr style="margin-top: 1em !important; width: 100%" />
            <h1>Hi User</h1>
            <p style="font-size: 15px; line-height: 1.4em; color: #4a4444; letter-spacing: 1.6px">Your subscription is going to expire soon. Here are your payment details</p>

            <table style="border-collapse: collapse; width: 100%; background-image: url(img/zimolight.png); background-repeat: no-repeat; background-position: center; background-size: contain; margin-top: 2em; margin-bottom: 2em">
                <thead>
                    <tr>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Software Name</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Next Billing Date</th>
                       
                    </tr>
                </thead>
                <tbody>
                   ${rows}
                </tbody>
            </table>

            <p>Thank You.</p>
            <p>Zimo.One</p>
        </div>
    </body>
</html>`

    mailOptions.html = html
    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}
exports.inviteCompany = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invited By Super Admin</title>
   </head>
   <body style=" margin: 0 auto;
      width: 32%;
      font-family: sans-serif;">
      <div style=" border: 1px solid #bdbaba;
         padding: 15px;
         background-color: #c4e5d6;
         border-radius: 10px;">
                 <img src="http://74.208.25.43:4004/uploads/company_logo/thumbnail/acbd192b-2d2c-40a4-9996-33451b11e3f0-1653997058191_Zimo logo.png" width="100px" height="60px">

         <hr style="margin-top: 1em !important;
            width: 100%;">
         <h1>Hi ${printContents.firstName}</h1>
         <p style="font-size: 15px;
            line-height: 1.4em;
            color: #4a4444;
            letter-spacing: 1.6px;">We are delighted to invite you to join our group. Hope you will accept our invitation.</p>
            <p style="font-size: 15px;
            line-height: 1.4em;
            color: #4a4444;
            letter-spacing: 1.6px;">Kindly use the below credentials for Signup.</p>
      
      <table style=" border-collapse: collapse;
      width: 100%;
      background-image: url(img/zimolight.png);
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      margin-top: 2em;
      margin-bottom: 2em;">
     
      <tr style="
      text-align: left;
      padding: 8px;">
      <td style="  
         text-align: left;
         padding: 8px;
         font-size: 18px;">
         Name:-<b>${printContents.firstName}  ${printContents.lastName}</b>
      </td>
     
   <tr style="
   text-align: left;
   padding: 8px;
   ">
   <td style="  
      text-align: left;
      padding: 8px;
      font-size: 18px;">
      Email id:-<b>${printContents.email}</b>
   </td>

<tr style="
text-align: left;
padding: 8px;">
<td style="  
   text-align: left;
   padding: 8px;
   font-size: 18px;">
  Corporate id:-<b>${printContents.corporateId}</b>
</td>  
   </tr>
   </table>

         <div style="text-align: center; 
            padding-top: 10px;  
            margin-bottom: 2em !important;">
         <a href="${printContents.acceptLink}">   <button style="font-size: 18px;
               background-color: #ffffff;
               border: 2px solid #198754;
               border-radius: 7px;
               padding:6px 26px;
               font-weight: 600;
               color: #198754;  
               letter-spacing: 1.8px;"> Accept</button></a>
              
         </div>
          
         <table style=" border-collapse: collapse;
            width: 100%;
            margin-top: 2em;
            margin-bottom: 2em;">
            <tr style="
               text-align: left;
               padding: 8px;">
               <td style="  
                  text-align: left;
                  padding: 8px;">
                  <h3 style="font-size: 18px;">For any query contact us:</h3>
                  <p style=" margin-top: -11px !important;
                     color: #767676;">Email: <a href="#">Support@zimo.one</a></p>
               </td>
               
            </tr>
         </table>
      </div>
   </body>
</html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

exports.applyLeave = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>leave</title>
   </head>
   <body style=" margin: 0 auto;
      width: 800px;
      font-family: sans-serif;">
      <div style=" border: 1px solid #bdbaba;
         padding: 15px;
         border-radius: 10px;">
         <img src="${printContents.imageUrl + 'uploads/company_logo/thumbnail/' + printContents.logo}" width="100px" height="60px">
         <hr style="margin-top: 1em !important;
            width: 100%;">
         <h1>Hi </h1>
         <p style="font-size: 15px;
            line-height: 1.4em;
            color: #4a4444;
            letter-spacing: 1.6px;">There is a Leave Request waiting for approval.</p>
          
      
      <table style=" border-collapse: collapse;
      width: 100%;
    
      margin-top: 2em;
      margin-bottom: 2em;">
     
      <tr style="
     
      padding: 8px;">
      <td style="  
         text-align: left;
         padding: 8px;
         font-size: 18px;">
         Employee id:-
      </td>
      <td style="  
      text-align: left;
      padding: 8px;
      font-size: 18px;">
     ${printContents.Employee_id}
   </td>
      
     
   <tr style="
  
   padding: 8px;
   ">
   <td style="  
      text-align: left;
      padding: 8px;
      font-size: 18px;">
      Name:-
   </td>
   <td style="  
      
      padding: 8px;
      font-size: 18px;">
     ${printContents.Name}
   </td>
  
<tr style="

padding: 8px;">
<td style="  
   text-align: left;
   padding: 8px;
   font-size: 18px;">
  Leave Type:-
</td> 
<td style="  
   
   padding: 8px;
   font-size: 18px;">
  ${printContents.LeaveName}
</td>  
   </tr>
   <tr style="

padding: 8px;">
<td style="  
   text-align: left;
   padding: 8px;
   font-size: 18px;">
  Start date:-
</td> 
<td style="  
  
   padding: 8px;
   font-size: 18px;">
  ${printContents.Start_date}
</td>  
   </tr>
   <tr style="

padding: 8px;">

   </tr>
   <tr style="

padding: 8px;">
<td style="  
   text-align: left;
   padding: 8px;
   font-size: 18px;">
  End Date:-
</td> 
<td style="  
   
   padding: 8px;
   font-size: 18px;">
  ${printContents.End_Date}
</td>  
   </tr>
   
   
   <tr style="

padding: 8px;">
<td style="  
   text-align: left;
   padding: 8px;
   font-size: 18px;">
  Reason:-
</td>  
<td style="  
   text-align: left;
   padding: 8px;
   font-size: 18px;">
  ${printContents.Reason}
</td> 
   </tr>


   </table>

         <div style="text-align: center; 
            padding-top: 10px;  
            margin-bottom: 2em !important;">
            <a href="${printContents.view_request}">
            <div style="font-size: 18px;
               background-color: #0dd0d0;
               border: 1px solid #0dd0d0;
               border-radius: 7px;
               padding:10px 26px;
               color: #fff;  
               letter-spacing: 1.8px;"> View Request </div></a>   
             
         </div>
      </div>
   </body>
</html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}
exports.applyRegularizedLeave = (mailOptions, printContents) => {
    const html = `<!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Regularised Attendance</title>
   </head>
   <body style=" margin: 0 auto;
      width: 800px;
      font-family: sans-serif;">
      <div style=" border: 1px solid #bdbaba;
         padding: 15px;
         border-radius: 10px;">
         <img src="img/zimo.png" width="100px" height="60px">
        
         <hr style="margin-top: 1em !important;
            width: 100%;">
         <h1>Hi All</h1>
         <p style="font-size: 15px;
            line-height: 1.4em;
            color: #4a4444;
            letter-spacing: 1.6px;">An employee has requested to regularise time.</p>
      <table style=" border-collapse: collapse;
      width: 100%;
    
      margin-top: 2em;
      margin-bottom: 2em;">

      <tr style="
      padding: 8px;
      ">
      <td style="  
         text-align: left;
         padding: 8px;
         font-size: 18px;">
         Employee id:-
      </td>
      <td style="   
         padding: 8px;
         font-size: 18px;">
        ${printContents.Employee_id}
      </td>
      </tr>

      <tr style="
      padding: 8px;">
      <td style="  
         text-align: left;
         padding: 8px;
         font-size: 18px;">
         Name:-
      </td>
      <td style="  
      text-align: left;
      padding: 8px;
      font-size: 18px;">
     ${printContents.firstName}  ${printContents.lastName}
   </td>
    </tr>
       
    <tr style="
    padding: 8px;">
    <td style="  
    text-align: left;
    padding: 8px;
    font-size: 18px;">
    Date:-
    </td> 
    <td style="  
    padding: 8px;
    font-size: 18px;">
    ${printContents.Date}
    </td>  
    </tr>

    <tr style="
    padding: 8px;">
    <td style="  
    text-align: left;
    padding: 8px;
    font-size: 18px;">
    Current Timings:-
    </td> 
    <td style="  
    padding: 8px;
    font-size: 18px;">
    <ul style="list-style: none; display: flex; padding-inline-start: 0px;margin-block-start: -1em; margin-block-end: -1em;">
        <li style="margin-right: 1em;"><p><b>In:-</b>${printContents.CurrentInTime}</p></li>
        <li><p><b>Out:-</b>${printContents.CurrentOutTime}</p></li>
    </ul>
    </td>   
    </tr>
    
    <tr style="
    padding: 8px;">
    <td style="  
    text-align: left;
    padding: 8px;
    font-size: 18px;">
    Regularised To:-
    </td> 
    <td style="  
    padding: 8px;
    font-size: 18px;">
    <ul style="list-style: none; display: flex; padding-inline-start: 0px;margin-block-start: -1em; margin-block-end: -1em;">
        <li style="margin-right: 1em;"><p><b>In:-</b>${printContents.RegularizedInTime}</p></li>
        <li><p><b>Out:-</b>${printContents.RegularizedOutTime}</p></li>
    </ul>
    </td>   
    </tr>
    
    <tr style="
    padding: 8px;">
    <td style="  
    text-align: left;
    padding: 8px;
    font-size: 18px;">
    Reason:-
    </td>  
    <td style="  
    text-align: left;
    padding: 8px;
    font-size: 18px;">
    ${printContents.regularizedReason}
    </td> 
    </tr>


   </table>

    <div style="text-align: center; 
    padding-top: 10px;  
    margin-bottom: 2em !important;">
 <a href="${printContents.viewRequest}">
    <button style="font-size: 18px;
        background-color: #0dd0d0;
        border: 1px solid #0dd0d0;
        border-radius: 7px;
        padding:10px 26px;
        color: #fff;  
        letter-spacing: 1.8px;"> View Request</button></a>
    </div>
      </div>
   </body>
</html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html
    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}
exports.inviteEmployee = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invited By Super Admin</title>
       </head>
       <body style=" margin: 0 auto;
        width: 100%;
        
        font-family: sans-serif;">
        <div style=" border: 1px solid #bdbaba;
           padding: 15px;
           border-radius: 10px;">
           <img src="https://media-exp1.licdn.com/dms/image/C560BAQFpAn7meReAfg/company-logo_200_200/0/1617776902673?e=1654128000&v=beta&t=Xvov5VQv_gM8RXjL0pymSMDVS3Z2QmXjqYBxXxweGJw" width="12%" width="12%">
           <h6 style="float: right;"></h6>
           <hr style="margin-top: 1em !important;
              width: 100%;">
           <h1>Hi ${printContents.firstName} </h1>
           <p style="font-size: 15px;
              line-height: 1.4em;
              color: #4a4444;
              letter-spacing: 1.6px;">you have been invited by the organization to join.
              </p>
              <p style="font-size: 15px;
              line-height: 1.4em;
              color: #4a4444;
              letter-spacing: 1.6px;">Your's Details are Here</p>
          
                <table style=" border-collapse: collapse;
                width: 100%;
                background-image: url(img/zimolight.png);
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
                margin-top: 2em;
                margin-bottom: 2em;">
               
                <tr style="
                text-align: left;
                padding: 8px;">
                <td style="  
                   text-align: left;
                   padding: 8px;">
                   Name:-<b>${printContents.firstName}  ${printContents.lastName}</b>
                </td>
                <td style="  
                text-align: right;
                padding: 8px;">
                Email id:-<b>${printContents.email}</b>
             </td>
             <tr style="
             text-align: left;
             padding: 8px;">
             <td style="  
                text-align: left;
                padding: 8px;">
                Employee ID :-<b>${printContents.empId}</b>
             </td>
             <td style="  
             text-align: right;
             padding: 8px;">
             Corporate Id :-<b>${printContents.corporateId}</b>
          </td>
          
             </table>
             <div style="text-align: center; 
             padding-top: 10px;  
             margin-bottom: 2em !important;">
             <a href="${printContents.acceptLink}"> <button style="font-size: 18px;
                background-color: #198754;
                border: 1px solid #198754;
                border-radius: 7px;
                padding:10px 26px;
                color: #fff;  
                letter-spacing: 1.8px;"> Accept</button></a>
               
          </div>
           
          <table style=" border-collapse: collapse;
             width: 100%;
             margin-top: 2em;
             margin-bottom: 2em;">
             <tr style="
                text-align: left;
                padding: 8px;">
                <td style="  
                   text-align: left;
                   padding: 8px;">
                   <h3 style="font-size: 18px;">For any query contact us:</h3>
                   <p style=" margin-top: -11px !important;
                      color: #767676;">Email: <a href="#">support@zimo.one</a></p>
                </td>
                
             </tr>
          </table>
       </div>
    </body>
  </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

exports.shortFall = (mailOptions, printContents) => {
    let rows = ''

    for (let i = 0; i < printContents.finalObj.length; i++) {
        rows +=
            '<tr><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;" >' +
            printContents.finalObj[i].empId +
            '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
            printContents.finalObj[i].firstName +
            '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
            printContents.finalObj[i].inTime +
            '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
            printContents.finalObj[i].outTime +
            '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
            printContents.finalObj[i].shiftHours +
            '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
            printContents.finalObj[i].workHrs +
            '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
            printContents.finalObj[i].shortfallHours +
            '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
            printContents.finalObj[i].workStatus +
            '</td>'
    }
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Attendance Shortfall</title>
    </head>
    <body style="margin: 0 auto; width: 100%; font-family: sans-serif">
        <div style="border: 1px solid #bdbaba; padding: 15px; border-radius: 10px">

            <h3>Hi All</h3>
            <p style="font-size: 15px; line-height: 1.4em; color: #4a4444; letter-spacing: 1.6px">Greetings for the day!!

The following employees have a shortfall in working hours on <b>${printContents.date}</b>. In case of miss punch or wrong punch, apply for attendance regularization through portal.</p>

            <table style="border-collapse: collapse; width: 100%; background-image: url(img/zimolight.png); background-repeat: no-repeat; background-position: center; background-size: contain; margin-top: 2em; margin-bottom: 2em">
                <thead>
                    <tr>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Employee Code</th>
                                                <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Name</th>
 <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">In Time</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Out Time</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Shift Hours</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px"> Work Hours</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Short fall</th>
                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px"> Work Status</th>

                    </tr>
                </thead>
                <tbody>
                   ${rows}
                </tbody>
            </table>

            <p>Thank You.</p>
            <p>Zimo.One</p>
        </div>
    </body>
</html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

// exports.shortFall = (mailOptions, printContents) => {
//     let rows = ''

//     for (let i = 0; i < printContents.finalObj.length; i++) {
//         rows +=
//             '<tr><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;" >' +
//             printContents.finalObj[i].empId +
//             '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
//             printContents.finalObj[i].firstName +
//             '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
//             printContents.finalObj[i].inTime +
//             '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
//             printContents.finalObj[i].outTime +
//             '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
//             printContents.finalObj[i].calculatedShiftHrs +
//             '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
//             printContents.finalObj[i].calculatedWorkHoursafterGrace +
//             '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
//             printContents.finalObj[i].shortfallGraceHours.toFixed(2) +
//             '</td><td style="border: 1px solid #dddddd; padding: 8px;font-size: 18px;">' +
//             printContents.finalObj[i].workStatus +
//             '</td>'
//     }
//     // 1) Creating HTML content
//     const html = `<!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8" />
//         <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//         <title>Attendance Shortfall</title>
//     </head>
//     <body style="margin: 0 auto; width: 100%; font-family: sans-serif">
//         <div style="border: 1px solid #bdbaba; padding: 15px; border-radius: 10px">

//             <h3>Hi All</h3>
//             <p style="font-size: 15px; line-height: 1.4em; color: #4a4444; letter-spacing: 1.6px">Greetings for the day!!

// The following employees have a shortfall in working hours on <b>${printContents.date}</b>. In case of miss punch or wrong punch, apply for attendance regularization through portal.</p>

//             <table style="border-collapse: collapse; width: 100%; background-image: url(img/zimolight.png); background-repeat: no-repeat; background-position: center; background-size: contain; margin-top: 2em; margin-bottom: 2em">
//                 <thead>
//                     <tr>
//                         <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Employee Code</th>
//                                                 <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Name</th>
//                         <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">In Time</th>
//                         <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Out Time</th>
//                         <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Shift Hours</th>
//                         <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px"> Work Hours</th>
//                         <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px">Short fall</th>
//                         <th style="border: 1px solid #dddddd; text-align: left; padding: 8px; font-size: 18px"> Work Status</th>

//                     </tr>
//                 </thead>
//                 <tbody>
//                    ${rows}
//                 </tbody>
//             </table>

//             <p>Thank You.</p>
//             <p>Zimo.One</p>
//         </div>
//     </body>
// </html>`

//     // 2) Setting HTML content to the mail options
//     mailOptions.html = html

//     // 3) Actually sending the mail
//     return sendEmail(mailOptions)
// }

exports.outOrInTimeEmail = (mailOptions, printContents) => {
    const html = `<html lang="en">

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
                                                                                    We have been noticing that you are
                                                                                    regularly coming late to work.
    
                                                                                </p>
    
                                                                                <p
                                                                                    style="color: rgb(114, 111, 111); margin: 20px 0px; line-height: 22px;">
                                                                                    You have
                                                                                    already received several verbal warnings
                                                                                    but still,<br>we haven’t noticed any
                                                                                    change
                                                                                    in your behavior.</p>
    
                                                                                <p
                                                                                    style="color: rgb(114, 111, 111); line-height: 22px;">
                                                                                    So consider this mail
                                                                                    as a final warning . <br> If you still
                                                                                    come
                                                                                    late then you have to face strict action
                                                                                    from the management.</p>
    
    
                                                                               
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
    
    </html>`
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

exports.forgotPasswordMobileEmail = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
  <html>
  
  <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  
      <title>Account confirmation</title>
  
  </head>
  
  <body style="font-family:Arial, Helvetica, sans-serif; font-size:1em;">
      <div class="preheader" style="font-size: 1px; display: none !important;"></div>
      <table id="backgroundTable" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
              <td class="body" align="center" valign="top" style="width="100%">
                  <table cellpadding="0" cellspacing="0">
                      <tr>
                          <td width="640">
                          </td>
                      </tr>
                      <tr>
                          <td class="main" width="640" align="center" style="padding: 0 10px;">
                              <table style="min-width: 100%; " class="stylingblock-content-wrapper" width="100%"
                                  cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td class="stylingblock-content-wrapper camarker-inner">
                                          <table class="featured-story featured-story--top" cellspacing="0"
                                              cellpadding="0">
                                              <tr>
                                                  <td style="padding-bottom: 20px;">
                                                      <table cellspacing="0" cellpadding="0">
                                                          <tr>
                                                              <td class="featured-story__inner" style="background:#F0F0F0; width:100%; box-shadow: 0 0 11px rgb(0 0 0 / 29%);    border-radius: 25px;">
                                                                  <table cellspacing="0" cellpadding="0">
                                                    
                                                                      <tr>
                                                                          <td class="featured-story__content-inner" style="width:100%;padding: 0 30px 45px;">
                                                                              <table cellspacing="0" cellpadding="0" width="100%">
                                                                                  <tr style="width: 100%; text-align: center;">
                                                                                      <td class="featured-story__heading featured-story--top__heading">
                                                                                          <table cellspacing="0" cellpadding="0" width="100%" style="text-align: center;">
                                                                                              
                                                                                              <tr>
                                                                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 22px; color: #464646;padding-bottom: 13px; margin-bottom:25px"
                                                                                                      width="100%"
                                                                                                      align="center">
                                                                                                      Reset your password
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                              <tr>
                                                                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 16px; line-height: 22px; color: #555555; padding-top: 16px; margin-top: 16px;border-top: 1px solid #F0F0F0;"
                                                                                                      align="center">
                                                                                                      Use this OTP to verify your email address.
                                                                                                      
                                                                                                      
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                              <tr>
                                                                                                  <td style="font-size: 16px; line-height: 22px; color: #555555; padding-top: 10px;"
                                                                                                      align="center">
                                                                                                      <h1 style="font-size: 35px;letter-spacing: 9px;"><strong>${printContents.otp}</strong></h1>
  
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
  
                  </table>
              </td>
          </tr>
      </table>
      </custom>
  </body>
  
  </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

exports.acceptanceConfirmation = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <title>Accept Confirmation Template</title>
  </head>
  
  <body style=" margin: 0 auto;
  width: 40%;
  font-family: sans-serif;">
     
                  <div style=" border: 1px solid #bdbaba;
                  padding: 15px;
                  border-radius: 10px;">
                      
                  <img style src="https://media-exp1.licdn.com/dms/image/C560BAQFpAn7meReAfg/company-logo_200_200/0/1617776902673?e=1654128000&v=beta&t=Xvov5VQv_gM8RXjL0pymSMDVS3Z2QmXjqYBxXxweGJw" width="12%" width="100px" height="60px">
                  <hr>
                  
                      <h1 style="text-align: center; font-size: 25px;">Confirmation Mail</h1>
                      <hr style="height: 0.5px;
                      opacity: 100;
                      width: 30%;
                      margin:10px auto;
                      background-color: #706f6d;
                      border: 1px solid #706f6d;
                      margin-top: -1em;">
                  
                 
                  <p style="letter-spacing: 1.5px;
                  line-height: 1.7em; text-align: center;">Dear <strong> ${printContents.appliedByName} </strong>,</p>
                   <p style="letter-spacing: 1.5px;
                   line-height: 1.7em; text-align: center;">Invitation ${printContents.leaveStatus}  by <strong> ${printContents.approvedByName}</strong></p>
                  </div>
                 
                  </div>
                  
              </div>
         
  </body>
  </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}
exports.withdrawConfirmation = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
    <html lang="en">
       <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>leave</title>
       </head>
       <body style=" margin: 0 auto;
          width: 35%;
          font-family: sans-serif;">
          <div style=" border: 1px solid #bdbaba;
             padding: 15px;
             border-radius: 10px;">
             <img src="img/zimo.png" width="100px" height="60px">
             <hr style="margin-top: 1em !important;
                width: 100%;">
             <h1>Hi </h1>
             <p style="font-size: 15px;
                line-height: 1.4em;
                color: #4a4444;
                letter-spacing: 1.6px;">This Request is Withdraw.</p>
              
          
          <table style=" border-collapse: collapse;
          width: 100%;
        
          margin-top: 2em;
          margin-bottom: 2em;">
         
          <tr style="
         
          padding: 8px;">
          <td style="  
             text-align: left;
             padding: 8px;
             font-size: 18px;">
             Employee Name:-
          </td>
          <td style="  
          text-align: left;
          padding: 8px;
          font-size: 18px;">
         <b>${printContents.appliedByName}</b>
       </td>
       <div style="text-align:center"
       <div style="font-size: 30px; padding:0px 0px;">
          <a style="text-decoration : none" href= "https://www.facebook.com/zimoinfotech/"> <img src= "https://www.linkpicture.com/q/fb.svg" style="width : 40px; margin: 0px 10px;"></img></a>  

           <a href= "https://www.instagram.com/zimo.one/" style="text-decoration : none"><img src ="https://www.linkpicture.com/q/ig.svg" style="width : 40px; margin: 0px 10px;"></a>

          <a style="text-decoration : none" href= "https://twitter.com/zimoinfotech"><img src = "https://www.linkpicture.com/q/twitter_3.svg" style="width : 40px; margin: 0px 10px;"></a>

       </div>
           <div style="padding: 0px  0px 10px 0px; text-align: center; ">
                   <p>© 2022 Zimo.one All Right Reserved</p></div>
          </div>
         
       <tr style="
      
       padding: 8px;
       ">
       <td style="  
          text-align: left;
          padding: 8px;
          font-size: 18px;">
         Leave Status:-
       </td>
       <td style="  
          
          padding: 8px;
          font-size: 18px;">
         <b>${printContents.leaveStatus}</b>
       </td>
    
       <tr style="
    
    padding: 8px;">
    <td style="  
       text-align: left;
       padding: 8px;
       font-size: 18px;">
      Reason:-  <div style="text-align:center"
      <div style="font-size: 30px; padding:0px 0px;">
         <a style="text-decoration : none" href= "https://www.facebook.com/zimoinfotech/"> <img src= "https://www.linkpicture.com/q/fb.svg" style="width : 40px; margin: 0px 10px;"></img></a>  

          <a href= "https://www.instagram.com/zimo.one/" style="text-decoration : none"><img src ="https://www.linkpicture.com/q/ig.svg" style="width : 40px; margin: 0px 10px;"></a>

         <a style="text-decoration : none" href= "https://twitter.com/zimoinfotech"><img src = "https://www.linkpicture.com/q/twitter_3.svg" style="width : 40px; margin: 0px 10px;"></a>

      </div>
          <div style="padding: 0px  0px 10px 0px; text-align: center; ">
                  <p>© 2022 Zimo.one All Right Reserved</p></div>
         </div>
    </td> 
    <td style="  
      
       padding: 8px;
       font-size: 18px;">
      <b>${printContents.leaveReason}</b>
    </td>  
       </tr>
       </table>
          </div>
       </body>
    </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

const sendEmail = async (mailOptions) => {
    if (!mailOptions.from) {
        mailOptions.from = config.smtp.mailUserName
    }
    if (!mailOptions.from || !mailOptions.to || !mailOptions.subject || !mailOptions.html) {
        return false
    }

    // Creating transporter
    const transporter = nodemailer.createTransport(
        smtpTransport({
            service: config.smtp.service,

            port: 587,

            secure: false,

            requireTLS: true,

            host: config.smtp.host,

            auth: {
                user: config.smtp.username,

                pass: config.smtp.password,
            },

            tls: {
                ciphers: 'SSLv3',
            },
        })
    )

    const transporterRes = await transporter.sendMail(mailOptions)

    return transporterRes.response.includes('250') ? true : false
}

exports.declineInvitation = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <title>Decline Template</title>
  </head>
  
  <body style=" margin: 0 auto;
  width: 40%;
  font-family: sans-serif;">
     
                  <div style=" border: 1px solid #bdbaba;
                  padding: 15px;
                  border-radius: 10px;">
                      
                  <img style src="https://media-exp1.licdn.com/dms/image/C560BAQFpAn7meReAfg/company-logo_200_200/0/1617776902673?e=1654128000&v=beta&t=Xvov5VQv_gM8RXjL0pymSMDVS3Z2QmXjqYBxXxweGJw" width="100px" height="60px">
                  <hr>
                  
                      <h1 style="text-align: center; font-size: 25px;">Confirmation Mail</h1>
                      <hr style="height: 2px;
                      opacity: 100;
                      width: 30%;
                      margin:10px auto;
                      background-color: #706f6d;
                      border: 1px solid #706f6d;
                      margin-top: -1em;">
                  
                 
                  <p style="letter-spacing: 1.5px;
                  line-height: 1.7em; text-align: center;">Dear <strong> ${printContents.name} </strong>,</p>
                   <p style="letter-spacing: 1.5px;
                   line-height: 1.7em; text-align: center;">Invitation Decline by <strong>${printContents.invitedUser}</strong></p>
                  </div>
                 
                  </div>
                  
              </div>
         
  </body>
  </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}
exports.attendance = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `<!DOCTYPE html>
  <html>
  
  <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  
      <title>Attendence</title>
  
  </head>
  
  <body style="font-family:Arial, Helvetica, sans-serif; font-size:1em;">
      <div class="preheader" style="font-size: 1px; display: none !important;"></div>
      <table id="backgroundTable" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
              <td class="body" align="center" valign="top" style="width="100%">
                  <table cellpadding="0" cellspacing="0">
                      <tr>
                          <td width="640">
                          </td>
                      </tr>
                      <tr>
                          <td class="main" width="640" align="center" style="padding: 0 10px;">
                              <table style="min-width: 100%; " class="stylingblock-content-wrapper" width="100%"
                                  cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td class="stylingblock-content-wrapper camarker-inner">
                                          <table class="featured-story featured-story--top" cellspacing="0"
                                              cellpadding="0">
                                              <tr>
                                                  <td style="padding-bottom: 20px;">
                                                      <table cellspacing="0" cellpadding="0">
                                                          <tr>
                                                              <td class="featured-story__inner" style="background:#F0F0F0; width:100%; box-shadow: 0 0 11px rgb(0 0 0 / 29%);    border-radius: 25px;">
                                                                  <table cellspacing="0" cellpadding="0">
                                                                    //   <tr>
                                                                    //       <td class="scalable-image" width="640" align="left">
                                                                          
                                                                    //           <img src="${config.siteURL}assets/template_image/truck-logo.png" width="50px" style="padding: 10px 10px  0 10px;">
                                                                    //       </td>
                                                                    //   </tr>
                                                                      <tr>
                                                                          <td class="featured-story__content-inner" style="width:100%;padding: 0 30px 45px;">
                                                                              <table cellspacing="0" cellpadding="0" width="100%">
                                                                                  <tr style="width: 100%; text-align: center;">
                                                                                      <td class="featured-story__heading featured-story--top__heading">
                                                                                          <table cellspacing="0" cellpadding="0" width="100%" style="text-align: center;">
                                                                                          username                                                       <tr style="margin-bottom: 15px;display: block;text-align: center;">
                                                                                                  <td>
                                                                                                      <img src="${config.siteURL}assets/template_image/shield.png" width="60" style="margin-left: 250px;">
                                                                                                  </td>
                                                                                              </tr>
                                                                                              <tr>
                                                                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 22px; color: #464646;padding-bottom: 13px; margin-bottom:25px"
                                                                                                      width="100%"
                                                                                                      align="center">
                                                                                                      Reset your password
                                                                                                  </td>
                                                                                              </tr>
                                                                                              username                                                   </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                              <tr>
                                                                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 16px; line-height: 22px; color: #555555; padding-top: 16px; margin-top: 16px;border-top: 1px solid #F0F0F0;"
                                                                                                      align="center">
                                                                                                      Here is your in and out time for today.
                                                                                                      <td>          
                                                                                                      
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                              <tr>
                                                                                                  <td style="font-size: 16px; line-height: 22px; color: #555555; padding-top: 10px;"
                                                                                                      align="center">
                                                                                                      <h1 style="font-size: 35px;letter-spacing: 9px;"><strong>${printContents.name}</strong></h1>
                                                                                                      <h1 style="font-size: 35px;letter-spacing: 9px;"><strong>${printContents.EMPCode}</strong></h1>
                                                                                                      <h1 style="font-size: 35px;letter-spacing: 9px;"><strong>${printContents.InTime}</strong></h1>
                                                                                                      <h1 style="font-size: 35px;letter-spacing: 9px;"><strong>${printContents.OutTime}</strong></h1>
                                                                                                      <h1 style="font-size: 35px;letter-spacing: 9px;"><strong>${printContents.ShiftHrs}</strong></h1>

  
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
  
                  </table>
              </td>
          </tr>
      </table>
      </custom>
  </body>
  
  </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

exports.registrationEmail = (mailOptions, printContents) => {
    const html = `<!DOCTYPE html>
  <html>
  
  <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  
      <title>Account confirmation</title>
  
  </head>
  
  <body style="font-family:Arial, Helvetica, sans-serif; font-size:1em;">
      <div class="preheader" style="font-size: 1px; display: none !important;"></div>
      <table id="backgroundTable" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
              <td class="body" align="center" valign="top" style="width="100%">
                  <table cellpadding="0" cellspacing="0">
                      <tr>
                          <td width="640">
                          </td>
                      </tr>
                      <tr>
                          <td class="main" width="640" align="center" style="padding: 0 10px;">
                              <table style="min-width: 100%; " class="stylingblock-content-wrapper" width="100%"
                                  cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td class="stylingblock-content-wrapper camarker-inner">
                                          <table class="featured-story featured-story--top" cellspacing="0"
                                              cellpadding="0">
                                              <tr>
                                                  <td style="padding-bottom: 20px;">
                                                      <table cellspacing="0" cellpadding="0">
                                                          <tr>
                                                              <td class="featured-story__inner" style="background:#F0F0F0; width:100%; box-shadow: 0 0 11px rgb(0 0 0 / 29%);    border-radius: 25px;">
                                                                  <table cellspacing="0" cellpadding="0">
                                                                      <tr>
                                                                          <td class="scalable-image" width="640" align="left">
                                                                          
                                                                              <img src="${config.siteURL}assets/template_image/truck-logo.png" width="50px" style="padding: 10px 10px  0 10px;">
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td class="featured-story__content-inner" style="width:100%;padding: 0 30px 45px;">
                                                                              <table cellspacing="0" cellpadding="0" width="100%">
                                                                                  <tr style="width: 100%; text-align: center;">
                                                                                      <td class="featured-story__heading featured-story--top__heading">
                                                                                          <table cellspacing="0" cellpadding="0" width="100%" style="text-align: center;">
                                                                                              <tr style="margin-bottom: 15px;display: block;text-align: center;">
                                                                                                  <td>
                                                                                                      <img src="${config.siteURL}assets/template_image/shield.png" width="60" style="margin-left: 250px;">
                                                                                                  </td>
                                                                                              </tr>
                                                                                              <tr>
                                                                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 22px; color: #464646;padding-bottom: 13px; margin-bottom:25px"
                                                                                                      width="100%"
                                                                                                      align="center">
                                                                                                      Thank you for signing up
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                              <tr>
                                                                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 16px; line-height: 22px; color: #555555; padding-top: 16px; margin-top: 16px;border-top: 1px solid #F0F0F0;"
                                                                                                      align="center">
                                                                                                      Use this OTP to verify your account.
                                                                                                      
                                                                                                      
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                              <tr>
                                                                                                  <td style="font-size: 16px; line-height: 22px; color: #555555; padding-top: 10px;"
                                                                                                      align="center">
                                                                                                      <h1 style="font-size: 35px;letter-spacing: 9px;"><strong>${printContents.number_otp}</strong></h1>
  
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
  
                  </table>
              </td>
          </tr>
      </table>
      </custom>
  </body>
  
  </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

exports.adminRegistrationEmail = (mailOptions, printContents) => {
    // 1) Creating HTML content
    const html = `
    
  <!DOCTYPE html>
  <html>
  
  <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  
      <title>Registration confirmation</title>
  
  </head>
  
  <body style="font-family:Arial, Helvetica, sans-serif; font-size:1em;">
      <div class="preheader" style="font-size: 1px; display: none !important;"></div>
      <table id="backgroundTable" width="100%" cellspacing="0" cellpadding="0" border="0">
          <tr>
              <td class="body" align="center" valign="top" style="width="100%">
                  <table cellpadding="0" cellspacing="0">
                      <tr>
                          <td width="640">
                          </td>
                      </tr>
                      <tr>
                          <td class="main" width="640" align="center" style="padding: 0 10px;">
                              <table style="min-width: 100%; " class="stylingblock-content-wrapper" width="100%"
                                  cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td class="stylingblock-content-wrapper camarker-inner">
                                          <table class="featured-story featured-story--top" cellspacing="0"
                                              cellpadding="0">
                                              <tr>
                                                  <td style="padding-bottom: 20px;">
                                                      <table cellspacing="0" cellpadding="0">
                                                          <tr>
                                                              <td class="featured-story__inner" style="background:#F0F0F0; width:100%; box-shadow: 0 0 11px rgb(0 0 0 / 29%);    border-radius: 25px;">
                                                                  <table cellspacing="0" cellpadding="0">
                                                                      <tr>
                                                                          <td class="scalable-image" width="640" align="left">
                                                                              <img src="${config.siteURL}assets/template_image/truck-logo.png" width="50px" style="padding: 10px 10px  0 10px;">
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td class="featured-story__content-inner" style="width:100%;padding: 0 30px 45px;">
                                                                              <table cellspacing="0" cellpadding="0" width="100%">
                                                                                  <tr style="width: 100%; text-align: center;">
                                                                                      <td class="featured-story__heading featured-story--top__heading">
                                                                                          <table cellspacing="0" cellpadding="0" width="100%" style="text-align: center;">
                                                                                              <tr style="margin-bottom: 15px;display: block;text-align: center;">
                                                                                                  <td>
                                                                                                      <img src="${config.siteURL}assets/template_image/invitation.png" width="60" style="margin-left: 250px;">
                                                                                                  </td>
                                                                                              </tr>
                                                                                              <tr>
                                                                                                  <td width="100%" align="center">
                                                                                                     <span style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 22px;display: inline-block; color: #464646;padding-bottom: 13px; margin-bottom:5px;border-bottom: 1px solid #ccc;">Registration confirmation mail</span>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                              <tr>
                                                                                                  <td style="font-family: Geneva, Tahoma, Verdana, sans-serif; font-size: 14px; line-height: 20px; color: #555555; padding-top: 16px;text-align:left; margin-top: 16px;"
                                                                                                      align="center">
                                                                                                      <p><strong>Dear</strong> <strong>${printContents.personName}</strong>,</p>
                                                                                                      <p>${printContents.personName1} successfully registered on the Truck Application.</p>
                                                                                                  </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                                  <tr>
                                                                                      <td class="featured-story__copy" style="width="100%" align="center">
                                                                                          <table cellspacing="0" cellpadding="0">
                                                                                             
                                                                                              <tr>
                                                                                              <td style="font-size: 16px; line-height: 22px; color: #555555; padding-top: 10px;"
                                                                                              align="center">
                                                                                              <img src="${config.siteURL}assets/apple.jpg" style="height: 100px; max-width: 100%;"/>&nbsp;
                                                                                              <img src="${config.siteURL}assets/googleplay.jpg" style="height: 100px; max-width: 100%;"/>
                                                                                             
                                                                                          </td>
                                                                                              </tr>
                                                                                          </table>
                                                                                      </td>
                                                                                  </tr>
                                                                              </table>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
  
                  </table>
              </td>
          </tr>
      </table>
  
      <!-- Exact Target tracking code -->
  
  
      </custom>
  </body>
  
  </html>`

    // 2) Setting HTML content to the mail options
    mailOptions.html = html

    // 3) Actually sending the mail
    return sendEmail(mailOptions)
}

module.exports.absentMail = {
    html: `<html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta charset="utf-8" />
        <link rel="icon" href="zimo-tab.png" />
        <title>Email</title>
    </head>
    
    <body style="margin: 0px; padding:0px;">
        <div
            style="padding: 0; margin:0 auto; width: 800px !important; height: auto; font-family: Helvetica Neue, Helvetica, Arial, sans-serif; background-color: #ffffff; border: 1px solid rgb(207, 203, 203);">
    
            <center>
                <div style="  background-color:#ed7171;  padding: 15px 0px; border-radius: 10px 10px 0px 0px; ">
                    <img src="https://www.linkpicture.com/q/logo2_14.png" height="60px" width="100px" alt="">
                </div>
            </center>
            <center style="width: 100%; position: absolute; top: 26%; left: 0px;">
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600px" bgcolor="#FFFFFF"
                    style="background-color: #ffffff; margin: 0 auto; max-width: 600px; width: inherit; border-radius: 10px; box-shadow: 1px 1px 20px 1px #ed71712a; padding: 20px;">
                    <tbody>
                        <tr>
                            <td>
                                <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                                    <tbody>
                                        <tr>
                                            <td style="padding: 20px 24px 10px 24px; margin: 0px;">
                                                <table role="presentation" border="0" cellspacing="0" cellpadding="0"
                                                    width="100%">
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
                                                                <p style="color: rgb(114, 111, 111); line-height: 22px;">
                                                                    We have been notice that you are absent tomorrow
    
    
                                                                </p>
    
                                                                <p
                                                                    style="color: rgb(114, 111, 111); margin: 20px 0px; line-height: 22px;">
                                                                </p>
    
                                                                <p style="color: rgb(114, 111, 111); line-height: 22px;">
                                                                    So consider this mail
                                                                    as a warning and consult with your HR</p>
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
                                                                    <table border="0" style="margin-right: 0px"
                                                                        cellpadding="0" cellspacing="0">
                                                                        <div style="text-align:center" <div
                                                                            style="font-size: 30px; padding:0px 0px;">
                                                                            <a style="text-decoration : none"
                                                                                href="https://www.facebook.com/zimoinfotech/">
                                                                                <img src="https://www.linkpicture.com/q/fb.svg"
                                                                                    style="width : 40px; margin: 0px 10px;"></img></a>
    
                                                                            <a href="https://www.instagram.com/zimo.one/"
                                                                                style="text-decoration : none"><img
                                                                                    src="https://www.linkpicture.com/q/ig.svg"
                                                                                    style="width : 40px; margin: 0px 10px;"></a>
    
                                                                            <a style="text-decoration : none"
                                                                                href="https://twitter.com/zimoinfotech"><img
                                                                                    src="https://www.linkpicture.com/q/twitter_3.svg"
                                                                                    style="width : 40px; margin: 0px 10px;"></a>
    
                                                                        </div>
                                                                        <div
                                                                            style="padding: 0px  0px 10px 0px; text-align: center; ">
                                                                            <p>© 2022 Zimo.one All Right Reserved</p>
                                                                        </div>
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
}

module.exports.inOutMail = {
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
                                                                                   We have been noticing that you are
                                                                                   regularly coming late to work.
   
                                                                               </p>
   
                                                                               <p
                                                                                   style="color: rgb(114, 111, 111); margin: 20px 0px; line-height: 22px;">
                                                                                   You have
                                                                                   already received several verbal warnings
                                                                                   but still,<br>we haven’t noticed any
                                                                                   change
                                                                                   in your behavior.</p>
   
                                                                               <p
                                                                                   style="color: rgb(114, 111, 111); line-height: 22px;">
                                                                                   So consider this mail
                                                                                   as a final warning . <br> If you still
                                                                                   come
                                                                                   late then you have to face strict action
                                                                                   from the management.</p>
   
   
                                                                              
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
}

module.exports.missedEmail = {
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
                                                                                    We have been notice that you are you have missed you attendance
                                                                                    
    
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
}
