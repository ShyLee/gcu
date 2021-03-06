package com.archibus.service.cost;

import java.math.BigDecimal;
import java.text.MessageFormat;
import java.util.Date;

import com.archibus.service.Period;

/**
 * Defines income or expense for specified period (month, year, or running total).
 */
public class CostPeriod extends Period {
    
    private BigDecimal cost;
    
    public CostPeriod(final String period, final Date dateStart) {
        super(period, dateStart);
        this.cost = new BigDecimal(0);
    }
    
    /**
     * constructor that is used for Date Range periods
     * 
     * @param period
     * @param dateStart
     * @param dateEnd
     */
    public CostPeriod(final String period, final Date dateStart, final Date dateEnd) {
        super(period, dateStart, dateEnd);
        this.cost = new BigDecimal(0);
    }
    
    public BigDecimal getCost() {
        return this.cost;
    }
    
    public void setCost(final BigDecimal cost) {
        this.cost = cost;
    }
    
    @Override
    public String toString() {
        return MessageFormat.format("{0}: {1}", new Object[] { super.toString(), this.cost });
    }
}
