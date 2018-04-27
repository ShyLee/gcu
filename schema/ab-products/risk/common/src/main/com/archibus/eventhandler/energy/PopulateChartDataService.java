package com.archibus.eventhandler.energy;

import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.utility.ExceptionBase;
/**
 * PopulateChartData - Once all nightly calculation are performed, this class
 * distributes all updated values on the tables used for reporting
 * 
 * <p>
 * History:
 * <li>19.1 Initial implementation.
 * 
 * @author Winston Lagos
 */
public class PopulateChartDataService {
    
    /**
     * Logger to write messages to archibus.log.
     */
    private final static Logger log = Logger.getLogger(PopulateChartDataService.class); 
    
    /**
     * Invokes all sql statements that populate the Energy Chart Point table
     */    
    public static boolean run() {
        if (log.isDebugEnabled()) {
            log.info("PopulateChartData");
        }
        deleteChartPoints();
        populateRegressionChartOat();
        populateRegressionChartConsumption();
        populateRegressionChartDemand();
        populateElectricChartPoints();
        populateGasChartPoints();
        
        return true;
    }
  
    /**
     * Deletes all contents of the energy_chart_point
     */   
    protected static void deleteChartPoints(){
        String SQL = "TRUNCATE TABLE energy_chart_point";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }
    
    /**
     * Inserts el_oat and gas_oat record types into energy_chart_point 
     */   
    protected static void populateRegressionChartOat(){
        String SQL = "" +
        "INSERT " +
        "INTO   energy_chart_point " +
        "       ( " +
        "              bl_id       , " +
        "              value_name  , " +
        "              time_period , " +
        "              VALUE       , " +
        "              outlier " +
        "       ) " +
        "SELECT px.* " +
        "FROM   (SELECT p.bl_id , " +
        "               CASE " +
        "                       WHEN lower(p.bill_type_id) = 'electric' " +
        "                       THEN 'el_oat' " +
        "                       ELSE 'gas_oat' " +
        "               END AS value_name , " +
        "               p.time_period     , " +
        "               p.period_oat      , " +
        "               0 AS outlier " +
        "       FROM    energy_bl_svc_period p " +
        "       WHERE   p.period_oat IS NOT NULL " +
        "       AND     LOWER(p.bill_type_id) IN ('electric', " +
        "                                         'gas - natural') " +
        "       ) " +
        "       px " +
        "WHERE  NOT EXISTS " +
        "       (SELECT 1 " +
        "       FROM    energy_chart_point ecp " +
        "       WHERE   ecp.bl_id             = px.bl_id " +
        "       AND     ecp.time_period       = px.time_period " +
        "       AND     LOWER(ecp.value_name) = LOWER(px.value_name) " +
        "       )";
        
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }
    
    /**
     * Inserts Consumption records into energy_chart_point 
     */  
    protected static void populateRegressionChartConsumption(){
        String SQL = "" +
        "INSERT " +
        "INTO   energy_chart_point " +
        "       ( " +
        "              bl_id       , " +
        "              value_name  , " +
        "              time_period , " +
        "              VALUE       , " +
        "              outlier " +
        "       ) " +
        "SELECT px.* " +
        "FROM   (SELECT p.bl_id , " +
        "               CASE " +
        "                       WHEN LOWER(p.bill_type_id) = 'electric' " +
        "                       THEN 'el_actual_rate' " +
        "                       ELSE 'gas_actual_rate' " +
        "               END AS value_name                   , " +
        "               p.time_period                       , " +
        "               p.consumption / p.num_days AS value , " +
        "               p.outlier_consumption " +
        "       FROM    energy_bl_svc_period p " +
        "       WHERE   p.num_days > 0 " +
        "       AND     LOWER(p.bill_type_id) IN ('electric', " +
        "                                         'gas - natural') " +
        "       AND     p.consumption IS NOT NULL " +
        "       ) " +
        "       px " +
        "WHERE  NOT EXISTS " +
        "       (SELECT 1 " +
        "       FROM    energy_chart_point ecp " +
        "       WHERE   ecp.bl_id             = px.bl_id " +
        "       AND     ecp.time_period       = px.time_period " +
        "       AND     LOWER(ecp.value_name) = LOWER(px.value_name) " +
        "       )";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }
    
    /**
     * Inserts Demand records into energy_chart_point 
     */ 
    protected static void populateRegressionChartDemand(){
        String SQL = "" +
        " INSERT " +
        " INTO   energy_chart_point " +
        "        ( " +
        "               bl_id       , " +
        "               value_name  , " +
        "               time_period , " +
        "               VALUE       , " +
        "               outlier " +
        "        ) " +
        " SELECT p.bl_id        , " +
        "        'el_actual_kw' , " +
        "        p.time_period  , " +
        "        p.demand       , " +
        "        p.outlier_demand " +
        " FROM   energy_bl_svc_period p " +
        " WHERE  p.num_days         > 0 " +
        " AND    lower(p.bill_type_id) = 'electric' " +
        " AND    p.demand IS NOT NULL";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }
    
