package com.archibus.app.reservation.dao;

import java.util.List;

import com.archibus.app.reservation.domain.Visitor;
import com.archibus.core.dao.IDao;

/**
 * The Interface IVisitorDataSource.
 */
public interface IVisitorDataSource extends IDao<Visitor> {
    /**
     * Find all visitors.
     * 
     * @return list of visitors
     */
    List<Visitor> findAll();
    
    /**
     * Gets the all visitors.
     * 
     * @return the all visitors
     */
    List<Visitor> getAllVisitors();
    
}
