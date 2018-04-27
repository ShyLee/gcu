package com.archibus.app.asset.mobile.service.impl;

import java.util.*;
import java.util.Map.Entry;

import com.archibus.app.common.mobile.util.ServiceConstants;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.ext.importexport.common.*;
import com.archibus.ext.importexport.common.TransferStatusHelper.TRANS_STATUS;
import com.archibus.utility.*;

/**
 * Utilities for AssetMobileService.
 * <p>
 * Provides methods for exportEquipmentToSurvey and importSurveyToEquipment in AssetMobileService
 * class.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
final class ImportExportUtilities {
    /**
     * Hide default constructor for this utility class - should never be instantiated.
     */
    private ImportExportUtilities() {
    }
    
    /**
     * Retrieves the equipment records for specified restrictions.
     * 
     * @param datasource equipment data source
     * @param map the hash map of equipment fields and values.
     * @param surveyId survey code for equipment
     * @param equipmentId equipment code
     * @param equipmentStandard equipment standard
     * 
     * @return a list of equipments as DataRecord objects
     */
    static List<DataRecord> retrieveEquipmentRecords(final DataSource datasource,
            final Map<String, Object> map, final String surveyId, final String equipmentId,
            final String equipmentStandard) {
        
        final Iterator<Map.Entry<String, Object>> eqMapIterator = map.entrySet().iterator();
        while (eqMapIterator.hasNext()) {
            final Map.Entry<String, Object> pairs = eqMapIterator.next();
            final String key = StringUtil.notNull(pairs.getKey());
            final Object value = StringUtil.notNull(pairs.getValue());
            // skip the "marked_for_deletion" field since it does not exist in eq table
            if (StringUtil.notNullOrEmpty(value)
                    && key.compareToIgnoreCase(Constants.MARKED_FOR_DELETION) != 0) {
                datasource.addRestriction(Restrictions.eq(Constants.EQ_TABLE, key, value));
            }
        }
        
        if (StringUtil.notNullOrEmpty(surveyId)) {
            datasource.addRestriction(Restrictions.eq(Constants.EQ_TABLE,
                ServiceConstants.SURVEY_ID, surveyId));
        }
        
        if (StringUtil.notNullOrEmpty(equipmentId)) {
            datasource.addRestriction(Restrictions.eq(Constants.EQ_TABLE, Constants.EQ_ID,
                equipmentId));
        }
        
        if (StringUtil.notNullOrEmpty(equipmentStandard)) {
            datasource.addRestriction(Restrictions.eq(Constants.EQ_TABLE, Constants.EQ_STD,
                equipmentStandard));
        }
        
        // add the not null field restriction
        datasource.addRestriction(Restrictions.sql(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                + Constants.EQ_ID + Constants.IS_NOT_NULL));
        
        return datasource.getRecords();
        
    }
    
    /**
     * Composes equipment hash map of fields and values from an eq_audit record.
     * 
     * @param equipmentRecord the eq_audit record to get the value from.
     * 
     * @return a hash map of equipment's fields and values
     */
    static Map<String, Object> retrieveEquipmentMap(final DataRecord equipmentRecord) {
        final Map<String, Object> map = new HashMap<String, Object>();
        
        final List<String> eqFieldsToSurvey = retrieveEquipmentFieldsToSurvey();
        for (int j = 0; j < eqFieldsToSurvey.size(); j++) {
            final String eqFieldToSurvey = eqFieldsToSurvey.get(j).toString();
            map.put(
                eqFieldToSurvey,
                equipmentRecord.getValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + eqFieldToSurvey));
        }
        
        return map;
    }
    
    /**
     * Composes equipment hash map of fields and values from bl, fl, dv, dp code.
     * 
     * @param buildingId building code
     * @param floorId floor code
     * @param divisionId division code
     * @param departmentId department code
     * 
     * @return a hash map of equipment's fields and values
     */
    static Map<String, Object> composeEquipmentMap(final String buildingId, final String floorId,
            final String divisionId, final String departmentId) {
        final Map<String, Object> eqMap = new HashMap<String, Object>();
        
        eqMap.put(ServiceConstants.BL_ID, buildingId);
        eqMap.put(ServiceConstants.FL_ID, floorId);
        eqMap.put(ServiceConstants.DV_ID, divisionId);
        eqMap.put(ServiceConstants.DP_ID, departmentId);
        
        return eqMap;
    }
    
    /**
     * Retrieves Equipment Record for the specified eq_id.
     * 
     * @param dsEquipment equipment data source
     * @param equipmentId equipment code
     * 
     * @return an equipment data record
     */
    static DataRecord retrieveEquipmentRecord(final DataSource dsEquipment, final String equipmentId) {
        
        DataRecord equipmentRecord = null;
        
        if (StringUtil.notNullOrEmpty(equipmentId)) {
            dsEquipment.addRestriction(Restrictions.eq(Constants.EQ_TABLE, Constants.EQ_ID,
                equipmentId));
            equipmentRecord = dsEquipment.getRecord();
        }
        
        return equipmentRecord;
    }
    
    /**
     * Updates value for the list of equipment fields to survey in equipment audit tale.
     * 
     * @param equipmentAuditRecord the record of eq_audit to insert or update
     * @param equipmentId the equipment code
     * @param eqRecord the record of eq to import from
     */
    static void updateValuesForEqFieldsToSurvey(final DataRecord equipmentAuditRecord,
            final String equipmentId, final DataRecord eqRecord) {
        final List<String> eqFieldsToSurvey = retrieveEquipmentFieldsToSurvey();
        for (int j = 0; j < eqFieldsToSurvey.size(); j++) {
            final String eqFieldToSurvey = eqFieldsToSurvey.get(j).toString();
            // skip "marked_for_deletion" field since it does not exist in eq table
            // skip "survey_id" field since we alread set it
            if (StringUtil.notNullOrEmpty(eqFieldToSurvey)
                    && eqFieldToSurvey.compareToIgnoreCase(ServiceConstants.SURVEY_ID) != 0
                    && eqFieldToSurvey.compareToIgnoreCase(Constants.MARKED_FOR_DELETION) != 0) {
                equipmentAuditRecord.setValue(
                    Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT + eqFieldToSurvey,
                    StringUtil.notNull(eqRecord.getString(Constants.EQ_TABLE
                            + ServiceConstants.SQL_DOT + eqFieldToSurvey)));
            }
        }
    }
    
    /**
     * Retrieves the eq_audit.transfer_status field's value based on the specified restrictions.
     * 
     * @param datasource the data source for eq_audit table
     * @param record the equipment record used to compose the eq_audit restriction
     * @param restriction the primary key restriction for eq_audit table
     * @param userName the user name of eq_audit.em_id value.
     * 
     * @return the transfer status of "updated" or "no change"
     */
    static String retrieveEquipmentAuditTransferStatusValue(final DataSource datasource,
            final DataRecord record, final String restriction, final String userName) {
        Enum<TRANS_STATUS> transStatus = TRANS_STATUS.NO_CHANGE;
        
        final String allRestriction =
                RestrictionUtilities
                    .composeEquipmentAuditRestriction(record, restriction, userName);
        final DataRecord equipmentAuditRecordUpdate = datasource.getRecord(allRestriction);
        
        if (equipmentAuditRecordUpdate == null) {
            transStatus = TRANS_STATUS.UPDATED;
        }
        return transStatus.toString();
    }
    
    /**
     * Looks up the activity parameter for the equipment fields to survey.
     * 
     * @return a list of equipment fields to survey.
     */
    protected static List<String> retrieveEquipmentFieldsToSurvey() {
        final DataSource dsActivityParams = DataSourceFactory.createDataSource();
        dsActivityParams.addTable("afm_activity_params");
        dsActivityParams.addField("activity_id");
        dsActivityParams.addField("param_id");
        dsActivityParams.addField("param_value");
        
        // TODO avoid using SQL restrictions
        final String restriction =
                "afm_activity_params.activity_id" + ServiceConstants.OPERATOR_EQ
                        + Utility.sqlrMakeLiteral("AbAssetManagement") + ServiceConstants.SQL_AND
                        + "afm_activity_params.param_id" + ServiceConstants.OPERATOR_EQ
                        + Utility.sqlrMakeLiteral("EquipmentFieldsToSurvey");
        final DataRecord activityParamsRecord = dsActivityParams.getRecord(restriction);
        return Utility.stringToList(
            activityParamsRecord.getString("afm_activity_params.param_value"), ";");
    }
    
    /**
     * Adds Or updates equipment(s) from the survey table.
     * 
     * 1. Creates new Equipment (eq) table records for all new Equipment Survey Audit records
     * (eq_audit).
     * <p>
     * 2. Updates the existing Equipment records for changed Equipment Survey Audit records.
     * <p>
     * 3. If the Marked for Deletion? field is active (per the task above), then this action deletes
     * all items that are Marked for Deletion (eq_audit.marked_for_deletion) from the Equipment
     * table. If the field is not active, this action does not delete any records.
     * <p>
     * 4. When the action copies the Equipment Status field, the status will still reflect the
     * Equipment item's disposition (e.g. In Service, Out of Service, In Repair, Salvaged, Sold).
     * 
     * @param surveyId survey code
     * @param equipmentAuditDatasource data source of eq_audit table
     * @param equipmentAuditRecord an eq_audit record
     * 
     * @return true if adding or updating successful, false if failed.
     */
    static boolean addOrUpdateEquipment(final String surveyId,
            final DataSource equipmentAuditDatasource, final DataRecord equipmentAuditRecord) {
        
        final DataSource equipmentDatasource = DataSourceUtilities.createEquipmentDatasource();
        
        final Map<String, Object> equipmentMap =
                ImportExportUtilities.retrieveEquipmentMap(equipmentAuditRecord);
        final String equipmentId = StringUtil.notNull(equipmentMap.get(Constants.EQ_ID));
        
        // search by primary key to see if there is any existing record
        DataRecord equipmentRecord =
                ImportExportUtilities.retrieveEquipmentRecord(equipmentDatasource, equipmentId);
        
        final int markedForDeletion =
                equipmentAuditRecord.getInt(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + Constants.MARKED_FOR_DELETION);
        
        boolean needsUpdate = false;
        
        // do the add or update can not process because of errors?
        boolean succeeds = true;
        boolean isNew = false;
        
        if (equipmentRecord == null) {
            // create new record in eq only if we do not want to delete it from eq table
            if (markedForDeletion == 0) {
                needsUpdate = true;
                try {
                    equipmentRecord = equipmentDatasource.createNewRecord();
                    
                    isNew = true;
                } catch (final ExceptionBase e) {
                    equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.ERROR.toString());
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                    succeeds = false;
                }
            }
        } else {
            final List<DataRecord> equipmentRecords =
                    ImportExportUtilities.retrieveEquipmentRecords(equipmentDatasource,
                        equipmentMap, surveyId, equipmentId, "");
            if (equipmentRecords.isEmpty()) {
                // update record in eq
                needsUpdate = true;
            }
            
            // marked for deletion field is "yes"
            if (markedForDeletion == 1) {
                // no need to update
                needsUpdate = false;
                try {
                    equipmentDatasource.deleteRecord(equipmentRecord);
                    equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.MISSING.toString());
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                    
                } catch (final ExceptionBase e) {
                    equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.ERROR.toString());
                    equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                    succeeds = false;
                }
            }
        }
        
        if (needsUpdate) {
            try {
                updateEquipmentRecordValues(surveyId, equipmentRecord, equipmentMap);
                
                if (isNew) {
                    equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.INSERTED.toString());
                } else {
                    equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.TRANSFER_STATUS,
                        TransferStatusHelper.TRANS_STATUS.UPDATED.toString());
                }
                
                // update the equipment record
                equipmentDatasource.saveRecord(equipmentRecord);
            } catch (final ExceptionBase e) {
                // if there is error updating, change the transfer status field to error in
                // equipment audit's corresponding record.
                equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.ERROR.toString());
                equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
                succeeds = false;
            }
        } else {
            equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                    + ServiceConstants.TRANSFER_STATUS,
                TransferStatusHelper.TRANS_STATUS.NO_CHANGE.toString());
        }
        return succeeds;
    }
    
    /**
     * update equipment record values to the related values from equipment map.
     * 
     * @param surveyId the survey code
     * @param equipmentRecord the record to be update.
     * @param equipmentMap the map to retrieve the values from.
     */
    private static void updateEquipmentRecordValues(final String surveyId,
            final DataRecord equipmentRecord, final Map<String, Object> equipmentMap) {
        
        final Iterator<Entry<String, Object>> iterator = equipmentMap.entrySet().iterator();
        while (iterator.hasNext()) {
            final Map.Entry<String, Object> pairs = iterator.next();
            final String key = pairs.getKey();
            // skip the "marked_for_deletion" field since it does not exist in eq table
            if (key.compareToIgnoreCase(Constants.MARKED_FOR_DELETION) != 0) {
                equipmentRecord.setValue(Constants.EQ_TABLE + ServiceConstants.SQL_DOT + key,
                    pairs.getValue());
            }
            
            // avoids a ConcurrentModificationException
            iterator.remove();
        }
        equipmentRecord.setValue(Constants.EQ_TABLE + ServiceConstants.SQL_DOT
                + ServiceConstants.SURVEY_ID, StringUtil.notNull(surveyId));
    }
    
    /**
     * Update the existing eq_audit record with the specified user name.
     * 
     * @param userName the user name to perform the survey
     * @param equipmentAuditDatasource eq_audit table datasource
     * @param equipmentAuditRecords records from eq_audit table
     */
    static void updateEquipmentAuditTable(final String userName,
            final DataSource equipmentAuditDatasource, final List<DataRecord> equipmentAuditRecords) {
        for (int i = 0; i < equipmentAuditRecords.size(); i++) {
            final DataRecord equipmentAuditRecord = equipmentAuditRecords.get(i);
            final String oldUserName =
                    StringUtil.notNull(equipmentAuditRecord.getString(Constants.EQ_AUDIT_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.MOB_LOCKED_BY));
            if (userName.compareToIgnoreCase(oldUserName) == 0) {
                equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.NO_CHANGE.toString());
            } else {
                // set the survey.em_id field
                equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.MOB_LOCKED_BY, userName);
                // set the survey.transfer_status field
                equipmentAuditRecord.setValue(Constants.EQ_AUDIT_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.TRANSFER_STATUS,
                    TransferStatusHelper.TRANS_STATUS.UPDATED.toString());
            }
            try {
                equipmentAuditDatasource.saveRecord(equipmentAuditRecord);
            } catch (final ExceptionBase e) {
                // TODO comment needed - why do you ignore exception?
                // go to next record
                // TODO why do you need continue?
                continue;
            }
        }
    }
    
}
