package com.archibus.app.helpdesk.mobile.maintenance.service.impl;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.Restrictions;

/**
 * Provides supporting methods related to synchronizing the data in the Labor tables. Supports the
 * MaintenanceMobileService class.
 * 
 * @author Constantine Kriezis
 * @since 21.1
 * 
 */
final class MaintenanceMobileLaborUpdate {
    
    /**
     * Hide default constructor.
     */
    private MaintenanceMobileLaborUpdate() {
    }
    
    /**
     * Creates the base data source for the craftsperson table (cf).
     * 
     * @return datasource
     */
    static DataSource createCfDataSource() {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(Constant.CF_TABLE, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.CF_ID);
        datasource.addField(Constant.RATE_DOUBLE);
        datasource.addField(Constant.RATE_OVER);
        datasource.addField(Constant.RATE_HOURLY);
        
        return datasource;
    }
    
    /**
     * Creates the base data source for the labor and the labor sync tables (wrcf or wrcf_sync).
     * 
     * @param tableName - to be either wrcf or wrcf_sync
     * @return datasource - either the wrcf or wrcf_sync data source
     */
    static DataSource createBaseLaborDataSource(final String tableName) {
        final DataSource datasource = DataSourceFactory.createDataSource();
        
        datasource.addTable(tableName, DataSource.ROLE_MAIN);
        
        datasource.addField(Constant.CF_ID);
        datasource.addField(Constant.COMMENTS);
        datasource.addField(Constant.DATE_ASSIGNED);
        datasource.addField(Constant.DATE_END);
        datasource.addField(Constant.DATE_START);
        datasource.addField(Constant.HOURS_DOUBLE);
        datasource.addField(Constant.HOURS_OVER);
        datasource.addField(Constant.HOURS_STRAIGHT);
        datasource.addField(Constant.HOURS_TOTAL);
        datasource.addField(Constant.COST_DOUBLE);
        datasource.addField(Constant.COST_OVER);
        datasource.addField(Constant.COST_STRAIGHT);
        datasource.addField(Constant.COST_TOTAL);
        datasource.addField(Constant.HOURS_DIFF);
        datasource.addField(Constant.HOURS_EST);
        datasource.addField(Constant.TIME_ASSIGNED);
        datasource.addField(Constant.TIME_END);
        datasource.addField(Constant.TIME_START);
        datasource.addField(Constant.WORK_TYPE);
        datasource.addField(Constant.WR_ID);
        
        return datasource;
    }
    
    /**
     * Creates the data source for the labor sync table - wrcf_sync.
     * 
     * @return wrcf_sync data source
     */
    static DataSource createLaborSyncDataSource() {
        final DataSource datasource = createBaseLaborDataSource(Constant.WRCF_SYNC_TABLE);
        
        // Add extra fields for the sync table
        datasource.addField(Constant.AUTO_NUMBER);
        datasource.addField(Constant.MOB_WR_ID);
        datasource.addField(Constant.MOB_LOCKED_BY);
        
        return datasource;
    }
    
    /**
     * Create labor records from the labor sync table.
     * 
     * @param wrId - Work Request Code
     * @param mobWrId - Mobile Work Request Code
     */
    static void createLaborRecords(final int wrId, final int mobWrId) {
        final DataSource datasource = createLaborSyncDataSource();
        
        datasource.addRestriction(Restrictions.eq(Constant.WRCF_SYNC_TABLE, Constant.MOB_WR_ID,
            mobWrId));
        
        final DataRecord testRecord = datasource.getRecord();
        testRecord.getString("wrcf_sync.cf_id");
        
        final List<DataRecord> records = datasource.getRecords();
        
        for (final DataRecord record : records) {
            insertLaborRecord(record, wrId);
        }
    }
    
    /**
     * Update labor records from the labor sync table for a specific work request id.
     * 
     * @param wrId - Work Request Code
     */
    static void updateLaborRecords(final int wrId) {
        final DataSource laborSyncDs = createLaborSyncDataSource();
        
        laborSyncDs.addRestriction(Restrictions.eq(Constant.WRCF_SYNC_TABLE, Constant.WR_ID, wrId));
        
        final List<DataRecord> records = laborSyncDs.getRecords();
        
        // Go through all the labor sync records for this work request code
        for (final DataRecord laborSyncRecord : records) {
            
            final DataSource laborDs = createBaseLaborDataSource(Constant.WRCF_TABLE);
            
            laborDs.addRestriction(Restrictions.eq(Constant.WRCF_TABLE, Constant.WR_ID, wrId));
            
            laborDs.addRestriction(Restrictions
                .eq(Constant.WRCF_TABLE,
                    Constant.CF_ID,
                    laborSyncRecord.getString(Constant.WRCF_SYNC_TABLE + Constant.DOT
                            + Constant.CF_ID)));
            
            laborDs.addRestriction(Restrictions.eq(
                Constant.WRCF_TABLE,
                Constant.DATE_ASSIGNED,
                laborSyncRecord.getDate(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.DATE_ASSIGNED)));
            
            laborDs.addRestriction(Restrictions.eq(
                Constant.WRCF_TABLE,
                Constant.TIME_ASSIGNED,
                laborSyncRecord.getValue(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.TIME_ASSIGNED)));
            
            // Get any labor record that meets the restriction
            final DataRecord laborRecord = laborDs.getRecord();
            
            // If there is no labor record create a new one from the sync record
            // If there is a labor record that corresponds to the sync record update its non primary
            // key values from the sync record
            if (laborRecord == null) {
                insertLaborRecord(laborSyncRecord, wrId);
            } else {
                final DataRecord updatedLaborRecord =
                        updateLaborRecord(laborSyncRecord, laborRecord);
                
                laborDs.saveRecord(updatedLaborRecord);
                
                // TODO (VT) Why commit?
                laborDs.commit();
            }
        }
    }
    
