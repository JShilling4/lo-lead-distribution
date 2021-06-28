import axios from "axios";
import Router from "@/router";

// base instance
// const rest = axios.create({
//     baseURL: process.env.VUE_APP_API_URL
// });

// const ruoffApiWithKey = axios.create({
//     baseURL: process.env.VUE_APP_RUOFFAPI_URL,
//     headers: {
//         Authorization: process.env.VUE_APP_API_KEY
//     }
// });

// // REST interceptors
// rest.interceptors.request.use(
//     config => {
//         const token = localStorage.getItem("wlv4");
//         if (token) {
//             config.headers.Authorization = token;
//         }
//         return config;
//     },
//     error => {
//         Promise.reject(error);
//     }
// );

// rest.interceptors.response.use(
//     response => response,
//     error => {
//         if (error.response.status === 401) {
//             Router.push("/login");
//         }
//         return Promise.reject(error);
//     }
// );

// ENDPOINTS
export default {
    auth: {
        login(payload) {
            /**
             * @apiParam {String} userID
             * @apiParam {String} password
             */
            // return rest.post("/Login", payload);
        },

        logout(payload) {
            /**
             * @apiParam {Object} session
             *
             */

            // return rest.post("/LogOut", payload);
        },

        validateToken(token) {
            /**
             * @apiParam {String} token
             *
             */
            // return rest.post("/ValidateToken", { token });
        },

        setImpersonatedLoanOfficer(session) {
            /**
             * @apiParam {object} session
             *
             */
            // return rest.post("/SetImpersonatedLO", session);
        }
    },
    leads: {
        // FETCH

        fetchLeadAnalytics() {
            /**
             * @apiParam None
             *
             */

            // return rest.post("/GetDailyLeadCount");
        },

        fetchLoanOfficerQueueData(encompassID) {
            /**
             * @desc polls for LO queue data to feed leads page updates
             * @apiParam {String} encompassID - identifies the LO to get queue data for.
             *
             */
            // return rest.post("/SyncLoanOfficerQueue", { encompassID });
        },

        convertToTimezone(payload) {
            const { timestamp, timezone } = payload;
            /**
             * @desc Request from endpoint on Ruoff API to convert a timestamp to user's timezone
             * @apiParam // TODO: get param list
             *
             */
            // return ruoffApiWithKey.get(`/datetime/v1/convertTimezone/${timestamp}/${timezone}`);
        },

        fetchCurrentDatetime(timezone) {
            /**
             * @desc Request from endpoint on Ruoff API to get non system time
             * @apiParam // TODO: get param list
             *
             */
            // return ruoffApiWithKey.get(`/datetime/v1/getDateTime/${timezone}`);
        },

        // UPDATE/INSERT

        updateSessionStartDateTime(session) {
            /**
             * @apiParam {Object} session - collection of key/values describing the session
             *
             */
            // return rest.post("/UpdateSessionData", session);
        },

        acceptOrDeclineLead(data) {
            /**
             * @apiParam {String} session object
             * @apiParam {String} loanNumber
             * @apiParam {Boolean} IsAccepted
             *
             */

            // return rest.post("/AcceptOrDenyLead", data);
        },

        addLoanOfficerToQueue(encompassID) {
            /**
             * @apiParam {String} encompassID - identifies the LO to add to queue.
             *
             */
            // return rest.post("/AddLoanOfficerToQueue", { encompassID });
        }
    },
    monitor: {
        // FETCH

        fetchAllZones() {
            /**
             * @apiParam None
             *
             */
            // return rest.post("/GetZones");
        },

        fetchLoanOfficersByZone(zone) {
            /**
             * @apiParam {Number} zoneNumber - 0 for all
             *
             */
            // return rest.post("/GetAllLoanOfficersByZone", { zone });
        },

        fetchZoneSessionsByZone(zone) {
            /**
             * @apiParam {Number} zone - 0 for all
             *
             */
            // return rest.post("/GetLoanOfficerQueueByZone", { zone });
        },

        fetchLeadsByZone(data) {
            /**
             * @apiParam {Number} zoneNumber - ID for zone.
             * @apiParam {String} from - YYYY/MM/DD start of date range filter.
             * @apiParam {String} to - YYYY/MM/DD end of date range filter.
             * @apiParam {bool} isClaimed - null for both assigned & unassigned
             *
             */
            // return rest.post("/GetAllLeads", data);
        },

        fetchLeadsWithErrors() {
            /**
             * @apiParam None
             *
             */

            // return rest.post("/GetAllZoneErrors");
        },

        fetchLeadsClaimedHistory(encompassID) {
            /**
             * @apiParam {String} encompassID - identifies the LO to get history for.
             *
             */
            // return rest.post("/GetClaimedLeadsByLoanOfficer", { encompassID });
        },

        fetchLeadHistory(data) {
            /**
             * @apiParam {String} from - YYYY/MM/DD start of date range filter.
             * @apiParam {String} to - YYYY/MM/DD end of date range filter.
             *
             */
            // return rest.post("/GetLeadHistory", data);
        },

        // UPDATE/INSERT

        updateLoanOfficerqueuePosition(data) {
            /**
             * @apiParam {String}   encompassID - ID for the loan officer.
             * @apiParam {Number}   Direction - (1 or -1) Direction to move the LO queue position.
             * @apiParam {Boolean}  ReturnAllZones - optional if returning all zones in response is desired
             *
             */
            // return rest.post("/UpdateLoanOfficerQueuePosition", data);
        },

        updateLead(data) {
            /**
             * @apiParam {Boolean}  isWebLead
             * @apiParam {Object}   lead - collection of key/values describing the lead.
             *
             */
            // return rest.post("/UpdateLeadInfo", data);
        },

        updateZoneQuota(zone, quota) {
            // return rest.post("/UpdateZoneQuota", { zone, quota });
        }
    }
};
