package com.archibus.app.reservation.domain.recurrence;

import java.text.SimpleDateFormat;
import java.util.*;

import junit.framework.TestCase;

/**
 * Base classe for testing recurrences.
 * 
 * @author bv
 * 
 * @since 20.1
 * 
 *        <p>
 *        Suppress warning "PMD.TestClassWithoutTestCases".
 *        <p>
 *        Justification: this is a suite that groups other tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class RecurrencePatternTestBase extends TestCase {
    
    /** Start date of the pattern. */
    protected Date startDate;
    
    /** End date of the pattern. */
    protected Date endDate;
    
    /** The date formatter to convert between strings and dates. */
    protected SimpleDateFormat dateFormatter;
    
    /** The day of the month for the start date. */
    protected int dayOfTheMonth;
    
    @Override
    protected void setUp() throws Exception {
        super.setUp();
        
        this.dateFormatter = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
        
        this.startDate = this.dateFormatter.parse("2012-05-17");
        this.endDate = this.dateFormatter.parse("2018-05-01");
        // CHECKSTYLE:OFF Justification: this 'magic number' is used for testing.
        this.dayOfTheMonth = 17;
        // CHECKSTYLE:ON
    }
    
}
