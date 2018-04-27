package com.archibus.eventhandler.resourcecalcs;

import java.text.SimpleDateFormat;
import java.util.Calendar;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

public class ResourceCalculations {
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Update Inventory and Insert Inventory Transaction WFR
    // ---------------------------------------------------------------------------------------------
    /**
     * This method serve as a WFR to update inventory information to pt table meanwhile store the
     * operation transaction into it table.
     * 
     * @param partId: part code.
     * @param quantity: part quantity adjusted.
     * @param price: just introduced part price.
     * @param inAction: transaction or operation type.
     * @param acId: account code.
     * 
     */
    public final static String INVENTORY_TRANSACTION_ADD = "Add_new";
    
    public final static String INVENTORY_TRANSACTION_DISBURSE = "Disburse";
    
    public final static String INVENTORY_TRANSACTION_RECTIFY = "Rectify";
    
    public final static String INVENTORY_TRANSACTION_RETURN = "Return";
    
    public void updatePartsAndIT(String partId, double quantity, double price, String inAction,
            String acId) {
        
        DataSource partDS =
                DataSourceFactory.createDataSourceForFields("pt", new String[] { "part_id",
                        "qty_on_hand", "qty_on_reserve", "cost_unit_avg", "cost_unit_last",
                        "cost_unit_std" });
        
        DataSource inventoryTransitionDS =
                DataSourceFactory.createDataSourceForFields("it", new String[] { "part_id",
                        "trans_type", "trans_date", "trans_time", "trans_quantity", "ac_id",
                        "cost_when_used", "cost_total", "performed_by" });
        
        DataRecord partRec = partDS.getRecord(" part_id='" + partId + "'");
        if (partRec == null) {
            return;
        }
        // Update part record with changed field values
        double qtyOnHandPt = partRec.getDouble("pt.qty_on_hand");
        double qtyOnReservePt = partRec.getDouble("pt.qty_on_reserve");
        double costUnitAvgPt = partRec.getDouble("pt.cost_unit_avg");
        double costUnitStdPt = partRec.getDouble("pt.cost_unit_std");
        
        double costUnitLastNew = 0;
        // Calculate and Set correct quantity value to part record
        if (INVENTORY_TRANSACTION_ADD.equalsIgnoreCase(inAction)) {
            
            partRec.setValue("pt.qty_on_hand", qtyOnHandPt + quantity);
            if (price > 0) {
                partRec.setValue("pt.cost_unit_last", price);
                double costUnitAvgNew =
                        (((qtyOnHandPt + qtyOnReservePt) * costUnitAvgPt) + (quantity * price))
                                / (qtyOnHandPt + quantity + qtyOnReservePt);
                partRec.setValue("pt.cost_unit_avg", costUnitAvgNew);
                costUnitLastNew = price;
            }
            
        } else if (INVENTORY_TRANSACTION_DISBURSE.equalsIgnoreCase(inAction)) {
            
            partRec.setValue("pt.qty_on_hand", qtyOnHandPt - quantity);
            costUnitLastNew = costUnitStdPt;
            
        } else if (INVENTORY_TRANSACTION_RETURN.equalsIgnoreCase(inAction)) {
            
            partRec.setValue("pt.qty_on_hand", qtyOnHandPt + quantity);
            costUnitLastNew = costUnitStdPt;
            
        } else if (INVENTORY_TRANSACTION_RECTIFY.equalsIgnoreCase(inAction)) {
            
            partRec.setValue("pt.qty_on_hand", quantity);
            costUnitLastNew = 0;
            
        }
        
        partDS.saveRecord(partRec);
        
        // Insert a new Inventory Transition record
        DataRecord itRec = inventoryTransitionDS.createNewRecord();
        itRec.setValue("it.trans_type", inAction);
        itRec.setValue("it.part_id", partId);
        itRec.setValue("it.trans_date", Utility.currentDate());
        itRec.setValue("it.trans_time", Utility.currentTime());
        itRec.setValue("it.trans_quantity", quantity);
        itRec.setValue("it.cost_when_used", costUnitLastNew);
        itRec.setValue("it.cost_total", costUnitLastNew * quantity);
        if (StringUtil.notNullOrEmpty(acId) && !"null".equalsIgnoreCase(acId)) {
            itRec.setValue("it.ac_id", acId);
        }
        itRec.setValue("it.performed_by", ContextStore.get().getUser().getName());
        inventoryTransitionDS.saveRecord(itRec);
       
        // kb#3035430: always run Calculate Inventory Usage from Adjust Inventory.
        this.CalculateInventoryUsage();        
    }
    
