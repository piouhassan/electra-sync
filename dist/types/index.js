"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElectionStatus = exports.Role = void 0;
var Role;
(function (Role) {
    Role["ADMIN"] = "admin";
    Role["BOARD"] = "board";
    Role["VOTER"] = "voter";
})(Role || (exports.Role = Role = {}));
var ElectionStatus;
(function (ElectionStatus) {
    ElectionStatus["OPEN"] = "open";
    ElectionStatus["CLOSED"] = "closed";
    ElectionStatus["PENDING"] = "pending";
})(ElectionStatus || (exports.ElectionStatus = ElectionStatus = {}));
