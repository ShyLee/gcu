package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Provides supporting methods related to synchronizing the data in the Other Costs tables. Supports
 * the MaintenanceMobileService class.
 * 
 * @author Constantine Kriezis
 * @since 21.1
 * 
 */
final class MaintenanceMobileCostsUpdate {
    
    /**
     * Hide default constructor.
     */
    private MaintenanceMobileCostsUpdate() {
    }
    
    /**
     * Creates data source for the work request costs table - wr_other.
     * 
     * @return wr_other data source
     */
    static DataSource createOtherCostDataSource() {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(Constant.WR_OTHER_TABLE, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.COST_ESTIMATED);
        datasource.addField(Constant.COST_TOTAL);
        datasource.addField(Constant.DATE_USED);
        datasource.addField(Constant.DESCRIPTION);
        datasource.addField(Constant.OTHER_RS_TYPE);
        datasource.addField(Constant.QTY_USED);
        datasource.addField(Constant.UNITS_USED);
        datasource.addField(Constant.WR_ID);
        
        return datasource;
    }
    
    /**
     * Creates data source for costs sync table - wr_other_sync.
     * 
     * @return wr_other_sync data source
     */
    static DataSource createOtherCostSyncDataSource() {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(Constant.WR_OTHER_SYNC_TABLE, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.COST_ESTIMATED);
        datasource.addField(Constant.COST_TOTAL);
        datasource.addField(Constant.DATE_USED);
        datasource.addField(Constant.DESCRIPTION);
        datasource.addField(Constant.OTHER_RS_TYPE);
        datasource.addField(Constant.QTY_USED);
        datasource.addField(Constant.UNITS_USED);
        datasource.addField(Constant.WR_ID);
        
        datasource.addField(Constant.AUTO_NUMBER);
        datasource.addField(Constant.MOB_LOCKED_BY);
        
        return datasource;
    }
    
