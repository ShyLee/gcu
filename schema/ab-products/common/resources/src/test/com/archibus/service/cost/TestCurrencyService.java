package com.archibus.service.cost;

import java.util.*;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;

/**
 * Test class for Multi Currency and VAT.
 * 
 * @author Ioan Draghici
 * 
 *         Suppress warning for :
 * 
 *         Local Variables - local variables defined for each test method
 * 
 *         System out - used to display some results in eclipse console
 */
@SuppressWarnings({ "PMD.AvoidFinalLocalVariable", "PMD.SystemPrintln" })
public class TestCurrencyService extends DataSourceTestBase {
    /**
     * Main class handler.
     */
    private final CostService costServiceHandler = new CostService();
    
    /**
     * Test get VAT Percent.
     */
    public void testGetVATPercent() {
        final String costCategId = "CLEANING - WINDOWS EXPENSE";
        final String ctryId = "BEL";
        final String lsId = "";
        final String vatParamName = "VATPercent";
        final String msgParamName = "message";
        final JSONObject result = this.costServiceHandler.getVATPercent(costCategId, ctryId, lsId);
        if (result.has(vatParamName)) {
            System.out.println("VAT percent = " + result.get(vatParamName));
        }
        if (result.has(msgParamName)) {
            System.out.println("ALERT = " + (String) result.get(msgParamName));
        }
    }
    
    /**
     * Test get exchange rate.
     */
    public void testGetExchangeRate() {
        final String sourceCurrency = "USD";
        final String destinCurrency = "EUR";
        final Date convDate = java.sql.Date.valueOf("2010-12-30");
        
        final JSONObject result =
                this.costServiceHandler.getExchangeRate(convDate, sourceCurrency, destinCurrency);
        
        System.out.println("result = " + result);
    }
    
    /**
     * Test convert cost.
     */
    public void testConvertCostsForVATandMC() {
        final List<String> costTypes = Arrays.asList("cost_tran_recur");
        final List<Integer> costIds = Arrays.asList(47);
        
        final String result = this.costServiceHandler.convertCostForVATAndMC(costIds, costTypes);
        
        System.out.println("result = " + result);
    }
}
