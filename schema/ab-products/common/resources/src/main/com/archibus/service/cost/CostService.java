package com.archibus.service.cost;

import java.math.BigDecimal;
import java.util.*;

import org.json.JSONObject;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.dao.datasource.*;
import com.archibus.app.common.finance.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.*;
import com.archibus.datasource.restriction.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.datasource.restriction.Restrictions.Restriction.Clause;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.service.Period;
import com.archibus.utility.StringUtil;

import edu.umd.cs.findbugs.annotations.SuppressWarnings;

/**
 * <p>
 * Provides for creating Scheduled Costs records from selected Recurring Costs records. Also,
 * provides for moving selected Scheduled Costs records to the Costs table.
 * 
 * <p>
 * Creating Costs:
 * 
 * <p>
 * There are three Costs tables:
 * <li>Recurring Costs
 * <li>Scheduled Costs
 * <li>Costs
 * 
 * <p>
 * Costs are only considered actual costs if they are listed in the Costs table. Recurring Costs and
 * Scheduled Costs are methods of listing Costs which have not yet been approved or paid.
 * 
 * <p>
 * The process of approving Recurring Costs and Scheduled Costs so that they become actual Costs is
 * documented below.
 * 
 * <p>
 * Costs may only be manually entered as Recurring Costs or Scheduled Costs. When Recurring Costs
 * are scheduled (with an action) they become Scheduled Costs. When Scheduled Costs are approved
 * (with an action) they become Costs.
 * 
 * <p>
 * The scheduling and approval processes basically copies or moves data from one cost table to
 * another. In particular, the mapping, listed below, of the fields in each of the costs tables
 * define how data is:
 * <li>Copied (from Recurring Costs to Scheduled Costs) with the 'Schedule Recurring Costs' actions
 * <li>Moved (from Scheduled Costs to Costs) with the 'Approve Costs' view actions.
 * 
 * <p>
 * Not all Recurring Costs fields are mapped to Scheduled Costs as some of the Recurring Costs
 * fields are only necessary to define the recurring cost rules; not the individual costs.
 * 
 * <p>
 * Scheduled Costs have additional fields which hold information which will only be entered for
 * individual costs and are not defined in Recurring Costs.
 * 
 * <pre>
 * ___________________________
 * Cost Tables fields Mapping:
 * 
 * Recurring Costs:    Scheduled Costs:         Costs:
 * -------------------------------------------------------------------------------
 * 
 * ac_id               ac_id                    ac_id
 *                     activity_log_id          activity_log_id
 * amount_expense      amount_expense           amount_expense
 * amount_income       amount_income            amount_income
 *                     amount_tax_late1         amount_tax_late1
 *                     amount_tax_late2         amount_tax_late2
 *                     amount_tax_late3         amount_tax_late3
 * bl_id               bl_id                    bl_id
 * cost_cat_id         cost_cat_id              cost_cat_id
 *                                              cost_tran_id
 * cost_tran_recur_id  cost_tran_recur_id       cost_tran_recur_id
 *                     cost_tran_sched_id
 *                     date_assessed            date_assessed
 *                     date_due                 date_due
 *                     date_paid                date_paid
 *                     date_tax_late1           date_tax_late1
 *                     date_tax_late2           date_tax_late2
 *                     date_tax_late3           date_tax_late3
 * date_end
 * date_seasonal_end
 * date_seasonal_start
 * date_start
 * date_trans_created  date_trans_created       date_trans_created   +++++
 * description         description              description
 * dp_id               dp_id                    dp_id
 * dv_id               dv_id                    dv_id
 *                                              invoice_id
 * ls_id               ls_id                    ls_id
 * option1             option1                  option1
 * option2             option2                  option2
 * pa_name             pa_name                  pa_name
 * parcel_id           parcel_id                parcel_id
 * period
 * period_custom
 * pr_id               pr_id                    pr_id
 * status_active
 * yearly_factor
 *                     status ++
 *                                              status    ++
 *                     tax_authority_contact    tax_authority_contact
 *                     tax_bill_num             tax_bill_num
 *                     tax_milage_rate          tax_milage_rate
 *                     tax_type                 tax_type
 *                     tax_value_assessed       tax_value_assessed
 *                     tax_clr                  tax_clr
 *                     tax_period_in_months     tax_period_in_months
 * 
 * ++ - the status field is different for Scheduled costs and costs
 * +++++ - date_trans_created is not copied; it is automatically filled in with the current date
 * </pre>
 * 
 * <p>
 * History:
 * <li>Web Central 17.2: Initial implementation, ported from costapp.abs, includes only the
 * Calculate Cash Flow Projection for Recurring Costs.
 * <li>Web Central 17.3: Added Create Scheduled Costs and Approve Scheduled Costs, ported from
 * costapp.abs. Added Calculate Chargeback Costs, ported from costchgb.abs.
 * 
 * @author Sergey Kuramshin
 */
public class CostService extends JobBase {
    
    private static final String LS_CAM_REC_REPORT_TABLE = "ls_cam_rec_report";
    
    private static final String COST_TRAN_SCHED_ID = "cost_tran_sched_id";
    
    private static final String COST_TRAN_ID = "cost_tran_id";
    
    // ----------------------- constants ---------------------------------------
    
    private final static String DEFAULT_SCHEDULED_STATUS = "AUTO-RECURRING";
    
    // @translatable
    private static final String MESSAGE_PREPARING_CASH_FLOW_PROJECTION =
            "Preparing cash flow projection";
    
