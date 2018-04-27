package com.archibus.app.sysadmin.updatewizard.project.job;

import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.*;
import com.archibus.app.sysadmin.updatewizard.project.transfer.mergeschema.UpdateArchibusSchema.ACTIONTYPE;
import com.archibus.jobmanager.*;

/**
 * This job updates data dictionary from merge data dictionary tab.
 * 
 * @author Catalin Purice
 * 
 */
public class UpdateArchibusSchemaJob extends JobBase {
    
    /**
     * action type: Recommended or Chosen.
     */
    private final ACTIONTYPE action;
    
    /**
     * 
     * @param chosenAction action
     */
    public UpdateArchibusSchemaJob(final ACTIONTYPE chosenAction) {
        super();
        this.action = chosenAction;
    }
    
    @Override
    public void run() {
        new UpdateArchibusSchema(this.action).update(this.status);
        this.status.setCode(JobStatus.JOB_COMPLETE);
    }
}