    /**
     * Create work request cost records from the cost sync table.
     * 
     * @param wrId - Work Request Code
     * @param mobWrId - Mobile Work Request Code
     */
    static void createOtherCostRecords(final int wrId, final int mobWrId) {
        final DataSource datasource = createOtherCostSyncDataSource();
        
        datasource.addRestriction(Restrictions.eq(Constant.WR_OTHER_SYNC_TABLE, Constant.MOB_WR_ID,
            mobWrId));
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            insertOtherCostRecord(record, wrId);
        }
    }
    
    /**
     * Update the work request cost records from the cost sync table.
     * 
     * @param wrId - Work Request Code
     */
    static void updateCostRecords(final int wrId) {
        final DataSource costSyncDs = createOtherCostSyncDataSource();
        
        costSyncDs.addRestriction(Restrictions.eq(Constant.WR_OTHER_SYNC_TABLE, Constant.WR_ID,
            wrId));
        
        final List<DataRecord> records = costSyncDs.getRecords();
        
        // Go through all the cost sync records for this work request
        for (final DataRecord costSyncRecord : records) {
            
            // Check if there is a corresponding cost record
            final DataSource costDs = createOtherCostDataSource();
            
            costDs.addRestriction(Restrictions.eq(Constant.WR_OTHER_TABLE, Constant.WR_ID, wrId));
            
            costDs.addRestriction(Restrictions.eq(
                Constant.WR_OTHER_TABLE,
                Constant.DATE_USED,
                costSyncRecord.getDate(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                        + Constant.DATE_USED)));
            
            costDs.addRestriction(Restrictions.eq(
                Constant.WR_OTHER_TABLE,
                Constant.OTHER_RS_TYPE,
                costSyncRecord.getString(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                        + Constant.OTHER_RS_TYPE)));
            
            // Get any cost record that meets the restriction
            final DataRecord costRecord = costDs.getRecord();
            
            // If there is no cost record insert a new one, else update the existing one
            if (costRecord == null) {
                insertOtherCostRecord(costSyncRecord, wrId);
            } else {
                final DataRecord updateRecord = updateCostRecord(costSyncRecord, costRecord);
                
                costDs.saveRecord(updateRecord);
                
                // TODO (VT) Why commit?
                costDs.commit();
            }
        }
    }
    
    /**
     * Create new work request cost records from the cost sync table.
     * 
     * @param wrId - Work Request Code
     * @param cfUser - User name of craftsperson
     */
    static void createOtherCostSyncRecords(final int wrId, final String cfUser) {
        final DataSource datasource = createOtherCostDataSource();
        
        datasource.addRestriction(Restrictions.eq(Constant.WR_OTHER_TABLE, Constant.WR_ID, wrId));
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            insertOtherCostSyncRecord(record, wrId, cfUser);
        }
    }
    
    /**
     * Insert a work request cost record from a cost sync record.
     * 
     * @param record - Other Cost Sync record
     * @param wrId - Work Request Code
     */
    static void insertOtherCostRecord(final DataRecord record, final int wrId) {
        final DataSource datasource = createOtherCostDataSource();
        
        final DataRecord newRecord = datasource.createNewRecord();
        
        newRecord
            .setValue(
                Constant.WR_OTHER_TABLE + Constant.DOT + Constant.COST_ESTIMATED,
                record.getDouble(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                        + Constant.COST_ESTIMATED));
        
        newRecord.setValue(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.COST_TOTAL,
            record.getDouble(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.COST_TOTAL));
        
        newRecord.setValue(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.DATE_USED,
            record.getDate(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.DATE_USED));
        
        newRecord.setValue(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.DESCRIPTION,
            record.getString(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.DESCRIPTION));
        
        newRecord.setValue(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.OTHER_RS_TYPE,
            record.getString(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.OTHER_RS_TYPE));
        
        newRecord.setValue(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.QTY_USED,
            record.getDouble(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.QTY_USED));
        
        newRecord.setValue(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.UNITS_USED,
            record.getString(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.UNITS_USED));
        
        newRecord.setValue(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.WR_ID, wrId);
        
        datasource.saveRecord(newRecord);
        
        // TODO (VT) Why commit?
        datasource.commit();
    }
    
    /**
     * Update a work request cost record from a cost sync record.
     * 
     * @param costSyncRecord - Cost Sync record
     * @param costRecord - Cost record
     * @return costRecord - Cost record
     */
    static DataRecord updateCostRecord(final DataRecord costSyncRecord, final DataRecord costRecord) {
        
        // Only update secondary fields
        costRecord.setValue(
            Constant.WR_OTHER_TABLE + Constant.DOT + Constant.DESCRIPTION,
            costSyncRecord.getString(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                    + Constant.DESCRIPTION));
        
        costRecord.setValue(
            Constant.WR_OTHER_TABLE + Constant.DOT + Constant.UNITS_USED,
            costSyncRecord.getString(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                    + Constant.UNITS_USED));
        
        costRecord.setValue(
            Constant.WR_OTHER_TABLE + Constant.DOT + Constant.QTY_USED,
            costSyncRecord.getDouble(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                    + Constant.QTY_USED));
        
        costRecord.setValue(
            Constant.WR_OTHER_TABLE + Constant.DOT + Constant.COST_TOTAL,
            costSyncRecord.getDouble(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                    + Constant.COST_TOTAL));
        
        costRecord.setValue(
            Constant.WR_OTHER_TABLE + Constant.DOT + Constant.COST_ESTIMATED,
            costSyncRecord.getDouble(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT
                    + Constant.COST_ESTIMATED));
        
        return costRecord;
    }
    
    /**
     * Insert a cost sync record from a cost record.
     * 
     * @param record - Cost record
     * @param wrId - Work Request Code
     * @param cfUser - User name of craftsperson
     */
    static void insertOtherCostSyncRecord(final DataRecord record, final int wrId,
            final String cfUser) {
        final DataSource datasource = createOtherCostSyncDataSource();
        
        final DataRecord newRecord = datasource.createNewRecord();
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.COST_ESTIMATED,
            record.getDouble(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.COST_ESTIMATED));
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.COST_TOTAL,
            record.getDouble(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.COST_TOTAL));
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.DATE_USED,
            record.getDate(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.DATE_USED));
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.DESCRIPTION,
            record.getString(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.DESCRIPTION));
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.OTHER_RS_TYPE,
            record.getString(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.OTHER_RS_TYPE));
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.QTY_USED,
            record.getDouble(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.QTY_USED));
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.UNITS_USED,
            record.getString(Constant.WR_OTHER_TABLE + Constant.DOT + Constant.UNITS_USED));
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.WR_ID, wrId);
        
        newRecord.setValue(Constant.WR_OTHER_SYNC_TABLE + Constant.DOT + Constant.MOB_LOCKED_BY,
            cfUser);
        
        datasource.saveRecord(newRecord);
        
        // TODO (VT) Why commit?
        datasource.commit();
    }
}