    /**
     * Inserts Electric records into energy_chart_point 
     */ 
    protected static void populateElectricChartPoints(){
        String SQL = "" +
        "INSERT " +
        "INTO   energy_chart_point " +
        "       ( " +
        "              bl_id       , " +
        "              value_name  , " +
        "              time_period , " +
        "              VALUE       , " +
        "              outlier " +
        "       ) " +
        "SELECT p.bl_id                 , " +
        "       'el_actual_consumption' , " +
        "       p.time_period           , " +
        "       p.consumption           , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id) = 'electric' " +
        "AND    p.consumption IS NOT NULL " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id            , " +
        "       'el_actual_demand' , " +
        "       p.time_period      , " +
        "       p.demand           , " +
        "       p.outlier_demand " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id) = 'electric' " +
        "AND    p.demand IS NOT NULL " +
        " " +
        "UNION ALL " +
        "SELECT p.bl_id             , " +
        "       'el_billing_demand' , " +
        "       p.time_period       , " +
        "       1                   , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id) = 'electric' " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id          , " +
        "       'el_load_factor' , " +
        "       p.time_period    , " +
        "       CASE " +
        "              WHEN " +
        "                     ( " +
        "                            p.demand   > 0.0 " +
        "                     AND    p.num_days > 0 " +
        "                     ) " +
        "              THEN p.consumption / 0.003412 / p.demand / p.num_days / 24 * 100" +
        "              ELSE 0 " +
        "       END , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id) = 'electric' " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id       , " +
        "       'el_cost'     , " +
        "       p.time_period , " +
        "       p.COST        , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id) = 'electric' " +
        "AND    p.COST IS NOT NULL " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id       , " +
        "       'el_num_days' , " +
        "       p.time_period , " +
        "       p.num_days    , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id) = 'electric' " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id       , " +
        "       'cdd'         , " +
        "       p.time_period , " +
        "       p.period_cdd  , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p , " +
        "       bl s " +
        "WHERE  p.bl_id                = s.bl_id " +
        "AND    p.bill_type_id         = s.utility_type_cool " +
        "AND    p.period_cdd IS NOT NULL " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id       , " +
        "       'hdd'         , " +
        "       p.time_period , " +
        "       p.period_hdd  , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p , " +
        "       bl s " +
        "WHERE  p.bl_id                = s.bl_id " +
        "AND    p.bill_type_id         = s.utility_type_heat " +
        "AND    p.period_hdd IS NOT NULL " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id       , " +
        "       'el_rate'     , " +
        "       p.time_period , " +
        "       CASE " +
        "              WHEN p.consumption > 0.0 " +
        "              THEN p.COST / p.consumption " +
        "              ELSE 0.0 " +
        "       END , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id) = 'electric'";
        
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }
    
    /**
     * Inserts Gas records into energy_chart_point 
     */ 
    protected static void populateGasChartPoints(){
        String SQL = "" +
        "INSERT " +
        "INTO   energy_chart_point " +
        "       ( " +
        "              bl_id       , " +
        "              value_name  , " +
        "              time_period , " +
        "              VALUE       , " +
        "              outlier " +
        "       ) " +
        "SELECT p.bl_id                  , " +
        "       'gas_actual_consumption' , " +
        "       p.time_period            , " +
        "       p.consumption            , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id)          = 'gas - natural' " +
        "AND    p.consumption IS NOT NULL " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id       , " +
        "       'gas_cost'    , " +
        "       p.time_period , " +
        "       p.COST        , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id)          = 'gas - natural' " +
        "AND    p.COST IS NOT NULL " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id        , " +
        "       'gas_num_days' , " +
        "       p.time_period  , " +
        "       p.num_days     , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id)          = 'gas - natural' " +
        " " +
        "UNION ALL " +
        " " +
        "SELECT p.bl_id       , " +
        "       'gas_rate'    , " +
        "       p.time_period , " +
        "       CASE " +
        "              WHEN p.consumption > 0.0 " +
        "              THEN p.COST / p.consumption " +
        "              ELSE 0.0 " +
        "       END , " +
        "       p.outlier_consumption " +
        "FROM   energy_bl_svc_period p " +
        "WHERE  lower(p.bill_type_id)          = 'gas - natural'";
        SqlUtils.executeUpdate("energy_chart_point", SQL);
    }    
}