    // ----------------------- data members ------------------------------------
    
    private ICostDao<ActualCost> actualCostDataSource;
    
    /**
     * The list of cost category codes defined in the activity parameter CAM_Reconciliation. If the
     * activity parameter is not defined, default value = "RENT - CAM RECONCILIATION".
     */
    private String[] costCategoriesCamReconciliation;
    
    // ----------------------- DataSource references ---------------------------
    
    private Configuration configuration;
    
    /**
     * References to custom data sources used to load cost objects from the database. These
     * references are set by the Web Central container based on the Spring configuration file
     * schema/ab-products/solutions/common/appContext-services.xml.
     */
    private ICostDao<RecurringCost> recurringCostDataSource;
    
    private ICostDao<ScheduledCost> scheduledCostDataSource;
    
    // ----------------------- business methods --------------------------------
    
    /**
     * Apply multicurrency updates to legacy data. Update all actual, scheduled and recurring costs
     * that have currency budget and currency payment null
     */
    public void applyMulticurrencyUpdatesToLegacyData() {
        final CurrencyAndVat currencyVatManager = new CurrencyAndVat();
        currencyVatManager.applyCurrencyUpdatesToLegacyData(this.status);
    }
    
    /**
     * APPROVE ALL CHARGEBACK COSTS:
     * <ul>
     * <li>When a cost_tran_sched AUTO-ROLLUP record is approved:
     * <li>- a cost_tran record is created with a chrgbck_status of RU
     * <li>When a cost_tran_sched AUTO-CHARGEBACK record is approved:
     * <li>- a cost_tran record is created with a chrgbck_status of PR
     * <li>All cost_tran_sched 'AUTO-ROLLUP' and 'AUTO-CHARGEBACK' records are deleted
     * <li>All cost_tran records with chrgbck_status = CS get set to CA
     * 
     * @param restriction on the cost_tran_recur records.
     */
    public void approveAllChargebackCosts(final String restriction) {
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        CostChargeback.approveAllChargebackCosts(restriction, isMcAndVatEnabled);
    }
    
    /**
     * <p>
     * Approves specified scheduled cost.
     * <li>Creates a new record in the Costs table with the same values as the record in the
     * Scheduled Costs table and assigns an auto-numbered key to the new Cost record.
     * <li>Sets the Cost Status value of the Cost record to RECEIVABLE if the cost is income, or to
     * PAYABLE if the cost is an expense.
     * <li>Sets the Chargeback Status field of the Cost record to NOT CHARGED BACK.
     * <li>Deletes the record from the Scheduled Costs table.
     */
    public void approveScheduledCost(final String costId, final Date datePaid) {
        initPerRequestState();
        
        approveScheduledCostNoInitialization(costId, datePaid);
    }
    
    /**
     * <p>
     * Approves specified scheduled cost.
     * <li>Creates a new record in the Costs table with the same values as the record in the
     * Scheduled Costs table and assigns an auto-numbered key to the new Cost record.
     * <li>Sets the Cost Status value of the Cost record to RECEIVABLE if the cost is income, or to
     * PAYABLE if the cost is an expense.
     * <li>Sets the Chargeback Status field of the Cost record to NOT CHARGED BACK.
     * <li>Deletes the record from the Scheduled Costs table.
     */
    private void approveScheduledCostNoInitialization(final String costId, final Date datePaid) {
        final ScheduledCost scheduledCost =
                this.scheduledCostDataSource.get(Integer.valueOf(costId));
        final ActualCost actualCost = ActualCost.createFromScheduledCost(scheduledCost);
        
        actualCost.setDatePaid(datePaid);
        actualCost.setChargebackStatus("N");
        
        if (actualCost.isIncome()) {
            actualCost.setStatus("RECEIVABLE");
        } else {
            actualCost.setStatus("PAYABLE");
        }
        
        final ActualCost savedActualCost = this.actualCostDataSource.save(actualCost);
        
        /*
         * If the scheduled cost has a CAM Reconciliation Adjustment associated, we must update the
         * adjustment record: remove the scheduled cost id and set the actual cost id
         */
        this.updateCamAdjustmentOnApproveScheduledCost(scheduledCost, savedActualCost);
        
        this.scheduledCostDataSource.delete(scheduledCost);
    }
    
    /**
     * 
     * If the scheduled cost has a CAM Reconciliation Adjustment associated, we must update the
     * adjustment record: remove the scheduled cost id and set the actual cost id.
     * 
     * @param scheduledCost The scheduled cost record
     * @param actualCost The actual cost record
     */
    private void updateCamAdjustmentOnApproveScheduledCost(final ScheduledCost scheduledCost,
            final ActualCost actualCost) {
        boolean isCamCategory = false;
        final String costCategoryId = scheduledCost.getCostCategoryId();
        for (final String costCategory : this.costCategoriesCamReconciliation) {
            if (costCategory.equals(costCategoryId)) {
                isCamCategory = true;
                break;
            }
        }
        if (isCamCategory) {
            // look for the adjustment record
            final String[] adjustmentFields =
                    { "ls_cam_rec_report_id", COST_TRAN_SCHED_ID, COST_TRAN_ID };
            final DataSource adjustmentDS =
                    DataSourceFactory.createDataSourceForFields(LS_CAM_REC_REPORT_TABLE,
                        adjustmentFields);
            adjustmentDS.addRestriction(Restrictions.eq(LS_CAM_REC_REPORT_TABLE,
                COST_TRAN_SCHED_ID, scheduledCost.getId()));
            final List<DataRecord> adjustmentRecords = adjustmentDS.getRecords();
            if (!adjustmentRecords.isEmpty()) {
                // remove the scheduled cost id and set the actual cost id;
                final DataRecord adjustmentRecord = adjustmentRecords.get(0);
                adjustmentRecord.setValue(LS_CAM_REC_REPORT_TABLE + "." + COST_TRAN_SCHED_ID, null);
                adjustmentRecord.setValue(LS_CAM_REC_REPORT_TABLE + "." + COST_TRAN_ID,
                    actualCost.getId());
                adjustmentDS.saveRecord(adjustmentRecord);
            }
        }
    }
    
