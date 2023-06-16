const { required } = require('joi')
const joi = require('joi'),
    constants = require('./constants')

exports.userValidation = joi.object({
    image: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.imageReq}` }),
    companyId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.companyReq}` }),
    firstName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.firstNameReq}` }),
    lastName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.lastNameReq}` }),
    email: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.emailReq}` }),
    password: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.passwordReq}` }),
    address: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.addressReq}` }),
    city: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.cityReq}` }),
    state: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.stateReq}` }),
    country: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.countryReq}` }),
    mobileNumber: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.mobileNumberReq}` }),
})
exports.nationalityValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.messages.titleReq}` }),
})

exports.attendanceRegularizedValidation = joi.object({
    regularizedReason: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.attendanceRegMsg.regularizedReason}` }),
    regularizedNote: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.attendanceRegMsg.regularizedNote}` }),
})
exports.employeeUpdateValidation = joi.object({
    permanentAddress: joi
        .object()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.permanentAddress}` }),
    currentAddress: joi
        .object()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.currentAddress}` }),
    previousExperience: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.previousExperience}` }),
    educationQualification: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.educationQualification}` }),
    familyDetails: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.familyDetails}` }),
    document: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.document}` }),
    skills: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.skills}` }),
    technology: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.technology}` }),
    domain: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.domain}` }),
    nationality: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.employeeUpdateMsg.nationality}` }),
})
exports.documentValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.messages.titleReq}` }),
})

exports.typeOfWorkValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.messages.titleReq}` }),
})
exports.timeLogValidation = joi.object({
    reportedDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.timeLogMsg.reportedDate}` }),

    companyId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.timeLogMsg.companyId}` }),
    employeeId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.timeLogMsg.employeeId}` }),
    totalHours: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.timeLogMsg.totalHours}` }),
})
exports.leaveApplyValidation = joi.object({
    appliedTo: joi.array().messages({ 'any.required': `${constants.leaveApplyMsg.appliedTo}` }),
    branchId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.messages.branchId}` }),

    createdById: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.messages.createdById}` }),

    companyId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.messages.companyId}` }),
    session: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.session}` }),
    startDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.startDate}` }),
    endDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.endDate}` }),

    leaveType: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.type}` }),
    reason: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.reason}` }),
})
exports.leaveApplyUpdateValidation = joi.object({
    startDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.startDate}` }),
    endDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.endDate}` }),
    session: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.session}` }),
    leaveType: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.type}` }),

    reason: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveApplyMsg.reason}` }),
})
exports.holidayValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.name}` }),

    from: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.date}` }),
    to: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.date}` }),
})
exports.holidayUpdateValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.name}` }),
    shifts: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.shift}` }),
    from: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.date}` }),
    to: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.date}` }),
    locations: joi
        .object()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.locations}` }),

    description: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.holidayMsg.description}` }),
})
exports.hardwareValidation = joi.object({
    systemNumber: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.hardwareMsg.systemNumber}` }),
    typeOfSystem: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.hardwareMsg.typeOfSystem}` }),
    brand: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.hardwareMsg.brand}` }),
})
exports.employeeValidation = joi.object({
    firstName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.firstName}` }),
    createdById: joi.string().messages({ 'any.required': `${constants.messages.createdById}` }),

    fatherName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.fatherName}` }),
    email: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.email}` }),
    mobileNumber: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.dob}` }),
    dob: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.empMsg.mobileNumber}` }),
    gender: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.gender}` }),

    age: joi
        .number()
        .required()
        .messages({ 'any.required': `${constants.empMsg.age}` }),

    resetKey: joi.string().messages({ 'any.required': `${constants.empMsg.resetKey}` }),

    // companyId: joi.string().messages({ 'any.required': `${constants.messages.companyId}` }),
})
exports.empDetailsValidation = joi.object({
    dateOfJoining: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.empMsg.dateOfJoining}` }),
    probationPeriod: joi
        .number()
        .required()
        .messages({ 'any.required': `${constants.empMsg.probationPeriod}` }),
    dateOfConfirmation: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.empMsg.dateOfConfirmation}` }),
    status: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.dateOfConfirmation}` }),
    empType: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.empType}` }),
})
exports.softwareValidation = joi.object({
    provider: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.softwareMsg.provider}` }),
    type: joi.string().messages({ 'any.required': `${constants.softwareMsg.type}` }),
    purchasedOn: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.softwareMsg.purchasedOn}` }),
    billingAfter: joi
        .object()
        .required()
        .messages({ 'any.required': `${constants.softwareMsg.billingCycle}` }),
})
exports.projectValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.name}` }),
    description: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.description}` }),
    startDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.startDate}` }),
    endDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.endDate}` }),
    projectManagerId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.projectManager}` }),
    projectLocation: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.projectLocation}` }),
    clientName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.clientName}` }),
    corporateAddress: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.corporateAddress}` }),
    clientEmail: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.clientEmail}` }),
    clientPhoneNo: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.clientPhoneNo}` }),
    clientCode: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.clientCode}` }),
    domainId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.projectMsg.domainId}` }),
})
exports.teamValidation = joi.object({
    employeeId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.teamMsg.empId}` }),
    startDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.teamMsg.startDate}` }),
    endDate: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.teamMsg.endDate}` }),
    projectId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.teamMsg.projectId}` }),
    companyId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.teamMsg.cmpnyId}` }),
})
exports.shiftRotationValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftRotationValidation.name}` }),
    frequency: joi
        .object()
        .required()
        .messages({
            'any.required': `${constants.shiftRotationValidation.scheduleFrequency}`,
        }),
    rotation: joi
        .object()
        .required()
        .messages({
            'any.required': `${constants.shiftRotationValidation.shiftRotation}`,
        }),
    applicablePeriod: joi
        .object()
        .required()
        .messages({
            'any.required': `${constants.shiftRotationValidation.applicablePeriod}`,
        }),
})
exports.shiftRotationUpdateValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftRotationValidation.name}` }),
    frequency: joi
        .object()
        .required()
        .messages({
            'any.required': `${constants.shiftRotationValidation.scheduleFrequency}`,
        }),
    rotation: joi
        .object()
        .required()
        .messages({
            'any.required': `${constants.shiftRotationValidation.shiftRotation}`,
        }),
    applicablePeriod: joi
        .object()
        .required()
        .messages({
            'any.required': `${constants.shiftRotationValidation.applicablePeriod}`,
        }),
    departments: joi
        .array()
        .required()
        .messages({
            'any.required': `${constants.departmentMsg.departmentIdReq}`,
        }),
    designations: joi
        .array()
        .required()
        .messages({
            'any.required': `${constants.messages.designations}`,
        }),
    locations: joi
        .string()
        .required()
        .messages({
            'any.required': `${constants.messages.locations}`,
        }),
})
exports.stateValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.stateMsg.titleReq}` }),
})

exports.shiftsValidation = joi.object({
    code: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.codeReq}` }),
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.name}` }),
    color: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.color}` }),
    timeZone: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.timeZone}` }),
    calculateHours: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.calculateHours}` }),
})

