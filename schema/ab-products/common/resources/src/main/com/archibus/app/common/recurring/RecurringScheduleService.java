package com.archibus.app.common.recurring;

import java.io.StringReader;
import java.util.*;

import org.dom4j.*;
import org.dom4j.io.SAXReader;

import com.archibus.utility.*;

/**
 * RecurringService. Provides to workflow rules that related to recurring schedule rule.
 * 
 * @author Guo Jiangtao
 * @since 20.1
 */
public class RecurringScheduleService {
    
    /**
     * Recurring Pattern interval.
     */
    private RecurringSchedulePattern rule;
    
    /**
     * Get date list from recurring rule.
     * 
     * @param start start date
     * @param end end date
     * @param ruleStr xml format recurring rule
     * 
     * @return date list
     */
    public List<Date> getDatesList(final Date start, final Date end, final String ruleStr) {
        
        this.rule = new RecurringSchedulePattern(start, end);
        
        // parse xml rule to get configuration values of the recurring rule
        this.parseXmlRule(ruleStr);
        
        // calculate date end of recurring rule
        RecurringScheduleHelper.calculateDateEnd(this.rule);
        
        // get the date list base on the recurring type
        this.rule.calculateDatesList();
        
        // return all matching dates
        return this.rule.getDatesList();
    }
    
    /**
     * parse xml rule to get values of the recurring rule pattern.
     * 
     * @param recurringRule recurring rule
     */
    private void parseXmlRule(final String recurringRule) {
        // parse the xml format recurring rule to xml document and element
        Document recordXmlDoc;
        
        try {
            
            recordXmlDoc = new SAXReader().read(new StringReader(recurringRule));
            final Element rootElement = recordXmlDoc.getRootElement();
            
            // get attributes from the xml document
            this.rule.setRecurringType(rootElement.attributeValue("type"));
            this.rule.setValue1(rootElement.attributeValue("value1"));
            this.rule.setValue2(rootElement.attributeValue("value2"));
            this.rule.setValue3(rootElement.attributeValue("value3"));
            
            final String totalValue = rootElement.attributeValue("total");
            if (StringUtil.notNullOrEmpty(totalValue)) {
                this.rule.setTotal(Integer.parseInt(totalValue));
            }
            
        } catch (final DocumentException e) {
            throw new ExceptionBase(null, e.getMessage(), e);
        }
    }
    
}