    /**
     * Excute 1//UPDATE pt SET qty_on_hand = qty_physical_count - qty_on_reserve 2This method serve
     * as a WFR to update inventory information to pt table meanwhile store the operation
     * transaction into it table.
     * 
     * @param records
     */
    public void updateQuantityAvailableFromPhysicalCount(JSONArray records) {
        
        if (records.length() > 0) {
            for (int i = 0; i < records.length(); i++) {
                
                JSONObject record = records.getJSONObject(i);
                // UPDATE pt SET qty_on_hand = qty_physical_count - qty_on_reserve
                // new FieldFormula("pt").calculate("qty_on_hand",
                // "qty_physical_count - qty_on_reserve");
                this.updatePartsAndIT(
                    record.getString("pt.part_id"),
                    record.getDouble("pt.qty_physical_count")
                            - record.getDouble("pt.qty_on_reserve"),
                    record.getDouble("pt.cost_unit_last"), "Rectify",
                    record.getString("pt.acc_prop_type"));
            }
        }
        
    }
    
    // ---------------------------------------------------------------------------------------------
    // END Update Inventory and Insert Inventory Transaction WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Calculate Parts of Equipment WFR
    // ---------------------------------------------------------------------------------------------
    /*
     * Converted from PTXEQ.ABS 2010.08.5
     * 
     * Performs parts of equipment calculations.
     */
    public void CalcEqPtUsePerYr() {
        new FieldFormula("ep").setAssignedRestriction("pt_life != 0").calculate("pt_use_yr",
            "(52/pt_life)*quantity");
        new FieldFormula("ep").setAssignedRestriction("pt_life = 0").calculate("pt_use_yr",
            "pt_life");
    }
    
