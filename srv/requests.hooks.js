const { SELECT } = require('@sap/cds/lib/ql/cds-ql');
const { validateDates, enrichEmployeeData } = require('./requests.logic');

module.exports = function (service) {

  const { Requests } = service.entities;

  service.on('CREATE', "Requests", async (req) => {

    // basic required field checks
    if (!req.data.fromDate || !req.data.toDate) {
      return req.error(400, 'Missing required fields: fromDate, toDate');
    }

    if (!req.data.description || !req.data.reason) {
      return req.error(400, 'Missing required fields: description, reason');
    }

    // reusable validations
    validateDates(req);

    // auto-fill employee data
    enrichEmployeeData(req);

    // duplicate check (still optional)
   const existing = await SELECT.one
  .from(Requests)
  .where({
    employeeId: req.data.employeeId,
    fromDate: req.data.fromDate,
    toDate: req.data.toDate
  });


    if (existing) {
      return req.error(409, 'WFH request already exists for this date range');
    }

    req.data.status = 'PENDING';
    return req.data
  });
};
