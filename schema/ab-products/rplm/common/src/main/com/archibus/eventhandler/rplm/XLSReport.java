package com.archibus.eventhandler.rplm;

import java.util.*;

import org.json.*;

import com.archibus.datasource.data.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.report.xls.*;
import com.archibus.utility.StringUtil;

/**
 * A customized 2D XLS report builder to cover 8 RPLM cost report cases and Cash Flow report case
 * Basically just overwrite any customized part of a standard XLS report
 * 
 * 
 * 
 * @author Yong Shao
 * 
 */

public class XLSReport extends CrossTab2DBuilder {
    // @translatable
    private static final String TAX_AMOUNT = "Tax Amount";
    
    // @translatable
    String bl_code = "Build Code";

    // @translatable
    String pr_code = "Property Code";

    // @translatable
    String ac_code = "Account Code";

    // @translatable
    String cost_cat = "Cost Category";

    // @translatable
    String totalYearTitle = "Yearly Totals:";

    // @translatable
    String totalMonthTitle = "Monthly Totals:";

    // @translatable
    String totalQuarterTitle = "Quarterly Totals:";

    // @translatable
    String measure_income = "Income";

    // @translatable
    String measure_expenses = "Expense";

    // @translatable
    String monthTitle = "Month";

    // @translatable
    String quarterTitle = "Quarter";

    // @translatable
    String Q1 = "Q1";

    // @translatable
    String Q2 = "Q2";

    // @translatable
    String Q3 = "Q3";

    // @translatable
    String Q4 = "Q4";
    
    /**
     * Set true for VAT amount balance report and false otherwise.
     */
    private boolean isVATCashFlowReport;
    
    boolean stripMinus = false;
    
    /**
     * Array with quarters corresponding to months. For example: quarters[3] = 4 means that March is in Q4.
     */
    private int[] quarters;
    
    private String quarterYear;

    public void setStripMinus(boolean stripMinus) {
        this.stripMinus = stripMinus;
    }

    boolean isMonthFormat = false;

    public void setMonthFormat(boolean isMonthFormat) {
        this.isMonthFormat = isMonthFormat;
    }

    boolean isQuarterFormat = false;

    public void setQuarterFormat(boolean isQuarterFormat) {
        this.isQuarterFormat = isQuarterFormat;
    }

    String projectionType;

    public void setProjectionType(String projectionType) {
        this.projectionType = projectionType;
    }

    String calculationType;

    public void setCalculationType(String calculationType) {
        this.calculationType = calculationType;
    }
    
    /**
     * @param isVATCashFlowReport the isVATCashFlowReport to set
     */
    public void setVATCashFlowReport(final String viewName) {
        if ("ab-rplm-cost-mgmt-vat-bal.axvw".equalsIgnoreCase(viewName)) {
            this.isVATCashFlowReport = true;
        }
    }
    
    /**
     * Overwrite column head
     */
    @Override
    public void writeColumnHead(final int row, final int column, final JSONObject columnValue) {
        String result = "";
        final String value = StringUtil.notNull(columnValue.get("n"));
        String year = value.substring(0, 4);
        final String month = value.substring(5, 7);
        if (this.isMonthFormat) {
            result = month + "/" + year;
        } else if (this.isQuarterFormat) {
            final int numericMonth = Integer.parseInt(month);
            if (StringUtil.isNullOrEmpty(this.quarterYear)
                    || (column - 2 - this.nRowDimensionFields) % 4 == 0) {
                this.quarterYear = year;
            } else {
                year = this.quarterYear;
            }
            final int quarter = this.quarters[numericMonth];
            String localizedQ = this.Q4;
            switch (quarter) {
                case 1: {
                    localizedQ = this.Q1;
                    break;
                }
                case 2: {
                    localizedQ = this.Q2;
                    break;
                }
                case 3: {
                    localizedQ = this.Q3;
                    break;
                }
            }
            
            localizedQ = EventHandlerBase.localizeString(this.context.getCurrentContext(), localizedQ, this.getClass().getName());
            
            result = localizedQ + "/" + year;
        } else {
            result = year;
        }
        
        super.writeColumnHead(row, column, result);
    }

