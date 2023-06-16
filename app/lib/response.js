// /**
//  * This file is meant for giving the custom response
//  * params @code | @status | @message | @data | @token
//  */

// module.exports = function (code, message, data, totalCount) {
//   const response = {};
//   response.code = code;
//   response.message = message;
//   response.data = data;
//   // response.responseStatus = 0
//   // if (data) {
//   //   if (data.length > 0) {
//   //     response.responseStatus = 1
//   //   } else if (data.data) {
//   //     if (data.data.length > 0) {
//   //       response.responseStatus = 1
//   //     } else {
//   //       response.responseStatus = 0
//   //     }
//   //   } else {
//   //     response.responseStatus = 0
//   //   }
//   // }

//   if (totalCount === 0 || totalCount) {
//     response.totalCount = totalCount;
//   }

//   // console.log('response', response)
//   return response;
// };

//1
/**
 * This file is meant for giving the custom response
 * params @code | @status | @message | @data | @token
 */

module.exports = function (code, message, data,totalCount) {
    const response = {}
    response.code = code
    response.message = message
    response.data = data
    // response.data = data2
    // response.data = data3
    // response.responseStatus = 0
    // if (data) {
    //   if (data.length > 0) {
    //     response.responseStatus = 1
    //   } else if (data.data) {
    //     if (data.data.length > 0) {
    //       response.responseStatus = 1
    //     } else {
    //       response.responseStatus = 0
    //     }
    //   } else {
    //     response.responseStatus = 0
    //   }
    // }

    if (totalCount === 0 || totalCount) {
        response.totalCount = totalCount
    }

    return response
}
