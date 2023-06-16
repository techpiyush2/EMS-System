"use strict";

module.exports = function (socketio) {
  global.socketClientList = {};
  socketio.on("connect", function (socket) {
    socket.on(
      "add-user",
      (data) => (socketClientList[data.user_id] = socket.id)
    );
  });
};