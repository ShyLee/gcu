package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.JobStatus;
import com.archibus.service.Period;
import com.archibus.utility.StringUtil;

/**
 * 
 * Provides methods for Straight Line Rent calculation.
 * <p>
 * 
 * TODO:(IOAN) - Refactor the class when straight line rent report is working.
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
// CHECKSTYLE:OFF : Justification: Disable for Bali 1 - must be refactored.
public class StraightLineReport {
    /**
     * 
     * Represents straight line rent for lease.
     * <p>
     * 
     * 
     * @author Ioan Draghici
     * @since 21.1
     * 
     */
    public static class StraightLineRent {
        /**
         * Lease code.
         */
        private final String lease;
        
        /**
         * Lease duration - month number.
         */
        private final int duration;
        
        /**
         * Lease start date.
         */
        private final Date startDate;
        
        /**
         * Lease end date.
         */
        private final Date endDate;
        
        /**
         * Straight line rent monthly value.
         */
        private final double rent;
        
        /**
         * Lease hold improvements cost - monthly value.
         */
        private final double improvement;
        
        /**
         * 
         * Constructor.
         * 
         * @param lease lease code
         * @param duration lease duration
         * @param rent straight line rent monthly value
         * @param improvement improvements costs monthly value
         * @param startDate lease start date
         * @param endDate lease end date
         */
        public StraightLineRent(final String lease, final int duration, final double rent,
                final double improvement, final Date startDate, final Date endDate) {
            this.lease = lease;
            this.duration = duration;
            this.rent = rent;
            this.improvement = improvement;
            this.startDate = startDate;
            this.endDate = endDate;
        }
        
        /**
         * Getter for the lease property.
         * 
         * @see lease
         * @return the lease property.
         */
        public String getLease() {
            return this.lease;
        }
        
        /**
         * Getter for the duration property.
         * 
         * @see duration
         * @return the duration property.
         */
        public int getDuration() {
            return this.duration;
        }
        
        /**
         * Getter for the rent property.
         * 
         * @see rent
         * @return the rent property.
         */
        public double getRent() {
            return this.rent;
        }
        
        /**
         * Getter for the improvement property.
         * 
         * @see improvement
         * @return the improvement property.
         */
        public double getImprovement() {
            return this.improvement;
        }
        
        /**
         * Getter for the startDate property.
         * 
         * @see startDate
         * @return the startDate property.
         */
        public Date getStartDate() {
            return this.startDate;
        }
        
        /**
         * Getter for the endDate property.
         * 
         * @see endDate
         * @return the endDate property.
         */
        public Date getEndDate() {
            return this.endDate;
        }
        
    }
    
    /**
     * Constant field name.
     */
    private static final String MONTH_NO = "month_no";
    
    /**
     * Constant paranthesis.
     */
    private static final String PARANTHESIS_CLOSE = ")";
    
    /**
     * Asset key.
     */
    private static final String ASSET_KEY = "ls_id";
    
    /**
     * Multi- currency and vat enabled.
     */
    private final boolean isMcAndVatEnabled;
    
    /**
     * Projection start date.
     */
    private final Date startDate;
    
    /**
     * Projection start date.
     */
    private final Date endDate;
    
    /**
     * Base rent cost categories.
     */
    private final String baseRentCategory;
    
    /**
     * Report request parameters.
     */
    private RequestParameters requestParameters;
    
    /**
     * Multi currency object.
     */
    private CurrencyUtilities currencyParameters;
    
    /**
     * Vat object.
     */
    private VatUtilities vatParameters;
    
    /**
     * Geographical fields list.
     */
    private final String[] geographicalFields = new String[] { Constants.CTRY_ID,
            Constants.REGN_ID, Constants.STATE_ID, Constants.CITY_ID, Constants.SITE_ID,
            Constants.PR_ID, Constants.BL_ID };
    
    /**
     * Actual cost data source object.
     */
    private ICostDao<ActualCost> actualCostDataSource;
    
    /**
     * Recurring cost data source object.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;
    
    /**
     * Scheduled cost data source object.
     */
    private ICostDao<ScheduledCost> scheduledCostDataSource;
    
    /**
     * 
     * Default constructor specifying report request parameters.
     * 
     * @param startDate projection start date
     * @param endDate projection end date
     * @param baseRentCateg base rent categories
     * @param isMcAndVatEnabled multi currency and vat enabled
     */
    public StraightLineReport(final Date startDate, final Date endDate, final String baseRentCateg,
            final boolean isMcAndVatEnabled) {
        this.baseRentCategory = baseRentCateg;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isMcAndVatEnabled = isMcAndVatEnabled;
    }
    
    /**
     * Getter for the recurringCostDataSource property.
     * 
     * @see recurringCostDataSource
     * @return the recurringCostDataSource property.
     */
    public ICostDao<RecurringCost> getRecurringCostDataSource() {
        return this.recurringCostDataSource;
    }
    
    /**
     * 
     * Calculate straight line rent projection.
     * 
     * @param requestParam report request parameters.
     * @param currencyParam currency request parameters
     * @param vatParam vat request parameters
     * @param jobStatus job status
     * @return cost projection
     */
    public CostProjection calculateStraightLineProjection(final RequestParameters requestParam,
            final CurrencyUtilities currencyParam, final VatUtilities vatParam,
            final JobStatus jobStatus) {
        initPerRequestState();
        this.requestParameters = requestParam;
        this.currencyParameters = currencyParam;
        this.vatParameters = vatParam;
        // get leases
        final List<DataRecord> leases = getLeaseRecords();
        
        final int totalNo = leases.size() * 2;
        jobStatus.setTotalNumber(totalNo);
        jobStatus.setCurrentNumber(1);
        
        String message =
                EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                    CostMessages.MESSAGE_CALCULATE_STRAIGHT_LINE, CostMessages.CLASS_NAME);
        jobStatus.setMessage(message);
        
        // calculating straight line rent values
        final Map<String, StraightLineRent> leaseStraightLineRent =
                calculateStraightLineRent(leases, jobStatus);
        
        // generate straight line projection
        message =
                EventHandlerBase.localizeString(ContextStore.get().getEventHandlerContext(),
                    CostMessages.MESSAGE_CALCULATE_COST_PROJECTION, CostMessages.CLASS_NAME);
        jobStatus.setMessage(message);
        final CostProjection projection =
                new CostProjection(ASSET_KEY, this.startDate, this.endDate,
                    this.requestParameters.getTimeRangeSpan());
        final Iterator<String> itKeys = leaseStraightLineRent.keySet().iterator();
        while (itKeys.hasNext()) {
            final String lsCode = itKeys.next();
            final StraightLineRent lsStraightLineRent = leaseStraightLineRent.get(lsCode);
            updateProjectonFromStraightLineRent(projection, lsStraightLineRent);
            
            incrementJobProgressStatus(jobStatus);
        }
        
        return projection;
    }
    
    /**
     * Calculate straight line rent detailed projection.
     * 
     * @param leaseId selected lease code
     * @param requestParam report request parameters.
     * @param currencyParam currency request parameters
     * @param vatParam vat request parameters
     * @param jobStatus job status
     * @return cost projection
     */
    public CostProjection calculateStraightLineDetailsProjection(final String leaseId,
            final RequestParameters requestParam, final CurrencyUtilities currencyParam,
            final VatUtilities vatParam, final JobStatus jobStatus) {
        initPerRequestState();
        this.requestParameters = requestParam;
        this.currencyParameters = currencyParam;
        this.vatParameters = vatParam;
        // get leases
        final Clause[] clauses = new Clause[1];
        clauses[0] = Restrictions.eq(Constants.LS_TABLE, Constants.LS_ID, leaseId);
        final Restriction restriction = Restrictions.and(clauses);
        final List<DataRecord> leases = getLeaseRecords(restriction);
        
        // calculating straight line rent values
        final Map<String, StraightLineRent> leaseStraightLineRent =
                calculateStraightLineRent(leases, jobStatus);
        final CostProjection projection =
                new CostProjection(ASSET_KEY, this.startDate, this.endDate,
                    this.requestParameters.getTimeRangeSpan());
        final Iterator<String> itKeys = leaseStraightLineRent.keySet().iterator();
        while (itKeys.hasNext()) {
            final String lsCode = itKeys.next();
            final StraightLineRent lsStraightLineRent = leaseStraightLineRent.get(lsCode);
            final Date lsLastCostMonth =
                    Period.incrementDate(lsStraightLineRent.getStartDate(), Period.MONTH,
                        lsStraightLineRent.getDuration() - 1);
            updateProjectonFromStraightLineRentDetails(projection, lsStraightLineRent);
            summarizeCostForAssetAndCostCategory(projection, lsCode, lsLastCostMonth,
                Constants.DIFFERENTIAL_RENT_CUMUL);
            incrementJobProgressStatus(jobStatus);
        }
        
        return projection;
    }
    
    /**
     * Summarize cost for asset and cost category for all periods.
     * 
     * @param projection cost projection
     * @param assetId asset id
     * @param endDate asset end date (lease end date)
     * @param costCategory cost category
     */
    private void summarizeCostForAssetAndCostCategory(final CostProjection projection,
            final String assetId, final Date endDate, final String costCategory) {
        final List<CostPeriod> periods =
                projection.getPeriodsForAssetAndCostCategory(assetId, costCategory);
        if (periods != null) {
            BigDecimal costHolder = BigDecimal.ZERO;
            for (final CostPeriod period : periods) {
                if (period.getDateStart().before(endDate) || period.getDateStart().equals(endDate)) {
                    costHolder = costHolder.add(period.getCost());
                    period.setCost(costHolder);
                } else {
                    break;
                }
            }
        }
        
    }
    
    /**
     * 
     * Update cost project from straight line rent object.
     * 
     * @param projection cost projection
     * @param straightLineRent straight line rent object
     */
    private void updateProjectonFromStraightLineRent(final CostProjection projection,
            final StraightLineRent straightLineRent) {
        final String leaseId = straightLineRent.getLease();
        final int leaseDuration = straightLineRent.getDuration();
        final Date lsStartDate = straightLineRent.getStartDate();
        straightLineRent.getEndDate();
        final double rent = Math.abs(straightLineRent.getRent());
        final int factor = projection.getMultiplicationFactor();
        final Date lsLastCostMonth =
                Period.incrementDate(lsStartDate, Period.MONTH, leaseDuration - 1);
        
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(projection.getDateStart());
        while (calendar.getTime().before(projection.getDateEnd())) {
            final Date dateFrom = calendar.getTime();
            final Period datePeriod = new Period(projection.getPeriod(), dateFrom);
            final Date dateTo = datePeriod.getDateEnd();
            final double periodAdjustment =
                    datePeriod.getCorrectionFactor(lsStartDate, lsLastCostMonth,
                        projection.getPeriod());
            if (!dateFrom.after(lsLastCostMonth) && !dateTo.before(lsStartDate)) {
                projection.updateCost(leaseId, dateFrom, rent * factor * periodAdjustment);
            }
            
            // add month, quarter, year, or custom number of days
            datePeriod.addPeriodToCalendar(calendar);
        }
    }
    
    /**
     * 
     * Update cost project from straight line rent details.
     * 
     * @param projection cost projection
     * @param straightLineRent straight line rent object
     */
    private void updateProjectonFromStraightLineRentDetails(final CostProjection projection,
            final StraightLineRent straightLineRent) {
        final Date leaseStartDate = straightLineRent.getStartDate();
        straightLineRent.getEndDate();
        final int leaseDuration = straightLineRent.getDuration();
        final Date lsLastCostMonth =
                Period.incrementDate(leaseStartDate, Period.MONTH, leaseDuration - 1);
        
        final Calendar calendar = Calendar.getInstance();
        calendar.setTime(projection.getDateStart());
        while (calendar.getTime().before(projection.getDateEnd())) {
            final Date periodStart = calendar.getTime();
            final Period period = new Period(projection.getPeriod(), periodStart);
            final Date periodEnd = period.getDateEnd();
            
            if (!periodStart.after(lsLastCostMonth) && !periodEnd.before(leaseStartDate)) {
                addDetailsToProjection(projection, straightLineRent, period);
            }
            
            period.addPeriodToCalendar(calendar);
        }
    }
    
    /**
     * Add straight line details to cost projection for interval.
     * 
     * @param projection cost projection
     * @param straightLineRent lease straight line rent object
     * @param interval projection interval
     */
    private void addDetailsToProjection(final CostProjection projection,
            final StraightLineRent straightLineRent, final Period interval) {
        final Date dateFrom = interval.getDateStart();
        final Date dateTo = interval.getDateEnd();
        final String leaseId = straightLineRent.getLease();
        final double monthlySlRent = Math.abs(straightLineRent.getRent());
        final double monthlyLiCost = straightLineRent.getImprovement();
        final int factor = projection.getMultiplicationFactor();
        final Date lsLastCostMonth =
                Period.incrementDate(straightLineRent.getStartDate(), Period.MONTH,
                    straightLineRent.getDuration() - 1);
        final double intervalAdjustment =
                interval.getCorrectionFactor(straightLineRent.getStartDate(), lsLastCostMonth,
                    projection.getPeriod());
        
        final double baseRent =
                Math.abs(getCostAmountForLeaseAndCategoryForInterval(leaseId, dateFrom, dateTo,
                    this.baseRentCategory));
        
        final double liCost = monthlyLiCost * factor * intervalAdjustment;
        final double actualRent = baseRent - Math.abs(liCost);
        final double slRent = monthlySlRent * factor * intervalAdjustment;
        final double diffCost = actualRent - slRent;
        final double cumulDiffCost = diffCost;
        
        projection.updateCost(leaseId, Constants.BASE_RENT, dateFrom, baseRent);
        projection.updateCost(leaseId, Constants.LI_CREDIT, dateFrom, liCost);
        projection.updateCost(leaseId, Constants.ACTUAL_RENT, dateFrom, actualRent);
        projection.updateCost(leaseId, Constants.STRAIGHT_LINE_RENT, dateFrom, slRent);
        projection.updateCost(leaseId, Constants.DIFFERENTIAL_RENT, dateFrom, diffCost);
        projection.updateCost(leaseId, Constants.DIFFERENTIAL_RENT_CUMUL, dateFrom, cumulDiffCost);
        
    }
    
    /**
     * Get cost amount for lease on specified interval.
     * 
     * @param leaseId lease code
     * @param dateFrom interval start
     * @param dateTo interval end
     * @param costCategory cost category
     * @return double value
     */
    private double getCostAmountForLeaseAndCategoryForInterval(final String leaseId,
            final Date dateFrom, final Date dateTo, final String costCategory) {
        // search on actual cost
        double result = 0;
        final Clause[] clauses = new Clause[4];
        clauses[0] = Restrictions.eq(Constants.ACTUAL_COST_TABLE, Constants.LS_ID, leaseId);
        clauses[1] =
                Restrictions.in(Constants.ACTUAL_COST_TABLE, Constants.COST_CAT_ID, costCategory);
        clauses[2] = Restrictions.gte(Constants.ACTUAL_COST_TABLE, Constants.DATE_DUE, dateFrom);
        clauses[3] = Restrictions.lte(Constants.ACTUAL_COST_TABLE, Constants.DATE_DUE, dateTo);
        final List<ActualCost> actualCosts =
                this.actualCostDataSource.findByRestriction(Restrictions.and(clauses));
        for (final ActualCost cost : actualCosts) {
            result +=
                    cost.calculateIncomeAndExpense(CostProjection.CALCTYPE_NETINCOME,
                        this.isMcAndVatEnabled, this.currencyParameters, this.vatParameters);
        }
        
        // search on scheduled
        clauses[0] = Restrictions.eq(Constants.SCHED_COST_TABLE, Constants.LS_ID, leaseId);
        clauses[1] =
                Restrictions.in(Constants.SCHED_COST_TABLE, Constants.COST_CAT_ID, costCategory);
        clauses[2] = Restrictions.gte(Constants.SCHED_COST_TABLE, Constants.DATE_DUE, dateFrom);
        clauses[3] = Restrictions.lte(Constants.SCHED_COST_TABLE, Constants.DATE_DUE, dateTo);
        final List<ScheduledCost> schedCosts =
                this.scheduledCostDataSource.findByRestriction(Restrictions.and(clauses));
        for (final ScheduledCost cost : schedCosts) {
            result +=
                    cost.calculateIncomeAndExpense(CostProjection.CALCTYPE_NETINCOME,
                        this.isMcAndVatEnabled, this.currencyParameters, this.vatParameters);
        }
        // search on recurring cost
        final String sqlString =
                "cost_tran_recur.ls_id = " + SqlUtils.formatValueForSql(leaseId)
                        + " AND cost_tran_recur.cost_cat_id IN ('"
                        + costCategory.replaceAll(",", "','")
                        + "') AND cost_tran_recur.date_start <= "
                        + SqlUtils.formatValueForSql(dateTo) + " AND (cost_tran_recur.date_end >= "
                        + SqlUtils.formatValueForSql(dateFrom)
                        + " OR cost_tran_recur.date_end IS NULL)";
        final Restriction restriction = Restrictions.sql(sqlString);
        
        final List<RecurringCost> recurCosts =
                this.recurringCostDataSource.findByRestriction(restriction);
        for (final RecurringCost cost : recurCosts) {
            final Date dateLastScheduled = cost.getChangeOverDate();
            if (dateLastScheduled == null
                    || (dateLastScheduled != null && !dateTo.before(dateLastScheduled))) {
                cost.calculateIncomeAndExpense(CostProjection.CALCTYPE_NETINCOME, dateFrom, dateTo,
                    this.isMcAndVatEnabled, this.currencyParameters, this.vatParameters);
                result += cost.getSummarizedAmount().doubleValue();
            }
        }
        return result;
    }
    
    /**
     * Calculate Straight line rent for leases.
     * 
     * @param leases lease records
     * @param jobStatus job status
     * @return map object
     */
    private Map<String, StraightLineRent> calculateStraightLineRent(final List<DataRecord> leases,
            final JobStatus jobStatus) {
        final Map<String, StraightLineRent> lsMap =
                new HashMap<String, StraightLineReport.StraightLineRent>();
        for (final DataRecord lsRecord : leases) {
            incrementJobProgressStatus(jobStatus);
            final String leaseCode = lsRecord.getString("ls.ls_id");
            final Date leaseStartdate = lsRecord.getDate("ls.date_start");
            final Date leaseEndDate = lsRecord.getDate("ls.date_end");
            final int leaseDuration = Period.getMonthsBetween(leaseStartdate, leaseEndDate);
            final StraightLineRent leaseRent =
                    calculateStraightLineValuesForLease(leaseCode, leaseStartdate, leaseEndDate,
                        leaseDuration, this.baseRentCategory);
            if (leaseRent != null) {
                lsMap.put(leaseCode, leaseRent);
            }
        }
        return lsMap;
    }
    
    /**
     * Calculate Straight line rent and lease hold improvements for lease.
     * 
     * @param lease lease code
     * @param leaseStartDate lease start date
     * @param leaseEndDate lease end date
     * @param duration lease duration - months number
     * @param baseRentCostCategory base rent cost category
     * @return object
     */
    private StraightLineRent calculateStraightLineValuesForLease(final String lease,
            final Date leaseStartDate, final Date leaseEndDate, final int duration,
            final String baseRentCostCategory) {
        StraightLineRent result = null;
        final Double baseRent =
                summarizeCostForLeaseAndCostCategory(lease, leaseEndDate, baseRentCostCategory);
        
        final Double leaseholdImprovements =
                summarizeCostForLeaseAndCostCategory(lease, leaseEndDate,
                    Constants.LEASEHOLD_IMPROVMENT_COST_CATEG);
        
        if (baseRent != null) {
            final double monthlyBaseRent = baseRent / duration;
            final double monthlyLeaseholdImprov = leaseholdImprovements / duration;
            result =
                    new StraightLineRent(lease, duration, monthlyBaseRent, monthlyLeaseholdImprov,
                        leaseStartDate, leaseEndDate);
        }
        return result;
    }
    
    /**
     * Summarize recurring, actual and scheduled costs.
     * 
     * @param lease lease code
     * @param leaseEndDate lease end date
     * @param costCategory base rent cost category
     * @return double value
     */
    private Double summarizeCostForLeaseAndCostCategory(final String lease,
            final Date leaseEndDate, final String costCategory) {
        Double result = Double.valueOf(0);
        
        final Restriction recurCostRestriction =
                Restrictions.and(Restrictions
                    .eq(Constants.RECUR_COST_TABLE, Constants.LS_ID, lease), Restrictions.in(
                    Constants.RECUR_COST_TABLE, Constants.COST_CAT_ID, costCategory), Restrictions
                    .eq(Constants.RECUR_COST_TABLE, "status_active", "1"));
        final List<RecurringCost> recurringCosts =
                this.recurringCostDataSource.findByRestriction(recurCostRestriction);
        for (final RecurringCost cost : recurringCosts) {
            
            cost.calculateIncomeAndExpense(CostProjection.CALCTYPE_NETINCOME, leaseEndDate,
                this.isMcAndVatEnabled, this.currencyParameters, this.vatParameters);
            result = result + cost.getSummarizedAmount().doubleValue();
        }
        
        final Restriction schedCostRestriction =
                Restrictions.and(Restrictions
                    .eq(Constants.SCHED_COST_TABLE, Constants.LS_ID, lease), Restrictions.in(
                    Constants.SCHED_COST_TABLE, Constants.COST_CAT_ID, costCategory));
        final List<ScheduledCost> schedCosts =
                this.scheduledCostDataSource.findByRestriction(schedCostRestriction);
        for (final ScheduledCost schedCost : schedCosts) {
            result =
                    result
                            + schedCost.calculateIncomeAndExpense(
                                CostProjection.CALCTYPE_NETINCOME, this.isMcAndVatEnabled,
                                this.currencyParameters, this.vatParameters);
        }
        final Restriction actualCostRestriction =
                Restrictions.and(Restrictions.eq(Constants.ACTUAL_COST_TABLE, Constants.LS_ID,
                    lease), Restrictions.in(Constants.ACTUAL_COST_TABLE, Constants.COST_CAT_ID,
                    costCategory));
        final List<ActualCost> actualCosts =
                this.actualCostDataSource.findByRestriction(actualCostRestriction);
        for (final ActualCost actualCost : actualCosts) {
            result =
                    result
                            + actualCost.calculateIncomeAndExpense(
                                CostProjection.CALCTYPE_NETINCOME, this.isMcAndVatEnabled,
                                this.currencyParameters, this.vatParameters);
        }
        
        return result;
    }
    
    /**
     * Get leases list.
     * 
     * @return data record list
     */
    private List<DataRecord> getLeaseRecords() {
        final Restriction restriction = getLeasesRestriction();
        return getLeaseRecords(restriction);
    }
    
    /**
     * Returns records for specified restriction.
     * 
     * @param restriction restriction object
     * @return records
     */
    private List<DataRecord> getLeaseRecords(final Restriction restriction) {
        final DataSource dataSource = DataSourceFactory.createDataSource();
        dataSource.addTable(Constants.LS_TABLE);
        dataSource.addField(Constants.LS_ID);
        dataSource.addField(Constants.DATE_START);
        dataSource.addField(Constants.DATE_END);
        dataSource.addField(Constants.LANDLORD_TENANT);
        
        // lease month number
        final VirtualFieldDef fieldDef =
                new VirtualFieldDef(Constants.LS_TABLE, MONTH_NO, DataSource.DATA_TYPE_INTEGER);
        final Map<String, String> sqlExpressions = new HashMap<String, String>();
        sqlExpressions.put("generic", "DATEDIFF(mm, ls.date_start, ls.date_end)+1");
        sqlExpressions.put("oracle", "ROUND(MONTHS_BETWEEN(ls.date_end, ls.date_start))");
        fieldDef.addSqlExpressions(sqlExpressions);
        
        dataSource.addCalculatedField(fieldDef);
        dataSource.addRestriction(restriction);
        return dataSource.getRecords();
    }
    
    /**
     * 
     * Get sql asset restriction.
     * 
     * @return sql string
     *         <p>
     *         Suppress PMD warning "AvoidUsingSql" in this method.
     *         <p>
     *         Justification Case 1. Sql statement with subqueries
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private Restriction getLeasesRestriction() {
        
        final String costAssociatedWith = this.requestParameters.getCostsAssociatedWith();
        final boolean isForBuilding =
                "lsBl".equals(costAssociatedWith) || Constants.LS_TABLE.equals(costAssociatedWith);
        final boolean isForProperty =
                "lsPr".equals(costAssociatedWith) || Constants.LS_TABLE.equals(costAssociatedWith);
        String sqlRestriction =
                "ls.use_as_template = 0 AND ls.date_end IS NOT NULL AND ls.date_end > "
                        + SqlUtils.formatValueForSql(this.startDate) + " AND ls.date_start < "
                        + SqlUtils.formatValueForSql(this.endDate);
        
        final String blRestriction =
                "EXISTS(SELECT bl.bl_id FROM bl WHERE ls.bl_id = bl.bl_id "
                        + getGeographicalClauses("bl") + PARANTHESIS_CLOSE;
        final String prRestriction =
                "EXISTS(SELECT property.pr_id FROM property WHERE ls.pr_id =  property.pr_id "
                        + getGeographicalClauses(Constants.PROPERTY) + PARANTHESIS_CLOSE;
        
        sqlRestriction += " AND (";
        String operator = "";
        if (isForBuilding) {
            sqlRestriction += blRestriction;
            operator = " OR ";
        }
        if (isForProperty) {
            sqlRestriction += operator + prRestriction;
        }
        sqlRestriction += PARANTHESIS_CLOSE;
        return Restrictions.sql(sqlRestriction);
    }
    
    /**
     * Get geographical restriction clauses - generic sql string.
     * 
     * @param table table name
     * @return string
     */
    final String getGeographicalClauses(final String table) {
        String sqlClause = "";
        for (final String fieldName : this.geographicalFields) {
            boolean addClause = true;
            if (table.equals(Constants.PROPERTY) && fieldName.equals(Constants.BL_ID)) {
                addClause = false;
            }
            final String fieldValue = this.requestParameters.getGeographicalField(fieldName);
            if (addClause && StringUtil.notNullOrEmpty(fieldValue)) {
                sqlClause +=
                        "AND " + table + "." + fieldName + " IN ('"
                                + fieldValue.replaceAll(",", "','") + "') ";
            }
        }
        return sqlClause;
    }
    
    /**
     * Increment job progress status.
     * 
     * @param jobStatus job status
     */
    private void incrementJobProgressStatus(final JobStatus jobStatus) {
        final long currentNo = jobStatus.getCurrentNumber();
        jobStatus.setCurrentNumber(currentNo + 1);
    }
    
    /**
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        if (this.actualCostDataSource == null) {
            this.actualCostDataSource = new ActualCostDataSource();
        }
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }
    }
}
