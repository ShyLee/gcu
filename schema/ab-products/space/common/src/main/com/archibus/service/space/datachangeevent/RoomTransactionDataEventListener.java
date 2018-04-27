package com.archibus.service.space.datachangeevent;

import java.util.Date;

import org.springframework.context.ApplicationEvent;

import com.archibus.app.common.organization.dao.datasource.EmployeeDataSource;
import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.IRoomDao;
import com.archibus.app.common.space.dao.datasource.Constants;
import com.archibus.app.common.space.domain.Room;
import com.archibus.config.Project;
import com.archibus.core.event.data.*;
import com.archibus.service.space.SpaceConstants;
import com.archibus.utility.StringUtil;

/**
 * Listener which is configured to be notified by the core when there is a DataEvent. Records
 * transaction using roomTransactionService, or Sets the ResyncWorkspaceTransactionsTable activity
 * parameter to 1.
 * <p>
 * This is a prototype bean managed by Spring, configured in
 * /WEB-INF/config/context/applications/applications-child-context.xml.
 * 
 * @author Valery Tydykov
 * 
 */
public class RoomTransactionDataEventListener implements IDataEventListener {
    
    /**
     * Project, required to get activity parameter value.
     */
    private Project.Immutable project;
    
    /**
     * Dao for Room.
     */
    private IRoomDao roomDao;
    
    /**
     * Employee dataSource.
     */
    private EmployeeDataSource employeeDataSource;
    
    /**
     * Room transaction service.
     */
    private IRoomTransactionService roomTransactionService;
    
    /**
     * @return the project
     */
    public Project.Immutable getProject() {
        return this.project;
    }
    
    /**
     * @return the roomDao
     */
    public IRoomDao getRoomDao() {
        return this.roomDao;
    }
    
    /**
     * @return the employeeDataSource
     */
    public EmployeeDataSource getEmployeeDataSource() {
        return this.employeeDataSource;
    }
    
    /**
     * @return the roomTransactionService
     */
    public IRoomTransactionService getRoomTransactionService() {
        return this.roomTransactionService;
    }
    
    /** {@inheritDoc} */
    public void onApplicationEvent(final ApplicationEvent event) {
        if (event instanceof RecordChangedEvent) {
            final RecordChangedEvent recordChangedEvent = (RecordChangedEvent) event;
            
            onApplicationEventRecordChanged(recordChangedEvent);
        } else if (event instanceof SqlExecutedEvent) {
            final SqlExecutedEvent sqlExecutedEvent = (SqlExecutedEvent) event;
            
            onApplicationEventSqlExecuted(sqlExecutedEvent);
        }
    }
    
    /**
     * @param project the project to set
     */
    public void setProject(final Project.Immutable project) {
        this.project = project;
    }
    
    /**
     * @param roomDao the roomDao to set
     */
    public void setRoomDao(final IRoomDao roomDao) {
        this.roomDao = roomDao;
    }
    
    /**
     * @param employeeDataSource the employeeDataSource to set
     */
    public void setEmployeeDataSource(final EmployeeDataSource employeeDataSource) {
        this.employeeDataSource = employeeDataSource;
    }
    
    /**
     * @param roomTransactionService the roomTransactionService to set
     */
    public void setRoomTransactionService(final IRoomTransactionService roomTransactionService) {
        this.roomTransactionService = roomTransactionService;
    }
    
    /**
     * Loads activity parameter UseWorkspaceTransactions.
     * 
     * @return activity parameter UseWorkspaceTransactions.
     */
    private boolean loadActivityParameterUseWorkspaceTransactions() {
        final String parameterValue =
                this.project.getActivityParameterManager().getParameterValue(
                    SpaceConstants.SPACE_ACTIVITY + "-" + SpaceConstants.USEWORKSPACETRANSACTIONS);
        
        boolean value = false;
        if (StringUtil.notNullOrEmpty(parameterValue) && !"0".equals(parameterValue)) {
            value = true;
        }
        return value;
    }
    
    /**
     * Handles ApplicationEvent "RecordChanged".
     * 
     * @param recordChangedEvent the event to respond to.
     */
    private void onApplicationEventRecordChanged(final RecordChangedEvent recordChangedEvent) {
        // if table name is "rm"
        if (Constants.RM.equalsIgnoreCase(recordChangedEvent.getTableName())) {
            // if activity parameter UseWorkspaceTransactions is “yes”
            final boolean useRoomTransactions =
                    this.loadActivityParameterUseWorkspaceTransactions();
            if (useRoomTransactions) {
                // record Room transaction
                final Room room =
                        this.roomDao.convertRecordToObject(recordChangedEvent.getRecord());
                final Date dateTime = new Date(recordChangedEvent.getTimestamp());
                
                this.roomTransactionService.recordTransaction(recordChangedEvent.getChangeType(),
                    recordChangedEvent.getUser(), room, dateTime,
                    recordChangedEvent.getBeforeOrAfter());
            }
        } else if (Constants.EM.equalsIgnoreCase(recordChangedEvent.getTableName())) {
            // if activity parameter UseWorkspaceTransactions is “yes”
            final boolean useRoomTransactions =
                    this.loadActivityParameterUseWorkspaceTransactions();
            if (useRoomTransactions) {
                // record Room transaction
                final Employee employee =
                        this.employeeDataSource.convertRecordToObject(recordChangedEvent
                            .getRecord());
                final Date dateTime = new Date(recordChangedEvent.getTimestamp());
                this.roomTransactionService.recordTransaction(recordChangedEvent.getChangeType(),
                    recordChangedEvent.getUser(), dateTime, employee,
                    recordChangedEvent.getBeforeOrAfter(), this.project);
            }
        }
    }
    
    /**
     * Handles ApplicationEvent "SqlExecuted".
     * 
     * @param sqlExecutedEvent the event to respond to.
     */
    private void onApplicationEventSqlExecuted(final SqlExecutedEvent sqlExecutedEvent) {
        // if table name is "rm"
        if (Constants.RM.equalsIgnoreCase(sqlExecutedEvent.getTableName())
                || Constants.EM.equalsIgnoreCase(sqlExecutedEvent.getTableName())) {
            // if activity parameter UseWorkspaceTransactions is “yes”
            final boolean useRoomTransactions =
                    this.loadActivityParameterUseWorkspaceTransactions();
            if (useRoomTransactions) {
                // below code don't work replace with sql update
                this.project.getActivityParameterManager().updateParameter(
                    SpaceConstants.SPACE_ACTIVITY, SpaceConstants.RESYNC_WORKSPACE_TRANSACTIONS,
                    "1", "");
                
            }
        }
    }
}
