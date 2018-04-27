package com.archibus.service.common;

import java.util.*;

import org.json.JSONArray;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.ViewHandlers;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.model.view.AbstractViewFieldDef;
import com.archibus.model.view.datasource.AbstractDataSourceDef;
import com.archibus.model.view.datasource.converter.DataSourceRuntimeConverter;
import com.archibus.model.view.datasource.field.*;
import com.archibus.model.view.datasource.grouping.*;
import com.archibus.model.view.datasource.grouping.CalculatedFormulaFieldDef.SqlFormula;
import com.archibus.model.view.datasource.processor.DataSourceUnitsConverter;
import com.archibus.model.view.form.processor.AnalysisViewDefGenerator;
import com.archibus.schema.ArchibusFieldDefBase;

/**
 * Helper class for statistic data service.
 * 
 * Calculate statistic data: minimum, maximum, average and totals.
 * 
 * @author Ioan Draghici
 * @since 20.1
 * 
 */
public class StatisticDataHelper {
    /**
     * Field name: counts.
     */
    static final String COUNT_FIELD = "count_of_records";
    
    /**
     * Constant: DOT.
     */
    static final String DOT = ".";
    
    /**
     * Control data source id.
     */
    static final String INPUT_DATA_SOURCE_ID = ViewHandlers.INPUT_DATA_SOURCE_ID;
    
    /**
     * Filter values.
     */
    static final String INPUT_FILTER_VALUES = ViewHandlers.INPUT_FILTER_VALUES;
    
    /**
     * Record limit.
     */
    static final String INPUT_RECORD_LIMIT = "recordLimit";
    
    /**
     * Restriction.
     */
    static final String INPUT_RESTRICTION = ViewHandlers.INPUT_RESTRICTION;
    
    /**
     * Show average.
     */
    static final String INPUT_SHOW_AVG = "showAvg";
    
    /**
     * Show counts.
     */
    static final String INPUT_SHOW_COUNTS = "showCounts";
    
    /**
     * Show max.
     */
    static final String INPUT_SHOW_MAX = "showMax";
    
    /**
     * Show min.
     */
    static final String INPUT_SHOW_MIN = "showMin";
    
    /**
     * Show totals.
     */
    static final String INPUT_SHOW_TOTALS = "showTotals";
    
    /**
     * Sort values.
     */
    static final String INPUT_SORT_VALUES = ViewHandlers.INPUT_SORT_VALUES;
    
    /**
     * Statistic fields.
     */
    static final String INPUT_STATISTIC_FIELDS = "statisticFields";
    
    /**
     * View name.
     */
    static final String INPUT_VIEW_NAME = ViewHandlers.INPUT_VIEW_NAME;
    
    /**
     * Parameter name.
     */
    static final String OUTPUT_AVERAGE = "average";
    
    /**
     * Parameter name.
     */
    static final String OUTPUT_MAXIMUM = "maximum";
    
    /**
     * Parameter name.
     */
    static final String OUTPUT_MINIMUM = "minimum";
    
    /**
     * Parameter name.
     */
    static final String OUTPUT_TOTALS = "totals";
    
    /**
     * Constant: UNDERSCORE.
     */
    static final String UNDERSCORE = "_";
    
    /**
     * If average values must be displayed.
     */
    private boolean isShowAvg;
    
    /**
     * If records number should be displayed.
     */
    private boolean isShowCounts;
    
    /**
     * If maximum values must be displayed.
     */
    private boolean isShowMax;
    
    /**
     * If minimum values must be displayed.
     */
    private boolean isShowMin;
    
    /**
     * If totals must be displayed.
     */
    private boolean isShowTotals;
    
    /**
     * Statistic fields list.
     */
    private List<String> statisticFields;
    
    /**
     * Get statistic data records.
     * 
     * @param context event handler context
     * @return map object
     */
    public Map<String, DataRecord> getStatisticDataRecord(final EventHandlerContext context) {
        
        // read context parameters
        readContextParameters(context);
        // load data source from view
        final DataSource controlDataSource = getControlDataSource(context);
        // get data source definition
        final AbstractDataSourceDef controlDataSourceDef = controlDataSource.getDataSourceDef();
        // get main table name
        final String tableName = controlDataSourceDef.getMainTableName();
        // get sql query from control data source
        final String controlDsQuery = getSqlQuery(context, controlDataSource);
        
        final Map<String, DataRecord> result = new HashMap<String, DataRecord>();
        // get totals
        if (this.isShowTotals) {
            final DataRecord totals =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.SUM, "sum", this.isShowCounts);
            result.put(OUTPUT_TOTALS, totals);
        }
        