    /**
     * Create labor sync records from labor records for a specific work request id.
     * 
     * @param wrId - Work Request Code
     * @param cfUser - User name of craftsperson
     */
    static void createLaborSyncRecords(final int wrId, final String cfUser) {
        final DataSource datasource = createBaseLaborDataSource(Constant.WRCF_TABLE);
        
        // Restrict to the labor records for this work request code
        datasource.addRestriction(Restrictions.eq(Constant.WRCF_TABLE, Constant.WR_ID, wrId));
        
        final List<DataRecord> records = datasource.getRecords();
        
        // For each labor record insert a sync record
        for (final DataRecord record : records) {
            insertLaborSyncRecord(record, wrId, cfUser);
        }
    }
    
    /**
     * Insert a new labor record from a mobile labor sync record. Note that this method does not set
     * Estimated Hours and the corresponding hours_diff and hours_est fields as it is inserting a
     * new record from the mobile and there is no interface for entering Estimated Hours on the
     * mobile device. These hours will rather be set by Web Central and calculated only in the
     * updateLaborRecord method which updates existing labor records that might have these values.
     * 
     * @param record - Labor Sync record
     * @param wrId - Work Request Code
     */
    static void insertLaborRecord(final DataRecord record, final int wrId) {
        // First get the craftsperson so we can get the hourly rates to calculate the costs when
        // inserting the labor record
        final String cfId =
                record.getString(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.CF_ID);
        
        // Get the craftsperson hourly rates in an array
        final double[] ratesArray = getCfRatesArray(cfId);
        
        final Double rateHourly = ratesArray[0];
        final Double rateOver = ratesArray[1];
        final Double rateDouble = ratesArray[2];
        
        final DataSource datasource = createBaseLaborDataSource(Constant.WRCF_TABLE);
        
        final DataRecord newRecord = datasource.createNewRecord();
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.CF_ID, cfId);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COMMENTS,
            record.getString(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.COMMENTS));
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_ASSIGNED,
            record.getDate(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_ASSIGNED));
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_END,
            record.getDate(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_END));
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_START,
            record.getDate(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_START));
        
        // These fields will always be non-null.
        final double hoursStraight =
                record.getDouble(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.HOURS_STRAIGHT);
        
        final double hoursOver =
                record.getDouble(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.HOURS_OVER);
        
        final double hoursDouble =
                record.getDouble(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.HOURS_DOUBLE);
        
        final double costStraight = hoursStraight * rateHourly;
        final double costOver = hoursOver * rateOver;
        final double costDouble = hoursDouble * rateDouble;
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_OVER, hoursOver);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_DOUBLE, hoursDouble);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_STRAIGHT,
            hoursStraight);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_TOTAL, hoursStraight
                + hoursOver + hoursDouble);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_OVER, costOver);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_DOUBLE, costDouble);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_STRAIGHT,
            costStraight);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_TOTAL, costStraight
                + costOver + costDouble);
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_ASSIGNED,
            record.getValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.TIME_ASSIGNED));
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_END,
            record.getValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.TIME_END));
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_START,
            record.getValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.TIME_START));
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.WORK_TYPE,
            record.getString(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.WORK_TYPE));
        
        newRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.WR_ID, wrId);
        
        datasource.saveRecord(newRecord);
        
        // TODO (VT) Why commit?
        datasource.commit();
    }
    
    /**
     * Update the fields in a labor record from the updated values in the corresponding labor sync
     * record.
     * 
     * @param laborSyncRecord - Labor Sync record
     * @param laborRecord - Labor record to update
     * @return laborRecord - Updated labor record
     */
    static DataRecord updateLaborRecord(final DataRecord laborSyncRecord,
            final DataRecord laborRecord) {
        
        // Get the craftsperson hourly rates in an array
        final double[] ratesArray =
                getCfRatesArray(laborSyncRecord.getString(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.CF_ID));
        
        final Double rateHourly = ratesArray[0];
        final Double rateOver = ratesArray[1];
        final Double rateDouble = ratesArray[2];
        
        // Only update secondary fields
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COMMENTS,
            laborSyncRecord.getString(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.COMMENTS));
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_END,
            laborSyncRecord.getDate(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_END));
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_START,
            laborSyncRecord.getDate(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_START));
        
        // // These fields will always be non-null.
        final double hoursDouble =
                laborSyncRecord.getDouble(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.HOURS_DOUBLE);
        
        final double hoursOver =
                laborSyncRecord.getDouble(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.HOURS_OVER);
        
        final double hoursStraight =
                laborSyncRecord.getDouble(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.HOURS_STRAIGHT);
        
        // Calculate the labor costs
        final double costStraight = hoursStraight * rateHourly;
        final double costOver = hoursOver * rateOver;
        final double costDouble = hoursDouble * rateDouble;
        
        // We are not setting the Estimated Hours as these are not set on the mobile device but in
        // Web Central. We get the value to update the Actual-Estimated field (hours_diff).
        final double hoursEst =
                laborSyncRecord.getDouble(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.HOURS_EST);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_OVER, hoursOver);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_DOUBLE,
            hoursDouble);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_STRAIGHT,
            hoursStraight);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_TOTAL,
            hoursStraight + hoursOver + hoursDouble);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_DIFF,
            hoursStraight + hoursOver + hoursDouble - hoursEst);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_OVER, costOver);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_DOUBLE, costDouble);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_STRAIGHT,
            costStraight);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.COST_TOTAL, costStraight
                + costOver + costDouble);
        
        laborRecord.setValue(Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_END,
            laborSyncRecord.getValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.TIME_END));
        
        laborRecord
            .setValue(
                Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_START,
                laborSyncRecord.getValue(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.TIME_START));
        
        laborRecord
            .setValue(
                Constant.WRCF_TABLE + Constant.DOT + Constant.WORK_TYPE,
                laborSyncRecord.getString(Constant.WRCF_SYNC_TABLE + Constant.DOT
                        + Constant.WORK_TYPE));
        
        return laborRecord;
    }
    
    /**
     * Insert a new labor sync record from a labor record.
     * 
     * @param record - Labor record
     * @param wrId - Work Request Code
     * @param cfUser - User name of craftsperson
     */
    static void insertLaborSyncRecord(final DataRecord record, final int wrId, final String cfUser) {
        final DataSource datasource = createLaborSyncDataSource();
        
        final DataRecord newRecord = datasource.createNewRecord();
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.CF_ID,
            record.getString(Constant.WRCF_TABLE + Constant.DOT + Constant.CF_ID));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.COMMENTS,
            record.getString(Constant.WRCF_TABLE + Constant.DOT + Constant.COMMENTS));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_ASSIGNED,
            record.getDate(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_ASSIGNED));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_END,
            record.getDate(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_END));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.DATE_START,
            record.getDate(Constant.WRCF_TABLE + Constant.DOT + Constant.DATE_START));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.HOURS_DOUBLE,
            record.getDouble(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_DOUBLE));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.HOURS_OVER,
            record.getDouble(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_OVER));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.HOURS_STRAIGHT,
            record.getDouble(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_STRAIGHT));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.HOURS_TOTAL,
            record.getDouble(Constant.WRCF_TABLE + Constant.DOT + Constant.HOURS_TOTAL));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.TIME_ASSIGNED,
            record.getValue(Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_ASSIGNED));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.TIME_END,
            record.getValue(Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_END));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.TIME_START,
            record.getValue(Constant.WRCF_TABLE + Constant.DOT + Constant.TIME_START));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.WORK_TYPE,
            record.getString(Constant.WRCF_TABLE + Constant.DOT + Constant.WORK_TYPE));
        
        newRecord.setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.WR_ID, wrId);
        
        newRecord
            .setValue(Constant.WRCF_SYNC_TABLE + Constant.DOT + Constant.MOB_LOCKED_BY, cfUser);
        
        datasource.saveRecord(newRecord);
        
        // TODO (VT) Why commit?
        datasource.commit();
    }
    
    /**
     * Get the Craftsperson's hourly rates.
     * 
     * @param cfId - Craftsperson Code
     * @return ratesArray - Array with the hourly rates
     */
    static double[] getCfRatesArray(final String cfId) {
        
        final DataSource cfdatasource = createCfDataSource();
        
        cfdatasource.addRestriction(Restrictions.eq(Constant.CF_TABLE, Constant.CF_ID, cfId));
        
        final DataRecord cfRecord = cfdatasource.getRecord();
        
        final Double rateHourly =
                cfRecord.getDouble(Constant.CF_TABLE + Constant.DOT + Constant.RATE_HOURLY);
        
        final Double rateOver =
                cfRecord.getDouble(Constant.CF_TABLE + Constant.DOT + Constant.RATE_OVER);
        
        final Double rateDouble =
                cfRecord.getDouble(Constant.CF_TABLE + Constant.DOT + Constant.RATE_DOUBLE);
        
        final double[] ratesArray = { rateHourly, rateOver, rateDouble };
        
        return ratesArray;
    }
}