exports.shiftsUpdateValidation = joi.object({
    code: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.empMsg.codeReq}` }),
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.name}` }),
    branchId: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.messages.branchId}` }),
    color: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.color}` }),
    timeZone: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.timeZone}` }),
    calculateHours: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.calculateHours}` }),

    sessions: joi
        .object()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.sessions}` }),
    fullDay: joi
        .number()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.fullDay}` }),
    halfDay: joi
        .number()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.halfDay}` }),
    days: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.shiftMsg.days}` }),
})

exports.userAdminValidation = joi.object({
    mobileNumber: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.mobileNumberReq}` }),
    firstName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.firstNameReq}` }),
    lastName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.lastNameReq}` }),
    email: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.emailReq}` }),
    image: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.imageReq}` }),
})
exports.departmentValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.departmentMsg.titleReq}` }),
    departmentCode: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.departmentMsg.departmentCode}` }),
})
exports.countryValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.countryMsg.titleReq}` }),
})

exports.companyValidation = joi.object({
    companyName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.nameReq}` }),
    headOfficeAdd: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.headOfficeAdd}` }),
    mobileNumber: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.mobileNumber}` }),
    email: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.email}` }),
    website: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.website}` }),
    dateOfFoundation: joi
        .date()
        .required()
        .messages({ 'any.required': `${constants.company.dateOfFoundation}` }),
    gst: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.gst}` }),
    pan: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.pan}` }),
    tan: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.tan}` }),
    esi: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.company.esi}` }),
})

exports.timezoneValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.timeZone.name}` }),
    code: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.timeZone.code}` }),
})

exports.designationValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.designationMsg.titleReq}` }),
    designationCode: joi
        .string()
        .required()
        .messages({
            'any.required': `${constants.designationMsg.designationCode}`,
        }),
})

