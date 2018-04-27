package com.archibus.service.cost;

import java.util.*;

import com.archibus.utility.StringUtil;

/**
 * Report request parameters.
 * <p>
 * Handle filter options: analyze cost from, analyze cost for, time information, geographical
 * selection.
 * <p>
 * 
 * 
 * @author Ioan Draghici
 * @since 21.1
 * 
 */
public class RequestParameters {
    
    /**
     * Constant fiscal.
     */
    static final String FISCAL = "fiscal";
    
    /**
     * Analyze recurring costs.
     */
    private boolean isFromRecurringCosts;
    
    /**
     * Analyze scheduled costs.
     */
    private boolean isFromScheduledCosts;
    
    /**
     * Analyze actual costs.
     */
    private boolean isFromActualCosts;
    
    /**
     * Analyze cost associated with: pr, bl, ac, lsBl, lsPr, ls.
     */
    private String costsAssociatedWith;
    
    /**
     * Calculation type : income, expense, both.
     */
    private String calculationType;
    
    /**
     * If time range is on fiscal year.
     */
    private boolean isFiscal;
    
    /**
     * Time range span.
     */
    private String timeRangeSpan;
    
    /**
     * Start date.
     */
    private final Date startDate;
    
    /**
     * End date.
     */
    private final Date endDate;
    
    /**
     * Geographical request parameters.
     */
    private final Map<String, String> geographicalParameters;
    
    /**
     * Geographical request parameters.
     */
    private final Map<String, String> currencyParameters;
    
    /**
     * Geographical request parameters.
     */
    private final Map<String, String> reportParameters;
    
    /**
     * Form multiple values separator.
     */
    private final String multipleValueSeparator;
    
    /**
     * Base rent cost category.
     */
    private String baseRentCostCategory;
    
    /**
     * CAM estimate cost category.
     */
    private String camEstimateCostCategory;
    
    /**
     * CAM reconciliation cost category.
     */
    private String camReconciliationCostCategory;
    
    /**
     * 
     * Constructor specifying request parameters.
     * 
     * @param dateFrom start date
     * @param dateTo end date
     * @param reportReqParam cost parameters
     * @param geoReqParam geographical parameters
     * @param currencyReqParam currency parameters
     */
    public RequestParameters(final Date dateFrom, final Date dateTo,
            final Map<String, String> reportReqParam, final Map<String, String> geoReqParam,
            final Map<String, String> currencyReqParam) {
        
        this.startDate = dateFrom;
        this.endDate = dateTo;
        
        this.reportParameters = reportReqParam;
        this.geographicalParameters = geoReqParam;
        this.multipleValueSeparator = geoReqParam.get(Constants.PARAM_MULTIPLE_VALUE_SEPARATOR);
        
        this.currencyParameters = currencyReqParam;
        
        intializeReportParameters();
    }
    
    /**
     * Return MC & Vat parameter value.
     * 
     * @param key parameter name
     * @return string value
     */
    public String getCurrencyParameter(final String key) {
        String value = null;
        if (this.currencyParameters.containsKey(key)) {
            value = this.currencyParameters.get(key);
        }
        return value;
    }
    
    /**
     * Returns formatted geographical field. Can have multiple values.
     * 
     * @param fieldName field name
     * @return formatted value
     */
    public String getGeographicalField(final String fieldName) {
        String value = null;
        if (this.geographicalParameters.containsKey(fieldName)) {
            value =
                    formatMultipleValue(this.geographicalParameters.get(fieldName),
                        this.multipleValueSeparator);
        }
        return value;
    }
    
    /**
     * Disable check style: duplicate code for getter and setter
     */
    // CHECKSTYLE: off
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
    
    // CHECKSTYLE: on
    /**
     * Returns true if time range is on fiscal year , false if is null or calendar year.
     * 
     * @return boolean
     */
    public boolean isFiscalYear() {
        return this.isFiscal;
    }
    
    /**
     * Getter for the isFromRecurring property.
     * 
     * @see isFromRecurring
     * @return the isFromRecurring property.
     */
    public boolean isFromRecurring() {
        return this.isFromRecurringCosts;
    }
    
    /**
     * Getter for the isFromScheduled property.
     * 
     * @see isFromScheduled
     * @return the isFromScheduled property.
     */
    public boolean isFromScheduled() {
        return this.isFromScheduledCosts;
    }
    
