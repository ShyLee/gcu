package com.archibus.service.cost;

import java.util.*;

import com.archibus.app.common.finance.dao.ICostDao;
import com.archibus.app.common.finance.domain.RecurringCost;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions.Restriction;
import com.archibus.model.view.datasource.AbstractRestrictionDef;
import com.archibus.service.Period;

public class TestCostService extends DataSourceTestBase {
    
    public void testSummarizePropertyCosts() {
        final Date dateFrom = new GregorianCalendar(2009, 0, 1).getTime();
        final Date dateTo = new GregorianCalendar(2009, 11, 31).getTime();
        final String period = "YEAR";
        final boolean isFromCosts = true;
        final boolean isFromScheduledCosts = true;
        final boolean isFromRecurringCosts = true;
        final int isActiveRecurringCosts = 1;
        final CostService service = createService();
        final Map<String, String> config = new HashMap<String, String>();
        config.put("vat", "total");
        config.put("type", "user");
        config.put("code", "GBP");
        config.put("rateType", "Budget");
        
        service.summarizePropertyCosts(dateFrom, dateTo, period, isFromCosts, isFromScheduledCosts,
            isFromRecurringCosts, isActiveRecurringCosts, config);
        
    }
    
    public void testCalculateCashFlowProjection() {
        final Date dateStart = new GregorianCalendar(2007, 0, 1).getTime();
        final Date dateEnd = new GregorianCalendar(2008, 11, 31).getTime();
        final String calculationPeriod = Period.MONTH;
        final String calculationType = CostProjection.CALCTYPE_NETINCOME;
        final Map<String, String> config = new HashMap<String, String>();
        config.put("vat", "total");
        config.put("type", "user");
        config.put("code", "GBP");
        config.put("rateType", "Budget");
        final CurrencyVatRequestParameters currencyVatParameters =
                new CurrencyVatRequestParameters(config);
        
        final CostService service = createService();
        
        final CostProjection projection =
                service.calculateCashFlowProjection("bl", dateStart, dateEnd, calculationPeriod,
                    calculationType, false, true, true, true, null, null, null,
                    currencyVatParameters);
        
        System.out.println(projection);
        
        final List<String> assetIds = projection.getAssetIds();
        assertNotNull(assetIds);
        assertTrue(assetIds.contains("HQ"));
        assertFalse(assetIds.contains("JFK A"));
        
        final List<CostPeriod> periods = projection.getPeriodsForAsset("HQ");
        assertNotNull(periods);
        
        // call the service with both dates set to null - should not throw exceptions
        {
            service.calculateCashFlowProjection("bl", null, null, calculationPeriod,
                calculationType, false, true, true, true, null, null, null, currencyVatParameters);
        }
    }
    
    private CostService createService() {
        final CostService service = new CostService();
        service.setRecurringCostDataSource(new RecurringCostDataSourceTestImpl());
        
        final Date dateStart = new GregorianCalendar(2007, 0, 1).getTime();
        final Date dateEnd = new GregorianCalendar(2008, 11, 31).getTime();
        
        final Configuration configuration = new Configuration();
        configuration.setDefaultDateStart(dateStart);
        configuration.setDefaultDateEnd(dateEnd);
        service.setConfiguration(configuration);
        
        return service;
    }
    
    /**
     * Test DAO implementation that creates test rule instances.
     */
    private static class RecurringCostDataSourceTestImpl extends DataSourceImpl implements ICostDao {
        
        public List<RecurringCost> findByAssetKeyAndDateRange(final String assetKey,
                final Date startDate, final Date endDate, final String clientRestriction) {
            final List<RecurringCost> rules = new ArrayList<RecurringCost>();
            
            {
                final RecurringCost rule = new RecurringCost();
                rule.setBuildingId("HQ");
                rule.setAmountExpense(199.98);
                rule.setAmountIncome(0);
                rule.setPeriod(Period.MONTH);
                rule.setDateStart(new GregorianCalendar(2000, 0, 1).getTime());
                rule.setDateEnd(new GregorianCalendar(2099, 11, 31).getTime());
                rule.setDateSeasonalStart(new GregorianCalendar(1999, 9, 31).getTime());
                rule.setDateSeasonalEnd(new GregorianCalendar(1999, 2, 31).getTime());
                rules.add(rule);
            }
            {
                final RecurringCost rule = new RecurringCost();
                rule.setBuildingId("HQ");
                rule.setAmountExpense(0);
                rule.setAmountIncome(100);
                rule.setPeriod(Period.CUSTOM);
                rule.setPeriodCustom(90);
                rule.setDateStart(new GregorianCalendar(2000, 0, 1).getTime());
                rule.setDateEnd(new GregorianCalendar(2099, 11, 31).getTime());
                rules.add(rule);
            }
            
            return rules;
        }
        
        public void delete(final Object bean) {
            // TODO Auto-generated method stub
        }
        
        public List find(final AbstractRestrictionDef restriction) {
            // TODO Auto-generated method stub
            return null;
        }
        
        public Object get(final Object id) {
            // TODO Auto-generated method stub
            return null;
        }
        
        public Object save(final Object bean) {
            // TODO Auto-generated method stub
            
            return null;
        }
        
        public void update(final Object bean) {
            // TODO Auto-generated method stub
        }
        
        public List findByCostIds(final List costIds) {
            // TODO Auto-generated method stub
            return null;
        }
        
        public List findByRestriction(final Restriction restriction) {
            // TODO Auto-generated method stub
            return null;
        }
        
        public String createSqlRestrictionForCosts(final List costIds) {
            // TODO Auto-generated method stub
            return null;
        }
        
        public void update(final Object bean, final Object oldBean) {
            // TODO Auto-generated method stub
            
        }
        
        public Object get(final PrimaryKeysValues pkValues) {
            // TODO Auto-generated method stub
            return null;
        }
        
        public Object getRecord(final int costId) {
            // TODO Auto-generated method stub
            return null;
        }
        
    }
}
