package com.archibus.service.cost;

import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataSet;
import com.archibus.jobmanager.JobBase;
import com.archibus.model.config.ExchangeRateType;
import com.archibus.utility.StringUtil;

/**
 * 
 * Provides WFR-ules for cost reporting.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class CostReportingService extends JobBase {
    
    /**
     * If Enhanced Global feature set is enabled.
     */
    private boolean isMcAndVatEnabled;
    
    /**
     * Report request parameters.
     */
    private RequestParameters requestParameters;
    
    /**
     * Multi currency object.
     */
    private CurrencyUtilities currencyUtilities;
    
    /**
     * Vat object.
     */
    private VatUtilities vatUtilities;
    
    /**
     * Returns Straight Line Rent projection.
     * 
     * @param dateFrom projection start date
     * @param dateTo projection end date
     * @param reportReqParam report request parameters
     * @param geoReqParam geographical request parameters
     * @param currencyReqParam currency request parameters
     * @return data set
     */
    public DataSet getStraightLineRentProjection(final Date dateFrom, final Date dateTo,
            final Map<String, String> reportReqParam, final Map<String, String> geoReqParam,
            final Map<String, String> currencyReqParam) {
        // initialize report request parameters.
        initPerRequestVariables(dateFrom, dateTo, reportReqParam, geoReqParam, currencyReqParam);
        final CostReportingHelper costReportingHelper = new CostReportingHelper();
        return costReportingHelper.getStraightLineRentProjection(this.requestParameters,
            this.currencyUtilities, this.vatUtilities, this.isMcAndVatEnabled, this.status);
    }
    
    /**
     * Returns Straight Line Rent details projection.
     * 
     * @param leaseId lease code
     * @param dateFrom projection start date
     * @param dateTo projection end date
     * @param reportReqParam report request parameters
     * @param geoReqParam geographical request parameters
     * @param currencyReqParam multi currency and vat request parameters
     * @return data set
     */
    public DataSet getStraightLineRentDetailsProjection(final String leaseId, final Date dateFrom,
            final Date dateTo, final Map<String, String> reportReqParam,
            final Map<String, String> geoReqParam, final Map<String, String> currencyReqParam) {
        // initialize report request parameters.
        initPerRequestVariables(dateFrom, dateTo, reportReqParam, geoReqParam, currencyReqParam);
        final CostReportingHelper costReportingHelper = new CostReportingHelper();
        return costReportingHelper.getStraightLineRentDetailsProjection(leaseId,
            this.requestParameters, this.currencyUtilities, this.vatUtilities,
            this.isMcAndVatEnabled, this.status);
    }
    
    /**
     * Calculate CAM Reconciliation costs.
     * 
     * @param leaseId lease code
     * @param dateFrom start date
     * @param dateTo end date
     * @param currencyReqParam Mc & Vat request parameters
     */
    public void calculateCamReconciliation(final String leaseId, final Date dateFrom,
            final Date dateTo, final Map<String, String> currencyReqParam) {
        initPerRequestVariables(dateFrom, dateTo, currencyReqParam);
        final CostReportingHelper costReportingHelper = new CostReportingHelper();
        costReportingHelper.calculateCamReconciliationData(leaseId, this.requestParameters,
            this.isMcAndVatEnabled, this.currencyUtilities, this.vatUtilities);
    }
    
    /**
     * Initialize request variables.
     * 
     * @param dateFrom start date
     * @param dateTo end date
     * @param currencyReqParam MC & VAT request variables.
     */
    private void initPerRequestVariables(final Date dateFrom, final Date dateTo,
            final Map<String, String> currencyReqParam) {
        initPerRequestVariables(dateFrom, dateTo, new HashMap<String, String>(),
            new HashMap<String, String>(), currencyReqParam);
    }
    
    /**
     * Initialize request variables.
     * 
     * @param dateFrom start date
     * @param dateTo end date
     * @param reportReqParam report request parameters
     * @param geoReqParam geographical request parameters
     * @param currencyReqParam MC & VAT request variables.
     */
    private void initPerRequestVariables(final Date dateFrom, final Date dateTo,
            final Map<String, String> reportReqParam, final Map<String, String> geoReqParam,
            final Map<String, String> currencyReqParam) {
        this.requestParameters =
                new RequestParameters(dateFrom, dateTo, reportReqParam, geoReqParam,
                    currencyReqParam);
        // init cost categories.
        initCostCategories();
        
        this.isMcAndVatEnabled = ContextStore.get().getProject().isVatAndMultiCurrencyEnabled();
        
        if (this.isMcAndVatEnabled) {
            this.vatUtilities =
                    new VatUtilities(
                        this.requestParameters.getCurrencyParameter(Constants.INPUT_PARAMETER_VAT));
            final String currencyCode =
                    this.requestParameters
                        .getCurrencyParameter(Constants.INPUT_PARAMETER_CURRENCY_CODE);
            final String currencyType =
                    this.requestParameters
                        .getCurrencyParameter(Constants.INPUT_PARAMETER_CURRENCY_TYPE);
            final String exchangeRateType =
                    this.requestParameters
                        .getCurrencyParameter(Constants.INPUT_PARAMETER_EXCHANGE_RATE_TYPE);
            this.currencyUtilities =
                    new CurrencyUtilities(currencyCode, exchangeRateType, currencyType);
            this.currencyUtilities.loadCurrencyConversions();
        } else {
            this.vatUtilities = new VatUtilities(VatType.TOTAL);
            this.currencyUtilities =
                    new CurrencyUtilities(ContextStore.get().getProject().getBudgetCurrency(),
                        ExchangeRateType.BUDGET, CurrencyType.BUDGET);
        }
    }
    
    /**
     * Initialize cost categories from activity parameters.
     * 
     */
    private void initCostCategories() {
        if (StringUtil.isNullOrEmpty(this.requestParameters.getBaseRentCostCategory())) {
            this.requestParameters.setBaseRentCostCategory(getActivityParameterValue(
                Constants.REPM_COST_ACTIVITY_ID, Constants.BASE_RENT_ACTIVITY_PARAM,
                Constants.BASE_RENT_COST_CATEG));
        }
        if (StringUtil.isNullOrEmpty(this.requestParameters.getCamEstimateCostCategory())) {
            this.requestParameters.setCamEstimateCostCategory(getActivityParameterValue(
                Constants.REPM_COST_ACTIVITY_ID, Constants.CAM_ESTIMATE_ACTIVITY_PARAM,
                Constants.CAM_ESTIMATE_COST_CATEG));
        }
        if (StringUtil.isNullOrEmpty(this.requestParameters.getCamReconciliationCostCategory())) {
            this.requestParameters.setCamReconciliationCostCategory(getActivityParameterValue(
                Constants.REPM_COST_ACTIVITY_ID, Constants.CAM_RECONCILIATION_ACTIVITY_PARAM,
                Constants.CAM_RECONCILIATION_COST_CATEG));
        }
    }
    
    /**
     * Get activity parameters value.
     * 
     * @param activityId activity id
     * @param paramName parameter name
     * @param defaultValue default value
     * @return parameter value
     */
    private String getActivityParameterValue(final String activityId, final String paramName,
            final String defaultValue) {
        String value =
                com.archibus.service.Configuration
                    .getActivityParameterString(activityId, paramName);
        if (StringUtil.isNullOrEmpty(value)) {
            value = defaultValue;
        }
        // if we have multiple values replace separator with comma.
        value = value.replaceAll(";", ",");
        return value;
    }
}