    /**
     * Move selected Scheduled Cost records to the Costs table.
     * 
     * @param costIds List<String> of primary keys of selected recurring cost records.
     */
    public void approveScheduledCosts(final List costIds) {
        initPerRequestState();
        
        String strIds = "";
        for (int i = 0; i < costIds.size(); i++) {
            strIds += (strIds == "" ? "" : ",") + costIds.get(i);
        }
        
        final List<Clause> clauses = new ArrayList<Clause>();
        clauses.add(Restrictions.in("cost_tran_sched", COST_TRAN_SCHED_ID, strIds));
        final Restriction restriction =
                Restrictions.and(clauses.toArray(new Clause[clauses.size()]));
        
        final ICostDao<ScheduledCost> schedCostDataSource = new ScheduledCostDataSource();
        final List<ScheduledCost> scheduledCosts =
                schedCostDataSource.findByRestriction(restriction);
        for (final ScheduledCost scheduledCost : scheduledCosts) {
            this.approveScheduledCostNoInitialization(String.valueOf(scheduledCost.getId()),
                scheduledCost.getDatePaid());
        }
    }
    
    /**
     * 
     * Deletes the scheduled costs. For the costs that have CAM Reconciliation Adjustments
     * associated (ls_cam_rec_report table), the adjustments are deleted first.
     * 
     * @param costIds List of scheduled cost codes
     */
    public void deleteScheduledCosts(final List<String> costIds) {
        initPerRequestState();
        
        String strIds = "";
        for (int i = 0; i < costIds.size(); i++) {
            strIds += (strIds == "" ? "" : "','") + costIds.get(i);
        }
        
        String sql =
                "DELETE FROM " + LS_CAM_REC_REPORT_TABLE + " WHERE " + COST_TRAN_SCHED_ID
                        + " IN ( '" + strIds + "' )";
        SqlUtils.executeUpdate(LS_CAM_REC_REPORT_TABLE, sql);
        
        sql = sql.replace(LS_CAM_REC_REPORT_TABLE, Constants.SCHED_COST_TABLE);
        SqlUtils.executeUpdate(Constants.SCHED_COST_TABLE, sql);
    }
    
    /**
     * Calculate cash flow projections from costs, scheduled costs, and/or recurring costs. Returns
     * calculation results as a CostProjection object.
     * 
     * @param projectionType The type of projection - "pr", "ls", "taxes", etc. Costs will be
     *            grouped by the corresponding foreign key field. Supported values are defined as
     *            constants in the CreateCostProjection class.
     * @param dateFrom The projection start date.
     * @param dateTo The projection end date.
     * @param period The date interval between projection values - "month", "quarter", or "year".
     * @param calculationType Defines how to calculate totals - "netincome", "income", or "expense".
     * @param isGroupByCostCategory Whether to group costs by cost category.
     * @param isFromCosts Whether to include actual costs into the projection.
     * @param isFromScheduledCosts Whether to include scheduled costs into the projection.
     * @param isFromRecurringCosts Whether to include recurring costs into the projection.
     * @param clientRestriction Optional client restriction string, or null.
     * @param costType selected VAT option ("base", "vat", "total")
     * @param currencyCode selected currency code
     * @param exchangeRateType selected exchange rate type ("Budget" or "Payment)
     * @return CostProjection
     */
    public CostProjection calculateCashFlowProjection(final String projectionType, Date dateFrom,
            Date dateTo, String period, String calculationType,
            final boolean isGroupByCostCategory, final boolean isFromCosts,
            final boolean isFromScheduledCosts, final boolean isFromRecurringCosts,
            final String recurringCostsRestriction, final String scheduledCostsRestriction,
            final String actualCostsRestriction,
            final CurrencyVatRequestParameters currencyVatParameters) {
        initPerRequestState();
        
        // if startDate or endDate is not supplied, use default values from
        // Configuration
        if (dateFrom == null) {
            dateFrom = this.configuration.getDefaultDateStart();
        }
        if (dateTo == null) {
            dateTo = this.configuration.getDefaultDateEnd();
        }
        
        // by default create monthly cash flow projection
        if (period == null) {
            period = Period.MONTH;
        }
        
        if (calculationType == null) {
            calculationType = CostProjection.CALCTYPE_NETINCOME;
        }
        
        final CreateCostProjection creator = new CreateCostProjection(this.recurringCostDataSource);
        
        creator.setCurrencyVatParameters(currencyVatParameters);
        
        return creator.calculateCashFlowProjection(projectionType, dateFrom, dateTo, period,
            calculationType, isGroupByCostCategory, isFromCosts, isFromScheduledCosts,
            isFromRecurringCosts, recurringCostsRestriction, scheduledCostsRestriction,
            actualCostsRestriction, this.status);
    }
    
