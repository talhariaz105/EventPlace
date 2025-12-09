"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRights = exports.roles = void 0;
const capa_role_1 = require("./modulesRole/capa.role");
const risk_role_1 = require("./modulesRole/risk.role");
const audit_role_1 = require("./modulesRole/audit.role");
const allRoles = {
    admin: [
        'getUsers',
        'manageCapa',
        'buySubscription',
        'getSubscriptions',
        'manageUsers',
        'manageSites',
        'manageProcesses',
        'getWorkspaceById',
        ...capa_role_1.capaadminRoles,
        ...risk_role_1.RiskadminRoles,
        ...audit_role_1.AuditadminRoles,
        'updateNotificationSetting',
        'getNotificationSetting',
        'updateApprovalStatus',
        'updateStatusByManager',
        'getCustomFields',
        'getCustomFieldRequests',
        'getCustomFieldDeletedRequests',
        'createCustomField',
        'updateCustomField',
        'deleteCustomField',
        'approveCustomField',
        'deleteCustomFieldByAdmin',
    ],
    workspaceUser: {
        view: [
            'getWorkspaceById',
            ...capa_role_1.capaView,
            ...risk_role_1.RiskViewer,
            ...audit_role_1.AuditViewer,
            'updateNotificationSetting',
            'getNotificationSetting',
            'updateApprovalStatus',
            'updateStatusByManager',
            'getCustomFields',
            'getCustomFieldRequests',
            'getCustomFieldDeletedRequests',
            'createCustomField',
            'updateCustomField',
            'deleteCustomField',
            'approveCustomField',
            'deleteCustomFieldByAdmin',
            'deletePlan',
            'updatePlan',
            'getWorkspacePlans',
            'getLibraryPlans',
            'getPlan',
            'createPlan',
        ],
        edit: [
            'getWorkspaceById',
            ...capa_role_1.capaEdit,
            ...risk_role_1.RiskEditer,
            ...audit_role_1.AuditEditer,
            'updateNotificationSetting',
            'getNotificationSetting',
            'updateApprovalStatus',
            'updateStatusByManager',
            'getCustomFields',
            'getCustomFieldRequests',
            'getCustomFieldDeletedRequests',
            'createCustomField',
            'updateCustomField',
            'deleteCustomField',
            'approveCustomField',
            'deleteCustomFieldByAdmin',
            'deletePlan',
            'updatePlan',
            'getWorkspacePlans',
            'getLibraryPlans',
            'getPlan',
            'createPlan',
        ],
    },
};
exports.roles = Object.keys(allRoles);
// Normalize allRoles so that each role maps to a string[]
const normalizedRoleRights = [];
for (const [role, rights] of Object.entries(allRoles)) {
    if (Array.isArray(rights)) {
        normalizedRoleRights.push([role, rights]);
    }
    else if (typeof rights === 'object' && rights !== null) {
        for (const [subRole, subRights] of Object.entries(rights)) {
            normalizedRoleRights.push([subRole, subRights]);
        }
    }
}
exports.roleRights = new Map(normalizedRoleRights);