    /**
     * Add a custom final total row
     */
    @Override
    public void addCustomTotalRow(int totalRows, int totalColumns,
            List<Map<String, Object>> calculatedFields, DataSet dataset) {
        Map<String, Object> calculatedField = calculatedFields.get(0);
        String calculatedFieldName = this.getStringValue("id", calculatedField);
        DataSet2D dataSet2D = (DataSet2D) dataset;
        JSONArray columnValues = dataSet2D.getColumnValues();
        JSONArray rowValues = dataSet2D.getRowValues();

        int row = totalRows + 1;

        for (int j = 0; j < columnValues.length(); j++) {
            Double result = 0.00;
            JSONObject columnValue = (JSONObject) columnValues.get(j);
            for (int i = 0; i < rowValues.length(); i++) {
                JSONObject rowValue = (JSONObject) rowValues.get(i);
                DataRecord record = dataSet2D.getRecordForRowAndColumn(rowValue.getString("n"),
                    columnValue.getString("n"));
                Object value = record.getValue(calculatedFieldName);
                if (value != null) {
                    String strValue = value.toString();
                    Double numericValue = Double.valueOf(strValue);
                    // XXX: WEIRD!!!
                    if (this.stripMinus && strValue.startsWith("-")) {
                        numericValue = -numericValue;
                    }
                    result += numericValue;

                }
            }
            addCustomTotalColumn(row, 2 + j + this.nRowDimensionFields, result, 2);
        }

        // XXX: add the total head
        if (rowValues.length() > 0) {
            for (int i = 0; i <= this.nRowDimensionFields; i++) {
                writeFieldTitle(row, i, "", this.totalColoring);
            }
            String localizedTitle = this.totalYearTitle;
            if (this.isMonthFormat) {
                localizedTitle = this.totalMonthTitle;
            } else if (this.isQuarterFormat) {
                localizedTitle = this.totalQuarterTitle;
            }
            localizedTitle = EventHandlerBase.localizeString(this.context.getCurrentContext(),
                localizedTitle, this.getClass().getName());

            writeFieldTitle(row, 1 + this.nRowDimensionFields, localizedTitle, this.totalColoring);
        }

    }

    /**
     * Strip Minus
     */
    @Override
    public void writeFieldValue(Map<String, Object> calculatedField, int row, int col, Object value) {
        String strValue = StringUtil.notNull(value);
        if (this.stripMinus && (strValue != null && strValue.startsWith("-"))) {
            Double numericValue = Double.valueOf(strValue);
            writeFieldValue(calculatedField, row, col, -numericValue, null);
        } else {
            writeFieldValue(calculatedField, row, col, strValue, null);
        }
    }

    @Override
    public void writeTitleOfFirstGroupByField(int row, int column, String title,
            XlsBuilder.Color color) {
        if (this.projectionType != null) {
            // Cash Flow Case
            if (this.nRowDimensionFields > 0) {
                writeGroupByFieldTitle(row, column + 1, EventHandlerBase.localizeString(
                    this.context.getCurrentContext(), this.cost_cat, this.getClass().getName()),
                    color);
            }
            String loaclizedTitle = title;
            if (this.projectionType.equals("bl")) {
                loaclizedTitle = this.bl_code;
            } else if (this.projectionType.equals("ac")) {
                loaclizedTitle = this.ac_code;
            } else if (this.projectionType.equals("pr")) {
                loaclizedTitle = this.pr_code;
            }
            loaclizedTitle = EventHandlerBase.localizeString(this.context.getCurrentContext(),
                loaclizedTitle, this.getClass().getName());

            writeGroupByFieldTitle(row, column, loaclizedTitle, color);
        } else {
            writeGroupByFieldTitle(row, column, title, color);
        }
    }

    @Override
    public void writeTitleOfSecondGroupByField(int row, int column, String title,
            XlsBuilder.Color color) {
        String loaclizedTitle = title;
        if (this.isMonthFormat) {
            loaclizedTitle = this.monthTitle;
        } else if (this.isQuarterFormat) {
            loaclizedTitle = this.quarterTitle;
        }
        loaclizedTitle = EventHandlerBase.localizeString(this.context.getCurrentContext(),
            loaclizedTitle, this.getClass().getName());

        writeGroupByFieldTitle(row, column, loaclizedTitle, color);
    }

    @Override
    public void writeCalculatedFieldTitle(int row, int column, String title) {
        if (this.calculationType != null) {
            // Cash Flow Case
            String loaclizedTitle = title;
            /**
             * Added for KB 3033868-VAT amount balance - incorrect label in XLS file. This needs to
             * be implemented as message parameter from .js client file.
             */
            if (this.isVATCashFlowReport) {
                loaclizedTitle = TAX_AMOUNT;
            }
            /**
             * end of KB 3033868
             */
            if (this.calculationType.equals("INCOME")) {
                loaclizedTitle = this.measure_income;
            } else if (this.calculationType.equals("EXPENSE")) {
                loaclizedTitle = this.measure_expenses;
            }
            loaclizedTitle = EventHandlerBase.localizeString(this.context.getCurrentContext(),
                loaclizedTitle, this.getClass().getName());
            writeFieldTitle(row, column, loaclizedTitle, this.rowHeaderColoring);
        } else {
            writeFieldTitle(row, column, title, this.rowHeaderColoring);
        }
    }
    
    /**
     * Calculates quarters and set the result to instance variable.
     * 
     * @param dateStart
     * @param dateEnd
     */
    protected void setQuarters(final Date dateStart, final Date dateEnd) {
        final int[] quarters = new int[13];
        final Calendar cal = Calendar.getInstance();
        cal.setTime(dateStart);
        int counter = cal.get(Calendar.MONTH) + 1;
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 3; j++) {
                quarters[counter] = i + 1;
                counter = (counter + 1 == 13 ? 1 : counter + 1);
            }
        }
        this.quarters = quarters;
    }
    
}
