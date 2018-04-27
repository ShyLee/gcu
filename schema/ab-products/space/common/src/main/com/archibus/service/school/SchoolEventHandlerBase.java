package com.archibus.service.school;

import java.util.Map;

import com.archibus.eventhandler.EventHandlerBase;

public class SchoolEventHandlerBase extends EventHandlerBase {
    
    protected static String getString(Map record, String name) {
        String s = (String) record.get(name);
        if (s == null) {
            s = "";
        }
        return s;
    }
    
}
