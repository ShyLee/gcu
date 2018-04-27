package com.archibus.app.sysadmin.updatewizard.app.job;

import java.io.IOException;
import java.text.MessageFormat;

import org.apache.log4j.Logger;

import com.archibus.app.sysadmin.updatewizard.app.packager.*;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;

/**
 * Package Extensions job. o
 * 
 * @author Catalin Purice
 * 
 */
public class PackageExtensions extends JobBase {
    /**
     * Packager.
     */
    private final Packager appPackage = new Packager(0, this.status);
    
    @Override
    public void run() {
        this.status.setMessage(JobMessage.PACKAGE_EXTENSIONS_MESSAGE);
        int count = 0;
        this.status.setTotalNumber(count);
        try {
            count = PackagerUtilities.getNoOfExtensionsFilesToZip();
            this.appPackage.writeAppExtensionsZip();
        } catch (final IOException e) {
            
            this.status.setMessage(e.getMessage());
            this.status.setCode(JobStatus.JOB_TERMINATED);
            Logger.getLogger(this.getClass()).error(
                MessageFormat.format("Package and Deploy Wizard - Package Extensions: [{0}]",
                    new Object[] { e.getMessage() }));
            throw new ExceptionBase(null, e.getMessage(), e);
        }
        this.status.setCurrentNumber(count);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
