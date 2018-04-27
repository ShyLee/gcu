package com.archibus.app.space.mobile.service.impl;

import java.util.List;

import com.archibus.app.common.mobile.util.ServiceConstants;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 * Utility class. Provides methods related with data sources for space book mobile services.
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
final class DataSourceUtilities {
    /**
     * Hide default constructor - should never be instantiated.
     */
    private DataSourceUtilities() {
    }
    
    /**
     * Creates data source for surveymob_sync table.
     * 
     * @return surveymob_sync data source
     */
    static DataSource createMobileSynDatasource() {
        
        final DataSource datasource = DataSourceFactory.createDataSource();
        datasource.addTable(Constants.SURVEY_MOB_SYNC_TABLE);
        
        datasource.addField(Constants.AUTO_NUMBER);
        datasource.addField(ServiceConstants.SURVEY_ID);
        datasource.addField(ServiceConstants.SURVEY_DATE);
        datasource.addField(ServiceConstants.DESCRIPTION);
        datasource.addField(ServiceConstants.MOB_LOCKED_BY);
        datasource.addField(ServiceConstants.TRANSFER_STATUS);
        datasource.addField(ServiceConstants.STATUS);
        
        return datasource;
    }
    
    /**
     * Creates Data Source for surveyrm_sync table.
     * 
     * @return surveyrm_sync data source
     */
    static DataSource createRoomSyncDatsource() {
        
        final DataSource datasource = DataSourceFactory.createDataSource();
        datasource.addTable(Constants.SURVEY_RM_SYNC_TABLE);
        
        datasource.addField(ServiceConstants.SURVEY_ID);
        datasource.addField(ServiceConstants.BL_ID);
        datasource.addField(ServiceConstants.FL_ID);
        datasource.addField(ServiceConstants.RM_ID);
        datasource.addField(ServiceConstants.DV_ID);
        datasource.addField(ServiceConstants.DP_ID);
        
        datasource.addField(Constants.PRORATE);
        datasource.addField(Constants.RM_CAT);
        datasource.addField(Constants.RM_STD);
        datasource.addField(Constants.RM_TYPE);
        datasource.addField(Constants.NAME);
        datasource.addField(Constants.RM_USE);
        
        datasource.addField(ServiceConstants.TRANSFER_STATUS);
        datasource.addField(ServiceConstants.MOB_LOCKED_BY);
        return datasource;
    }
    
    /**
     * Creates Data Source for rm table.
     * 
     * @return room data source
     */
    static DataSource createRoomDatsource() {
        
        final DataSource datasource = DataSourceFactory.createDataSource();
        datasource.addTable(Constants.RM_TABLE);
        
        datasource.addField(ServiceConstants.BL_ID);
        datasource.addField(ServiceConstants.FL_ID);
        datasource.addField(ServiceConstants.RM_ID);
        datasource.addField(ServiceConstants.DV_ID);
        datasource.addField(ServiceConstants.DP_ID);
        datasource.addField(Constants.PRORATE);
        datasource.addField(Constants.RM_CAT);
        datasource.addField(Constants.RM_STD);
        datasource.addField(Constants.RM_TYPE);
        datasource.addField(Constants.NAME);
        datasource.addField(Constants.RM_USE);
        datasource.addField(ServiceConstants.TRANSFER_STATUS);
        return datasource;
    }
    
