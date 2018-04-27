package com.archibus.app.common.drawing.svg.service.dao;

import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.utility.ExceptionBase;

/**
 * DAO for HighlightParameters.
 * 
 * @author shao
 * @since 21.1
 * 
 */

public interface IHighlightParametersDao {
    /**
     * 
     * Gets HighlightParameters by a plan type.
     * 
     * @param planType plan type value.
     * @return HighlightParameters.
     * 
     * @throws ExceptionBase if DataSource throws an exception.
     */
    HighlightParameters getByPlanType(final String planType) throws ExceptionBase;
}