    /**
     * Performs roll-up and chargeback (proration) of Costs recorded in the cost_tran table
     * according to the Roll-Up and Proration settings in cost_cat (Cost Categories) table.
     * 
     * @param restriction on cost_tran records.
     * @param isDeleteExistingChargeback
     * @param isRecalculatePropertyAndLeaseAreas
     */
    public void calculateChargebackCosts(final String restriction,
            final boolean isDeleteExistingChargeback,
            final boolean isRecalculatePropertyAndLeaseAreas) {
        final boolean isMcAndVatEnabled =
                ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        CostChargeback.calculateChargebackCosts(restriction, isDeleteExistingChargeback,
            isRecalculatePropertyAndLeaseAreas, isMcAndVatEnabled, this.status);
    }
    
    /**
     * Apply yearly factor escalation to cost value
     * 
     * @param recurCostId recurring cost id
     * @param amount cost amount
     * @param date date value
     * @return double value
     */
    public double applyYearlyFactor(final int recurCostId, final double amount, final Date date) {
        initPerRequestState();
        final BigDecimal decimalAmount = new BigDecimal(amount);
        final RecurringCost recurringCost = this.recurringCostDataSource.getRecord(recurCostId);
        final double escalation = recurringCost.calculateYearlyFactorEscalation(date);
        return decimalAmount.multiply(new BigDecimal(escalation)).doubleValue();
    }
    
    /**
     * Calculate cost values at runtime. This method replace JavaScript calculation. Called from
     * cost edit forms and base rent edit forms.
     * 
     * 
     * @param costTable cost table name
     * @param values map with user inputs
     * @param isVatAmountOverride override vat amount
     * @param isVatExcluded if vat is excluded, only for costs associated with leases
     * @return map with calculated values.
     */
    public Map<String, String> calculateCostRuntimeValues(final String costTable,
            final Map<String, String> values, final boolean isVatAmountOverride,
            final boolean isVatExcluded) {
        
        double incomeBase = 0;
        double expenseBase = 0;
        double incomeVAT = 0;
        double expenseVAT = 0;
        double incomeTotal = 0;
        double expenseTotal = 0;
        double vatPercent = 0;
        double vatAmount = 0;
        // get base cost
        if (values.containsKey("amount_income_base_payment")
                && StringUtil.notNullOrEmpty(values.get("amount_income_base_payment"))) {
            incomeBase = Double.valueOf(values.get("amount_income_base_payment"));
        }
        
        if (values.containsKey("amount_expense_base_payment")
                && StringUtil.notNullOrEmpty(values.get("amount_expense_base_payment"))) {
            expenseBase = Double.valueOf(values.get("amount_expense_base_payment"));
        }
        
        if (values.containsKey("vat_amount_override")
                && StringUtil.notNullOrEmpty(values.get("vat_amount_override"))) {
            vatAmount = Double.valueOf(values.get("vat_amount_override"));
        }
        
        if (values.containsKey("vat_percent_value")
                && StringUtil.notNullOrEmpty(values.get("vat_percent_value"))) {
            vatPercent = Double.valueOf(values.get("vat_percent_value"));
        }
        
        // if vat is excluded
        if (isVatExcluded) {
            vatPercent = 0;
            vatAmount = 0;
        }
        // if is vat amount override
        if (isVatAmountOverride && vatAmount != -1.0) {
            if (incomeBase != 0) {
                incomeVAT = vatAmount;
                expenseVAT = 0;
            } else if (expenseBase != 0) {
                incomeVAT = 0;
                expenseVAT = vatAmount;
            }
        }
        
        // vat percent
        if (!isVatAmountOverride) {
            if (vatPercent == 0 && !isVatExcluded) {
                values.put("displayValues", "1");
            }
            incomeVAT = incomeBase * vatPercent / 100;
            expenseVAT = expenseBase * vatPercent / 100;
        }
        
        incomeTotal = incomeBase + incomeVAT;
        expenseTotal = expenseBase + expenseVAT;
        
        // update new values
        values.put("amount_income_vat_payment", String.valueOf(incomeVAT));
        values.put("amount_income_total_payment", String.valueOf(incomeTotal));
        values.put("amount_expense_vat_payment", String.valueOf(expenseVAT));
        values.put("amount_expense_total_payment", String.valueOf(expenseTotal));
        
        return values;
    }
    
