package com.archibus.app.sysadmin.updatewizard.app.job;

import java.io.IOException;
import java.text.MessageFormat;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.app.packager.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Package Data job.
 * 
 * @author Catalin Purice
 * 
 */
public class PackageData extends JobBase {
    
    /**
     * Packager.
     */
    private final Packager appPackage = new Packager(0, this.status);
    
    @Override
    public void run() {
        int count = 0;
        try {
            this.status.setMessage(JobMessage.PACKAGE_DATA_MESSAGE);
            count = PackagerUtilities.getNoOfDataFilesToZip();
            this.status.setTotalNumber(count);
            this.appPackage.writeAppDataZip();
        } catch (final IOException e) {
            // @non-translatable
            this.status.setMessage(e.getMessage());
            this.status.setCode(JobStatus.JOB_TERMINATED);
            Logger.getLogger(this.getClass()).error(
                MessageFormat.format("Package and Deploy Wizard - Package Data: [{0}]",
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
        this.status.setCurrentNumber(count);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