    // ---------------------------------------------------------------------------------------------
    // END Calculate Parts of Equipment WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Calculate Inventory Usage WFR
    // ---------------------------------------------------------------------------------------------
    /*
     * Converted from PTCALC.ABS 2010.08.5
     * 
     * Performs parts inventory calculations: CostTotal, CalcDefaultAvgCost, DateLastUse,
     * QtyToDateYrUse, QtyYrUse, QtyWkUse, QtyVendors, QtyToOrder
     */
    public void CalculateInventoryUsage() {
        
        // Calculate parts total values
        new FieldFormula("pt").calculate("cost_total",
            "(qty_on_hand + qty_on_reserve) * cost_unit_std");
        
        // Calculate default parts average cost
        new FieldFormula("pt").setAssignedRestriction("cost_unit_avg = 0").calculate(
            "cost_unit_avg", "cost_unit_std");
        
        // Calculate quantity of vendors
        new FieldOperation("pt", "pv").addOperation("pt.qty_of_vendors", "COUNT", "*").calculate();
        
        // Calculate quantity to order
        new FieldFormula("pt").calculate("qty_to_order", "qty_min_hand - qty_on_hand");
        new FieldFormula("pt").setAssignedRestriction("qty_to_order < 0").calculate("qty_to_order",
            "0");
        
        // Start Calculate date last used
        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String sDefaultDate = EventHandlerBase.formatSqlIsoToNativeDate(context, "1899-12-30");
        // Construct sql for select last date from hwrpt
        String sMaxHwrpt =
                EventHandlerBase.formatSqlIsNull(context, " MAX(date_assigned)," + sDefaultDate);
        StringBuilder selectMaxHwrptBuilder = new StringBuilder();
        selectMaxHwrptBuilder.append("( SELECT ").append(sMaxHwrpt);
        selectMaxHwrptBuilder.append("  FROM hwrpt");
        selectMaxHwrptBuilder.append("  WHERE hwrpt.part_id = pt.part_id )");
        String selectMaxHwrpt = selectMaxHwrptBuilder.toString();
        
        // Construct sql for select last date from it
        String sMaxIt =
                EventHandlerBase.formatSqlIsNull(context, " MAX(trans_date), " + sDefaultDate);
        StringBuilder selectMaxItBuilder = new StringBuilder();
        selectMaxItBuilder.append("( SELECT ").append(sMaxIt);
        selectMaxItBuilder.append("  FROM it ");
        selectMaxItBuilder.append("  WHERE it.part_id = pt.part_id");
        selectMaxItBuilder.append("        AND it.trans_type = 'Disburse')");
        String selectMaxIt = selectMaxItBuilder.toString();
        
        // Construct sql for to update date_of_last_use of part
        StringBuilder sqlStatement1 = new StringBuilder();
        sqlStatement1.append("UPDATE pt SET pt.date_of_last_use = ");
        sqlStatement1.append("(CASE WHEN ").append(selectMaxHwrpt).append(">").append(selectMaxIt);
        sqlStatement1.append("   THEN ").append(selectMaxHwrpt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append(">").append(selectMaxHwrpt);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" WHEN ").append(selectMaxIt).append("=").append(selectMaxHwrpt);
        sqlStatement1.append(" AND ").append(selectMaxIt).append(" <> ").append(sDefaultDate);
        sqlStatement1.append("   THEN ").append(selectMaxIt);
        sqlStatement1.append(" ELSE NULL END)");
        
        EventHandlerBase.executeDbSql(context, sqlStatement1.toString(), false);
        // End Calculate date last used
        
        // Calculate quantity to date year use of part
        Calendar c = Calendar.getInstance();
        String year = String.valueOf(c.get(Calendar.YEAR));
        String FirstOfYear = EventHandlerBase.formatSqlIsoToNativeDate(context, year + "-01-01");
        String sSumIt = EventHandlerBase.formatSqlIsNull(context, "SUM(it.trans_quantity),0");
        String sSumHwrpt = EventHandlerBase.formatSqlIsNull(context, "SUM(hwrpt.qty_actual),0");
        StringBuilder sqlStatement2 = new StringBuilder();
        sqlStatement2.append("UPDATE pt SET pt.qty_to_date_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement2.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement2.append(" ( SELECT ").append(sSumIt);
        }
        
        sqlStatement2.append("  FROM it");
        sqlStatement2.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement2.append("        AND it.part_id = pt.part_id");
        sqlStatement2.append("        AND it.trans_date >= ").append(FirstOfYear);
        sqlStatement2.append(")");
        sqlStatement2.append(" + ");
        sqlStatement2.append("( SELECT ").append(sSumHwrpt);
        sqlStatement2.append("  FROM hwrpt,hwr");
        sqlStatement2.append("  WHERE hwrpt.part_id = pt.part_id");
        sqlStatement2.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement2.append("        AND hwr.status <> 'Can'");
        sqlStatement2.append("        AND hwrpt.date_assigned >= ").append(FirstOfYear);
        if (SqlUtils.isOracle()) {
            sqlStatement2.append(") FROM dual)");
        } else {
            sqlStatement2.append(") ");
        }
        EventHandlerBase.executeDbSql(context, sqlStatement2.toString(), false);
        
        // Calculate quantity year use of part
        c.add(Calendar.YEAR, -1);
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        String YearAgo = EventHandlerBase.formatSqlIsoToNativeDate(context, df.format(c.getTime()));
        StringBuilder sqlStatement3 = new StringBuilder();
        sqlStatement3.append("UPDATE pt SET pt.qty_calc_yr_use = ");
        if (SqlUtils.isOracle()) {
            sqlStatement3.append("(SELECT ( SELECT ").append(sSumIt);
        } else {
            sqlStatement3.append(" ( SELECT ").append(sSumIt);
        }
        
        sqlStatement3.append("  FROM it");
        sqlStatement3.append("  WHERE it.trans_type IN ('Disburse', 'Return')");
        sqlStatement3.append("        AND it.part_id = pt.part_id");
        sqlStatement3.append("        AND it.trans_date >= ").append(YearAgo);
        sqlStatement3.append("        AND it.trans_date < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");
        sqlStatement3.append("( SELECT ").append(sSumHwrpt);
        sqlStatement3.append("  FROM hwrpt,hwr");
        sqlStatement3.append("  WHERE hwrpt.part_id = pt.part_id");
        sqlStatement3.append("        AND hwr.wr_id = hwrpt.wr_id");
        sqlStatement3.append("        AND hwr.status <> 'Can'");
        sqlStatement3.append("        AND hwrpt.date_assigned >= ").append(YearAgo);
        sqlStatement3.append("        AND hwrpt.date_assigned < ").append(FirstOfYear);
        sqlStatement3.append(")");
        sqlStatement3.append("+");
        
        if (SqlUtils.isOracle()) {
            sqlStatement3.append("+ pt.qty_to_date_yr_use FROM dual)");
        } else {
            sqlStatement3.append("+ pt.qty_to_date_yr_use ");
        }
        
        EventHandlerBase.executeDbSql(context, sqlStatement3.toString(), false);
        
        // Calculate quantity week use
        new FieldFormula("pt").calculate("qty_calc_wk_use", "qty_calc_yr_use/52");
    }
    
    // ---------------------------------------------------------------------------------------------
    // END Calculate Inventory Usage WFR
    // ---------------------------------------------------------------------------------------------
    
    // ---------------------------------------------------------------------------------------------
    // BEGIN Calculate Tool Type Quantity by Tools
    // ---------------------------------------------------------------------------------------------
    public void updateTtByTl() {
        // Calculate quantity of vendors
        new FieldOperation("tt", "tl").addOperation("tt.total_quantity", "COUNT", "*").calculate();
        
    }
    // ---------------------------------------------------------------------------------------------
    // END Calculate Tool Type Quantity by Tools
    // ---------------------------------------------------------------------------------------------
    
}
