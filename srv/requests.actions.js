const { SELECT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');
const {
  approveRequest,
  rejectRequest,
  cancelRequest
} = require('./requests.logic');

module.exports = function (service) {

  const { Requests } = service.entities;
  service.on('submitWFH', async (req) => {
     const newRequest = await INSERT.into(Requests).entries({
       fromDate: req.data.fromDate,
       toDate: req.data.toDate,
       description: req.data.description,
       reason: req.data.reason
     });
     return SELECT.one.from(Requests).where({ ID: newRequest.ID });
   });

  service.on('approve', async (req) => {
    return approveRequest(req, Requests);
  });

  service.on('reject', async (req) => {
    return rejectRequest(req, Requests);
  });

  service.on('cancel', async (req) => {
    return cancelRequest(req, Requests);
  });

};