    /**
     * Calculate Cam profile fields at runtime.
     * 
     * @param values field values
     * @return calculated values
     */
    public Map<String, String> calculateCamProfile(final Map<String, String> values) {
        
        final String camAllocMethod = values.get("ls_cam_profile.cam_alloc_method");
        // Read field values
        final Double dblBaseRent = getDoubleValue("ls_cam_profile.cam_rent", values);
        final Double dblFixedEstimate = getDoubleValue("ls_cam_profile.cam_cost_fixed", values);
        final Double dblAreaNegotiated =
                getDoubleValue("ls_cam_profile.cam_area_negotiated", values);
        Double dblPercentage = getDoubleValue("ls_cam_profile.cam_rent_pct", values);
        Double dblCostRentPct = getDoubleValue("ls_cam_profile.cam_cost_rent_pct", values);
        Double dblCamCostPerArea = getDoubleValue("ls_cam_profile.cam_cost_per_area", values);
        Double dblCostArea = getDoubleValue("ls_cam_profile.cam_cost_area", values);
        
        if (camAllocMethod.equals("F")) {
            values.remove("ls_cam_profile.cam_rent_pct");
            values.remove("ls_cam_profile.cam_cost_per_area");
            if (dblBaseRent != null && dblBaseRent > 0 && dblFixedEstimate != null) {
                dblPercentage = 100 * dblFixedEstimate / dblBaseRent;
                values.put("ls_cam_profile.cam_rent_pct", dblPercentage.toString());
            }
            if (dblAreaNegotiated != null && dblAreaNegotiated > 0 && dblFixedEstimate != null) {
                dblCamCostPerArea = dblFixedEstimate / dblAreaNegotiated;
                values.put("ls_cam_profile.cam_cost_per_area", dblCamCostPerArea.toString());
            }
        }
        
        if (camAllocMethod.equals("P")) {
            values.remove("ls_cam_profile.cam_cost_rent_pct");
            values.remove("ls_cam_profile.cam_cost_per_area");
            if (dblBaseRent != null && dblBaseRent > 0 && dblPercentage != null) {
                dblCostRentPct = dblBaseRent * dblPercentage / 100;
                values.put("ls_cam_profile.cam_cost_rent_pct", dblCostRentPct.toString());
            }
            if (dblAreaNegotiated != null && dblAreaNegotiated > 0 && dblCostRentPct != null) {
                dblCamCostPerArea = dblCostRentPct / dblAreaNegotiated;
                values.put("ls_cam_profile.cam_cost_per_area", dblCamCostPerArea.toString());
            }
        }
        
        if (camAllocMethod.equals("A")) {
            values.remove("ls_cam_profile.cam_cost_area");
            values.remove("ls_cam_profile.cam_rent_pct");
            if (dblAreaNegotiated != null && dblCamCostPerArea != null) {
                dblCostArea = dblAreaNegotiated * dblCamCostPerArea;
                values.put("ls_cam_profile.cam_cost_area", dblCostArea.toString());
            }
            
            if (dblBaseRent != null && dblBaseRent > 0 && dblCostArea != null) {
                dblPercentage = 100 * dblCostArea / dblBaseRent;
                values.put("ls_cam_profile.cam_rent_pct", dblPercentage.toString());
            }
        }
        return values;
    }
    
    /**
     * Convert cost values according to conversion rate from afm_conversions.
     * 
     * @param costIds list of cost ids
     * @param costTypes list of cost types ("cost_tran", "cost_tran_sched", "cost_tran_recur")
     * @return error message if exchange rate is not defined or null
     */
    public String convertCostForVATAndMC(final List<Integer> costIds, final List<String> costTypes) {
        initPerRequestState();
        final CurrencyAndVat currencyVatManager = new CurrencyAndVat();
        currencyVatManager.setActualCostDataSource(this.actualCostDataSource);
        currencyVatManager.setRecurringCostDataSource(this.recurringCostDataSource);
        currencyVatManager.setScheduledCostDataSource(this.scheduledCostDataSource);
        final long recsNo = costIds.size();
        this.status.setTotalNumber(recsNo);
        String result = "";
        for (int counter = 0; counter < recsNo; counter++) {
            final int costId = costIds.get(counter);
            final String costType = costTypes.get(counter);
            result = currencyVatManager.convertCost(costType, costId);
            if (result == null) {
                result = "";
            } else {
                break;
            }
            this.status.setCurrentNumber(counter);
        }
        
        this.status.setCurrentNumber(recsNo);
        this.status.setCode(JobStatus.JOB_COMPLETE);
        return result;
    }
    
    /**
     * Convert costs value according to conversion rate from afm_conversions.
     * 
     * @param updateAll if we must update all costs
     * @param isNewCost if we must update only new costs
     * @param date specified date
     */
    public void convertCostsForVATAndMC(final boolean updateAll, final boolean isNewCost,
            final Date date) {
        initPerRequestState();
        final CurrencyAndVat currencyVatManager = new CurrencyAndVat();
        currencyVatManager.setActualCostDataSource(this.actualCostDataSource);
        currencyVatManager.setRecurringCostDataSource(this.recurringCostDataSource);
        currencyVatManager.setScheduledCostDataSource(this.scheduledCostDataSource);
        currencyVatManager.convertCosts(updateAll, isNewCost, date, this.status);
    }
    
    /**
     * Create Scheduled Cost records for selected Recurring Cost records.
     * 
     * @param costIds List<String> of primary keys of selected recurring cost records.
     * @param dateEnd
     */
    public void createScheduledCosts(final List costIds, final Date dateEndChosen) {
        initPerRequestState();
        
        // get data from recurring cost records for selected active records
        final List<RecurringCost> recurringCosts =
                this.recurringCostDataSource.findByCostIds(costIds);
        
        // loop over the Recurring cost records; create Scheduled cost records based on the values
        // in each Recurring cost record
        for (final RecurringCost recurringCost : recurringCosts) {
            
            final Date dateStart = recurringCost.getDateStart();
            
            // get earliest end date for this record-chosen date vs. recurring date
            Date dateEndRecurring = recurringCost.getDateEnd();
            if (dateEndRecurring == null || dateEndChosen.before(dateEndRecurring)) {
                dateEndRecurring = dateEndChosen;
            }
            
            // set the values required by the DateAdd function to determine the date intervals at
            // which this recur cost occurs
            final Period recurringPeriod = recurringCost.getRecurringPeriod();
            // original code set increment to period_custom if period == DAY,
            // and to 1 if period != DAY
            
            final Date changeOverDate = recurringCost.getChangeOverDate();
            
            // repeat incrementing date and creating scheduled costs, for each increment create a
            // new scheduled cost record, until reach the end date picked
            final Date dateEnd = dateEndRecurring;
            recurringPeriod.iterate(changeOverDate, dateEnd, new Period.Callback() {
                
                public boolean call(final Date dateNext) {
                    if (!recurringCost.isOutOfSeason(dateNext)) {
                        
                        final ScheduledCost scheduledCost =
                                ScheduledCost.createFromRecurringCost(recurringCost);
                        
                        scheduledCost.setDateDue(dateNext);
                        scheduledCost.setStatus(DEFAULT_SCHEDULED_STATUS);
                        
                        scheduledCost.calculateIncomeAndExpense(recurringCost, dateStart, dateNext,
                            dateEnd);
                        
                        CostService.this.scheduledCostDataSource.save(scheduledCost);
                    }
                    return true;
                }
            });
        } // next recurring cost record
    }
    
