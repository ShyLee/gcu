package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Provides supporting methods related to synchronizing the data in the parts tables. Supports the
 * MaintenanceMobileService class.
 * 
 * @author Constantine Kriezis
 * @since 21.1
 * 
 */
final class MaintenanceMobilePartsUpdate {
    
    /**
     * Hide default constructor.
     */
    private MaintenanceMobilePartsUpdate() {
    }
    
    /**
     * Creates the base data source for the parts table (pt).
     * 
     * @return datasource
     */
    static DataSource createPtDataSource() {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(Constant.PT_TABLE, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.PART_ID);
        datasource.addField(Constant.COST_UNIT_AVG);
        
        return datasource;
    }
    
    /**
     * Create the data source with the base fields for the parts or the parts sync table (wrpt or
     * wrpt_sync).
     * 
     * @param tableName - either wrpt or wrpt_sync
     * @return data source
     */
    static DataSource createPartBaseDataSource(final String tableName) {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(tableName, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.COMMENTS);
        datasource.addField(Constant.COST_ACTUAL);
        datasource.addField(Constant.COST_ESTIMATED);
        datasource.addField(Constant.DATE_ASSIGNED);
        datasource.addField(Constant.PART_ID);
        datasource.addField(Constant.QTY_ACTUAL);
        datasource.addField(Constant.QTY_ESTIMATED);
        datasource.addField(Constant.QTY_PICKED);
        datasource.addField(Constant.STATUS);
        datasource.addField(Constant.TIME_ASSIGNED);
        datasource.addField(Constant.WR_ID);
        
        return datasource;
    }
    
    /**
     * Create the data source for the parts sync table.
     * 
     * @return wrpt_sync data source
     */
    static DataSource createPartSyncDataSource() {
        final DataSource datasource = createPartBaseDataSource(Constant.WRPT_SYNC_TABLE);
        
        datasource.addField(Constant.AUTO_NUMBER);
        datasource.addField(Constant.MOB_LOCKED_BY);
        
        return datasource;
    }
    
