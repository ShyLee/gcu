package com.archibus.app.sysadmin.updatewizard.schema.output;

import java.io.*;
import java.text.MessageFormat;
import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.project.util.ProjectUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.datasource.DataSource;
import com.archibus.utility.ExceptionBase;

/**
 * Log the commands into update.sql file.
 * 
 * @author Catalin Purice
 * 
 */
public class LogCommand implements SqlCommandOutput {
    
    /**
     * Constant.
     */
    private static final char END_OF_DML = ';';
    
    /**
     * Constant.
     */
    private static final String FILENAME = "update.sql";
    
    /**
     * Constant.
     */
    private static final String NEW_LINE = "\r\n";
    
    /**
     * Constant.
     */
    private static final String SECURITY_TEXT = "--***RUN UNDER SECURITY ROLE***";
    
    /**
     * Constant.
     */
    private static final String LOG_PREFIX = "Schema Update Wizard - [{0}]";
    
    /**
     * Constant.
     */
    private final Logger logger = Logger.getLogger(LogCommand.class);
    
    /**
     * Constant.
     */
    private transient FileWriter fileWriter;
    
    /**
     * Constructor.
     */
    public LogCommand() {
        final String filePath = getLogFolder() + File.separatorChar + FILENAME;
        
        final File logFile = new File(filePath);
        try {
            if (!logFile.exists() && !logFile.createNewFile()) {
                throw new IOException();
            }
            // this.fop = new FileOutputStream(this.logFile);
            this.fileWriter = new FileWriter(logFile);
        } catch (final IOException e) {
            this.logger.error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * Close the file.
     */
    public void close() {
        try {
            this.fileWriter.close();
        } catch (final IOException e) {
            this.logger.error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * @param sqlCommand sql command to be logged.
     * @param role db role
     */
    public void runCommand(final String sqlCommand, final String role) {
        // writes command to logFile
        
        if (sqlCommand.length() > 0) {
            try {
                if (role.equals(DataSource.DB_ROLE_SECURITY)) {
                    this.fileWriter.write(SECURITY_TEXT);
                    this.fileWriter.write(NEW_LINE);
                }
                this.fileWriter.write(sqlCommand + END_OF_DML);
                this.fileWriter.write(NEW_LINE);
                this.fileWriter.flush();
            } catch (final IOException e) {
                this.logger
                    .error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
                throw new ExceptionBase(null, e.getMessage(), e);
            }
        }
    }
    
    /**
     * 
     * @param sqlCommands sql Command
     */
    public void runCommandNoParams(final List<String> sqlCommands) {
        for (final String sqlCommand : sqlCommands) {
            runCommand(sqlCommand, DataSource.DB_ROLE_SCHEMA);
        }
    }
    
    /**
     * @param sqlCommands sql commands to be logged.
     */
    public void runCommands(final List<String> sqlCommands) {
        try {
            for (final String command : sqlCommands) {
                if (command.length() > 0) {
                    this.fileWriter.write(command + END_OF_DML);
                    this.fileWriter.write(NEW_LINE);
                }
            }
            this.fileWriter.flush();
        } catch (final IOException e) {
            this.logger.error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
    /**
     * Gets the log folder.
     * 
     * @return log folder
     */
    private String getLogFolder() {
        final String archibusPath = ContextStore.get().getWebAppPath();
        final String userName = ContextStore.get().getUser().getName().toLowerCase();
        final String logFolder =
                archibusPath + File.separator + "projects" + File.separator + "users"
                        + File.separator + userName + File.separator
                        + ProjectUpdateWizardConstants.PUW_FOLDER;
        final File logFile = new File(logFolder);
        if (!logFile.exists()) {
            try {
                logFile.mkdirs();
            } catch (final SecurityException e) {
                this.logger
                    .error(MessageFormat.format(LOG_PREFIX, new Object[] { e.getMessage() }));
                throw new ExceptionBase(null, e.getMessage(), e);
            }
        }
        return logFolder;
    }
    
    /**
     * @return true
     */
    public boolean isLog() {
        return true;
    }
    
    /**
     * Setter for the throwException property.
     * @param throwException the throwException to set
     */
    
    public void setThrowException(final boolean throwException) {
    /**
     * This setter is used by the ExecuteCommand class only. 
     * Because this class implements an interface we need this method here too.
     */
    }

    /**
     * {@inheritDoc}
     */
    public void runCommandsNoException(final List<String> sqlCommands) {
        runCommands(sqlCommands);
    }
}
