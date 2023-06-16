//  Expired savedjob - When job get expire it cron job will  change the status from true to false
let express = require('express'),
 moment = require('moment'),
 mongoose = require('mongoose'),
 User =  require("../api/v1/modules/user/models/user_model"),
 Response = require("./response"),
 constants = require("./constants");


 exports.expireResetToken = async (req, res) => {
        const userResult = await User.updateMany({token:{$ne:""}}, {"$set":{"token": ""}}, {"multi": true})
        
 }