exports.registerValidation = joi.object({
    email: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.emailReq}` }),
    password: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.passwordReq}` }),
    firstName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.firstNameReq}` }),
    lastName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.userMsg.lastNameReq}` }),
})

exports.domainValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.domain.titleReq}` }),
    description: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.domain.descriptionReq}` }),
})

exports.technologyValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.technology.titleReq}` }),
    description: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.technology.descriptionReq}` }),
})

exports.skillsValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.skills.titleReq}` }),
})

exports.skillsUpdateValidation = joi.object({
    title: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.technology.titleReq}` }),
})

exports.roleValidation = joi.object({
    roleTitle: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.roleMsg.titleReq}` }),
    roleName: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.roleMsg.roleNameReq}` }),
})
exports.branchValidation = joi.object({
    branchName: joi
        .string()
        .required()
        .max(60)
        .messages({ 'any.required': `${constants.branchMsg.branchNameReq}` }),
    branchCode: joi
        .string()
        .required()
        .max(5)
        .messages({ 'any.required': `${constants.branchMsg.branchCodeReq}` }),
    address: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.branchMsg.addressReq}` }),

    phone: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.branchMsg.phoneReq}` }),
    email: joi
        .string()
        .email()
        .required()
        .messages({ 'any.required': `${constants.branchMsg.emailReq}` }),
})

exports.leaveValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveMsg.name}` }),
    code: joi
        .string()
        .required()
        .max(6)
        .messages({ 'any.required': `${constants.leaveMsg.code}` }),
    color: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveMsg.color}` }),
    type: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveMsg.type}` }),
    basedOn: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.leaveMsg.basedOn}` }),
    unit: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.leaveMsg.unit}` }),

    applicable: joi
        .object()
        .required()
        .messages({ 'any.required': `${constants.leaveMsg.applicable}` }),
})

exports.policyValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.policyMsg.name}` }),
    code: joi
        .string()
        .required()
        .max(6)
        .messages({ 'any.required': `${constants.policyMsg.code}` }),
    description: joi.string().messages({ 'any.required': `${constants.policyMsg.description}` }),
    file: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.policyMsg.file}` }),
})

exports.updatePolicyValidation = joi.object({
    name: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.policyMsg.name}` }),
    code: joi
        .string()
        .required()
        .max(6)
        .messages({ 'any.required': `${constants.policyMsg.code}` }),
    description: joi.string().messages({ 'any.required': `${constants.policyMsg.description}` }),
    file: joi
        .string()
        .required()
        .messages({ 'any.required': `${constants.policyMsg.file}` }),
    enforcePolicy: joi.boolean().messages({ 'any.required': `${constants.policyMsg.enforcePolicy}` }),
    departments: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.policyMsg.department}` }),
    designations: joi
        .array()
        .required()
        .messages({ 'any.required': `${constants.policyMsg.designation}` }),
})
