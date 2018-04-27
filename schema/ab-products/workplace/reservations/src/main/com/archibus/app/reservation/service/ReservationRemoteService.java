package com.archibus.app.reservation.service;

import java.sql.Time;
import java.util.*;

import javax.jws.*;
import javax.xml.bind.annotation.XmlSeeAlso;

import com.archibus.app.common.space.domain.*;
import com.archibus.app.reservation.domain.*;
import com.archibus.app.reservation.domain.recurrence.*;
import com.archibus.utility.ExceptionBase;

/**
 * The Interface ReservationRemoteService.
 * 
 * @author Bart Vanderschoot
 */
@WebService(name = "reservationService")
@XmlSeeAlso(value = { DailyPattern.class, WeeklyPattern.class, MonthlyPattern.class,
        YearlyPattern.class })
public interface ReservationRemoteService {
    
    /**
     * Cancel room reservation.
     * 
     * @param reservation the reservation
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "cancelRoomReservation")
    void cancelRoomReservation(RoomReservation reservation) throws ExceptionBase;
    
    /**
     * Cancel room reservation by unique id recurrence.
     * 
     * @param uniqueId the unique id
     * @param email the email
     * @param disconnectOnError the disconnect on error
     * @return the list of reservations that could not be cancelled
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "cancelRoomReservationRecurrence")
    List<RoomReservation> cancelRoomReservationByUniqueIdRecurrence(String uniqueId, String email,
            boolean disconnectOnError) throws ExceptionBase;
    
    /**
     * Disconnect room reservation: remove the appointment unique ID.
     * 
     * @param reservation the reservation
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "disconnectRoomReservation")
    void disconnectRoomReservation(RoomReservation reservation) throws ExceptionBase;
    
    /**
     * Find available rooms.
     * 
     * @param reservation the reservation
     * @param capacity the capacity
     * @param allDayEvent true for all day events, false for regular reservations
     * 
     * @return the list
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "findAvailableRooms")
    List<RoomArrangement> findAvailableRooms(RoomReservation reservation, Integer capacity,
            boolean allDayEvent) throws ExceptionBase;
    
    /**
     * Find room availabilities.
     * 
     * @param blId the bl id
     * @param flId the fl id
     * @param arrangeTypeId the arrange type id
     * @param startDate the start date
     * @param endDate the end date
     * @return the list
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "findRoomAvailabilities")
    List<RoomAvailability> findRoomAvailabilities(String blId, String flId, String arrangeTypeId,
            Date startDate, Date endDate) throws ExceptionBase;
    
    /**
     * Get room reservation by primary key.
     * 
     * @param reserveId reservation id
     * @return room reservation
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getRoomReservationById")
    RoomReservation getRoomReservationById(final Integer reserveId) throws ExceptionBase;
    
    /**
     * Gets the room reservations by unique id.
     * 
     * @param uniqueId the unique id
     * @return the room reservations by unique id
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getRoomReservationsByUniqueId")
    List<RoomReservation> getRoomReservationsByUniqueId(String uniqueId) throws ExceptionBase;
    
    /**
     * Gets the sites that have reservable rooms.
     * 
     * @return the sites
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getSites")
    List<Site> getSites() throws ExceptionBase;
    
    /**
     * Get the user's location.
     * 
     * @param email user's email address
     * @return user's location
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getUserLocation")
    UserLocation getUserLocation(final String email) throws ExceptionBase;
    
    /**
     * Gets the arrange types.
     * 
     * @return the arrange types
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getArrangeTypes")
    List<ArrangeType> getArrangeTypes() throws ExceptionBase;
    
    /**
     * Gets the buildings.
     * 
     * @param siteId the site id
     * @return the buildings
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getBuildings")
    List<Building> getBuildings(String siteId) throws ExceptionBase;
    
    /**
     * Get building details.
     * 
     * @param blId building id
     * @return the building details
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getBuildingDetails")
    Building getBuildingDetails(final String blId) throws ExceptionBase;
    
    /**
     * Gets the floors.
     * 
     * @param blId the bl id
     * @return the floors
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getFloors")
    List<Floor> getFloors(String blId) throws ExceptionBase;
    
    /**
     * Gets the floors.
     * 
     * @param blId the bl id
     * @param flId the floor id
     * @param rmId the room id
     * 
     * @return the floors
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getRoomDetails")
    Room getRoomDetails(String blId, String flId, String rmId) throws ExceptionBase;
    
    /**
     * Gets the value of a reservations activity parameter.
     * 
     * @param id activity parameter identifier
     * @return value of the activity parameter
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "getActivityParameter")
    String getActivityParameter(String id) throws ExceptionBase;
    
    /**
     * Heart beat, just for testing. Can be removed?
     * 
     * @return the string
     */
    @WebMethod(action = "heartBeat")
    String heartBeat();
    
    /**
     * Save recurring room reservation.
     * 
     * @param reservation the reservation
     * @param recurrence the recurrence
     * @return the list
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "saveRecurringRoomReservation")
    List<RoomReservation> saveRecurringRoomReservation(RoomReservation reservation,
            Recurrence recurrence) throws ExceptionBase;
    
    /**
     * Save room reservation.
     * 
     * @param reservation the reservation
     * @return the room reservation
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "saveRoomReservation")
    RoomReservation saveRoomReservation(RoomReservation reservation) throws ExceptionBase;
    
    /**
     * Verify whether all reservations linked to an ID match a given recurrence pattern.
     * 
     * @param uniqueId the unique id of the appointment series
     * @param recurrence the recurrence
     * @param startTime time of day that the appointments start
     * @param endTime time of day that the appointments end
     * @param timeZone the time zone
     * @return true if it matches, false if at least one reservation is different or missing
     * 
     * @throws ExceptionBase ExceptionBase
     */
    @WebMethod(action = "verifyRecurrencePattern")
    boolean verifyRecurrencePattern(String uniqueId, Recurrence recurrence, Time startTime,
            Time endTime, String timeZone) throws ExceptionBase;
}