    /**
     * Calculate cash flow projections from costs, scheduled costs, and/or recurring costs. Returns
     * calculation results as a DataSet.
     * 
     * @param projectionType
     * @param dateFrom
     * @param dateTo
     * @param period
     * @param calculationType
     * @param isGroupByCostCategory
     * @param isFromCosts
     * @param isFromScheduledCosts
     * @param isFromRecurringCosts
     * @param recurringCostsRestriction
     * @param scheduledCostsRestriction
     * @param actualCostsRestriction
     * @param currencyVatReqParam currency and vat settings
     * @return dataset
     */
    public DataSet getCashFlowProjection(final String projectionType, final Date dateFrom,
            final Date dateTo, final String period, final String calculationType,
            final boolean isGroupByCostCategory, final boolean isFromCosts,
            final boolean isFromScheduledCosts, final boolean isFromRecurringCosts,
            final String recurringCostsRestriction, final String scheduledCostsRestriction,
            final String actualCostsRestriction, final Map<String, String> currencyVatReqParam) {
        
        DataSet dataSet = null;
        final CurrencyVatRequestParameters currencyVatParameters =
                new CurrencyVatRequestParameters(currencyVatReqParam);
        // check cost data integrity
        final CurrencyAndVat currencyAndVat = new CurrencyAndVat();
        final String existCostWithoutCurrency =
                currencyAndVat.checkCostDataIntegrity(isFromCosts, isFromScheduledCosts,
                    isFromRecurringCosts, currencyVatParameters.isMcVatEnabled());
        
        final CostProjection projection =
                calculateCashFlowProjection(projectionType, dateFrom, dateTo, period,
                    calculationType, isGroupByCostCategory, isFromCosts, isFromScheduledCosts,
                    isFromRecurringCosts, recurringCostsRestriction, scheduledCostsRestriction,
                    actualCostsRestriction, currencyVatParameters);
        
        if (!this.status.isStopRequested() && StringUtil.isNullOrEmpty(existCostWithoutCurrency)) {
            this.status.setMessage(EventHandlerBase.localizeString(ContextStore.get()
                .getCurrentContext(), MESSAGE_PREPARING_CASH_FLOW_PROJECTION, this.getClass()
                .getName()));
            dataSet =
                    projectionToDataSet(projection, (DataSource) this.recurringCostDataSource,
                        isGroupByCostCategory);
        } else {
            dataSet = createEmptyDataSet(projection);
        }
        
        this.status.setDataSet(dataSet);
        
        if (this.status.isStopRequested()) {
            this.status.setCode(JobStatus.JOB_STOPPED);
        } else {
            this.status.setCode(JobStatus.JOB_COMPLETE);
        }
        
        if (StringUtil.notNullOrEmpty(existCostWithoutCurrency)) {
            this.status.addProperty("updateLegacyCosts", "true");
            this.status.addProperty("updateLegacyCostsMessage", existCostWithoutCurrency);
        }
        
        return dataSet;
    }
    
    /**
     * Get exchange rate for specified date and currencies.
     * 
     * @param date conversion date
     * @param sourceCurrency source currency
     * @param destinCurrency destination currency
     * @return JSONObject {DateUsedForExchangeRateBudget, ExchangeRateBudget,
     *         DateUsedForExchangeRatePayment, ExchangeRatePayment};
     */
    public JSONObject getExchangeRate(final Date date, final String sourceCurrency,
            final String destinCurrency) {
        final CurrencyAndVat currencyVatManager = new CurrencyAndVat();
        final Map<String, Object> mapExchangeRate =
                currencyVatManager.getExchangeRate(date, sourceCurrency, destinCurrency);
        final JSONObject result = new JSONObject(mapExchangeRate);
        return result;
    }
    
    /**
     * Return VAT percent value for specified cost category and country.
     * 
     * @param costCategoryCode cost category code
     * @param countryCode country code
     * @param leaseCode lease code
     * @return JSONObject {VATPercent, message}
     */
    public JSONObject getVATPercent(final String costCategoryCode, final String countryCode,
            final String leaseCode) {
        final CurrencyAndVat currencyVatManager = new CurrencyAndVat();
        final Map<String, Object> mapVAT =
                currencyVatManager.getVATPercent(costCategoryCode, countryCode, leaseCode);
        final JSONObject result = new JSONObject(mapVAT);
        return result;
    }
    
    /**
     * Verify if currencyCode is a supported ISO 4217 code.
     * 
     * @param currencyCode currency code
     * @return true if currencyCode is a supported ISO 4217 code else return false
     */
    public boolean isValidCurrency(final String currencyCode) {
        boolean validCurrency = true;
        try {
            java.util.Currency.getInstance(currencyCode);
        } catch (final IllegalArgumentException illegalArgumentException) {
            validCurrency = false;
        }
        return validCurrency;
    }
    
