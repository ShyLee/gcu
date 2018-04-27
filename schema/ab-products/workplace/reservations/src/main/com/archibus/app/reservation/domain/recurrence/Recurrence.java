package com.archibus.app.reservation.domain.recurrence;

import java.util.*;

import javax.xml.bind.annotation.*;

import org.dom4j.*;

import com.archibus.app.reservation.domain.ReservationException;

/**
 * Recurrence base class.
 * 
 * @author Bart Vanderschoot
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "Recurrence")
public class Recurrence {
    /**
     * The first week's index.
     */
    protected static final int ONE = 1;
    
    /**
     * The second week's index.
     */
    protected static final int TWO = 2;
    
    /**
     * The third week's index.
     */
    protected static final int THREE = 3;
    
    /**
     * The fourth week's index.
     */
    protected static final int FOUR = 4;
    
    /**
     * The fifth week's index.
     */
    protected static final int FIVE = 5;
    
    /**
     * The month.
     */
    private static final String MONTH = "month";
    
    /**
     * Sunday.
     */
    private static final String SUN = "sun";
    
    /**
     * Saturday.
     */
    private static final String SAT = "sat";
    
    /**
     * Friday.
     */
    private static final String FRI = "fri";
    
    /**
     * Thursday.
     */
    private static final String THU = "thu";
    
    /**
     * Wednesday.
     */
    private static final String WED = "wed";
    
    /**
     * Tuesday.
     */
    private static final String TUE = "tue";
    
    /**
     * Monday.
     */
    private static final String MON = "mon";
    
    /**
     * Week.
     */
    private static final String WEEK = "week";
    
    /**
     * Day.
     */
    private static final String DAY = "day";
    
    /**
     * Value.
     */
    private static final String VALUE = "value";
    
    /**
     * Fourth.
     */
    private static final String FOURTH = "fourth";
    
    /**
     * Third.
     */
    private static final String THIRD = "third";
    
    /**
     * Second.
     */
    private static final String SECOND = "second";
    
    /**
     * First.
     */
    private static final String FIRST = "first";
    
    /** xml attribute value for true. */
    private static final String ATTRIBUTE_TRUE = "true";
    
    /** The end date. */
    private Date endDate;
    
    /** The number of occurrences. */
    private Integer numberOfOccurrences;
    
    /** The start date. */
    private Date startDate;
    
    /**
     * Parse XML string to return an recurrence object.
     * 
     * @param startDate start date
     * @param endDate end date
     * @param xmlPattern XML pattern
     * 
     * @return Recurrence object
     * 
     * @throws ReservationException reservation exception
     */
    public static Recurrence parseRecurrence(final Date startDate, final Date endDate,
            final String xmlPattern) throws ReservationException {
        try {
            // make XML compatible format.
            String pattern = xmlPattern.replace("1st", FIRST);
            pattern = pattern.replace("2nd", SECOND);
            pattern = pattern.replace("3rd", THIRD);
            pattern = pattern.replace("4th", FOURTH);
            
            final Document document = DocumentHelper.parseText(pattern);
            
            final Element rootElement = document.getRootElement();
            final String type = rootElement.attributeValue("type");
            
            if (type == null) {
                // @translatable
                throw new ReservationException("Recurrence type required in XML string",
                    Recurrence.class);
            }
            
            final Element ndays = rootElement.element("ndays");
            final int interval =
                    "".equals(ndays.attributeValue(VALUE)) ? 1 : Integer.parseInt(ndays
                        .attributeValue(VALUE));
            
            Recurrence result = null;
            if (type.equals(DAY)) {
                result = new DailyPattern(startDate, endDate, interval);
            } else if (type.equals(WEEK)) {
                result = getWeeklyPattern(startDate, endDate, rootElement, interval);
            } else if (type.equals(MONTH)) {
                result = getMonthlyPattern(startDate, endDate, rootElement, interval);
            } else {
                // @ translatable
                final String message = "Recurrence type " + type + " not supported";
                throw new ReservationException(message, Recurrence.class);
            }
            return result;
        } catch (final DocumentException e) {
            // @ translatable
            throw new ReservationException("Error occured parsing XML recurring rule",
                Recurrence.class);
        }
    }
    
    /**
     * Parse a monthly pattern from XML.
     * 
     * @param startDate pattern start date
     * @param endDate pattern end date
     * @param rootElement XML root element to parse
     * @param interval pattern interval
     * @return the monthly pattern
     */
    private static Recurrence getMonthlyPattern(final Date startDate, final Date endDate,
            final Element rootElement, final int interval) {
        final Element monthly = rootElement.element("monthly");
        
        final DayOfTheWeek dayOfTheWeek = getDayOfTheWeek(monthly);
        
        Integer weekOfMonth = null;
        
        if (monthly.attributeValue(FIRST).equals(ATTRIBUTE_TRUE)) {
            weekOfMonth = ONE;
        }
        if (monthly.attributeValue(SECOND).equals(ATTRIBUTE_TRUE)) {
            weekOfMonth = TWO;
        }
        if (monthly.attributeValue(THIRD).equals(ATTRIBUTE_TRUE)) {
            weekOfMonth = THREE;
        }
        if (monthly.attributeValue(FOURTH).equals(ATTRIBUTE_TRUE)) {
            weekOfMonth = FOUR;
        }
        if (monthly.attributeValue("last").equals(ATTRIBUTE_TRUE)) {
            weekOfMonth = FIVE;
        }
        
        // interval ???
        final Recurrence monthlyPattern =
                new MonthlyPattern(startDate, endDate, interval, weekOfMonth, dayOfTheWeek);
        
        // Recurrence monthlyPattern = new MonthlyPattern(startDate, 1, 1);
        return monthlyPattern;
    }
    
    /**
     * Get the day of the week from the XML element defining a monthly pattern.
     * 
     * @param monthly XML element defining a monthly pattern
     * @return day of the week
     */
    private static DayOfTheWeek getDayOfTheWeek(final Element monthly) {
        DayOfTheWeek dayOfTheWeek = null;
        
        if (monthly.attributeValue(MON).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeek = DayOfTheWeek.Monday;
        }
        if (monthly.attributeValue(TUE).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeek = DayOfTheWeek.Tuesday;
        }
        if (monthly.attributeValue(WED).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeek = DayOfTheWeek.Wednesday;
        }
        if (monthly.attributeValue(THU).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeek = DayOfTheWeek.Thursday;
        }
        if (monthly.attributeValue(FRI).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeek = DayOfTheWeek.Friday;
        }
        if (monthly.attributeValue(SAT).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeek = DayOfTheWeek.Saturday;
        }
        if (monthly.attributeValue(SUN).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeek = DayOfTheWeek.Sunday;
        }
        return dayOfTheWeek;
    }
    
    /**
     * Parse a weekly pattern from XML.
     * 
     * @param startDate pattern start date
     * @param endDate pattern end date
     * @param rootElement XML root element to parse
     * @param interval pattern interval
     * @return the weekly pattern
     */
    private static Recurrence getWeeklyPattern(final Date startDate, final Date endDate,
            final Element rootElement, final int interval) {
        final Element weekly = rootElement.element("weekly");
        
        final List<DayOfTheWeek> dayOfTheWeeks = new ArrayList<DayOfTheWeek>();
        
        if (weekly.attributeValue(MON).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeeks.add(DayOfTheWeek.Monday);
        }
        if (weekly.attributeValue(TUE).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeeks.add(DayOfTheWeek.Tuesday);
        }
        if (weekly.attributeValue(WED).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeeks.add(DayOfTheWeek.Wednesday);
        }
        if (weekly.attributeValue(THU).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeeks.add(DayOfTheWeek.Thursday);
        }
        if (weekly.attributeValue(FRI).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeeks.add(DayOfTheWeek.Friday);
        }
        if (weekly.attributeValue(SAT).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeeks.add(DayOfTheWeek.Saturday);
        }
        if (weekly.attributeValue(SUN).equals(ATTRIBUTE_TRUE)) {
            dayOfTheWeeks.add(DayOfTheWeek.Sunday);
        }
        // every week ????
        final Recurrence weeklyPattern =
                new WeeklyPattern(startDate, endDate, interval, dayOfTheWeeks);
        return weeklyPattern;
    }
    
    // Disable StrictDuplicate CHECKSTYLE warning. Justification: this class has common properties.
    
    /**
     * Get end date.
     * 
     * @return end date
     */
    public final Date getEndDate() {
        return this.endDate;
    }
    
    /**
     * Get number of occurences.
     * 
     * @return number of occurences
     */
    public final Integer getNumberOfOccurrences() {
        return this.numberOfOccurrences;
    }
    
    /**
     * Gets the start date of the recurrence pattern.
     * 
     * @return the start date
     */
    public final Date getStartDate() {
        return this.startDate;
    }
    
    /**
     * Get a calendar instance set up at the start date of the recurrence pattern.
     * 
     * @return a new calendar instance set up at the start date of the pattern
     */
    public final Calendar getStartDateCalendar() {
        final Calendar cal = Calendar.getInstance();
        cal.setTime(getStartDate());
        return cal;
    }
    
    /**
     * Checks for end.
     * 
     * @return true, if successful
     */
    public final boolean hasEnd() {
        return this.numberOfOccurrences != null || this.endDate != null;
    }
    
    // CHECKSTYLE:OFF Justification: this class has common properties.
    /**
     * Sets the end date.
     * 
     * @param endDate the new end date
     */
    public final void setEndDate(final Date endDate) {
        this.endDate = endDate;
    }
    
    /**
     * Sets the start date.
     * 
     * @param startDate the new start date
     */
    public final void setStartDate(final Date startDate) {
        this.startDate = startDate;
    }
    
    // CHECKSTYLE:ON
    
    /**
     * Sets the number of occurrences.
     * 
     * @param numberOfOccurrences the new number of occurrences
     */
    public final void setNumberOfOccurrences(final Integer numberOfOccurrences) {
        this.numberOfOccurrences = numberOfOccurrences;
    }
    
    /**
     * {@inheritDoc}
     */
    @Override
    public String toString() {
        return "Recurrence";
    }
    
}
