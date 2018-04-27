package com.archibus.eventhandler.hoteling;

import java.text.SimpleDateFormat;
import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * Service class for Hoteling notification.
 * <p>
 * 
 * @author Guo
 * @since 20.3
 */
public class HotelingNotifyService extends EventHandlerBase {
    
    /**
     * schedule notify subject.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_SUBJECT = "Your pending Hotel bookings";
    
    /**
     * schedule notify body text.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_BODY_TEXT =
            "The following Hotel booking is pending approval, but the approval window has expired.  Please review it.";
    
    /**
     * schedule notify text booking id.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_BOOKING_ID = "Booking ID";
    
    /**
     * schedule notify text employee.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_EMPLOYEE = "Employee";
    
    /**
     * schedule notify text location.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_LOCATION = "Location";
    
    /**
     * schedule notify text start date.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_START_DATE = "Start Date";
    
    /**
     * schedule notify text end date.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_END_DATE = "End Date";
    
    /**
     * schedule notify text day part.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_DAY_PART = "Day Part";
    
    /**
     * schedule notify text status.
     */
    // @translatable
    private static final String SCHEDULE_NOTIFY_TEXT_STATUS = HotelingConstants.STATUS;
    
    /**
     * schedule notify text - row text.
     */
    private static final String SCHEDULE_NOTIFY_ROW_TEXT =
            "<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td><td>{5}</td><td>{6}</td></tr>";
    
    /**
     * schedule notify body td element start.
     */
    private static final String SCHEDULE_NOTIFY_BODY_TD_START = "<td width=\"150\">";
    
    /**
     * schedule notify body td element end.
     */
    private static final String SCHEDULE_NOTIFY_BODY_TD_END = "</td>";
    
    /**
     * flag of send email.
     */
    private boolean sendEmail;
    
    /**
     * Getter for the isSendEmail property.
     * 
     * @see isSendEmail
     * @return the isSendEmail property.
     */
    public boolean isSendEmail() {
        return this.sendEmail;
    }
    
    /**
     * Setter for the isSendEmail property.
     * 
     * @param isSend isSend
     */
    
    public void setSendEmail(final boolean isSend) {
        this.sendEmail = isSend;
    }
    
    /**
     * add parameters to context response for notify.
     * 
     */
    public void addParametertoContextForNotify() {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        context.addInputParameter(HotelingConstants.EMPLOYEE_LIST, new ArrayList<String>());
        context.addInputParameter(HotelingConstants.VISITOR_LIST, new ArrayList<String>());
        context.addInputParameter(HotelingConstants.APPROVER_LIST, new ArrayList<String>());
        context.addInputParameter(HotelingConstants.EMPLOYEE_MAP,
            new TreeMap<String, List<DataRecord>>());
        context.addInputParameter(HotelingConstants.VISITOR_MAP,
            new TreeMap<String, List<DataRecord>>());
        context.addInputParameter(HotelingConstants.APPROVER_MAP,
            new TreeMap<String, List<DataRecord>>());
    }
    