    public void setActualCostDataSource(final ICostDao<ActualCost> actualCostDataSource) {
        this.actualCostDataSource = actualCostDataSource;
    }
    
    public void setConfiguration(final Configuration configuration) {
        this.configuration = configuration;
    }
    
    public void setRecurringCostDataSource(final ICostDao<RecurringCost> recurringCostDataSource) {
        this.recurringCostDataSource = recurringCostDataSource;
    }
    
    public void setScheduledCostDataSource(final ICostDao<ScheduledCost> scheduledCostDataSource) {
        this.scheduledCostDataSource = scheduledCostDataSource;
    }
    
    // ----------------------- implementation methods ---------------------------------------------
    
    /**
     * Summarize building costs for financial reports
     * 
     * 1. Create SummarizeCosts instance
     * 
     * 3. Run Summarize Costs calculation
     * 
     * @param dateFrom Start date for date range chosen by user to analyze costs
     * @param dateTo End date for date range chosen by user to analyze costs
     * @param period Recurring cost projection period "month", "quarter", "year" or "custom"
     * @param isFromCosts Whether to include actual cost in financial report
     * @param isFromScheduledCosts Whether to include scheduled cost in financial report
     * @param isFromRecurringCosts Whether to include recurring cost in financial report
     * @param isActiveRecurringCosts is active costs , three state value -1 - all costs; 0 -
     *            inactive costs; 1 - active costs
     * @param currencyVatReqParam currency and vat settings
     * @return
     */
    public void summarizeBuildingCosts(final Date dateFrom, final Date dateTo, final String period,
            final boolean isFromCosts, final boolean isFromScheduledCosts,
            final boolean isFromRecurringCosts, final int isActiveRecurringCosts,
            final Map<String, String> currencyVatReqParam) {
        
        final CurrencyVatRequestParameters currencyVatParameters =
                new CurrencyVatRequestParameters(currencyVatReqParam);
        final SummarizeCosts summarizeCost = new SummarizeCosts("bl");
        summarizeCost.calculate(dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts,
            isFromRecurringCosts, isActiveRecurringCosts, currencyVatParameters, this.status);
    }
    
    /**
     * Summarize lease costs for financial reports.
     * 
     * 1. Create SummarizeCosts instance 2. Run Summarize Costs calculation
     * 
     * @param dateFrom Start date for date range chosen by user to analyze costs
     * @param dateTo End date for date range chosen by user to analyze costs
     * @param period Recurring cost projection period "month", "quarter", "year" or "custom"
     * @param isFromCosts Whether to include actual cost in financial report
     * @param isFromScheduledCosts Whether to include scheduled cost in financial report
     * @param isFromRecurringCosts Whether to include recurring cost in financial report
     * @param isActiveRecurringCosts is active costs , three state value -1 - all costs; 0 -
     *            inactive costs; 1 - active costs
     * @param currVatConfig currency and vat settings
     * @return
     */
    public void summarizeLeaseCosts(final Date dateFrom, final Date dateTo, final String period,
            final boolean isFromCosts, final boolean isFromScheduledCosts,
            final boolean isFromRecurringCosts, final int isActiveRecurringCosts,
            final Map<String, String> currencyVatReqParam) {
        
        final CurrencyVatRequestParameters currencyVatParameters =
                new CurrencyVatRequestParameters(currencyVatReqParam);
        final SummarizeCosts summarizeCost = new SummarizeCosts("ls");
        summarizeCost.calculate(dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts,
            isFromRecurringCosts, isActiveRecurringCosts, currencyVatParameters, this.status);
    }
    
    /**
     * Summarize property costs for financial reports
     * 
     * 1. Create SummarizeCosts instance
     * 
     * 3. Run Summarize Costs calculation
     * 
     * @param dateFrom Start date for date range chosen by user to analyze costs
     * @param dateTo End date for date range chosen by user to analyze costs
     * @param period Recurring cost projection period "month", "quarter", "year" or "custom"
     * @param isFromCosts Whether to include actual cost in financial report
     * @param isFromScheduledCosts Whether to include scheduled cost in financial report
     * @param isFromRecurringCosts Whether to include recurring cost in financial report
     * @param isActiveRecurringCosts is active costs , three state value -1 - all costs; 0 -
     *            inactive costs; 1 - active costs
     * @param currVatConfig currency and vat settings
     * @return
     */
    public void summarizePropertyCosts(final Date dateFrom, final Date dateTo, final String period,
            final boolean isFromCosts, final boolean isFromScheduledCosts,
            final boolean isFromRecurringCosts, final int isActiveRecurringCosts,
            final Map<String, String> currencyVatReqParam) {
        
        final CurrencyVatRequestParameters currencyVatParameters =
                new CurrencyVatRequestParameters(currencyVatReqParam);
        final SummarizeCosts summarizeCost = new SummarizeCosts("pr");
        summarizeCost.calculate(dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts,
            isFromRecurringCosts, isActiveRecurringCosts, currencyVatParameters, this.status);
        
    }
    
    /**
     * Update VAT field values for costs.
     * 
     * @param costIds list of cost id's
     * @param costTypes list of cost types
     */
    public void updateCostRecordforVATandMC(final List<Integer> costIds,
            final List<String> costTypes) {
        initPerRequestState();
        final CurrencyAndVat currencyVatManager = new CurrencyAndVat();
        currencyVatManager.setActualCostDataSource(this.actualCostDataSource);
        currencyVatManager.setRecurringCostDataSource(this.recurringCostDataSource);
        currencyVatManager.setScheduledCostDataSource(this.scheduledCostDataSource);
        currencyVatManager.updateCostRecords(costIds, costTypes, this.status);
    }
    
