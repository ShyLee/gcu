package com.archibus.app.asset.mobile.service.impl;

import java.sql.Date;
import java.util.*;

import com.archibus.app.asset.mobile.service.IAssetMobileService;
import com.archibus.app.common.mobile.util.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.importexport.common.TransferStatusHelper;
import com.archibus.utility.*;

/**
 * Implementation of the Asset Management Workflow Rule Service for mobile asset survey application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbAssetManagement-AssetMobileService'.
 * <p>
 * Provides methods for synchronization between sync tables (survey, eq_audit) and inventory tables
 * (eq).
 * <p>
 * Invoked by web client or mobile client.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
public class AssetMobileService implements IAssetMobileService {
    
    /**
     * Constant: error message when the user name does not exists in afm_users table with matching
     * email.
     */
    static final String NO_USER_ACCOUNT_MESSAGE =
            "No ARCHIBUS User account exists for Performed By user [{0}] with the matching email.";
    
    /** {@inheritDoc} */
    // TODO Will performedBy be always the current user?
    public String createSurvey(final String surveyId, final Date surveyDate,
            final String performedBy, final String description) {
        final String userName = DataSourceUtilities.retrieveUserName(performedBy);
        
        if (StringUtil.notNullOrEmpty(userName)) {
            addOrUpdateSurveyRecord(surveyId, surveyDate, performedBy, description, null, true);
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(NO_USER_ACCOUNT_MESSAGE);
            exception.setTranslatable(true);
            exception.setArgs(new Object[] { performedBy });
            throw exception;
        }
        
        return userName;
    }
    
    /**
     * Add or Update the survey record.
     * 
     * @param surveyId survey code
     * @param surveyDate date of the survey
     * @param performedBy employee that the survey will be performed by
     * @param description description of the new or updated survey
     * @param status the survey status
     * @param newRecord true if adding, false if updating.
     */
    private void addOrUpdateSurveyRecord(final String surveyId, final Date surveyDate,
            final String performedBy, final String description, final String status,
            final boolean newRecord) {
        final DataSource datasource = DataSourceFactory.createDataSource();
        datasource.addTable(Constants.SURVEY_TABLE);
        datasource.addField(ServiceConstants.SURVEY_ID);
        datasource.addField(ServiceConstants.SURVEY_DATE);
        datasource.addField(Constants.EM_ID);
        datasource.addField(ServiceConstants.DESCRIPTION);
        datasource.addField(ServiceConstants.STATUS);
        
        DataRecord record = null;
        if (newRecord) {
            record = datasource.createNewRecord();
        } else {
            final String restriction =
                    ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_TABLE,
                        ServiceConstants.SURVEY_ID, surveyId);
            record = datasource.getRecord(restriction);
        }
        
        if (record != null) {
            record.setValue(Constants.SURVEY_TABLE + ServiceConstants.SQL_DOT
                    + ServiceConstants.SURVEY_ID, surveyId);
            record.setValue(Constants.SURVEY_TABLE + ServiceConstants.SQL_DOT
                    + ServiceConstants.SURVEY_DATE, surveyDate);
            record.setValue(Constants.SURVEY_TABLE + ServiceConstants.SQL_DOT + Constants.EM_ID,
                performedBy);
            record.setValue(Constants.SURVEY_TABLE + ServiceConstants.SQL_DOT
                    + ServiceConstants.DESCRIPTION, description);
            if (StringUtil.notNullOrEmpty(status)) {
                record.setValue(Constants.SURVEY_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.STATUS, status);
            }
            
            datasource.saveRecord(record);
        }
        // TODO else ?
    }
    
    /** {@inheritDoc} */
    public long importEquipmentToSurvey(final String surveyId, final String buildingId,
            final String floorId, final String divisionId, final String departmentId,
            final String userName, final String equipmentStandard) {
        final DataSource equipmentDatasource = DataSourceUtilities.createEquipmentDatasource();
        
        final Map<String, Object> equipmentMap =
                ImportExportUtilities.composeEquipmentMap(buildingId, floorId, divisionId,
                    departmentId);
        
        long numberOfRecords = 0;
        
        final List<DataRecord> equipmentRecords =
                ImportExportUtilities.retrieveEquipmentRecords(equipmentDatasource, equipmentMap,
                    "", "", equipmentStandard);
        if (!equipmentRecords.isEmpty()) {
            final DataSource equipmentAuditDatasource =
                    DataSourceUtilities.createEquipmentAuditDatsource();
            
            for (int i = 0; i < equipmentRecords.size(); i++) {
                final DataRecord equipmentRecord = equipmentRecords.get(i);
                final String equipmentId =
                        equipmentRecord.getString(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                                + Constants.EQ_ID);
                
                // restrict on primary keys
                final String restriction =
                        RestrictionUtilities.composeEquipmentAuditPrimaryKeysRestriction(surveyId,
                            equipmentId);
                DataRecord equipmentAuditRecord = equipmentAuditDatasource.getRecord(restriction);
                if (equipmentAuditRecord == null) {
                    equipmentAuditRecord = equipmentAuditDatasource.createNewRecord();
                }
                
                // set the required fields
                equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.SURVEY_ID, surveyId);
                
                // copy the afm_user.user_name value (e.g. TRAM) to the mob_locked_by field of the
                // eq_audit record assigned to this employee.
                equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.MOB_LOCKED_BY, userName);
                
                // the record has been updated to the same as the eq table
                equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.NO_CHANGE.toString());
                
                ImportExportUtilities.updateValuesForEqFieldsToSurvey(equipmentAuditRecord,
                    equipmentId, equipmentRecord);
                equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                
                numberOfRecords++;
            }
        }
        
        return numberOfRecords;
    }
    
    /** {@inheritDoc} */
    public void updateSurvey(final String surveyId, final Date surveyDate,
            final String performedBy, final String description, final String status) {
        // update the afm_user.user_name value (e.g. TRAM) to the mob_locked_by field of the
        // eq_audit record assigned to this employee.
        final String userName = DataSourceUtilities.retrieveUserName(performedBy);
        
        if (StringUtil.notNullOrEmpty(userName)) {
            addOrUpdateSurveyRecord(surveyId, surveyDate, performedBy, description, status, false);
            
            final DataSource equipmentAuditDatasource =
                    DataSourceUtilities.createEquipmentAuditDatsource();
            
            final String restriction =
                    ServiceUtilities.composeFieldRestriction("", Constants.EQ_AUDIT_TABLE,
                        ServiceConstants.SURVEY_ID, surveyId);
            
            final List<DataRecord> equipmentAuditRecords =
                    equipmentAuditDatasource.getRecords(restriction);
            if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
                ImportExportUtilities.updateEquipmentAuditTable(userName, equipmentAuditDatasource,
                    equipmentAuditRecords);
            }
            // TODO else ?
        } else {
            final ExceptionBase exception = new ExceptionBase();
            exception.setPattern(NO_USER_ACCOUNT_MESSAGE);
            exception.setTranslatable(true);
            exception.setArgs(new Object[] { performedBy });
            throw exception;
        }
    }
    
    /** {@inheritDoc} */
    public void closeSurvey(final String surveyId) {
        
        final DataSource surveyDatasource = DataSourceFactory.createDataSource();
        surveyDatasource.addTable(Constants.SURVEY_TABLE);
        surveyDatasource.addField(ServiceConstants.SURVEY_ID);
        surveyDatasource.addField(ServiceConstants.STATUS);
        
        final String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        final DataRecord surveyRecord = surveyDatasource.getRecord(restriction);
        if (surveyRecord != null) {
            surveyRecord.setValue(Constants.SURVEY_TABLE + ServiceConstants.SQL_DOT
                    + ServiceConstants.STATUS, ServiceConstants.COMPLETED);
            surveyDatasource.saveRecord(surveyRecord);
            
            exportSurveyToEquipment(surveyId);
        }
        // TODO else ?
    }
    
    /** {@inheritDoc} */
    public void exportSurveyToEquipment(final String surveyId) {
        final DataSource equipmentAuditDatasource =
                DataSourceUtilities.createEquipmentAuditDatsource();
        final String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        final List<DataRecord> equipmentAuditRecords =
                equipmentAuditDatasource.getRecords(restriction);
        if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
            for (int i = 0; i < equipmentAuditRecords.size(); i++) {
                final DataRecord equipmentAuditRecord = equipmentAuditRecords.get(i);
                final boolean succeeds =
                        ImportExportUtilities.addOrUpdateEquipment(surveyId,
                            equipmentAuditDatasource, equipmentAuditRecord);
                
                // clear the mob_locked_by field if update is successful
                if (succeeds) {
                    equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.MOB_LOCKED_BY, "");
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                }
                // TODO else ?
            }
        }
        
    }
    
    /** {@inheritDoc} */
    public void deleteSurvey(final String surveyId) {
        
        final DataSource surveyDatasource = DataSourceFactory.createDataSource();
        surveyDatasource.addTable(Constants.SURVEY_TABLE);
        surveyDatasource.addField(ServiceConstants.SURVEY_ID);
        
        String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        final DataRecord surveyRecord = surveyDatasource.getRecord(restriction);
        if (surveyRecord != null) {
            surveyDatasource.deleteRecord(surveyRecord);
        }
        // TODO else ?
        
        final DataSource equipmentAuditDatasource =
                DataSourceUtilities.createEquipmentAuditDatsource();
        restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.EQ_AUDIT_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        
        final List<DataRecord> equipmentAuditRecords =
                equipmentAuditDatasource.getRecords(restriction);
        if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
            for (int i = 0; i < equipmentAuditRecords.size(); i++) {
                final DataRecord equipmentAuditRecord = equipmentAuditRecords.get(i);
                equipmentAuditDatasource.deleteRecord(equipmentAuditRecord);
            }
        }
    }
    
    /** {@inheritDoc} */
    public void markSurveyCompleted(final String surveyId) {
        final DataSource surveyDatasource = DataSourceFactory.createDataSource();
        surveyDatasource.addTable(Constants.SURVEY_TABLE);
        surveyDatasource.addField(ServiceConstants.SURVEY_ID);
        surveyDatasource.addField(ServiceConstants.STATUS);
        
        String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        final DataRecord surveyRecord = surveyDatasource.getRecord(restriction);
        if (surveyRecord != null) {
            surveyRecord.setValue(Constants.SURVEY_TABLE + ServiceConstants.SQL_DOT
                    + ServiceConstants.STATUS, ServiceConstants.COMPLETED);
            surveyDatasource.saveRecord(surveyRecord);
            
            final DataSource equipmentAuditDatasource =
                    DataSourceUtilities.createEquipmentAuditDatsource();
            restriction =
                    ServiceUtilities.composeFieldRestriction("", Constants.EQ_AUDIT_TABLE,
                        ServiceConstants.SURVEY_ID, surveyId);
            final List<DataRecord> equipmentAuditRecords =
                    equipmentAuditDatasource.getRecords(restriction);
            if (equipmentAuditRecords != null && !equipmentAuditRecords.isEmpty()) {
                for (int i = 0; i < equipmentAuditRecords.size(); i++) {
                    final DataRecord equipmentAuditRecord = equipmentAuditRecords.get(i);
                    equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.MOB_LOCKED_BY, "");
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                }
            }
        }
        // TODO else ?
    }
}
