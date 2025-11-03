"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateByLocation = void 0;
const date_fns_tz_1 = require("date-fns-tz");
const locationToTimezone = {
    'Jakarta': 'Asia/Jakarta',
    'Yogyakarta': 'Asia/Jakarta',
    'Bandung': 'Asia/Jakarta',
    'Surabaya': 'Asia/Jakarta',
};
const formatDateByLocation = (date, location) => {
    const timezone = locationToTimezone[location] || 'Asia/Jakarta';
    return (0, date_fns_tz_1.formatInTimeZone)(date, timezone, 'MM/dd/yyyy, h:mm:ss a');
};
exports.formatDateByLocation = formatDateByLocation;
