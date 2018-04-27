package com.archibus.app.solution.logiccookbook;

import java.text.MessageFormat;
import java.util.Date;

import org.apache.log4j.Logger;

/**
 * Minimal event handler example.
 * 
 * @author Valery Tydykov
 */
/**
 * Suppress PMD warning "SystemPrintln" in this class.
 * <p>
 * Justification: This is a simplified example. Don't do this in production code.
 */
@SuppressWarnings("PMD.SystemPrintln")
public class HelloWorld {
    
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * Returns a message containing current date and time to the view.
     * 
     * @return Message to the calling view.
     */
    public String sayHello() {
        // get current date and time
        final Date now = new Date();
        
        // format the message
        final String message = MessageFormat.format("Hello World -- Invoked at: {0}", now);
        
        // Don't do this in real application!
        System.out.println(message);
        
        // This is the right way to output debug messages.
        // To enable debug-level logging in this class: in afm-logging.xml, set priority
        // to 'debug' for com.archibus.eventhandler.cookbook.HelloWorld category.
        if (this.logger.isDebugEnabled()) {
            this.logger.debug(message);
        }
        
        // return the message to the calling view
        return message;
    }
}