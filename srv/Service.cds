using { WFHRequests} from '../db/schema';
using { Users as DBUsers  } from '../db/schema';

service UserService {

  @readonly
  entity Users as projection on DBUsers;

}


service WFHService {
//action for 
//   @restrict: [
//     { grant: 'READ', to: 'Employee', where: 'employeeId = $user' },
//     { grant: '*', to: 'HR_Admin' }
//   ]
  entity Requests as projection on WFHRequests;
  @requires: 'Employee'
  action submitWFH(

    fromDate     : Date,

    toDate       : Date,

    description  : String,

    reason       : String

  ) returns Requests;

  @requires: 'HR_Admin'
  action approve(

    employeeId : String,

    fromDate   : Date,

    toDate     : Date

  ) returns Requests;
  
  @requires: 'HR_Admin'
  action reject(

    employeeId : String,

    fromDate   : Date,

    toDate     : Date

  ) returns Requests;
 
  action cancel(

    employeeId : String,

    fromDate   : Date,

    toDate     : Date

  ) returns Requests;

}
