package com.archibus.app.reservation.dao.datasource;

import java.util.*;

import com.archibus.app.reservation.dao.IVisitorDataSource;
import com.archibus.app.reservation.domain.Visitor;
import com.archibus.app.reservation.util.DataSourceUtils;
import com.archibus.datasource.*;

/**
 * Datasource for visitor.
 * 
 * @author Bart Vanderschoot
 * 
 */
public class VisitorDataSource extends ObjectDataSourceImpl<Visitor> implements IVisitorDataSource {
    
    /**
     * Default constructor.
     */
    public VisitorDataSource() {
        this("visitor", "visitors");
    }
    
    /**
     * Constructor using parameters.
     * 
     * @param beanName the bean name
     * @param tableName the table name
     */
    public VisitorDataSource(final String beanName, final String tableName) {
        super(beanName, tableName);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<Visitor> findAll() {
        return find(null);
    }
    
    /**
     * {@inheritDoc}
     */
    public final List<Visitor> getAllVisitors() {
        final DataSource dataSource = this.createCopy();
        return convertRecordsToObjects(dataSource.getRecords());
    }
    
    /**
     * Create fields to properties mapping. To be compatible with version 19.
     * 
     * @return mapping
     */
    @Override
    protected final Map<String, String> createFieldToPropertyMapping() {
        
        final Map<String, String> mapping = new HashMap<String, String>();
        // no table name
        mapping.put(this.tableName + ".visitor_id", "visitorId");
        mapping.put(this.tableName + ".email", "email");
        mapping.put(this.tableName + ".name_first", "firstName");
        mapping.put(this.tableName + ".name_last", "lastName");
        mapping.put(this.tableName + ".company", "company");
        mapping.put(this.tableName + ".date_start", "startDate");
        mapping.put(this.tableName + ".date_end", "endDate");
        mapping.put(this.tableName + ".bl_id", "blId");
        mapping.put(this.tableName + ".fl_id", "flId");
        mapping.put(this.tableName + ".rm_id", "rmId");
        mapping.put(this.tableName + ".comments", "comments");
        
        return mapping;
    }
    
    /**
     * for version 20.
     * 
     * @return array of arrays.
     */
    @Override
    protected final String[][] getFieldsToProperties() {
        return DataSourceUtils.getFieldsToProperties(createFieldToPropertyMapping());
    }
    
}