    /**
     * Update field value for selected costs.
     * 
     * <p>
     * Suppress PMD warning "AvoidUsingSql" in this method.
     * <p>
     * Justification: Case #2. Bulk updates. #2.2. Statements with UPDATE ... WHERE pattern.
     * 
     * @param costTable cost table name
     * @param fieldName field that is updated
     * @param fieldValue neutral field value
     * @param costIds list of selected costs
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    public void updateSelectedCosts(final String costTable, final String fieldName,
            final String fieldValue, final List costIds) {
        String sqlRestriction = "1=1";
        
        initPerRequestState();
        
        if (Constants.ACTUAL_COST_TABLE.equals(costTable)) {
            sqlRestriction = this.actualCostDataSource.createSqlRestrictionForCosts(costIds);
        } else if (Constants.RECUR_COST_TABLE.equals(costTable)) {
            sqlRestriction = this.recurringCostDataSource.createSqlRestrictionForCosts(costIds);
        } else if (Constants.SCHED_COST_TABLE.equals(costTable)) {
            sqlRestriction = this.scheduledCostDataSource.createSqlRestrictionForCosts(costIds);
        }
        
        final String sql =
                "UPDATE " + costTable + " SET " + fieldName + " = '" + fieldValue + "' WHERE "
                        + sqlRestriction;
        
        SqlUtils.executeUpdate(costTable, sql);
    }
    
    /**
     * Creates records from projection cost periods for specified asset and cost category.
     * 
     * @param dataSource
     * @param rowDimension
     * @param columnDimension
     * @param measure
     * @param assetId
     * @param costCategory
     * @param periods
     * @param records
     */
    private void addRecords(final DataSource dataSource, final String rowDimension,
            final String columnDimension, final String measure, final String assetId,
            final String costCategory, final List<CostPeriod> periods,
            final List<DataRecord> records) {
        
        if (!verifyPeriodsHaveCosts(periods)) {
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
    
    /**
     * Verify if at least one period has a non zero cost attached.
     * 
     * @param periods
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
     * Get field double value.
     * 
     * @param field field name
     * @param values fields values
     * @return field value or null
     */
    private Double getDoubleValue(final String field, final Map<String, String> values) {
        Double result = null;
        if (values.containsKey(field) && StringUtil.notNullOrEmpty(values.get(field))) {
            result = Double.valueOf(values.get(field));
        }
        return result;
    }
    
    // ----------------------- getters and setters ------------------------------------------------
    
    private DataSet2D createEmptyDataSet(final CostProjection projection) {
        final String ROW_DIMENSION = "cost_tran_recur." + projection.getAssetKey();
        final String COL_DIMENSION = "cost_tran_recur.date_start";
        return new DataSet2D(ROW_DIMENSION, COL_DIMENSION);
    }
    
    /**
     * Initializes per-request state variables.
     */
    private void initPerRequestState() {
        this.configuration.loadSchemaPreferences();
        if (this.actualCostDataSource == null) {
            this.actualCostDataSource = new ActualCostDataSource();
        }
        if (this.scheduledCostDataSource == null) {
            this.scheduledCostDataSource = new ScheduledCostDataSource();
        }
        if (this.recurringCostDataSource == null) {
            this.recurringCostDataSource = new RecurringCostDataSource();
        }
        if (this.costCategoriesCamReconciliation == null) {
            final String costCategories =
                    com.archibus.service.Configuration.getActivityParameterString("AbRPLMCosts",
                        "CAM_Reconciliation");
            if (StringUtil.notNullOrEmpty(costCategories)) {
                this.costCategoriesCamReconciliation = costCategories.split(";");
            } else {
                this.costCategoriesCamReconciliation = new String[] { "RENT - CAM RECONCILIATION" };
            }
        }
    }
    
    /**
     * Creates DataSet from CashFlowProjection.
     * 
     * @return DataSet2D
     */
    private DataSet projectionToDataSet(final CostProjection projection,
            final DataSource dataSource, final boolean isGroupByCostCategory) {
        final String ROW_DIMENSION = "cost_tran_recur." + projection.getAssetKey();
        final String COL_DIMENSION = "cost_tran_recur.date_start";
        final String MEASURE = "cost_tran_recur.amount_income";
        
        final List<DataRecord> records = new ArrayList<DataRecord>();
        for (final String assetId : projection.getAssetIds()) {
            
            if (isGroupByCostCategory) {
                final List<String> costCategories = projection.getCostCategories(assetId);
                
                for (final String costCategory : costCategories) {
                    final List<CostPeriod> periods =
                            projection.getPeriodsForAssetAndCostCategory(assetId, costCategory);
                    addRecords(dataSource, ROW_DIMENSION, COL_DIMENSION, MEASURE, assetId,
                        costCategory, periods, records);
                    
                }
            } else {
                final List<CostPeriod> periods = projection.getPeriodsForAsset(assetId);
                addRecords(dataSource, ROW_DIMENSION, COL_DIMENSION, MEASURE, assetId, null,
                    periods, records);
            }
        }
        
        final DataSet2D dataSet = createEmptyDataSet(projection);
        dataSet.addRecords(records);
        return dataSet;
    }
}
