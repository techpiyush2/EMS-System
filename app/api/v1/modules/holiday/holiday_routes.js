module.exports = function (router) {
    var holiday = require('./controllers/holiday_controller')
    const auth = require('./../../../middleware/auth')

    //create
    router.post('/holiday/add', holiday.addHoliday)
    router.post('/holiday/list', holiday.holidayList)
    router.post('/holiday/update', auth, holiday.holidayUpdate)
    router.post('/holiday/changeStatus', auth, holiday.changeStatus)
    router.post('/holiday/details', auth, holiday.holidayDetails)
    router.post('/holiday/delete', auth, holiday.delete)
    return router
}
