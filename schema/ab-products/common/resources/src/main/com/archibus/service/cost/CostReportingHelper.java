package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.jobmanager.JobStatus;
import com.archibus.service.Period;

/**
 * 
 * Utility class. Provides methods for cost reporting.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CostReportingHelper {
    
    /**
     * Returns Straight Line Rent report data.
     * 
     * @param requestParameters report request parameters
     * @param currencyUtilities currency object
     * @param vatUtilities vat object
     * @param isMcAndVatEnabled if multi currency and vat is enabled
     * @param jobStatus job status
     * @return report data set
     */
    public DataSet getStraightLineRentProjection(final RequestParameters requestParameters,
            final CurrencyUtilities currencyUtilities, final VatUtilities vatUtilities,
            final boolean isMcAndVatEnabled, final JobStatus jobStatus) {
        
        final StraightLineReport creator =
                new StraightLineReport(requestParameters.getStartDate(),
                    requestParameters.getEndDate(), requestParameters.getBaseRentCostCategory(),
                    isMcAndVatEnabled);
        final CostProjection projection =
                creator.calculateStraightLineProjection(requestParameters, currencyUtilities,
                    vatUtilities, jobStatus);
        
        DataSet dataSet = null;
        
        dataSet =
                projectionToDataSet(projection, (DataSource) creator.getRecurringCostDataSource(),
                    false, false);
        
        jobStatus.setDataSet(dataSet);
        
        return dataSet;
    }
    
    /**
     * Returns Straight Line Rent details report data.
     * 
     * @param leaseId selected lease code
     * @param requestParameters report request parameters
     * @param currencyUtilities currency object
     * @param vatUtilities vat object
     * @param isMcAndVatEnabled if multi currency and vat is enabled
     * @param jobStatus job status
     * @return report data set
     */
    public DataSet getStraightLineRentDetailsProjection(final String leaseId,
            final RequestParameters requestParameters, final CurrencyUtilities currencyUtilities,
            final VatUtilities vatUtilities, final boolean isMcAndVatEnabled,
            final JobStatus jobStatus) {
        
        final StraightLineReport creator =
                new StraightLineReport(requestParameters.getStartDate(),
                    requestParameters.getEndDate(), requestParameters.getBaseRentCostCategory(),
                    isMcAndVatEnabled);
        
        final CostProjection projection =
                creator.calculateStraightLineDetailsProjection(leaseId, requestParameters,
                    currencyUtilities, vatUtilities, jobStatus);
        
        DataSet dataSet = null;
        dataSet =
                projectionToDataSet(projection, (DataSource) creator.getRecurringCostDataSource(),
                    true, true);
        
        jobStatus.setDataSet(dataSet);
        
        return dataSet;
    }
    
    /**
     * Calculate CAM Reconciliation report data.
     * 
     * @param leaseId lease code
     * @param requestParameters report request parameters
     * @param isMcAndVatEnabled if multi currency and vat is enabled
     * @param currencyUtilities currency object
     * @param vatUtilities vat object
     */
    public void calculateCamReconciliationData(final String leaseId,
            final RequestParameters requestParameters, final boolean isMcAndVatEnabled,
            final CurrencyUtilities currencyUtilities, final VatUtilities vatUtilities) {
        final String userName = ContextStore.get().getUser().getName();
        clearBufferTable(userName, Constants.REPORT_TYPE_CAM_RECONCILIATION);
        
        // get cost projection for lease and selected date range
        
        final CostProjection camProjection =
                new CostProjection(Constants.LS_ID, requestParameters.getStartDate(),
                    requestParameters.getEndDate(), Period.YEAR);
        final List<CostPeriod> costPeriods = camProjection.createPeriodsForAsset(leaseId);
        final SummarizeCosts summarizeCostsHandler =
                new SummarizeCosts(Constants.REPORT_TYPE_CAM_RECONCILIATION);
        for (final CostPeriod period : costPeriods) {
            summarizeCostsHandler.summarizeCamCostForPeriod(leaseId, userName, period,
                requestParameters, isMcAndVatEnabled, currencyUtilities, vatUtilities);
        }
        
    }
    
    /**
     * Create an empty data set.
     * 
     * @param projection projection object
     * @return data set
     */
    private DataSet2D createEmptyDataSet(final CostProjection projection) {
        final String rowDimension =
                Constants.RECUR_COST_TABLE + Constants.DOT + projection.getAssetKey();
        final String colDimension =
                Constants.RECUR_COST_TABLE + Constants.DOT + Constants.DATE_START;
        return new DataSet2D(rowDimension, colDimension);
    }
    
    /**
     * Creates DataSet from cost projection.
     * 
     * @param projection cost projection
     * @param dataSource data source object
     * @param isGroupByCostCategory if are grouped by cost category
     * @param showAllCosts if zero cost should be displayed or not
     * @return DataSet2D
     */
    private DataSet projectionToDataSet(final CostProjection projection,
            final DataSource dataSource, final boolean isGroupByCostCategory,
            final boolean showAllCosts) {
        final String rowDimension =
                Constants.RECUR_COST_TABLE + Constants.DOT + projection.getAssetKey();
        final String colDimension =
                Constants.RECUR_COST_TABLE + Constants.DOT + Constants.DATE_START;
        
        final String measure = Constants.RECUR_COST_TABLE + Constants.DOT + "amount_income";
        
        final List<DataRecord> records = new ArrayList<DataRecord>();
        for (final String assetId : projection.getAssetIds()) {
            
            if (isGroupByCostCategory) {
                final List<String> costCategories = projection.getCostCategories(assetId);
                
                for (final String costCategory : costCategories) {
                    final List<CostPeriod> periods =
                            projection.getPeriodsForAssetAndCostCategory(assetId, costCategory);
                    addRecords(dataSource, rowDimension, colDimension, measure, assetId,
                        costCategory, periods, records, showAllCosts);
                    
                }
            } else {
                final List<CostPeriod> periods = projection.getPeriodsForAsset(assetId);
                addRecords(dataSource, rowDimension, colDimension, measure, assetId, null, periods,
                    records, showAllCosts);
            }
        }
        
        final DataSet2D dataSet = createEmptyDataSet(projection);
        dataSet.addRecords(records);
        return dataSet;
    }
    
    /**
     * Creates records from projection cost periods for specified asset and cost category.
     * 
     * @param dataSource data source
     * @param rowDimension row dimension
     * @param columnDimension column dimension
     * @param measure measure
     * @param assetId asset id
     * @param costCategory cost category
     * @param periods periods
     * @param records records
     * @param showAllCosts keep zero values
     */
    // CHECKSTYLE:OFF Justification: disabled for Bali 1 must be fixed
    private void addRecords(final DataSource dataSource, final String rowDimension,
            final String columnDimension, final String measure, final String assetId,
            final String costCategory, final List<CostPeriod> periods,
            final List<DataRecord> records, final boolean showAllCosts) {
        
        if (!verifyPeriodsHaveCosts(periods) && !showAllCosts) {
            return;
        }
        
        String rowDimensionValue = assetId;
        if (costCategory != null) {
            rowDimensionValue += "|" + costCategory;
        }
        for (final CostPeriod period : periods) {
            final DataRecord periodRecord = dataSource.createRecord();
            periodRecord.setValue(rowDimension, rowDimensionValue);
            periodRecord.setValue(columnDimension, period.getDateStart());
            periodRecord.setValue(measure, period.getCost());
            
            records.add(periodRecord);
        }
    }
    
    // CHECKSTYLE:ON
    
    /**
     * Verify if at least one period has a non zero cost attached.
     * 
     * @param periods periods list
     * @return true if periods have costs, else false
     */
    private boolean verifyPeriodsHaveCosts(final List<CostPeriod> periods) {
        boolean haveCosts = false;
        for (final CostPeriod period : periods) {
            if (!period.getCost().equals(BigDecimal.ZERO)) {
                haveCosts = true;
            }
        }
        return haveCosts;
    }
    
    /**
     * Clear buffer table for user and report.
     * 
     * @param userName logged user name
     * @param reportType requested report type
     */
    private void clearBufferTable(final String userName, final String reportType) {
        final String sqlStatement =
                "DELETE FROM ccost_sum WHERE user_name = " + SqlUtils.formatValueForSql(userName)
                        + " AND report_name = " + SqlUtils.formatValueForSql(reportType);
        SqlUtils.executeUpdate("ccost_sum", sqlStatement);
    }
}
