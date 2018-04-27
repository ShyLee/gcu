package com.archibus.app.asset.mobile.service.impl;

import com.archibus.app.common.mobile.util.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Utility class. Provides supporting methods for retrieving restrictions for eq and eq_audit table.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
// TODO avoid SQL - use parsed restriction
final class RestrictionUtilities {
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private RestrictionUtilities() {
    }
    
    /**
     * Composes a restriction based on values for the primary key fields (survey_id, eq_id) for
     * table eq_audit.
     * 
     * @param surveyId survey code to set the restriction on
     * @param equipmentId equipment code to set the restriction on
     * 
     * @return restriction string.
     */
    static String composeEquipmentAuditPrimaryKeysRestriction(final String surveyId,
            final String equipmentId) {
        String primaryKeyRestriction =
                ServiceUtilities.composeFieldRestriction("", Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        primaryKeyRestriction =
                ServiceUtilities.composeFieldRestriction(primaryKeyRestriction,
                    Constants.EQ_AUDIT_TABLE, Constants.EQ_ID, equipmentId);
        return primaryKeyRestriction;
    }
    
    /**
     * Compose the restriction for eq_audit table.
     * 
     * @param equipmentRecord equipment record data record used to get the restriction values
     * @param primaryKeyRestriction primary key restriction
     * @param userName the user name of eq_audit.em_id value.
     * 
     * @return restriction string
     */
    static String composeEquipmentAuditRestriction(final DataRecord equipmentRecord,
            final String primaryKeyRestriction, final String userName) {
        
        final String buildingId =
                equipmentRecord.getString(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.BL_ID);
        final String floorId =
                equipmentRecord.getString(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.FL_ID);
        final String roomId =
                equipmentRecord.getString(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.RM_ID);
        final String divisionId =
                equipmentRecord.getString(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.DV_ID);
        final String departmentId =
                equipmentRecord.getString(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.DP_ID);
        final String status =
                equipmentRecord.getString(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.STATUS);
        
        // restriction on all fields
        String allRestrictions =
                ServiceUtilities.composeFieldRestriction(primaryKeyRestriction,
                    Constants.EQ_AUDIT_TABLE, ServiceConstants.BL_ID, buildingId);
        allRestrictions =
                ServiceUtilities.composeFieldRestriction(allRestrictions, Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.FL_ID, floorId);
        allRestrictions =
                ServiceUtilities.composeFieldRestriction(allRestrictions, Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.RM_ID, roomId);
        allRestrictions =
                ServiceUtilities.composeFieldRestriction(allRestrictions, Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.DV_ID, divisionId);
        allRestrictions =
                ServiceUtilities.composeFieldRestriction(allRestrictions, Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.DP_ID, departmentId);
        allRestrictions =
                ServiceUtilities.composeFieldRestriction(allRestrictions, Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.STATUS, status);
        allRestrictions =
                ServiceUtilities.composeFieldRestriction(allRestrictions, Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.MOB_LOCKED_BY, userName);
        
        return allRestrictions;
    }
}
