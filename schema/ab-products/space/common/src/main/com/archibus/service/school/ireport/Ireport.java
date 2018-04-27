package com.archibus.service.school.ireport;

import java.util.*;

import org.apache.log4j.Logger;
import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.utility.ExceptionBase;
import com.sun.org.apache.xerces.internal.impl.xpath.regex.ParseException;

public class Ireport extends EventHandlerBase {
    private final Logger log = Logger.getLogger(this.getClass());
    
    public void PmreReport(final String filename, final String fileType, final JSONObject json)
            throws ExceptionBase, ParseException {
        final HashMap map = getMap4Json(json);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final ReportGenerator generator = new ReportGenerator(filename, fileType, map);
        this.startJob(context, generator);
    }
    
    private void startJob(final EventHandlerContext context, final Job job) {
        final JobManager.ThreadSafe jobManager = getJobManager(context);
        final String jobId = jobManager.startJob(job);
        // add the status to the response
        final JSONObject result = new JSONObject();
        result.put("jobId", jobId);
        
        // get the job status from the job id
        final JobStatus status = jobManager.getJobStatus(jobId);
        result.put("jobStatus", status.toString());
        
        context.addResponseParameter("jsonExpression", result.toString());
    }
    
    /**
     * Returns a message containing current date and time to the view.
     */
    public HashMap getMapFromJson(final JSONObject json) throws Exception {
        final HashMap map = null;
        
        try {
            for (final Iterator iter = json.keys(); iter.hasNext();) {
                final String key = (String) iter.next();
                map.put(key, json.get(key));
            }
        } catch (final Exception e) {
            this.log.info("Exception is: " + e.getMessage());
            throw new Exception(e.toString());
        }
        return map;
    }
    
    public HashMap getMap4Json(final JSONObject json) {
        // JSONObject jsonObject = new JSONObject();
        
        final Iterator keyIter = json.keys();
        String key;
        Object value;
        final HashMap valueMap = new HashMap();
        
        while (keyIter.hasNext()) {
            key = (String) keyIter.next();
            System.out.println("key" + key);
            value = json.get(key);
            System.out.println("value" + value);
            if (!"".equals(value)) {
                valueMap.put(key, value);
            }
        }
        
        return valueMap;
    }
    
}
