package com.archibus.app.reservation.service;

import java.sql.Time;
import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.Recurrence;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * The Class ReservationRemoteServiceImpl.
 * 
 * @author Bart Vanderschoot
 */
public class ReservationRemoteServiceImpl implements ReservationRemoteService {
    
    /** reservation activity. */
    private static final String RESERVATIONS_ACTIVITY = "AbWorkplaceReservations";
    
    /**
     * UTC time zone identifier.
     */
    private static final String UTC_TIMEZONE = "UTC";
    
    /**
     * Project parameter name.
     */
    private static final String PROJECT_PARAMETER = "project";
    
    /** The reservation service. */
    private IReservationService reservationService;
    
    /** The space service. */
    private ISpaceService spaceService;
    
    /** The employee service. */
    private IEmployeeService employeeService;
    
    /**
     * {@inheritDoc}
     */
    public final void cancelRoomReservation(final RoomReservation reservation) throws ExceptionBase {
        this.reservationService.cancelReservation(reservation);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomReservation> cancelRoomReservationByUniqueIdRecurrence(
            final String uniqueId, final String email, final boolean disconnectOnError)
            throws ExceptionBase {
        
        return this.reservationService.cancelRecurringReservation(uniqueId, email,
            disconnectOnError);
        
    }
    
    /**
     * {@inheritDoc}
     */
    public final void disconnectRoomReservation(final RoomReservation reservation)
            throws ExceptionBase {
        
        // get the original reservation, so any changes in the object received from the client
        // are not saved
        final RoomReservation roomReservation =
                this.reservationService.getActiveReservation(reservation.getReserveId(),
                    UTC_TIMEZONE);
        
        this.reservationService.disconnectReservation(roomReservation);
        
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomArrangement> findAvailableRooms(final RoomReservation reservation,
            final Integer capacity, final boolean allDayEvent) throws ExceptionBase {
        return this.reservationService.findAvailableRooms(reservation, capacity, null, allDayEvent,
            UTC_TIMEZONE);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomAvailability> findRoomAvailabilities(final String blId,
            final String flId, final String arrangeTypeId, final Date startDate, final Date endDate)
            throws ExceptionBase {
        return this.reservationService.findRoomAvailabilities(blId, flId, arrangeTypeId, startDate,
            endDate);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<ArrangeType> getArrangeTypes() throws ExceptionBase {
        return this.reservationService.getArrangeTypes();
    }
    
    /**
     * {@inheritDoc}
     */
    public final UserLocation getUserLocation(final String email) throws ExceptionBase {
        
        return this.employeeService.findEmployeeLocation(email);
        
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<Site> getSites() throws ExceptionBase {
        return this.spaceService.getSites();
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<Building> getBuildings(final String siteId) throws ExceptionBase {
        return this.spaceService.getBuildings(siteId);
    }
    
    /**
     * {@inheritDoc}
     */
    public final Building getBuildingDetails(final String blId) throws ExceptionBase {
        return this.spaceService.getBuildingDetails(blId);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<Floor> getFloors(final String blId) throws ExceptionBase {
        return this.spaceService.getFloors(blId);
    }
    
    /**
     * {@inheritDoc}
     */
    public final RoomReservation getRoomReservationById(final Integer reserveId)
            throws ExceptionBase {
        return this.reservationService.getActiveReservation(reserveId, UTC_TIMEZONE);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomReservation> getRoomReservationsByUniqueId(final String uniqueId)
            throws ExceptionBase {
        return this.reservationService.getByUniqueId(uniqueId, UTC_TIMEZONE);
    }
    
    /**
     * {@inheritDoc}
     */
    public final String heartBeat() {
        return "ok";
    }
    
    /**
     * {@inheritDoc}
     */
    public final RoomReservation saveRoomReservation(final RoomReservation reservation)
            throws ExceptionBase {
        setRequestor(reservation);
        this.reservationService.saveReservation(reservation);
        return this.getRoomReservationById(reservation.getReserveId());
    }
    
    /**
     * {@inheritDoc}
     */
    public final boolean verifyRecurrencePattern(final String uniqueId,
            final Recurrence recurrence, final Time startTime, final Time endTime,
            final String timeZone) throws ExceptionBase {
        
        return this.reservationService.verifyRecurrencePattern(uniqueId, recurrence, startTime,
            endTime, timeZone);
        
    }
    
    /**
     * {@inheritDoc}
     */
    public final Room getRoomDetails(final String blId, final String flId, final String rmId)
            throws ExceptionBase {
        return this.spaceService.getRoomDetails(blId, flId, rmId);
    }
    
    /**
     * {@inheritDoc}
     */
    public final String getActivityParameter(final String identifier) throws ExceptionBase {
        checkProjectContext();
        
        final String viewName =
                com.archibus.service.Configuration.getActivityParameterString(
                    RESERVATIONS_ACTIVITY, identifier);
        return viewName;
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<RoomReservation> saveRecurringRoomReservation(
            final RoomReservation reservation, final Recurrence recurrence) throws ExceptionBase {
        // Set the requestor and save the reservation series.
        setRequestor(reservation);
        final List<RoomReservation> temporaryList =
                this.reservationService.saveRecurringReservation(reservation, recurrence);
        
        // Return the reservations with UTC time zone.
        final List<RoomReservation> reservationList = new ArrayList<RoomReservation>();
        for (RoomReservation temporaryReservation : temporaryList) {
            final RoomReservation savedReservation =
                    getRoomReservationById(temporaryReservation.getReserveId());
            reservationList.add(savedReservation);
        }
        return reservationList;
    }
    
    /**
     * Sets the employee service.
     * 
     * @param employeeService the new employee service
     */
    public final void setEmployeeService(final IEmployeeService employeeService) {
        this.employeeService = employeeService;
    }
    
    /**
     * Sets the reservation service.
     * 
     * @param reservationService the new reservation service
     */
    public final void setReservationService(final IReservationService reservationService) {
        this.reservationService = reservationService;
    }
    
    /**
     * Sets the space service.
     * 
     * @param spaceService the new space service
     */
    public final void setSpaceService(final ISpaceService spaceService) {
        this.spaceService = spaceService;
    }
    
    /**
     * Check project context.
     */
    private void checkProjectContext() {
        final EventHandlerContext eventHandlerContext = ContextStore.get().getEventHandlerContext();
        if (!eventHandlerContext.parameterExistsNotEmpty(PROJECT_PARAMETER)) {
            ContextStore.get().getEventHandlerContext()
                .addInputParameter(PROJECT_PARAMETER, ContextStore.get().getProject());
        }
    }
    
    /**
     * Set the creator of the reservation, verified via employee table.
     * 
     * @param reservation the reservation to set the creator for
     */
    private void setRequestor(final RoomReservation reservation) {
        final Employee requestor = this.employeeService.findEmployee(reservation.getEmail());
        
        if (requestor == null) {
            // @translatable
            throw new ReservationException("No employee found with the email [{0}].",
                ReservationRemoteServiceImpl.class, reservation.getEmail());
        } else {
            reservation.setCreator(requestor);
        }
    }
    
}
