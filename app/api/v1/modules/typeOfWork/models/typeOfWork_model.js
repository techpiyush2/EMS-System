const mongoose = require('mongoose')

const typeOfWorkSchema = new mongoose.Schema(
    {
        title: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    },
    {
        timestamps: true,
    }
)

var TypeOfWork = mongoose.model('typeOfWork', typeOfWorkSchema)
module.exports = TypeOfWork
