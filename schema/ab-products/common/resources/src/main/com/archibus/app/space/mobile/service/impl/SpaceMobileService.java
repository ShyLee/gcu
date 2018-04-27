package com.archibus.app.space.mobile.service.impl;

import java.util.List;

import org.json.JSONObject;

import com.archibus.app.common.mobile.util.*;
import com.archibus.app.space.mobile.service.ISpaceMobileService;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.datasource.data.DataRecord;
import com.archibus.security.UserAccount;
import com.archibus.utility.*;

/**
 * Implementation of the Space Room Inventory Mobile Management Workflow Rule Service for space book
 * mobile application.
 * <p>
 * Registered in the ARCHIBUS Workflow Rules table as 'AbSpaceRoomInventoryBAR-SpaceMobileService'.
 * <p>
 * Provides methods for synchronize and close space book survey and business logic for space book
 * survey.
 * <p>
 * Invoked by web or mobile client.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
// TODO why do you need commits?
// TODO why do you need continue?
// TODO do not swallow exceptions
public class SpaceMobileService implements ISpaceMobileService {
    
    /**
     * Constant: allowed security group.
     */
    static final String SECURITY_GROUP_SPAC_SURVEY_POST = "SPAC-SURVEY-POST";
    
    /**
     * Constant: error message when the user does not belong t the allowed security group.
     */
    static final String SECURITY_GROUP_MESSAGE =
            "Your account does not belong to the security group required to run this rule: [AbSpaceRoomInventoryBAR-SpaceMobileService-copyRoomsToSyncTable].";
    
    /**
     * Constant: the number of failed records.
     */
    private static final String NUMBER_OF_FAILED_RECORDS = "numberOfFailedRecords";
    
    /**
     * Constant: the "errorMessage" parameter returned to client.
     */
    private static final String ERROR_MESSAGE = "errorMessage";
    
    /** {@inheritDoc} */
    public void copyRoomsToSyncTable(final String surveyId, final String userName,
            final String buildingId, final String floorId) {
        
        // check if there is any existing record in surveymob_sync table
        final DataSource roomMobileDatasource = DataSourceUtilities.createMobileSynDatasource();
        final String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_MOB_SYNC_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        final List<DataRecord> roomMobileRecords = roomMobileDatasource.getRecords(restriction);
        
        // if there are records exists in surveymob_sync table
        if (StringUtil.notNullOrEmpty(surveyId) && roomMobileRecords != null
                && !roomMobileRecords.isEmpty()) {
            final DataSource roomSyncDatasource = DataSourceUtilities.createRoomSyncDatsource();
            
            // remove the room sync records from surveyrm_sync table
            DataSourceUtilities.clearRoomSyncRecords(roomSyncDatasource, surveyId, buildingId,
                floorId);
            
            // copy the record from room table to the room sync (surveyrm_sync) table
            DataSourceUtilities.copyRoomsToSyncTable(roomSyncDatasource, surveyId, userName,
                buildingId, floorId);
        }
    }
    
    /** {@inheritDoc} */
    // TODO avoid using JSON in business logic
    public JSONObject closeSurveyTable(final String surveyId) {
        
        final JSONObject result = new JSONObject();
        
        // check if the rule specifies the security group, and the user is a member of this group
        final UserAccount.Immutable userAccount =
                ContextStore.get().getUserSession().getUserAccount();
        
        // returns an error if the current user is not a member of the SPAC-SURVEY-POST Security
        // Group.
        if (userAccount.isMemberOfGroup(SECURITY_GROUP_SPAC_SURVEY_POST)) {
            // search for the records in the surveyrm_sync table that is assigned to
            // surveymob_sync.survey_id value.
            final DataSource roomSyncDatasource = DataSourceUtilities.createRoomSyncDatsource();
            final String roomSyncRestriction =
                    ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_RM_SYNC_TABLE,
                        ServiceConstants.SURVEY_ID, surveyId);
            List<DataRecord> roomSyncRecords = roomSyncDatasource.getRecords(roomSyncRestriction);
            
            copySyncRecordToRoomTable(roomSyncDatasource, roomSyncRecords);
            
            // try to get the room sync records in database again
            roomSyncRecords = roomSyncDatasource.getRecords(roomSyncRestriction);
            final DataSource roomMobileDatasource = DataSourceUtilities.createMobileSynDatasource();
            final String restriction =
                    ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_MOB_SYNC_TABLE,
                        ServiceConstants.SURVEY_ID, surveyId);
            final List<DataRecord> roomMobileRecords = roomMobileDatasource.getRecords(restriction);
            
            // transfer from rm sync table to room table is successful
            if (roomSyncRecords == null || roomSyncRecords.isEmpty()) {
                // delete the room mobile sync record.
                removeMobileSurvey(roomMobileDatasource, roomMobileRecords);
                result.put(NUMBER_OF_FAILED_RECORDS, 0);
            } else {
                // Marks the surveymob_sync.status as Completed
                updateMobileSurveyStatus(roomMobileDatasource, roomMobileRecords);
                result.put(NUMBER_OF_FAILED_RECORDS, roomMobileRecords.size());
            }
        } else {
            result.put(NUMBER_OF_FAILED_RECORDS, "-1");
            result.put(ERROR_MESSAGE, SECURITY_GROUP_MESSAGE);
        }
        
        return result;
    }
    
    /** {@inheritDoc} */
    public void deleteSurvey(final String surveyId) {
        
        final DataSource roomSyncDatasource = DataSourceUtilities.createRoomSyncDatsource();
        
        // delete the room mobile sync record.
        DataSourceUtilities.clearRoomSyncRecords(roomSyncDatasource, surveyId, "", "");
        
        final String roomSyncRestriction =
                ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_RM_SYNC_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        
        final List<DataRecord> roomSyncRecords = roomSyncDatasource.getRecords(roomSyncRestriction);
        if (roomSyncRecords == null || roomSyncRecords.isEmpty()) {
            removeMobileSurvey(surveyId);
        }
    }
    
    /**
     * loops through the survey mobile sync records and marks the surveymob_sync.status as
     * Completed.
     * 
     * @param roomMobileDatasource the survey mobile sync data source
     * @param roomMobileRecords the survey mobile sync records
     */
    // TODO Naming: consistency: why do you need "Mobile" in the method name?
    private void updateMobileSurveyStatus(final DataSource roomMobileDatasource,
            final List<DataRecord> roomMobileRecords) {
        for (int k = 0; k < roomMobileRecords.size(); k++) {
            final DataRecord roomMobileRecord = roomMobileRecords.get(k);
            roomMobileRecord.setValue(Constants.SURVEY_MOB_SYNC_TABLE + ServiceConstants.SQL_DOT
                    + ServiceConstants.STATUS, ServiceConstants.COMPLETED);
            try {
                roomMobileDatasource.saveRecord(roomMobileRecord);
                roomMobileDatasource.commit();
            } catch (final ExceptionBase e) {
                // might due to the record is locked - go to next record
                // TODO why continue?
                continue;
            }
        }
    }
    
    /**
     * loops through the survey mobile sync records and remove them from the survey mobile sync
     * table (surveymob_sync).
     * 
     * @param roomMobileDatasource the survey mobile sync data source
     * @param roomMobileRecords the survey mobile sync records
     */
    // TODO Naming: consistency: why do you need "Mobile" in the method name?
    private void removeMobileSurvey(final DataSource roomMobileDatasource,
            final List<DataRecord> roomMobileRecords) {
        for (int j = 0; j < roomMobileRecords.size(); j++) {
            final DataRecord roomMobileRecord = roomMobileRecords.get(j);
            try {
                roomMobileDatasource.deleteRecord(roomMobileRecord);
                // TODO why commit?
                roomMobileDatasource.commit();
            } catch (final ExceptionBase e) {
                // might due to the record is locked - go to next record
                // TODO why continue?
                continue;
            }
        }
    }
    
    /**
     * remove all the survey mobile sync records with the specified survey id from the
     * surveymob_sync table.
     * 
     * @param surveyId the survey code
     */
    // TODO Naming: consistency: why do you need "Mobile" in the method name?
    private void removeMobileSurvey(final String surveyId) {
        final DataSource roomMobileDatasource = DataSourceUtilities.createMobileSynDatasource();
        
        final String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_MOB_SYNC_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        final List<DataRecord> roomMobileRecords = roomMobileDatasource.getRecords(restriction);
        removeMobileSurvey(roomMobileDatasource, roomMobileRecords);
        
    }
    
    /**
     * Copies rooms sync records to room table.
     * 
     * For each record in the surveyrm_sync table that is assigned to surveymob_sync.survey_id
     * value: If the record exists in the rm table, update it by updating the non-pkey fields listed
     * above. Otherwise insert it. If the update or insert succeeds, delete the record from the
     * surveyrm_sync table.
     * 
     * @param roomSyncDatasource the room sync data source to copy from
     * @param roomSyncRecords the room sync records to copy
     */
    private void copySyncRecordToRoomTable(final DataSource roomSyncDatasource,
            final List<DataRecord> roomSyncRecords) {
        final DataSource roomDatasource = DataSourceUtilities.createRoomDatsource();
        // loop through all the room sync records
        for (int i = 0; roomSyncRecords != null && i < roomSyncRecords.size(); i++) {
            final DataRecord roomSyncRecord = roomSyncRecords.get(i);
            final String buildingId =
                    roomSyncRecord.getString(Constants.SURVEY_RM_SYNC_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.BL_ID);
            final String floorId =
                    roomSyncRecord.getString(Constants.SURVEY_RM_SYNC_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.FL_ID);
            final String roomId =
                    roomSyncRecord.getString(Constants.SURVEY_RM_SYNC_TABLE
                            + ServiceConstants.SQL_DOT + ServiceConstants.RM_ID);
            final String roomRestriction =
                    RestrictionUtilities.composeRoomRestriction(buildingId, floorId, roomId);
            try {
                DataRecord roomRecord = roomDatasource.getRecord(roomRestriction);
                // If the record does not exist in the rm table, create a new record with the
                // specified pks.
                if (roomRecord == null) {
                    // new record, does not exist in the room table
                    roomRecord = roomDatasource.createNewRecord();
                    DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord,
                        ServiceConstants.BL_ID);
                    DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord,
                        ServiceConstants.FL_ID);
                    DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord,
                        ServiceConstants.RM_ID);
                }
                // set all non-pk fields values
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord,
                    ServiceConstants.DV_ID);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord,
                    ServiceConstants.DP_ID);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord, Constants.PRORATE);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord, Constants.RM_CAT);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord, Constants.RM_TYPE);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord, Constants.RM_STD);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord, Constants.NAME);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord, Constants.RM_USE);
                DataSourceUtilities.exportFieldValue(roomRecord, roomSyncRecord,
                    ServiceConstants.TRANSFER_STATUS);
                
                // save the record
                roomDatasource.saveRecord(roomRecord);
                roomDatasource.commit();
                
                // If the update or insert succeeds, delete the record from the surveyrm_sync table
                roomSyncDatasource.deleteRecord(roomSyncRecord);
                roomSyncDatasource.commit();
                
            } catch (final ExceptionBase e) {
                // insert or update failed (usually due to validation error);
                // why swallow exception?
                // TODO why continue?
                continue;
            }
        }
    }
}
