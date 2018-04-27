package com.archibus.app.reservation.domain.recurrence;

import junit.framework.*;

/**
 * All tests in the recurrence package.
 * <p>
 * Suppress warning "PMD.TestClassWithoutTestCases".
 * <p>
 * Justification: this is a suite that groups other recurrence tests.
 */
@SuppressWarnings("PMD.TestClassWithoutTestCases")
public class AllTests extends TestCase {
    
    /**
     * Constructor specifying a name for the test.
     * 
     * @param name name
     */
    public AllTests(final String name) {
        super(name);
    }
    
    /**
     * Get the test suite for recurrence.
     * 
     * @return suite suite
     */
    public static Test suite() {
        final TestSuite suite = new TestSuite();
        suite.addTestSuite(DailyPatternTest.class);
        suite.addTestSuite(IntervalPatternHelperTest.class);
        suite.addTestSuite(MonthlyPatternTest.class);
        suite.addTestSuite(WeeklyPatternTest.class);
        suite.addTestSuite(YearlyPatternTest.class);
        return suite;
    }
}