    /**
     * Getter for the isFromActual property.
     * 
     * @see isFromActual
     * @return the isFromActual property.
     */
    public boolean isFromActual() {
        return this.isFromActualCosts;
    }
    
    /**
     * Getter for the costsAssociatedWith property.
     * 
     * @see costsAssociatedWith
     * @return the costsAssociatedWith property.
     */
    public String getCostsAssociatedWith() {
        return this.costsAssociatedWith;
    }
    
    /**
     * Getter for the timeRangeSpan property.
     * 
     * @see timeRangeSpan
     * @return the timeRangeSpan property.
     */
    public String getTimeRangeSpan() {
        return this.timeRangeSpan;
    }
    
    /**
     * Getter for the costType property.
     * 
     * @see calculationType
     * @return the calculationType property.
     */
    public String getCalculationType() {
        return this.calculationType;
    }
    
    /**
     * Getter for the baseRentCostCategory property.
     * 
     * @see baseRentCostCategory
     * @return the baseRentCostCategory property.
     */
    public String getBaseRentCostCategory() {
        return this.baseRentCostCategory;
    }
    
    /**
     * Setter for the baseRentCostCategory property.
     * 
     * @see baseRentCostCategory
     * @param baseRentCostCategory the baseRentCostCategory to set
     */
    
    public void setBaseRentCostCategory(final String baseRentCostCategory) {
        this.baseRentCostCategory = baseRentCostCategory;
    }
    
    /**
     * Getter for the camEstimateCostCategory property.
     * 
     * @see camEstimateCostCategory
     * @return the camEstimateCostCategory property.
     */
    public String getCamEstimateCostCategory() {
        return this.camEstimateCostCategory;
    }
    
    /**
     * Setter for the camEstimateCostCategory property.
     * 
     * @see camEstimateCostCategory
     * @param camEstimateCostCategory the camEstimateCostCategory to set
     */
    
    public void setCamEstimateCostCategory(final String camEstimateCostCategory) {
        this.camEstimateCostCategory = camEstimateCostCategory;
    }
    
    /**
     * Getter for the camReconciliationCostCategory property.
     * 
     * @see camReconciliationCostCategory
     * @return the camReconciliationCostCategory property.
     */
    public String getCamReconciliationCostCategory() {
        return this.camReconciliationCostCategory;
    }
    
    /**
     * Setter for the camReconciliationCostCategory property.
     * 
     * @see camReconciliationCostCategory
     * @param camReconciliationCostCategory the camReconciliationCostCategory to set
     */
    
    public void setCamReconciliationCostCategory(final String camReconciliationCostCategory) {
        this.camReconciliationCostCategory = camReconciliationCostCategory;
    }
    
    /**
     * Initialize some report parameters.
     * 
     */
    private void intializeReportParameters() {
        if (!this.reportParameters.isEmpty()) {
            final String costFrom = this.reportParameters.get("showCostFrom");
            this.isFromRecurringCosts =
                    costFrom.indexOf(Constants.RECUR_COST_TABLE + this.multipleValueSeparator) != -1;
            this.isFromScheduledCosts =
                    costFrom.indexOf(Constants.SCHED_COST_TABLE + this.multipleValueSeparator) != -1;
            this.isFromActualCosts =
                    costFrom.indexOf(Constants.ACTUAL_COST_TABLE + this.multipleValueSeparator) != -1;
            this.isFiscal = FISCAL.equals(this.reportParameters.get("timeRangeType").toLowerCase());
            this.costsAssociatedWith = this.reportParameters.get("showCostFor");
            this.timeRangeSpan = this.reportParameters.get("timeRangeSpan");
            this.calculationType = this.reportParameters.get("showCostTypeOf");
        }
    }
    
    /**
     * 
     * Format string for multiple values. Replace form multiple value separator with comma.
     * 
     * @param value string value
     * @param separator form multiple value separator
     * @return formatted string
     */
    private String formatMultipleValue(final String value, final String separator) {
        String formattedValue = null;
        if (StringUtil.notNullOrEmpty(value) && StringUtil.notNullOrEmpty(separator)) {
            formattedValue = value.replaceAll(separator, Constants.COMMA);
            if (formattedValue.indexOf(Constants.COMMA) == 0) {
                formattedValue = formattedValue.substring(1);
            }
        }
        return formattedValue;
    }
    
}
