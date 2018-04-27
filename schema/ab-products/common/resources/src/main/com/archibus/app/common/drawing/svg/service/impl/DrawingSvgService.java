package com.archibus.app.common.drawing.svg.service.impl;

import java.util.*;

import com.archibus.app.common.drawing.svg.service.IDrawingSvgService;
import com.archibus.app.common.drawing.svg.service.dao.*;
import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.service.common.svg.SvgReport;
import com.archibus.utility.*;

/**
 * <p>
 * Implementation of <code>IDrawingSvgService</code>.
 * <p>
 * This is a bean managed by Spring, configured in
 * /schema/ab-products/common/resources/appContext-services.xml.
 * <p>
 * Exposed to JavaScript clients through DWR, configured in /WEB-INF/dwr.xml.
 * 
 * 
 * @author shao
 * @since 21.1
 * 
 */
public class DrawingSvgService implements IDrawingSvgService {
    /**
     * DAO for Site.
     * <p>
     * Used to get Site by site_id.
     */
    private ISiteDao siteDao;
    
    /**
     * DAO for Drawing.
     * <p>
     * Used to get Drawing by space_hier_field_values.
     */
    private IDrawingDao drawingDao;
    
    /**
     * DAO for HighlightParameters.
     * <p>
     * Used to get HighlightParameters by plan_type.
     */
    private IHighlightParametersDao highlightParametersDao;
    
    /**
     * {@inheritDoc}
     */
    public String highlightSvgDrawing(final Map<String, String> pkeyValues,
            final String planTypeValue, final List<Map<String, String>> parameters)
            throws ExceptionBase {
        String svgXML = null;
        
        final String drawingName =
                ServiceUtilities.retrieveDrawingName(pkeyValues, this.getSiteDao(),
                    this.getDrawingDao());
        
        if (StringUtil.notNullOrEmpty(drawingName)) {
            final SvgReport svgReport =
                    new SvgReport(drawingName, ServiceUtilities.readSvgFile(drawingName));
            
            final HighlightParameters highlightParameters =
                    retrieveHighlightParameters(planTypeValue, parameters);
            
            svgReport.processAsset(highlightParameters.getViewName(),
                highlightParameters.getHighlightDatasourceId(),
                highlightParameters.getLabelDataSourceId(), highlightParameters.getAssetType(),
                highlightParameters.getLabelHeight(), highlightParameters.getLabelColorName());
            
            // process secondary asset
            if (highlightParameters.hasSecondaryAssetHighlight()) {
                svgReport.processAsset(highlightParameters.getSecondaryViewName(),
                    highlightParameters.getSecondaryHighlightDatasourceId(),
                    highlightParameters.getSecondaryLabelDataSourceId(),
                    highlightParameters.getSecondaryAssetType(),
                    highlightParameters.getSecondaryLabelHeight(),
                    highlightParameters.getSecondaryLabelColorName());
            }
            
            svgXML = svgReport.getSvgDocument().asXML();
        }
        
        // return processed svg xml
        return svgXML;
    }
    
    /**
     * 
     * Retrieves HighlightParameters from database or specified parameters.
     * 
     * @param planType plan type value.
     * @param parameters List<Map<String, String>> highlight parameters.
     * @return HighlightParameters.
     */
    private HighlightParameters retrieveHighlightParameters(final String planType,
            final List<Map<String, String>> parameters) {
        HighlightParameters highlightParameters;
        if (StringUtil.notNullOrEmpty(planType) && !("null".equals(planType))) {
            highlightParameters = this.getHighlightParametersDao().getByPlanType(planType);
        } else {
            highlightParameters = ServiceUtilities.extractHighlightParameters(parameters);
        }
        
        return highlightParameters;
    }
    
    /**
     * Getter for the siteDao property.
     * 
     * @see siteDao
     * @return the siteDao property.
     */
    public ISiteDao getSiteDao() {
        return this.siteDao;
    }
    
    /**
     * Setter for the siteDao property.
     * 
     * @see siteDao
     * @param siteDao the siteDao to set
     */
    
    public void setSiteDao(final ISiteDao siteDao) {
        this.siteDao = siteDao;
    }
    
    /**
     * Getter for the drawingDao property.
     * 
     * @see drawingDao
     * @return the drawingDao property.
     */
    public IDrawingDao getDrawingDao() {
        return this.drawingDao;
    }
    
    /**
     * Setter for the drawingDao property.
     * 
     * @see drawingDao
     * @param drawingDao the drawingDao to set
     */
    
    public void setDrawingDao(final IDrawingDao drawingDao) {
        this.drawingDao = drawingDao;
    }
    
    /**
     * Getter for the highlightParametersDao property.
     * 
     * @see highlightParametersDao
     * @return the highlightParametersDao property.
     */
    public IHighlightParametersDao getHighlightParametersDao() {
        return this.highlightParametersDao;
    }
    
    /**
     * Setter for the highlightParametersDao property.
     * 
     * @see highlightParametersDao
     * @param highlightParametersDao the highlightParametersDao to set
     */
    
    public void setHighlightParametersDao(final IHighlightParametersDao highlightParametersDao) {
        this.highlightParametersDao = highlightParametersDao;
    }
    
}
