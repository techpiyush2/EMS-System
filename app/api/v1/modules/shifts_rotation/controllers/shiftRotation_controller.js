const Response = require("../../../../../lib/response"),
  catchAsync = require("../../../../../lib/catchAsync"),
  toggleStatus = require("../../factory/changeStatus"),
  constants = require("../../../../../lib/constants"),
  query = require("../../../../../lib/common_query"),
  softDelete = require("../../factory/softDelete"),
  {
    shiftRotationValidation,
    shiftRotationUpdateValidation,
  } = require("../../../../../lib/joiValidation"),
  ShiftRotation = require("../models/shiftRotation_model"),
  mongoose = require("mongoose");

exports.addShiftRotation = catchAsync(async (req, res, next) => {
  let validateObj = {
    name: req.body.name,
    frequency: req.body.frequency,
    rotation: req.body.rotation,
    applicablePeriod: req.body.applicablePeriod,
  };

  await shiftRotationValidation.validateAsync(validateObj);
  const { createdById, companyId, departments, designations, locations } =
    req.body;

  if (!createdById)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.createdById)
    );
  if (!companyId)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.companyId)
    );
  if (!departments)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.departments)
    );
  if (!locations)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.locations)
    );
  if (!designations)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.designations)
    );
  validateObj.createdById = createdById;
  validateObj.companyId = companyId;
  validateObj.departments = departments;
  validateObj.designations = designations;
  validateObj.locations = locations;
  let shiftRotationInfo = await ShiftRotation.create(validateObj);

  if (shiftRotationInfo) {
    return res.json(
      Response(constants.statusCode.ok, constants.messages.addSuccess)
    );
  } else {
    return res.json(
      Response(
        constants.statusCode.internalServerError,
        constants.statusCode.internalError
      )
    );
  }
});
exports.shiftRotationDetails = catchAsync(async (req, res, next) => {
  if (!req.body._id)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.idReq)
    );
  let condition = { _id: mongoose.Types.ObjectId(req.body._id) };

  const data = await ShiftRotation.aggregate([
    { $match: condition },
    {
      $project: {
        frequency: "$frequency",
        name: "$name",
        rotation: "$rotation",
        applicablePeriod: "$applicablePeriod",
        departments: "$departments",
        designations: "$designations",
        locations: "$locations",
        isActive: "$isActive",
        isDeleted: "$isDeleted",
        createdById: "$createdById",
        companyId: "$companyId",
      },
    },
  ]);
  if (data.length == 0)
    return res.json(
      Response(constants.statusCode.notFound, constants.messages.noRecordFound)
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

exports.shiftRotationUpdate = catchAsync(async (req, res) => {
  const { _id } = req.body;

  if (!_id)
    return res.json(
      Response(constants.statusCode.unauth, constants.messages.idReq)
    );

  let validateObj = {
    name: req.body.name,
    frequency: req.body.frequency,
    rotation: req.body.rotation,
    applicablePeriod: req.body.applicablePeriod,
    departments: req.body.departments,
    designations: req.body.designations,
    locations: req.body.locations,
  };

  await shiftRotationUpdateValidation.validateAsync(validateObj);

  const Result = await ShiftRotation.findByIdAndUpdate(_id, validateObj, {
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

exports.shiftRotationList = catchAsync(async (req, res) => {
  let count = req.body.count ? req.body.count : 10;
  req.body.page = req.body.page ? req.body.page : 1;
  let skip = count * (req.body.page - 1);

  let sortObject = {};
  if (req.body.sortValue && req.body.sortOrder) {
    sortObject[req.body.sortValue] = req.body.sortOrder;
  } else {
    sortObject = { title: -1 };
  }
  let child_condition = {};
  let condition = {};
  if (req.body.isActive != "" && req.body.isActive != undefined) {
    condition.isActive = req.body.isActive == "true" ? true : false;
  }
  const searchText = decodeURIComponent(req.body.searchText).replace(
    /[[\]{}()*+?,\\^$|#\s]/g,
    "\\s+"
  );
  if (req.body.searchText) {
    child_condition.$or = [{ title: new RegExp(searchText, "gi") }];
  }

  if (req.body.isDeleted) {
    condition.isDeleted = req.body.isDeleted == "true" ? true : false;
  } else {
    condition.isDeleted = false;
  }
  if (req.body.createdById)
    condition.createdById = mongoose.Types.ObjectId(req.body.createdById);

  if (req.body.locations)
    condition.locations = mongoose.Types.ObjectId(req.body.locations);
  const data = await ShiftRotation.aggregate([
    { $match: condition },
    // {
    //   $project: {
    //     code: "$code",
    //     name: "$name",
    //     color: "$color",
    //     timeZone: "$timeZone",
    //     calculateHours: "$calculateHours",
    //     sessions: "$sessions",
    //     fullDay: "$fullDay",
    //     halfDay: "$halfDay",
    //     days: "$days",
    //     isActive: "$isActive",
    //     isDeleted: "$isDeleted",
    //     createdById: "$createdById",
    //     companyId: "$companyId",
    //     branchId: "$branchId",
    //   },
    // },
    { $match: child_condition },
    { $sort: sortObject },
    { $limit: parseInt(skip) + parseInt(count) },
    { $skip: parseInt(skip) },
  ]);
  const totalCount = await ShiftRotation.countDocuments({
    ...condition,
    ...child_condition,
  });

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

exports.delete = softDelete(ShiftRotation);
exports.changeStatus = toggleStatus(ShiftRotation);
