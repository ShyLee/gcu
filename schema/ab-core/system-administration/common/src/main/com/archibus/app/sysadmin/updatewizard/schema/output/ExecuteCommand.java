package com.archibus.app.sysadmin.updatewizard.schema.output;

import java.text.MessageFormat;
import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.util.SchemaUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

/**
 * Executes commands directly on database.
 * 
 * @author Catalin Purice
 * 
 */
public class ExecuteCommand extends EventHandlerBase implements SqlCommandOutput {
    
    /**
     * Constant.
     */
    private static final String LOG_PREFIX = "Schema Update Wizard - : [{0}]";
    
    /**
     * context.
     */
    private final transient EventHandlerContext context;
    
    /**
     * Whether or not we a throwing an exception in case SQL command fails.
     */
    private boolean throwException;
    
    /**
     * Constructor.
     */
    public ExecuteCommand() {
        super();
        this.context = ContextStore.get().getEventHandlerContext();
    }
    
    /**
     * commit changes.
     */
    public void close() {
        SqlUtils.commit();
    }
    
    /**
     * @return false
     */
    public boolean isLog() {
        return false;
    }
    
    /**
     * run sql command.
     * 
     * @param sqlCommand sql command
     * @param role db role
     */
    public void runCommand(final String sqlCommand, final String role) {
        if (sqlCommand.length() > 0) {
            if (role.equals(DataSource.DB_ROLE_SECURITY)) {
                final DataSource dsForAfmSecure =
                        DataSourceFactory.createDataSource()
                            .addTable(SchemaUpdateWizardConstants.AFM_TBLS).addQuery(sqlCommand);
                dsForAfmSecure.setDatabaseRole(role);
                dsForAfmSecure.setContext();
                dsForAfmSecure.executeUpdate();
            } else {
                try {
                    executeDbSql(this.context, sqlCommand, false);
                    SqlUtils.commit();
                } catch (final ExceptionBase sqlException) {
                    handleSqlException(sqlException);
                }
            }
        }
    }
    
    /**
     * run sql commands with no parameters. Use to create Oracle triggers
     * 
     * @param sqlCommands sql commands
     */
    public void runCommandNoParams(final List<String> sqlCommands) {
        for (final String sqlCommand : sqlCommands) {
            try {
                EventHandlerBase.executeDbSqlNoParameters(ContextStore.get()
                    .getEventHandlerContext(), sqlCommand, false);
            } catch (final ExceptionBase sqlException) {
                handleSqlException(sqlException);
            }
        }
    }
    
    /**
     * run sql commands.
     * 
     * @param sqlCommands sql commands
     *            <p>
     *            Suppress PMD warning "UseArrayListInsteadOfVector" in this method.
     *            <p>
     *            Justification: <executeDbSqlCommands> third party requires Vector type.
     */
    @SuppressWarnings("PMD.UseArrayListInsteadOfVector")
    public void runCommands(final List<String> sqlCommands) {
        // execute more that one command
        try {
            executeDbSqlCommands(this.context, new Vector<String>(sqlCommands), false);
            SqlUtils.commit();
        } catch (final ExceptionBase sqlException) {
            handleSqlException(sqlException);
        }
    }
    
    /**
     * 
     * Ignores errors if the a SQL command fails from the list. The execution continues with the
     * rest of the commands.
     * 
     * @param sqlCommands list of SQL commands
     */
    public void runCommandsNoException(final List<String> sqlCommands) {
        for (final String sqlCommand : sqlCommands) {
            runCommand(sqlCommand, DataSource.ROLE_STANDARD);
        }
    }
    
    /**
     * Setter for the throwException property.
     * 
     * @see throwException
     * @param throwException the throwException to set
     */
    
    public void setThrowException(final boolean throwException) {
        this.throwException = throwException;
    }
    
    /**
     * 
     * Handles SQL exception.
     * 
     * @param sqlException exception
     */
    private void handleSqlException(final ExceptionBase sqlException) {
        final String errorMessage =
                MessageFormat.format(LOG_PREFIX, sqlException.toStringForLogging());
        this.log.error(errorMessage);
        if (this.throwException) {
            throw sqlException;
        }
    }
}
