package com.archibus.app.reservation.dao.datasource;

import java.sql.Time;
import java.util.*;

import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.util.DataSourceUtils;
import com.archibus.context.*;
import com.archibus.datasource.*;
import com.archibus.datasource.restriction.Restrictions;
import com.archibus.utility.StringUtil;

/**
 * The Class ReservableDataSource.
 * 
 * @param <T> the generic type
 * @author Bart Vanderschoot
 */
public abstract class AbstractReservableDataSource<T> extends ObjectDataSourceImpl<T> {
    
    /**
     * Constructor.
     * 
     * @param beanName Spring bean name
     * @param tableName table name
     */
    protected AbstractReservableDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }
    
    /**
     * Adds the announce restriction.
     * 
     * @param dataSrc datasource
     * @param reservation the reservation
     * @param localCurrentDate current local date
     * @param localCurrentTime current local time
     * @throws ReservationException the reservation exception
     */
    protected final void addAnnounceRestriction(final DataSource dataSrc,
            final IReservation reservation, final Date localCurrentDate, final Time localCurrentTime)
            throws ReservationException {
        
        // Ignore the announce restriction for Reservation Service Desk and Reservation Manager
        // members.
        final User user = ContextStore.get().getUser();
        if (!user.isMemberOfGroup(Constants.RESERVATION_SERVICE_DESK)
                && !user.isMemberOfGroup(Constants.RESERVATION_MANAGER)) {
            
            final int daysDifference = getDaysDifference(reservation, localCurrentDate);
            dataSrc.addParameter("daysDifference", daysDifference, DATA_TYPE_INTEGER);
            dataSrc.addParameter("localCurrentTime", localCurrentTime, DATA_TYPE_TIME);
            dataSrc.addRestriction(Restrictions.sql(this.tableName
                    + ".announce_days < ${parameters['daysDifference']} OR (" + this.tableName
                    + ".announce_days = ${parameters['daysDifference']} AND " + this.tableName
                    + ".announce_time > ${parameters['localCurrentTime']}) "));
        }
    }
    
    /**
     * Adds the max day ahead restriction.
     * 
     * @param dataSrc datasource
     * @param reservation the reservation
     * @param localCurrentDate current local date
     * @throws ReservationException the reservation exception
     */
    protected final void addMaxDayAheadRestriction(final DataSource dataSrc,
            final IReservation reservation, final Date localCurrentDate)
            throws ReservationException {
        
        // Ignore the max_days_ahead restriction for Reservation Service Desk, Reservation Manager
        // and Reservation Assistant members.
        final User user = ContextStore.get().getUser();
        if (!user.isMemberOfGroup(Constants.RESERVATION_SERVICE_DESK)
                && !user.isMemberOfGroup(Constants.RESERVATION_MANAGER)
                && !user.isMemberOfGroup(Constants.RESERVATION_ASSISTANT)) {
            dataSrc.addRestriction(Restrictions.gte(this.tableName, "max_days_ahead",
                getDaysDifference(reservation, localCurrentDate)));
        }
    }
    
    /**
     * Adds the day start end restriction.
     * 
     * @param dataSrc datasource
     * @param reservation the reservation
     */
    protected final void addDayStartEndRestriction(final DataSource dataSrc,
            final IReservation reservation) {
        if (reservation.getStartTime() == null || reservation.getEndTime() == null) {
            return;
        }
        dataSrc.addRestriction(Restrictions.sql(" ${parameters['startTime']} >= "
                + DataSourceUtils.generateDateAddSql(dataSrc, this.tableName, "day_start",
                    Constants.PRE_BLOCK_FIELD_NAME, true)));
        dataSrc.addRestriction(Restrictions.sql(" ${parameters['endTime']} <= "
                + DataSourceUtils.generateDateAddSql(dataSrc, this.tableName, "day_end",
                    Constants.POST_BLOCK_FIELD_NAME, false)));
    }
    
    /**
     * Adds the security restriction.
     * 
     * @param dataSrc datasource
     */
    protected final void addSecurityRestriction(final DataSource dataSrc) {
        
        // Ignore the available_for_group restriction for Reservation Service Desk and Reservation
        // Manager members.
        final User user = ContextStore.get().getUser();
        if (!user.isMemberOfGroup(Constants.RESERVATION_SERVICE_DESK)
                && !user.isMemberOfGroup(Constants.RESERVATION_MANAGER)) {
            
            String restriction = "( " + this.tableName + ".available_for_group IS NULL ";
            int groupIndex = 0;
            for (final String group : user.getGroups()) {
                final String parameterName = Constants.GROUP_PARAMETER_NAME + (++groupIndex);
                dataSrc.addParameter(parameterName, group, DataSource.DATA_TYPE_TEXT);
                restriction +=
                        " OR " + this.tableName + ".available_for_group LIKE ${parameters['"
                                + parameterName + "']} ";
            }
            restriction += ")";
            dataSrc.addRestriction(Restrictions.sql(restriction));
        }
    }
    
    /**
     * Adds the time period parameters.
     * 
     * @param dataSrc datasource
     * @param reservation the reservation
     */
    protected final void addTimePeriodParameters(final DataSource dataSrc,
            final IReservation reservation) {
        // TODO: check what is now? time zones
        dataSrc.addParameter("now", new Date(), DataSource.DATA_TYPE_DATE);
        
        dataSrc.addParameter("startDate", reservation.getStartDate(), DataSource.DATA_TYPE_DATE);
        dataSrc.addParameter("endDate", reservation.getEndDate(), DataSource.DATA_TYPE_DATE);
        
        dataSrc.addParameter("startTime", reservation.getStartTime(), DataSource.DATA_TYPE_TIME);
        dataSrc.addParameter("endTime", reservation.getEndTime(), DataSource.DATA_TYPE_TIME);
    }
    
    /*
     * (non-Javadoc)
     * 
     * @see com.archibus.datasource.ObjectDataSourceImpl#createFieldToPropertyMapping()
     */
    @Override
    protected Map<String, String> createFieldToPropertyMapping() {
        final Map<String, String> mapping = new HashMap<String, String>();
        
        mapping.put(this.tableName + ".approval", "approvalRequired");
        mapping.put(this.tableName + ".approve_days", "approvalDays");
        mapping.put(this.tableName + ".cancel_days", "cancelDays");
        
        mapping.put(this.tableName + ".announce_time", "announceTime");
        mapping.put(this.tableName + ".cancel_time", "cancelTime");
        
        mapping.put(this.tableName + ".pre_block", "preBlock");
        mapping.put(this.tableName + ".post_block", "postBlock");
        
        mapping.put(this.tableName + ".announce_days", "announceDays");
        mapping.put(this.tableName + ".max_days_ahead", "maxDaysAhead");
        
        mapping.put(this.tableName + ".day_start", "dayStart");
        mapping.put(this.tableName + ".day_end", "dayEnd");
        
        mapping.put(this.tableName + ".reservable", "reservable");
        mapping.put(this.tableName + ".doc_image", "docImage");
        mapping.put(this.tableName + ".ac_id", "acId");
        
        mapping.put(this.tableName + ".group_name", "securityGroupName");
        mapping.put(this.tableName + ".available_for_group", "availableForGroup");
        
        mapping.put(this.tableName + ".cost_per_unit", "costPerUnit");
        mapping.put(this.tableName + ".cost_per_unit_ext", "costPerUnitExternal");
        mapping.put(this.tableName + ".cost_unit", "costUnit");
        mapping.put(this.tableName + ".cost_late_cancel_pct", "costLateCancelPercentage");
        
        return mapping;
    }
    
    /**
     * for version 20.
     * 
     * @return array of arrays.
     */
    @Override
    protected String[][] getFieldsToProperties() {
        return DataSourceUtils.getFieldsToProperties(createFieldToPropertyMapping());
    }
    
    /**
     * Gets the total minutes offset.
     * 
     * @param reservationTimeZoneId the reserved timezone
     * @param dateCheckTimeZone the date check timezone
     * @return the total minutes offset
     */
    protected final int getTotalMinutesOffset(final String reservationTimeZoneId,
            final Date dateCheckTimeZone) {
        TimeZone reservationTimeZone;
        final TimeZone serverTimeZone = TimeZone.getDefault();
        
        if (StringUtil.notNullOrEmpty(reservationTimeZoneId)) {
            reservationTimeZone = TimeZone.getTimeZone(reservationTimeZoneId);
        } else {
            reservationTimeZone = TimeZone.getDefault();
        }
        
        final int reservedMinutesOffset =
                -(reservationTimeZone.getOffset(dateCheckTimeZone.getTime()) / Constants.ONE_MINUTE);
        final int serverMinutesOffset =
                -(serverTimeZone.getOffset(dateCheckTimeZone.getTime()) / Constants.ONE_MINUTE);
        
        return reservedMinutesOffset - serverMinutesOffset;
    }
    
    /**
     * Gets the days difference.
     * 
     * @param reservation the reservation
     * @param localCurrentDate current local date
     * @return the days difference
     * @throws ReservationException the reservation exception
     */
    protected final int getDaysDifference(final IReservation reservation,
            final Date localCurrentDate) throws ReservationException {
        if (reservation.getStartDate() == null) {
            // @translatable
            throw new ReservationException("No reservation date",
                AbstractReservableDataSource.class);
        }
        
        final int daysDifference =
                (int) ((reservation.getStartDate().getTime() - localCurrentDate.getTime()) / Constants.ONE_DAY);
        
        if (daysDifference < 0) {
            // @translatable
            throw new ReservationException("Reservations should be in the future.",
                AbstractReservableDataSource.class);
        }
        return daysDifference;
    }
    
    /**
     * Get the difference in minutes between reservation start time and local current time.
     * 
     * @param reservation Reservation
     * @param localCurrentTime local current time
     * @return difference in minutes
     * @throws ReservationException thrown when reservation start time is not found
     */
    protected final long getMinutesDifference(final IReservation reservation,
            final Time localCurrentTime) throws ReservationException {
        if (reservation.getStartTime() == null) {
            // @translatable
            throw new ReservationException("No reservation start time",
                AbstractReservableDataSource.class);
        }
        
        final long minutesDifference =
                (reservation.getStartTime().getTime() - localCurrentTime.getTime())
                        / Constants.ONE_MINUTE;
        
        return minutesDifference;
    }
    
}
