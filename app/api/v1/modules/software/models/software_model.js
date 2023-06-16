const mongoose = require('mongoose')
const softwareSchema = new mongoose.Schema(
    {
        provider: { type: String, default: null },
        type: {
            type: String,
            enum: ['Trial', 'Subscription', 'Lifetime'],
        },
        purchasedOn: { type: Date },
        billingAfter: {
            value: { type: Number, default: 0 },
            unit: { type: String, enum: ['MONTH', 'YEAR', 'WEEK', ''], default: '' },
        }, // no of days
        autoRenew: { type: Boolean, default: false },
        nextPaymentDate: { type: Date },
        costAndCurrency: {
            cost: { type: Number, default: null },
            currency: { type: String, enum: ['CAD', 'USD', 'INR', ''], default: '' },
        },
        userMail: { type: String, default: null },
        password: { type: String, default: null },
        productId: { type: String, default: null },
        systemNumber: { type: mongoose.Schema.Types.ObjectId, ref: 'hardwares', default: null },
        url: { type: String, default: null },
        note: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
        reminder: { type: Boolean, default: false },
        
    },
    {
        timestamps: true,
    }
)

var Software = mongoose.model('software', softwareSchema)
module.exports = Software