    /**
     * Create new part records from the part sync table.
     * 
     * @param wrId - Work Request Code
     * @param mobWrId - Mobile Work Request Code
     */
    static void createPartRecords(final int wrId, final int mobWrId) {
        final DataSource datasource = createPartSyncDataSource();
        
        datasource.addRestriction(Restrictions.eq(Constant.WRPT_SYNC_TABLE, Constant.MOB_WR_ID,
            mobWrId));
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            insertPartRecord(record, wrId);
        }
    }
    
    /**
     * Update part records from the part sync table.
     * 
     * @param wrId - Work Request Code
     */
    static void updatePartRecords(final int wrId) {
        final DataSource partSyncDs = createPartSyncDataSource();
        
        partSyncDs.addRestriction(Restrictions.eq(Constant.WRPT_SYNC_TABLE, Constant.WR_ID, wrId));
        
        final List<DataRecord> records = partSyncDs.getRecords();
        
        // Go through all the part sync records for this work request
        for (final DataRecord partSyncRecord : records) {
            
            final DataSource partDs = createPartBaseDataSource(Constant.WRPT_TABLE);
            
            partDs.addRestriction(Restrictions.eq(Constant.WRPT_TABLE, Constant.WR_ID, wrId));
            
            partDs.addRestriction(Restrictions.eq(Constant.WRPT_TABLE, Constant.PART_ID,
                partSyncRecord
                    .getString(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.PART_ID)));
            
            partDs.addRestriction(Restrictions.eq(
                Constant.WRPT_TABLE,
                Constant.DATE_ASSIGNED,
                partSyncRecord.getDate(Constant.WRPT_SYNC_TABLE + Constant.DOT
                        + Constant.DATE_ASSIGNED)));
            
            partDs.addRestriction(Restrictions.eq(
                Constant.WRPT_TABLE,
                Constant.TIME_ASSIGNED,
                partSyncRecord.getValue(Constant.WRPT_SYNC_TABLE + Constant.DOT
                        + Constant.TIME_ASSIGNED)));
            
            // Get any part record that meets the restriction
            final DataRecord partRecord = partDs.getRecord();
            
            // If there is no corresponding part record insert a new one
            // If there is a corresponding part record update the fields with any new values
            if (partRecord == null) {
                insertPartRecord(partSyncRecord, wrId);
            } else {
                final DataRecord updateRecord = updatePartRecord(partSyncRecord, partRecord);
                
                partDs.saveRecord(updateRecord);
                
                // TODO (VT) Why commit?
                partDs.commit();
            }
        }
    }
    
    /**
     * Create new part sync records from the part table.
     * 
     * @param wrId - Work Request Code
     * @param cfUser - Craftsperson's User Name
     */
    static void createPartSyncRecords(final int wrId, final String cfUser) {
        final DataSource datasource = createPartBaseDataSource(Constant.WRPT_TABLE);
        
        datasource.addRestriction(Restrictions.eq(Constant.WRPT_TABLE, Constant.WR_ID, wrId));
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            insertPartSyncRecord(record, wrId, cfUser);
        }
    }
    
    /**
     * Insert part record from part sync record.
     * 
     * @param record - Part Sync Record
     * @param wrId - Work Request Code
     */
    static void insertPartRecord(final DataRecord record, final int wrId) {
        // Get the part code so we can get the part cost to calculate the costs when
        // inserting the part record
        final String partId =
                record.getString(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.PART_ID);
        
        // Get the part cost
        final double costUnitAvg = getPtCost(partId);
        
        final DataSource datasource = createPartBaseDataSource(Constant.WRPT_TABLE);
        
        final DataRecord newRecord = datasource.createNewRecord();
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.COMMENTS,
            record.getString(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.COMMENTS));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.COST_ACTUAL,
            record.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.COST_ACTUAL));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.COST_ESTIMATED,
            record.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.COST_ESTIMATED));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.DATE_ASSIGNED,
            record.getDate(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.DATE_ASSIGNED));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.PART_ID, partId);
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_ACTUAL,
            record.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_ACTUAL));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.COST_ACTUAL,
            record.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_ACTUAL)
                    * costUnitAvg);
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_ESTIMATED,
            record.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_ESTIMATED));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_PICKED,
            record.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_PICKED));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.STATUS,
            record.getString(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.STATUS));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.TIME_ASSIGNED,
            record.getValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.TIME_ASSIGNED));
        
        newRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.WR_ID, wrId);
        
        datasource.saveRecord(newRecord);
        
        // TODO (VT) Why commit?
        datasource.commit();
    }
    
    /**
     * Update part record from part sync record.
     * 
     * @param partSyncRecord - Part Sync record
     * @param partRecord - Part record
     * @return partRecord - Part record
     */
    static DataRecord updatePartRecord(final DataRecord partSyncRecord, final DataRecord partRecord) {
        // Get the part code so we can get the part cost to calculate the costs when
        // inserting the part record
        final String partId =
                partSyncRecord
                    .getString(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.PART_ID);
        
        // Get the part cost
        final double costUnitAvg = getPtCost(partId);
        
        // Only update secondary fields
        partRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.COMMENTS,
            partSyncRecord.getString(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.COMMENTS));
        
        partRecord
            .setValue(
                Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_ACTUAL,
                partSyncRecord.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT
                        + Constant.QTY_ACTUAL));
        
        partRecord.setValue(
            Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_ESTIMATED,
            partSyncRecord.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT
                    + Constant.QTY_ESTIMATED));
        
        partRecord
            .setValue(
                Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_PICKED,
                partSyncRecord.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT
                        + Constant.QTY_PICKED));
        
        // Calculate the parts cost by multiplying the number of parts used with the cost per unit
        partRecord.setValue(Constant.WRPT_TABLE + Constant.DOT + Constant.COST_ACTUAL,
            partSyncRecord.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_ACTUAL)
                    * costUnitAvg);
        
        partRecord.setValue(
            Constant.WRPT_TABLE + Constant.DOT + Constant.COST_ESTIMATED,
            partSyncRecord.getDouble(Constant.WRPT_SYNC_TABLE + Constant.DOT
                    + Constant.COST_ESTIMATED));
        
        return partRecord;
    }
    
    /**
     * Insert part sync record from part record.
     * 
     * @param record - Part Record
     * @param wrId - Work Request Code
     * @param cfUser - Craftsperson's User Name
     */
    static void insertPartSyncRecord(final DataRecord record, final Integer wrId,
            final String cfUser) {
        final DataSource datasource = createPartSyncDataSource();
        
        final DataRecord newRecord = datasource.createNewRecord();
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.COMMENTS,
            record.getString(Constant.WRPT_TABLE + Constant.DOT + Constant.COMMENTS));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.COST_ACTUAL,
            record.getDouble(Constant.WRPT_TABLE + Constant.DOT + Constant.COST_ACTUAL));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.COST_ESTIMATED,
            record.getDouble(Constant.WRPT_TABLE + Constant.DOT + Constant.COST_ESTIMATED));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.DATE_ASSIGNED,
            record.getDate(Constant.WRPT_TABLE + Constant.DOT + Constant.DATE_ASSIGNED));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.PART_ID,
            record.getString(Constant.WRPT_TABLE + Constant.DOT + Constant.PART_ID));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_ACTUAL,
            record.getDouble(Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_ACTUAL));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_ESTIMATED,
            record.getDouble(Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_ESTIMATED));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.QTY_PICKED,
            record.getDouble(Constant.WRPT_TABLE + Constant.DOT + Constant.QTY_PICKED));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.STATUS,
            record.getString(Constant.WRPT_TABLE + Constant.DOT + Constant.STATUS));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.TIME_ASSIGNED,
            record.getValue(Constant.WRPT_TABLE + Constant.DOT + Constant.TIME_ASSIGNED));
        
        newRecord.setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.WR_ID, wrId);
        
        newRecord
            .setValue(Constant.WRPT_SYNC_TABLE + Constant.DOT + Constant.MOB_LOCKED_BY, cfUser);
        
        datasource.saveRecord(newRecord);
        
        // TODO (VT) Why commit?
        datasource.commit();
    }
    
    /**
     * Get the Part's cost.
     * 
     * @param partId - Part Code
     * @return costUnitAvg - Part Cost
     */
    static double getPtCost(final String partId) {
        
        final DataSource ptdatasource = createPtDataSource();
        
        ptdatasource.addRestriction(Restrictions.eq(Constant.PT_TABLE, Constant.PART_ID, partId));
        
        final DataRecord partRecord = ptdatasource.getRecord();
        
        final Double costUnitAvg =
                partRecord.getDouble(Constant.PT_TABLE + Constant.DOT + Constant.COST_UNIT_AVG);
        
        return costUnitAvg;
    }
}