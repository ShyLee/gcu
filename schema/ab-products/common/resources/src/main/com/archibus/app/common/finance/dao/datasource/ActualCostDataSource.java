package com.archibus.app.common.finance.dao.datasource;

import java.util.*;

import org.apache.commons.lang.ArrayUtils;

import com.archibus.app.common.finance.domain.ActualCost;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * DataSource for ActualCost.
 * <p>
 * Designed to have singleton scope in order to be dependency of a singleton bean: method to be
 * called from singleton bean uses new instance of this object on each call.
 * 
 * @author Ioan Draghici
 * @author Valery Tydykov
 */
public class ActualCostDataSource extends AbstractCostDataSource<ActualCost> {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     * <p>
     * Only fields specific to ActualCost are specified here, the common fields are specified in the
     * base class.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = { { "cost_tran_id", "id" },
            { "cost_tran_recur_id", "recurCostId" }, { "date_assessed", "dateAssessed" },
            { "date_due", "dateDue" }, { Constants.DATE_PAID, "datePaid" },
            { Constants.STATUS, Constants.STATUS }, { "chrgbck_status", "chargebackStatus" },
            { "invoice_id", "invoiceId" } };
    
    /**
     * Constructs ActualCostDataSource, mapped to <code>cost_tran</code> table, using
     * <code>actualCost</code> bean.
     */
    public ActualCostDataSource() {
        super("actualCost", Constants.COST_TRAN);
    }
    
    /** {@inheritDoc} */
    public ActualCost[] getActualCostsByCategoryAndMonth(final String costCategoryId,
            final int month, final int year) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from costCategoryId and month.
        final ParsedRestrictionDef restrictionDef = prepareRestriction(costCategoryId, month, year);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        // TODO: (VT): change returned type to List<ActualCost>
        final List<ActualCost> actualCosts =
                new DataSourceObjectConverter<ActualCost>().convertRecordsToObjects(records,
                    this.beanName, this.fieldToPropertyMapping, null);
        
        return actualCosts.toArray(new ActualCost[actualCosts.size()]);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        // merge fieldsToProperties from the base class with FIELDS_TO_PROPERTIES in this class
        final String[][] fieldsToPropertiesMerged =
                (String[][]) ArrayUtils.addAll(super.getFieldsToProperties(), FIELDS_TO_PROPERTIES);
        
        return fieldsToPropertiesMerged;
    }
    
    /**
     * Prepares parsed restriction from the supplied costCategoryId, month, year.
     * 
     * @param costCategoryId to be used in restriction.
     * @param month to be used in restriction.
     * @param year to be used in restriction.
     * @return restriction.
     */
    private ParsedRestrictionDef prepareRestriction(final String costCategoryId, final int month,
            final int year) {
        // calculate dateFrom, lastDayOfMonth
        Date dateFrom = null;
        int lastDayOfMonth;
        {
            final GregorianCalendar calendar = new GregorianCalendar(year, month, 1);
            lastDayOfMonth = calendar.getActualMaximum(Calendar.DAY_OF_MONTH);
            dateFrom = calendar.getTime();
        }
        
        // calculate dateTo using lastDayOfMonth
        final Date dateTo = new GregorianCalendar(year, month, lastDayOfMonth).getTime();
        
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        restrictionDef.addClause(Constants.COST_TRAN, Constants.COST_CAT_ID, costCategoryId,
            Operation.EQUALS);
        // use dateTo and dateFrom in the restriction
        restrictionDef.addClause(Constants.COST_TRAN, Constants.DATE_PAID, dateFrom, Operation.GTE);
        restrictionDef.addClause(Constants.COST_TRAN, Constants.DATE_PAID, dateTo, Operation.LTE);
        
        return restrictionDef;
    }
}
