package com.archibus.app.common.finance.dao.datasource;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finance.domain.RecurringCost;

/**
 * DataSource for RecurringCost.
 * 
 * @author Ioan Draghici
 * @author Valery Tydykov
 */
public class RecurringCostDataSource extends AbstractCostDataSource<RecurringCost> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Only fields specific to RecurringCost are specified here, the common fields are specified in
     * the base class.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "cost_tran_recur_id", "id" },
            { "date_start", "dateStart" }, { "date_end", "dateEnd" },
            { "date_seasonal_start", "dateSeasonalStart" },
            { "date_seasonal_end", "dateSeasonalEnd" }, { Constants.PERIOD, Constants.PERIOD },
            { "period_custom", "periodCustom" }, { "yearly_factor", "yearlyFactor" },
            { "status_active", "statusActive" } };
    
    /**
     * Constructs RecurringCostDataSource, mapped to <code>cost_tran_recur</code> table, using
     * <code>recurringCost</code> bean.
     */
    public RecurringCostDataSource() {
        super("recurringCost", "cost_tran_recur");
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES in this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);
        
        return fieldsToPropertiesMerged;
    }
}
