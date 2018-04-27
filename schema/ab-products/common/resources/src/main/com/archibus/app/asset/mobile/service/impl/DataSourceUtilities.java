package com.archibus.app.asset.mobile.service.impl;

import java.util.List;

import com.archibus.app.common.mobile.util.ServiceConstants;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * Utility class. Provides methods related with data sources for asset mobile services.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
final class DataSourceUtilities {
    
    /**
     * Constant: error message when the user name does not exists in afm_users table with matching
     * email.
     */
    static final String NO_USER_ACCOUNT_MESSAGE =
            "No ARCHIBUS User account exists for Performed By user [{0}] with the matching email.";
    
    /**
     * Hide default constructor.
     */
    private DataSourceUtilities() {
    }
    
    /**
     * Creates data source for eq_audit table.
     * 
     * @return an DataSource object
     */
    static DataSource createEquipmentAuditDatsource() {
        
        final DataSource datasource = DataSourceFactory.createDataSource();
        datasource.addTable(Constants.EQ_AUDIT_TABLE);
        
        datasource.addField(ServiceConstants.TRANSFER_STATUS);
        datasource.addField(ServiceConstants.SURVEY_ID);
        datasource.addField(ServiceConstants.MOB_LOCKED_BY);
        datasource.addField(Constants.MARKED_FOR_DELETION);
        
        final List<String> eqFieldsToSurvey =
                ImportExportUtilities.retrieveEquipmentFieldsToSurvey();
        for (int j = 0; j < eqFieldsToSurvey.size(); j++) {
            final String eqFieldToSurvey = eqFieldsToSurvey.get(j).toString();
            datasource.addField(eqFieldToSurvey);
        }
        return datasource;
    }
    
    /**
     * Creates equipment Data Source.
     * 
     * @return equipment data source
     */
    static DataSource createEquipmentDatasource() {
        
        final DataSource datasource = DataSourceFactory.createDataSource();
        datasource.addTable(Constants.EQ_TABLE);
        datasource.addField(Constants.EQ_ID);
        datasource.addField(ServiceConstants.BL_ID);
        datasource.addField(ServiceConstants.FL_ID);
        datasource.addField(ServiceConstants.RM_ID);
        datasource.addField(ServiceConstants.DV_ID);
        datasource.addField(ServiceConstants.DP_ID);
        datasource.addField(Constants.EM_ID);
        datasource.addField(ServiceConstants.STATUS);
        datasource.addField(ServiceConstants.SURVEY_ID);
        datasource.addField(Constants.EQ_STD);
        datasource.addField(Constants.SITE_ID);
        return datasource;
    }
    
    /**
     * Look up the afm_user.user_name (e.g. TRAM) for the employee (e.g. TRAM, WILL) in the
     * Performed by field.
     * 
     * @param performedBy the employee code in equipment survey's performed_by field
     * @return user name from afm_users table that matches the em_id
     */
    static String retrieveUserName(final String performedBy) {
        String userName = "";
        final String userEmail = retrieveUserEmail(performedBy);
        
        if (StringUtil.notNullOrEmpty(userEmail)) {
            final DataSource datasource = DataSourceFactory.createDataSource();
            datasource.addTable(Constants.AFM_USERS_TABLE);
            datasource.addField(Constants.USER_NAME);
            datasource.addField(Constants.EMAIL);
            datasource.addRestriction(new Restrictions.Restriction.Clause(
                Constants.AFM_USERS_TABLE, Constants.EMAIL, userEmail, Restrictions.OP_EQUALS));
            final DataRecord record = datasource.getRecord();
            if (record != null) {
                userName =
                        record.getString(Constants.AFM_USERS_TABLE + ServiceConstants.SQL_DOT
                                + Constants.USER_NAME);
            }
        }
        
        return userName;
    }
    
    /**
     * Look up the em.email (e.g. tran_will@archibus.com) for the employee (e.g. TRAM, WILL) in the
     * Performed by field.
     * 
     * @param performedBy the employee code in equipment survey's performed_by field
     * @return user email from em table that matches the em_id
     */
    static String retrieveUserEmail(final String performedBy) {
        String email = "";
        if (StringUtil.notNullOrEmpty(performedBy)) {
            final DataSource datasource = DataSourceFactory.createDataSource();
            datasource.addTable(Constants.EM_TABLE);
            datasource.addField(Constants.EM_ID);
            datasource.addField(Constants.EMAIL);
            datasource.addRestriction(new Restrictions.Restriction.Clause(Constants.EM_TABLE,
                Constants.EM_ID, performedBy, Restrictions.OP_EQUALS));
            final DataRecord record = datasource.getRecord();
            if (record != null) {
                email =
                        record.getString(Constants.EM_TABLE + ServiceConstants.SQL_DOT
                                + Constants.EMAIL);
            }
        }
        return email;
    }
}
