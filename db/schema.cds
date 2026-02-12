using {managed , cuid} from '@sap/cds/common';
type WFHStatus : String enum {
  PENDING = 'PENDING';
  APPROVED = 'APPROVED';
  REJECTED = 'REJECTED';
  CANCELLED = 'CANCELLED';
};
 
entity WFHRequests :cuid , managed {
  employeeId   : String;
  employeeName : String;
  key email         : String(100);
  fromDate     : Date @required;
  toDate       : Date @required;
  description  : String;
  reason       : String @required;
  status       : WFHStatus default 'PENDING';

   user         : Association to Users;
}

entity Users : cuid, managed {
  userId        : String(100);   // SSO user id (sub / user_name)
  fullName      : String(100); 
  roles         : String(255);   // comma-separated roles
  isActive      : Boolean default true;
}