    /**
     * This method will prepare needed information for following email notification according to
     * activity's parameter 'SendEmailToOccupiers'.
     * 
     * @param booking booking
     * @param bookingsList bookingsList
     */
    public void prepareEmailNotificationList(final JSONObject booking,
            final List<DataRecord> bookingsList) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        final String emId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.EM_ID);
        final String dvId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DV_ID);
        final String dpId =
                booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                        + HotelingConstants.DP_ID);
        String visitorId = null;
        if (booking.has(HotelingConstants.RMPCT + HotelingConstants.DOT
                + HotelingConstants.VISITOR_ID)) {
            visitorId =
                    booking.getString(HotelingConstants.RMPCT + HotelingConstants.DOT
                            + HotelingConstants.VISITOR_ID);
        }
        
        final List<String> employeesList =
                (List<String>) context.getParameter(HotelingConstants.EMPLOYEE_LIST);
        final List<String> visitorsList =
                (List<String>) context.getParameter(HotelingConstants.VISITOR_LIST);
        final List<String> approvesList =
                (List<String>) context.getParameter(HotelingConstants.APPROVER_LIST);
        
        final TreeMap<String, List<DataRecord>> notifyEmployeesMap =
                (TreeMap<String, List<DataRecord>>) context
                    .getParameter(HotelingConstants.EMPLOYEE_MAP);
        final TreeMap<String, List<DataRecord>> notifyVisitorsMap =
                (TreeMap<String, List<DataRecord>>) context
                    .getParameter(HotelingConstants.VISITOR_MAP);
        final TreeMap<String, List<DataRecord>> approvesMap =
                (TreeMap<String, List<DataRecord>>) context
                    .getParameter(HotelingConstants.APPROVER_MAP);
        
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_OCCUPIERS))) {
            if (StringUtil.notNullOrEmpty(visitorId)) {
                addNotifyList(visitorId, visitorsList, bookingsList, notifyVisitorsMap);
            } else {
                if (StringUtil.notNullOrEmpty(emId)) {
                    addNotifyList(emId, employeesList, bookingsList, notifyEmployeesMap);
                }
            }
        }
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_APPROVERS))) {
            final String approver = HotelingUtility.getDepartManagerByDpId(dvId, dpId);
            if (StringUtil.notNullOrEmpty(approver)) {
                addNotifyList(approver, approvesList, bookingsList, approvesMap);
            }
        }
        
    }
    
    /**
     * add notify list.
     * 
     * @param name name
     * @param notifyList notifyList
     * @param bookingsList bookingsList
     * @param notifyMap notifyMap
     */
    private static void addNotifyList(final String name, final List<String> notifyList,
            final List<DataRecord> bookingsList, final Map<String, List<DataRecord>> notifyMap) {
        if (notifyList.contains(name)) {
            final List<DataRecord> bookingsList1 = notifyMap.get(name);
            bookingsList1.addAll(bookingsList);
            notifyMap.put(name, bookingsList1);
        } else {
            notifyMap.put(name, bookingsList);
            notifyList.add(name);
        }
    }
    
    /**
     * send notification.
     * 
     * @param bookingAction bookingAction can be set "create",cancel,approve,reject
     * @param recurringRule recurringRule
     */
    public void sendNotification(final String bookingAction, final String recurringRule) {
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_OCCUPIERS))) {
            String emId = "";
            final TreeMap<String, List<DataRecord>> notifyEmployeesMap =
                    (TreeMap<String, List<DataRecord>>) context
                        .getParameter(HotelingConstants.EMPLOYEE_MAP);
            if (notifyEmployeesMap != null) {
                final Iterator<Map.Entry<String, List<DataRecord>>> itEm =
                        notifyEmployeesMap.entrySet().iterator();
                while (itEm.hasNext()) {
                    final Map.Entry<String, List<DataRecord>> enterEm = itEm.next();
                    emId = enterEm.getKey();
                    final List<DataRecord> bookingsList = enterEm.getValue();
                    final TreeMap<String, String> mailText =
                            (TreeMap<String, String>) new HotelingNotifyText(this).getEmailText(
                                bookingsList, null, null, bookingAction, recurringRule);
                    final Iterator<Map.Entry<String, String>> mailTextIt =
                            mailText.entrySet().iterator();
                    final Map.Entry<String, String> mailTextEnter = mailTextIt.next();
                    final String subject = mailTextEnter.getKey();
                    final String text = mailTextEnter.getValue();
                    
                    sendEmailToEmployee(context, emId, subject, text);
                    
                }
            }
            
            final TreeMap<String, List<DataRecord>> notifyVisitorsMap =
                    (TreeMap<String, List<DataRecord>>) context
                        .getParameter(HotelingConstants.VISITOR_MAP);
            if (notifyVisitorsMap != null) {
                final Iterator<Map.Entry<String, List<DataRecord>>> itVistor =
                        notifyVisitorsMap.entrySet().iterator();
                while (itVistor.hasNext()) {
                    final Map.Entry<String, List<DataRecord>> enterVisitor = itVistor.next();
                    final List<DataRecord> bookingsList = enterVisitor.getValue();
                    // call getEmailText for visitor
                    final TreeMap<String, String> mailText =
                            (TreeMap<String, String>) new HotelingNotifyText(this).getEmailText(
                                null, bookingsList, null, bookingAction, recurringRule);
                    final Iterator<Map.Entry<String, String>> mailTextIt =
                            mailText.entrySet().iterator();
                    final Map.Entry<String, String> mailTextEnter = mailTextIt.next();
                    final String subject = mailTextEnter.getKey();
                    final String text = mailTextEnter.getValue();
                    
                    sendEmailToVisitor(context, enterVisitor.getKey(), subject, text);
                    
                }
                
            }
        }
        
        if (HotelingConstants.YES.equalsIgnoreCase(EventHandlerBase.getActivityParameterString(
            context, HotelingConstants.AB_SPACE_HOTELLING,
            HotelingConstants.SEND_EMAIL_TO_APPROVERS))) {
            String approveId = "";
            final TreeMap<String, List<DataRecord>> approvesMap =
                    (TreeMap<String, List<DataRecord>>) context
                        .getParameter(HotelingConstants.APPROVER_MAP);
            if (approvesMap != null) {
                final Iterator<Map.Entry<String, List<DataRecord>>> itApprove =
                        approvesMap.entrySet().iterator();
                while (itApprove.hasNext()) {
                    final Map.Entry<String, List<DataRecord>> enterApprove = itApprove.next();
                    approveId = enterApprove.getKey();
                    final List<DataRecord> bookingsList = enterApprove.getValue();
                    final TreeMap<String, String> mailText =
                            (TreeMap<String, String>) new HotelingNotifyText(this).getEmailText(
                                null, null, bookingsList, bookingAction, recurringRule);
                    final Iterator<Map.Entry<String, String>> mailTextIt =
                            mailText.entrySet().iterator();
                    final Map.Entry<String, String> mailTextEnter = mailTextIt.next();
                    final String subject = mailTextEnter.getKey();
                    final String text = mailTextEnter.getValue();
                    
                    sendEmailToApprover(bookingAction, context, approveId, subject, text);
                }
            }
        }
    }
    
    /**
     * send email to approver.
     * 
     * @param bookingAction bookingAction
     * @param context context
     * @param approveId approveId
     * @param subject subject
     * @param text text
     */
    private void sendEmailToApprover(final String bookingAction, final EventHandlerContext context,
            final String approveId, final String subject, final String text) {
        if (approveId.length() > 0) {
            final String email =
                    EventHandlerBase.getEmailAddress(context, HotelingConstants.T_EM,
                        HotelingConstants.EM_ID, approveId);
            if (StringUtil.notNullOrEmpty(email) && this.sendEmail
                    && bookingAction.equals(HotelingConstants.BOOKING_ACTION_CREATE)) {
                this.sendEmail = false;
                this.sendSubNotifyEmail(email, subject, text);
            }
            
        }
    }
    
    /**
     * send email to visitor.
     * 
     * @param context context
     * @param visitorId visitorId
     * @param subject subject
     * @param text text
     */
    private void sendEmailToVisitor(final EventHandlerContext context, final String visitorId,
            final String subject, final String text) {
        if (visitorId.length() > 0) {
            final String email =
                    EventHandlerBase.getEmailAddress(context, HotelingConstants.VISITORS,
                        HotelingConstants.VISITOR_ID, visitorId);
            if (StringUtil.notNullOrEmpty(email)) {
                this.sendSubNotifyEmail(email, subject, text);
            }
        }
        
    }
    
    /**
     * send email to employee.
     * 
     * @param context context
     * @param emId emId
     * @param subject subject
     * @param text text
     */
    private void sendEmailToEmployee(final EventHandlerContext context, final String emId,
            final String subject, final String text) {
        if (emId.length() > 0) {
            final String email =
                    EventHandlerBase.getEmailAddress(context, HotelingConstants.T_EM,
                        HotelingConstants.EM_ID, emId);
            if (StringUtil.notNullOrEmpty(email)) {
                this.sendSubNotifyEmail(email, subject, text);
            }
        }
        
    }
    
    /**
     * send sub notify email.
     * 
     * @param email email
     * @param subject subject
     * @param text text
     */
    public void sendSubNotifyEmail(final String email, final String subject, final String text) {
        final MailMessage message = new MailMessage();
        message.setActivityId(HotelingConstants.AB_SPACE_HOTELLING);
        message.setContentType("text/html; charset=UTF-8");
        message.setTo(email);
        message.setSubject(subject);
        message.setText(text);
        
        final MailSender sender = new MailSender();
        sender.send(message);
    }
    
    /**
     * notify user when approval expired.
     * 
     * @param context context
     * @param bookingList bookingList
     * @param user user
     */
    public void notityUserApprovalExpired(final EventHandlerContext context,
            final List<Map<String, Object>> bookingList, final String user) {
        
        String body = "";
        final SimpleDateFormat dateFornat = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
        
        for (final Map<String, Object> element : bookingList) {
            final Map<String, Object> record = element;
            final String pctId =
                    getIntegerValue(context, record.get(HotelingConstants.PCT_ID)).toString();
            String emId = "";
            if (record.get(HotelingConstants.EM_ID) != null) {
                emId = (String) record.get(HotelingConstants.EM_ID);
            }
            
            final String location =
                    (String) record.get(HotelingConstants.BL_ID)
                            + HotelingConstants.EMAIL_TEXT_CONCAT
                            + (String) record.get(HotelingConstants.FL_ID)
                            + HotelingConstants.EMAIL_TEXT_CONCAT
                            + (String) record.get(HotelingConstants.RM_ID);
            final Date startDate = getDateValue(context, record.get(HotelingConstants.DATE_START));
            final Date endDate = getDateValue(context, record.get(HotelingConstants.DATE_END));
            final String dayPart =
                    getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
                        HotelingConstants.DAY_PART,
                        getIntegerValue(context, record.get(HotelingConstants.DAY_PART)).toString());
            final String status =
                    getEnumFieldDisplayedValue(context, HotelingConstants.RMPCT,
                        HotelingConstants.STATUS,
                        getIntegerValue(context, record.get(HotelingConstants.STATUS)).toString());
            final Object[] args =
                    new Object[] { pctId, emId, location, dateFornat.format(startDate),
                            dateFornat.format(endDate), dayPart, status };
            body = body + prepareMessage(context, SCHEDULE_NOTIFY_ROW_TEXT, args);
        }
        
        body =
                "<html><body style = \"font-family:Arial;color=blue;font-size:12px;\">"
                        + "<p style = \"font-family:Arial;color=blue;font-size:12px;\">"
                        + SCHEDULE_NOTIFY_BODY_TEXT
                        + "</p>"
                        + "<table style=\"font-family:Arial;color=blue;font-size:12px;\" border=\"1px\">"
                        + "<tr>"
                        + SCHEDULE_NOTIFY_BODY_TD_START
                        + SCHEDULE_NOTIFY_TEXT_BOOKING_ID
                        + SCHEDULE_NOTIFY_BODY_TD_END
                        + SCHEDULE_NOTIFY_BODY_TD_START
                        + SCHEDULE_NOTIFY_TEXT_EMPLOYEE
                        + SCHEDULE_NOTIFY_BODY_TD_END
                        + SCHEDULE_NOTIFY_BODY_TD_START
                        + SCHEDULE_NOTIFY_TEXT_LOCATION
                        + SCHEDULE_NOTIFY_BODY_TD_END
                        + SCHEDULE_NOTIFY_BODY_TD_START
                        + SCHEDULE_NOTIFY_TEXT_START_DATE
                        + SCHEDULE_NOTIFY_BODY_TD_END
                        + SCHEDULE_NOTIFY_BODY_TD_START
                        + SCHEDULE_NOTIFY_TEXT_END_DATE
                        + SCHEDULE_NOTIFY_BODY_TD_END
                        + SCHEDULE_NOTIFY_BODY_TD_START
                        + SCHEDULE_NOTIFY_TEXT_DAY_PART
                        + SCHEDULE_NOTIFY_BODY_TD_END
                        + SCHEDULE_NOTIFY_BODY_TD_START
                        + SCHEDULE_NOTIFY_TEXT_STATUS
                        + SCHEDULE_NOTIFY_BODY_TD_END
                        + "</tr>"
                        + body
                        + "</table>"
                        + "<br><br>"
                        + "<a href=\""
                        + getWebCentralPath(context)
                        + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-review.axvw\">"
                        + getWebCentralPath(context)
                        + "/schema/ab-products/workplace/hoteling/views/ab-ht-booking-review.axvw"
                        + "</a>" + "</body></html>";
        
        final String email = getEmailAddress(context, "afm_users", "user_name", user);
        if (StringUtil.notNullOrEmpty(email)) {
            sendSubNotifyEmail(email, SCHEDULE_NOTIFY_SUBJECT, body);
        }
    }
}
