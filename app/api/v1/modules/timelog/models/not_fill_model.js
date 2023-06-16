'use strict'

const mongoose = require('mongoose')

const notFillSchema = new mongoose.Schema(
    {
        date: { type: Date, default: null },
        employeeId : { type : mongoose.Schema.Types.ObjectId , ref : "users" },
        companyId : {  type : mongoose.Schema.Types.ObjectId , ref : "users" },
        isActive : { type : Boolean , default :true },
        isDelete : { type : Boolean , default :false }

    },
    {
        timestamps: true,
    }
)

var NotFill = mongoose.model('notFill', notFillSchema)
module.exports = NotFill