    /**
     * Copies all rooms' records from rm table to mobile sync survey table (surveyrm_sync). Copies
     * all common fields between the two tables, namely: bl_id, fl_id, rm_id, dv_id, dp_id, rm_cat,
     * rm_std, prorate, status, rm_use, name. Sets the surveyrm_sync.survey_id to the given value
     * for each room.
     * 
     * @param roomSyncDatasource mobile sync survey datasource with all common fields.
     * @param surveyId survey code
     * @param userName the mobile user name validated from afm_users.user_name table
     * @param buildingId building code
     * @param floorId floor code
     */
    static void copyRoomsToSyncTable(final DataSource roomSyncDatasource, final String surveyId,
            final String userName, final String buildingId, final String floorId) {
        final DataSource roomDatasource = DataSourceUtilities.createRoomDatsource();
        final String roomRestriction =
                RestrictionUtilities.composeRoomRestriction(buildingId, floorId, "");
        final List<DataRecord> roomRecords = roomDatasource.getRecords(roomRestriction);
        if (roomRecords != null && !roomRecords.isEmpty()) {
            for (int i = 0; i < roomRecords.size(); i++) {
                final DataRecord roomRecord = roomRecords.get(i);
                final DataRecord roomSyncRecord = roomSyncDatasource.createNewRecord();
                roomSyncRecord.setValue(Constants.SURVEY_RM_SYNC_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.SURVEY_ID, surveyId);
                roomSyncRecord.setValue(Constants.SURVEY_RM_SYNC_TABLE + ServiceConstants.SQL_DOT
                        + ServiceConstants.MOB_LOCKED_BY, userName);
                importFieldValue(roomRecord, roomSyncRecord, ServiceConstants.BL_ID);
                importFieldValue(roomRecord, roomSyncRecord, ServiceConstants.FL_ID);
                importFieldValue(roomRecord, roomSyncRecord, ServiceConstants.RM_ID);
                importFieldValue(roomRecord, roomSyncRecord, ServiceConstants.DV_ID);
                importFieldValue(roomRecord, roomSyncRecord, ServiceConstants.DP_ID);
                importFieldValue(roomRecord, roomSyncRecord, Constants.PRORATE);
                importFieldValue(roomRecord, roomSyncRecord, Constants.RM_CAT);
                importFieldValue(roomRecord, roomSyncRecord, Constants.RM_TYPE);
                importFieldValue(roomRecord, roomSyncRecord, Constants.RM_STD);
                importFieldValue(roomRecord, roomSyncRecord, Constants.NAME);
                importFieldValue(roomRecord, roomSyncRecord, Constants.RM_USE);
                importFieldValue(roomRecord, roomSyncRecord, ServiceConstants.TRANSFER_STATUS);
                roomSyncDatasource.saveRecord(roomSyncRecord);
                roomSyncDatasource.commit();
            }
        }
    }
    
    /**
     * Deletes from the surveyrm_sync table any records that already exist for that survey_id,
     * bl_id, fl_id. (Typically there should be none.)
     * 
     * @param roomSyncDatasource mobile sync survey datasource with all common fields.
     * @param surveyId survey code
     * @param buildingId building code
     * @param floorId floor code
     */
    static void clearRoomSyncRecords(final DataSource roomSyncDatasource, final String surveyId,
            final String buildingId, final String floorId) {
        final String restriction =
                RestrictionUtilities.composeRoomSyncRestriction(surveyId, buildingId, floorId);
        
        final List<DataRecord> roomSyncRecords = roomSyncDatasource.getRecords(restriction);
        if (roomSyncRecords != null && !roomSyncRecords.isEmpty()) {
            for (int i = 0; i < roomSyncRecords.size(); i++) {
                final DataRecord roomSyncRecord = roomSyncRecords.get(i);
                roomSyncDatasource.deleteRecord(roomSyncRecord);
                roomSyncDatasource.commit();
            }
        }
    }
    
    /**
     * Copy the field value from room (rm) table to the room sync (surveyrm_sync) table for the
     * specified field.
     * 
     * @param roomRecord the record from room table
     * @param roomSyncRecord the record from room sync table (surveyrm_sync)
     * @param field the field to copy
     */
    static void importFieldValue(final DataRecord roomRecord, final DataRecord roomSyncRecord,
            final String field) {
        final String roomSyncField =
                Constants.SURVEY_RM_SYNC_TABLE + ServiceConstants.SQL_DOT + field;
        final String roomField = Constants.RM_TABLE + ServiceConstants.SQL_DOT + field;
        final String roomValue = roomRecord.getString(roomField);
        if (StringUtil.notNullOrEmpty(roomValue)) {
            roomSyncRecord.setValue(roomSyncField, roomValue);
        }
    }
    
    /**
     * Copy the field value from room sync(surveyrm_sync) table to the room (rm) table for the
     * specified field.
     * 
     * @param roomRecord the record from room table
     * @param roomSyncRecord the record from room sync table (surveyrm_sync)
     * @param field the field to copy
     */
    static void exportFieldValue(final DataRecord roomRecord, final DataRecord roomSyncRecord,
            final String field) {
        final String roomSyncField =
                Constants.SURVEY_RM_SYNC_TABLE + ServiceConstants.SQL_DOT + field;
        final String roomField = Constants.RM_TABLE + ServiceConstants.SQL_DOT + field;
        final Object roomSyncValue = roomSyncRecord.getValue(roomSyncField);
        roomRecord.setValue(roomField, StringUtil.notNull(roomSyncValue));
    }
    
}
