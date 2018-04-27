package com.archibus.app.sysadmin.updatewizard.schema.job;

import java.io.*;
import java.util.List;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.schema.output.ExecuteCommand;
import com.archibus.app.sysadmin.updatewizard.schema.sqlfile.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

/**
 * Recreate structures job.
 * 
 * @author Catalin Purice
 * 
 */
public class RecreateStructuresJob extends JobBase {
    
    /**
     * database type.
     */
    private transient String dbType = "sybase";
    
    /**
     * Constructor.
     */
    public RecreateStructuresJob() {
        super();
        if (SqlUtils.isOracle()) {
            this.dbType = "oracle";
        } else if (SqlUtils.isSqlServer()) {
            this.dbType = "mssql";
        }
    }
    
    @Override
    public void run() {
        final String rootPath =
                ContextStore.get().getWebAppPath().toString() + File.separator + "schema";
        final SqlFileSearch fileSearch = new SqlFileSearch(this.dbType);
        final File dir = new File(rootPath);
        final List<File> sqlFiles = fileSearch.search(dir).getFindedFiles();
        final ExecuteCommand executeSqlFile = new ExecuteCommand();
        
        this.status.setTotalNumber(sqlFiles.size());
        int count = 0;
        
        try {
            for (final File sqlFile : sqlFiles) {
                if (!this.stopRequested) {
                    final SqlFileLoader sqlFromFile = new SqlFileLoader(sqlFile);
                    final List<String> sqlCommands = sqlFromFile.getSqlCommands();
                    String partialStatus = sqlFromFile.getPartialStatus();
                    if (partialStatus.length() == 0) {
                        partialStatus = sqlFromFile.getFile().getName();
                    }
                    this.status.addPartialResult(new JobResult("Executing " + partialStatus));
                    for (final String sqlCommand : sqlCommands) {
                        executeSqlFile.runCommand(sqlCommand, DataSource.DB_ROLE_DATA);
                    }
                    this.status.updateLastPartialResult(new JobResult(partialStatus + " updated."));
                    this.status.setCurrentNumber(++count);
                }
            }
        } catch (final IOException ioE) {
            this.status.setCode(JobStatus.JOB_FAILED);
            try {
                throw ioE;
            } catch (final IOException e) {
                Logger.getLogger(this.getClass()).error(ioE.getMessage());
            }
        }
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