        // get max values
        if (this.isShowMax) {
            final DataRecord maximum =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.MAX, "max", this.isShowCounts);
            result.put(OUTPUT_MAXIMUM, maximum);
        }
        
        // get min values
        if (this.isShowMin) {
            final DataRecord minimum =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.MIN, "min", this.isShowCounts);
            result.put(OUTPUT_MINIMUM, minimum);
        }
        
        // get average values
        if (this.isShowAvg) {
            final DataRecord average =
                    generateDataSourceAndGetData(controlDsQuery, controlDataSourceDef, tableName,
                        this.statisticFields, SqlFormula.AVG, "avg", this.isShowCounts);
            result.put(OUTPUT_AVERAGE, average);
        }
        
        return result;
    }
    
    /**
     * Creates calculated field definition for specified base field.
     * 
     * @param tableName table name
     * @param baseField base field
     * @param formula field formula
     * @param dataType field data type
     * @return field definition
     */
    private AbstractVirtualFieldDef createCalculatedFieldDef(final String tableName,
            final AbstractDataSourceFieldDef baseField, final SqlFormula formula,
            final AbstractViewFieldDef.DataType dataType) {
        
        AbstractVirtualFieldDef calculatedField = null;
        {
            final CalculatedFormulaFieldDef formulaField = new CalculatedFormulaFieldDef();
            formulaField.setBaseField(new ReferenceFieldDef(baseField.getFullName()));
            formulaField.setDataType(dataType);
            formulaField.setTableName(tableName);
            formulaField.setSqlFormula(formula);
            calculatedField = formulaField;
        }
        
        if (baseField instanceof AbstractVirtualFieldDef) {
            // the base field is virtual - use its properties for calculated field
            final AbstractVirtualFieldDef virtualBaseField = (AbstractVirtualFieldDef) baseField;
            calculatedField.setSize(virtualBaseField.getSize());
            calculatedField.setDecimals(virtualBaseField.getDecimals());
            if (dataType == null) {
                calculatedField.setDataType(virtualBaseField.getDataType());
            }
            calculatedField.setTitle(virtualBaseField.getTitle());
            calculatedField.setNumericFormat(virtualBaseField.getNumericFormat());
            
        } else {
            // the base field is physical - use the schema field definition properties
            final ArchibusFieldDefBase.Immutable schemaFieldDef =
                    AnalysisViewDefGenerator.getSchemaFieldDef(baseField);
            AbstractViewFieldDef.DataType fieldType = dataType;
            if (dataType == null) {
                schemaFieldDef.getJavaType();
                // KB 3036283 IOAN Use double AVG can be double not integer on ORACLE and SYBASE
                fieldType = AbstractViewFieldDef.DataType.DOUBLE;
                // (fieldJavaTypeBaseImpl instanceof FieldJavaIntegerImpl) ?
                // AbstractViewFieldDef.DataType.DOUBLE
                // : AbstractViewFieldDef.DataType.DOUBLE;
                
            }
            calculatedField.setDataType(fieldType);
            calculatedField.setSize(schemaFieldDef.getSize());
            calculatedField.setDecimals(schemaFieldDef.getDecimals());
            calculatedField.setNumericFormat(schemaFieldDef.getNumericFormat());
            
            final String schemaFieldTitle =
                    AnalysisViewDefGenerator.getSchemaFieldTitle(schemaFieldDef);
            calculatedField.setTitle(schemaFieldTitle);
        }
        
        return calculatedField;
    }
    
    /**
     * Generate statistic data source and get statistic data.
     * 
     * @param mainQuery control data source SQL query.
     * @param controlDataSourceDef control data source definition.
     * @param table table name.
     * @param fields statistic fields.
     * @param formula statistic formula.
     * @param fieldPrefix field prefix.
     * @param isShowCount if record counts should calculated.
     * @return data record object.
     */
    private DataRecord generateDataSourceAndGetData(final String mainQuery,
            final AbstractDataSourceDef controlDataSourceDef, final String table,
            final List<String> fields, final SqlFormula formula, final String fieldPrefix,
            final boolean isShowCount) {
        // get grouping data source definition
        final GroupingDataSourceDef statisticDataSourceDef =
                generateGroupingDataSourceDef(controlDataSourceDef, table, fields, formula,
                    fieldPrefix, isShowCount);
        // create grouping data source instance
        final DataSourceGroupingImpl statisticDataSource =
                (DataSourceGroupingImpl) DataSourceRuntimeConverter
                    .toRuntime(statisticDataSourceDef);
        // add original sql query
        statisticDataSource.addQuery(mainQuery);
        // get record
        final DataRecord statisticRecord = statisticDataSource.getRecord();
        // convert units
        DataSourceUnitsConverter.convertRecord(statisticRecord, statisticDataSource);
        
        return statisticRecord;
    }
    
    /**
     * Generate grouping data source definition.
     * 
     * @param controlDataSourceDef control data source definition.
     * @param table table name.
     * @param fields statistic fields.
     * @param formula statistic formula.
     * @param fieldPrefix field prefix.
     * @param isShowCount if record counts should calculated.
     * @return grouping data source definition
     */
    private GroupingDataSourceDef generateGroupingDataSourceDef(
            final AbstractDataSourceDef controlDataSourceDef, final String table,
            final List<String> fields, final SqlFormula formula, final String fieldPrefix,
            final boolean isShowCount) {
        
        final GroupingDataSourceDef groupingDataSourceDef = new GroupingDataSourceDef();
        groupingDataSourceDef.setId(controlDataSourceDef.getId() + UNDERSCORE + fieldPrefix);
        groupingDataSourceDef.setMainTableName(table);
        groupingDataSourceDef.setTitle(controlDataSourceDef.getTitle());
        groupingDataSourceDef.setImplicit(true);
        groupingDataSourceDef.setApplyVpaRestrictions(controlDataSourceDef
            .getApplyVpaRestrictions());
        
        // add count field
        if (isShowCount) {
            final AbstractDataSourceFieldDef baseFieldDef =
                    controlDataSourceDef.getFieldDefs().get(0);
            final AbstractVirtualFieldDef countFieldDef =
                    createCalculatedFieldDef(table, baseFieldDef, SqlFormula.COUNT,
                        AbstractViewFieldDef.DataType.INTEGER);
            countFieldDef.setName(COUNT_FIELD);
            groupingDataSourceDef.addFieldDef(countFieldDef);
        }
        
        for (final String field : fields) {
            final String baseFieldName = table + DOT + field;
            final AbstractDataSourceFieldDef baseFieldDef =
                    controlDataSourceDef.findFieldDef(baseFieldName);
            final AbstractVirtualFieldDef calculatedFieldDef =
                    createCalculatedFieldDef(table, baseFieldDef, formula, null);
            calculatedFieldDef.setName(fieldPrefix + UNDERSCORE + baseFieldDef.getName());
            groupingDataSourceDef.addFieldDef(calculatedFieldDef);
        }
        
        return groupingDataSourceDef;
    }
    
    /**
     * Load control data source.
     * 
     * @param context event handler context
     * @return data source object
     */
    private DataSource getControlDataSource(final EventHandlerContext context) {
        final String viewName = context.getString(INPUT_VIEW_NAME);
        final String dataSourceId = context.getString(INPUT_DATA_SOURCE_ID);
        return DataSourceFactory.loadDataSourceFromFile(viewName, dataSourceId);
    }
    
    /**
     * Get sql query from control data source.
     * 
     * @param context current context
     * @param dataSource control data source
     * @return sql query
     */
    private String getSqlQuery(final EventHandlerContext context, final DataSource dataSource) {
        
        // set max records.
        if (context.parameterExists(INPUT_RECORD_LIMIT)) {
            final int maxRecords = context.getInt(INPUT_RECORD_LIMIT);
            dataSource.setMaxRecords(maxRecords);
        }
        
        // get restriction
        String restriction = "";
        if (context.parameterExists(INPUT_RESTRICTION)) {
            restriction = context.getString(INPUT_RESTRICTION);
        }
        
        // sort values
        List<Object> sortValues = new ArrayList<Object>();
        if (context.parameterExists(INPUT_SORT_VALUES)) {
            final JSONArray jsonSortValues = context.getJSONArray(INPUT_SORT_VALUES);
            sortValues = ViewHandlers.fromJSONArray(jsonSortValues);
        }
        
        // filter values
        List<Object> filterValues = new ArrayList<Object>();
        if (context.parameterExists(INPUT_FILTER_VALUES)) {
            final JSONArray jsonFilterValues = context.getJSONArray(INPUT_FILTER_VALUES);
            filterValues = ViewHandlers.fromJSONArray(jsonFilterValues);
        }
        
        return dataSource.formatSqlQuery(restriction, sortValues, filterValues, false, true);
    }
    
    /**
     * Get statistic fields list.
     * 
     * @param context event handler context
     * @param parameterName parameter name
     * @return fields list
     */
    private List<String> getStatisticFields(final EventHandlerContext context,
            final String parameterName) {
        final List<String> fields = new ArrayList<String>();
        if (context.parameterExists(parameterName)) {
            final JSONArray fieldsJSON = context.getJSONArray(parameterName);
            for (int index = 0; index < fieldsJSON.length(); index++) {
                final String fieldName = fieldsJSON.getString(index);
                fields.add(fieldName.substring(fieldName.indexOf('.') + 1));
            }
        }
        return fields;
    }
    
    /**
     * Read input parameters from context.
     * 
     * @param context event handler context.
     */
    private void readContextParameters(final EventHandlerContext context) {
        // show counts
        if (context.parameterExists(INPUT_SHOW_COUNTS)) {
            this.isShowCounts = context.getBoolean(INPUT_SHOW_COUNTS);
        }
        
        // show totals
        if (context.parameterExists(INPUT_SHOW_TOTALS)) {
            this.isShowTotals = context.getBoolean(INPUT_SHOW_TOTALS);
        }
        
        // show max
        if (context.parameterExists(INPUT_SHOW_MAX)) {
            this.isShowMax = context.getBoolean(INPUT_SHOW_MAX);
        }
        
        // show min
        if (context.parameterExists(INPUT_SHOW_MIN)) {
            this.isShowMin = context.getBoolean(INPUT_SHOW_MIN);
        }
        
        // show avg
        if (context.parameterExists(INPUT_SHOW_AVG)) {
            this.isShowAvg = context.getBoolean(INPUT_SHOW_AVG);
        }
        
        this.statisticFields = getStatisticFields(context, INPUT_STATISTIC_FIELDS);
        
    }
}
