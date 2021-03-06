package com.archibus.app.common.notification.service;

import java.text.MessageFormat;
import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.common.notification.dao.INotificationDao;
import com.archibus.app.common.notification.dao.datasource.NotificationDataSource;
import com.archibus.app.common.notification.domain.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.*;

/**
 * 
 * Compliance Notification Sender Implementation Class.
 * 
 * @author Zhang Yi
 * 
 */
public class NotificationSender implements INotificationSender {
    
    /**
     * ARCHIBUS Mail Sender Object.
     */
    private final MailSender mailSender;
    
    /**
     * Constructor.
     * 
     */
    public NotificationSender() {
        this.mailSender = new MailSender();
        
    }
    
    /**
     * {@inheritDoc}
     */
    public void send(final List<Notification> notifications, final NotificationTemplate template) {
        
        final INotificationDao notificationDao = new NotificationDataSource();
        
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String from = EventHandlerBase.getEmailFrom(context);
        final String host = EventHandlerBase.getEmailHost(context);
        final String port = EventHandlerBase.getEmailPort(context);
        final String userId = EventHandlerBase.getEmailUserId(context);
        final String password = EventHandlerBase.getEmailPassword(context);
        
        final String activityId = template.getActivityId();
        
        if ("Email".equalsIgnoreCase(template.getType())
                || "Email and Alert".equalsIgnoreCase(template.getType())) {
            
            // for each notification object of notifications list:
            for (final Notification notification : notifications) {
                boolean sent = false;
                for (final MailMessage message : notification.getMailMessages()) {
                    
                    message.setActivityId(activityId);
                    message.setContentType(EventHandlerBase.CONTENT_TYPE_TEXT_UFT8);
                    message.setUser(userId);
                    message.setPassword(password);
                    message.setPort(port);
                    message.setHost(host);
                    message.setFrom(from);
                    try {
                        this.mailSender.send(message);
                        sent = true;
                    } catch (final ExceptionBase originalException) {
                        final String errorMessage =
                                MessageFormat
                                    .format(
                                        "Failed to Send Notification {0} to Address {1}.\nRoot cause: {2}",
                                        notification.getId(), message.getTo(),
                                        originalException.getMessage());
                        Logger.getLogger(NotificationSender.class).error(errorMessage,
                            originalException);
                    }
                    
                }
                if (sent) {
                    // after notification send, plus one to origianl notify_count
                    notification.setCount(notification.getCount() + 1);
                    notification.setDateSent(Utility.currentDate());
                    notificationDao.update(notification);
                }
            }
            
            // call update() to update the date send and save it to database
            this.update();
        }
    }
    
    /**
     * Update the properties( fields) of notification object according to logic in functional.
     * 
     * Justification: Case#2.2 : Statement with Update ... pattern.
     */
    @SuppressWarnings("PMD.AvoidUsingSql")
    private void update() {
        
        // UPDATE notifications
        // SET notifications.is_active=0
        // WHERE notifications.is_active=1 and notifications.date_sent IS NOT NULL
        // AND notifications.template_id =
        // ( SELECT notify_templates.template_id FROM notify_templates
        // WHERE notifications.template_id=notify_templates.template_id
        // AND (notify_templates.notify_recurrence=0 OR notifications.notify_count >=
        // notify_templates.total_recurrence)
        // )
        final StringBuilder updateBuilder = new StringBuilder();
        updateBuilder.append(" UPDATE notifications SET notifications.is_active=0  ");
        updateBuilder
            .append("           WHERE  notifications.is_active=1 and notifications.date_sent IS NOT NULL ");
        updateBuilder.append("    AND  notifications.template_id = ");
        updateBuilder
            .append("                   ( SELECT notify_templates.template_id FROM notify_templates ");
        updateBuilder
            .append("                       WHERE notifications.template_id=notify_templates.template_id ");
        updateBuilder.append("               AND ( notify_templates.notify_recurrence=0 ");
        updateBuilder
            .append("                         OR notifications.notify_count >= notify_templates.total_recurrence )");
        updateBuilder.append("          )");
        
        SqlUtils.executeUpdate("notifications", updateBuilder.toString());
    }
}
