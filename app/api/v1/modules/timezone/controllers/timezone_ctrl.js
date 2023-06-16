const Response = require("../../../../../lib/response"),
  catchAsync = require("./../../../../../lib/catchAsync"),
  toggleDeletedState = require("./../../factory/update"),
  toggleStatus = require("./../../factory/changeStatus"),
  constants = require("./../../../../../lib/constants"),
  // toggleDeletedRole = require('./../../factory/update'),
  query = require("./../../../../../lib/common_query"),
  softDelete = require("./../../factory/softDelete"),
  { timezoneValidation } = require("./../../../../../lib/joiValidation"),
  Timezone = require("./../models/timezone_model"),
  mongoose = require("mongoose");
exports.addTime = catchAsync(async (req, res, next) => {
  let timeZoneInfo = await Timezone.insertMany(req.body);

  if (timeZoneInfo) {
    return res.json(
      Response(constants.statusCode.ok, constants.timeZone.timeMsg)
    );
  } else {
    return res.json(
      Response(
        constants.statusCode.internalServerError,
        constants.messages.internalServerError
      )
    );
  }
});

exports.timedetails = catchAsync(async (req, res, next) => {
  if (!req.body._id)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.idReq)
    );
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };

  const data = await Timezone.aggregate([
    { $match: condition },
    {
      $project: {
        _id: 1,
        name: "$name",
        code: "$code",
        isActive: "$isActive",
        isDeleted: "$isDeleted",
      },
    },
  ]);
  if (data.length == 0)
    return res.json(
      Response(
        constants.statusCode.internalServerError,
        constants.messages.internalServerError
      )
    );
  else
    return res.json(
      Response(
        constants.statusCode.ok,
        constants.messages.ExecutedSuccessfully,
        data[0]
      )
    );
});
exports.updateStatus = catchAsync(async (req, res) => {
  const { _id } = req.body;

  if (!_id)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.timezoneId)
    );

  const Result = await Timezone.findByIdAndUpdate(_id, timeObj, { new: true });
  if (Result)
    return res.json(
      Response(constants.statusCode.ok, constants.messages.updateSuccess)
    );
  else
    return res.json(
      Response(
        constants.statusCode.internalServerError,
        constants.messages.internalServerError
      )
    );
});
exports.timeUpdate = catchAsync(async (req, res) => {
  const { _id } = req.body;

  if (!_id)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.timezoneId)
    );

  let validateObj = {
    name: req.body.name,
    code: req.body.code,
  };
  await timezoneValidation.validateAsync(validateObj);
  const Result = await Timezone.findByIdAndUpdate(_id, validateObj, {
    new: true,
  });
  if (Result)
    return res.json(
      Response(constants.statusCode.ok, constants.messages.updateSuccess)
    );
  else
    return res.json(
      Response(
        constants.statusCode.internalServerError,
        constants.messages.internalServerError
      )
    );
});

exports.timezoneList = catchAsync(async (req, res) => {
  let count = req.body.count ? req.body.count : 10;
  req.body.page = req.body.page ? req.body.page : 1;
  let skip = count * (req.body.page - 1);

  let condition = {};
  let sortObject = {};
  let child_condition = {};
  if (req.body.sortValue && req.body.sortOrder) {
    sortObject[req.body.sortValue] = req.body.sortOrder;
  } else {
    sortObject = { _id: -1 };
  }
  const searchText = decodeURIComponent(req.body.searchText).replace(
    /[[\]{}()*+?,\\^$|#\s]/g,
    "\\s+"
  );
  if (req.body.searchText) {
    child_condition.$or = [{ name: new RegExp(searchText, "gi") }];
  }

  if (req.body.isActive) {
    condition.isActive = req.body.isActive == "true" ? true : false;
  } else {
    condition.isActive = true;
  }
  if (req.body.isDeleted) {
    condition.isDeleted = req.body.isDeleted == "true" ? true : false;
  }

  // }
  const data = await Timezone.aggregate([
    { $match: condition },
    {
      $project: {
        _id: "$_id",
        name: "$name",
        code: "$code",
        isActive: "$isActive",
        isDeleted: "$isDeleted",
      },
    },
    { $match: child_condition },
    { $sort: sortObject },
    { $limit: parseInt(skip) + parseInt(count) },
    { $skip: parseInt(skip) },
  ]);
  const totalCount = await Timezone.countDocuments(condition);

  if (data.length)
    return res.json(
      Response(
        constants.statusCode.ok,
        constants.messages.ExecutedSuccessfully,
        data,
        totalCount
      )
    );
  else
    return res.json(
      Response(
        constants.statusCode.ok,
        constants.messages.noRecordFound,
        [],
        totalCount
      )
    );
});

exports.changeStatus = toggleStatus(Timezone);
exports.delete = softDelete(Timezone);
