package com.archibus.app.common.finance.dao.datasource;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finance.domain.ScheduledCost;

/**
 * DataSource for ScheduledCost.
 * 
 * @author Ioan Draghici
 * @author Valery Tydykov
 */
public class ScheduledCostDataSource extends AbstractCostDataSource<ScheduledCost> {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Only fields specific to ScheduledCost are specified here, the common fields are specified in
     * the base class.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "cost_tran_sched_id", "id" },
            { "cost_tran_recur_id", "recurCostId" }, { "date_assessed", "dateAssessed" },
            { "date_due", "dateDue" }, { "date_paid", "datePaid" },
            { Constants.STATUS, Constants.STATUS } };
    
    /**
     * Constructs ScheduledCostDataSource, mapped to <code>cost_tran_sched</code> table, using
     * <code>scheduledCost</code> bean.
     */
    public ScheduledCostDataSource() {
        super("scheduledCost", "cost_tran_sched");
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES in this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);
        
        return fieldsToPropertiesMerged;
    }
}
