module.exports = function (router) {
    var ticketingsystem = require('./controllers/ticketingsystem_controller')

    // router.post('/ticketingsystem/addTicket',  ticketingsystem.addTicket)
    // router.post('/ticketingsystem/ticketList', ticketingsystem.ticketList)
    // router.post('/ticketingsystem/ticketchangeStatus',  ticketingsystem.ticketchangeStatus)
    // router.post('/ticketingsystem/ticketDetails',  ticketingsystem.ticketDetails)

    //who we are
    router.post('/ticketingsystem/addwhoweare',  ticketingsystem.addwhoweare)
    router.post('/ticketingsystem/whowearelist', ticketingsystem.whowearelist)
    router.post('/ticketingsystem/whowearechangeStatus',  ticketingsystem.whowearechangeStatus)
    
    
    
    return router
}
