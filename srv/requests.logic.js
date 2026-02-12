const { WFHRequests } = cds.entities;
const { SELECT, UPDATE } = require('@sap/cds/lib/ql/cds-ql');

/* ================== VALIDATORS ================== */

/**
 * Validates that fromDate is not after toDate
 * @throws 400 error if validation fails
 */
function validateDates(req) {
  const fromDate = new Date(req.data.fromDate);
  const toDate = new Date(req.data.toDate);

  if (fromDate > toDate) {
    req.error(400, 'Start date cannot be after end date');
  }
}

/**
 * Auto-populates employee information from authenticated user
 * Prioritizes user.attr over user.id for compatibility
 */
function enrichEmployeeData(req) {
  req.data.employeeId = req.user.attr?.Id || req.user.id;
  req.data.employeeName = req.user.attr?.name || req.user.id;
  req.data.employeeEmail = req.user.attr?.email || req.user.id;
}

/* ================== HR ADMIN ACTIONS ================== */

/**
 * Approves a pending leave request
 * @requires HR_Admin role
 * @returns Approved request record
 */
async function approveRequest(req, Requests) {
  // Authorization check
  if (!req.user.is('HR_Admin')) {
    req.reject(403, 'Only HR administrators can approve requests');
  }

  const { employeeId, fromDate, toDate } = req.data;

  // Attempt to update PENDING request to APPROVED
  const rowsUpdated = await UPDATE(Requests)
    .set({ status: 'APPROVED' })
    .where({ 
      employeeId, 
      fromDate, 
      toDate, 
      status: 'PENDING'  // Only approve pending requests
    });

  // Verify the update succeeded
  if (rowsUpdated === 0) {
    req.reject(404, 'Request not found or already processed');
  }

  // Return the updated record
  return SELECT.one.from(Requests).where({ employeeId, fromDate, toDate });
}

/**
 * Rejects a pending leave request
 * @requires HR_Admin role
 * @returns Rejected request record
 */
async function rejectRequest(req, Requests) {
  // Authorization check
  if (!req.user.is('HR_Admin')) {
    req.reject(403, 'Only HR administrators can reject requests');
  }

  const { employeeId, fromDate, toDate } = req.data;

  // Attempt to update PENDING request to REJECTED
  const rowsUpdated = await UPDATE(Requests)
    .set({ status: 'REJECTED' })
    .where({ 
      employeeId, 
      fromDate, 
      toDate, 
      status: 'PENDING' 
    });

  if (rowsUpdated === 0) {
    req.reject(404, 'Request not found or already processed');
  }

  return SELECT.one.from(Requests).where({ employeeId, fromDate, toDate });
}

/* ================== CANCELLATION (ROLE-BASED) ================== */

 
async function cancelRequest(req, Requests) {
  const { employeeId, fromDate, toDate } = req.data;

  // ADMIN PATH: Unrestricted cancellation
  if (req.user.is('HR_Admin')) {
    await UPDATE(Requests)
      .set({ status: 'CANCELLED' })
      .where({ employeeId, fromDate, toDate });

    return SELECT.one.from(Requests).where({ employeeId, fromDate, toDate });
  }

  // EMPLOYEE PATH: Restricted cancellation
  if (req.user.is('Employee')) {
    const rowsUpdated = await UPDATE(Requests)
      .set({ status: 'CANCELLED' })
      .where({
        employeeId: req.user.id,  // Must own the request
        fromDate,
        toDate,
        status: 'PENDING'          // Must be pending
      });

    // Rejection scenarios: wrong owner, already approved/rejected, or doesn't exist
    if (rowsUpdated === 0) {
      req.reject(403, 'Cannot cancel: request not found, not yours, or already processed');
    }

    return SELECT.one.from(Requests).where({
      employeeId: req.user.id,
      fromDate,
      toDate
    });
  }

  // Fallback: User has neither role
  req.reject(403, 'Unauthorized: requires HR_Admin or Employee role');
}

module.exports = {
  validateDates,
  enrichEmployeeData,
  approveRequest,
  rejectRequest,
  cancelRequest
};