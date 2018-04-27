package com.archibus.app.common.drawing.svg.service.impl;

import java.io.*;
import java.net.URL;
import java.util.*;

import com.archibus.app.common.drawing.svg.service.dao.*;
import com.archibus.app.common.drawing.svg.service.domain.*;
import com.archibus.utility.*;

/**
 * 
 * Utilities for class DrawingSvgService.
 * <p>
 * Provides methods to retrieve drawing name, read svg file inputStream and extract
 * HighlightParameters.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public final class ServiceUtilities {
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private ServiceUtilities() {
    }
    
    /**
     * 
     * Retrieves drawing name by primary key values.
     * 
     * @param pkeyValues Map<String, String> like {bl_id:HQ, fl_id:18} to get corresponding drawing
     *            name;
     * 
     * @param siteDao Site Dao.
     * @param drawingDao Drawing Dao.
     * @return String found drawing name.
     */
    public static String retrieveDrawingName(final Map<String, String> pkeyValues,
            final ISiteDao siteDao, final IDrawingDao drawingDao) {
        String drawName = null;
        
        if (pkeyValues.get(Constants.SITE_ID) == null) {
            // XXX: from afm_dwgs table for building floor plan drawing
            final Drawing drawing =
                    drawingDao.getBySpaceHierarchyValues(pkeyValues.get(Constants.BUILDING_ID)
                        .toString() + ';' + pkeyValues.get(Constants.FLOOR_ID).toString());
            if (drawing != null) {
                drawName = drawing.getDrawingName();
            }
        } else {
            // XXX: from site table for site drawing???
            drawName =
                    siteDao.getBySiteId(pkeyValues.get(Constants.SITE_ID).toString())
                        .getDetailDrawingName();
        }
        
        return drawName;
    }
    
    /**
     * 
     * Reads svg file by its drawing name.
     * 
     * @param drawingName String drawing name like hq18.
     * @return svg InputStream object.
     * 
     * @throws ExceptionBase if cannot get inputStream it throws ExceptionBase.
     */
    public static InputStream readSvgFile(final String drawingName) throws ExceptionBase {
        InputStream result = null;
        
        final String fileName =
                com.archibus.ext.drawing.highlight.HighLightUtilities.getDrawingSourcePath() + '/'
                        + drawingName.toLowerCase() + Constants.SVG_FILE_EXTENSION;
        
        try {
            final URL url = new URL(fileName);
            result = url.openStream();
        } catch (final IOException e) {
            throw new ExceptionBase(String.format(Constants.SVG_FILE_READ_EXCEPTION_MESSAGE,
                fileName), e);
        }
        return result;
    }
    
    /**
     * 
     * Extracts HighlightParameters from specified parameters.
     * 
     * @param parameters List<Map<String, String>> list of name-value paired parameters.
     * @return HighlightParameters.
     */
    public static HighlightParameters extractHighlightParameters(
            final List<Map<String, String>> parameters) {
        final HighlightParameters highlightParameters = new HighlightParameters();
        
        highlightParameters.setViewName(parameters.get(0).get(Constants.PARAMETER_VIEW_NAME));
        
        highlightParameters.setHighlightDatasourceId(parameters.get(0).get(
            Constants.PARAMETER_HIGHLIGHT_DATASOURCE_ID));
        
        highlightParameters.setLabelDataSourceId(parameters.get(0).get(
            Constants.PARAMETER_LABEL_DATASOURCE_ID));
        
        highlightParameters.setAssetType(parameters.get(0).get(Constants.ASSET_TYPE));
        
        if (parameters.get(0).get(Constants.PARAMETER_LABEL_HEIGHT) != null) {
            highlightParameters.setLabelHeight(Double.valueOf(StringUtil.notNull(parameters.get(0)
                .get(Constants.PARAMETER_LABEL_HEIGHT))));
        }
        
        highlightParameters.setLabelColorName(parameters.get(0).get(
            Constants.PARAMETER_LABEL_COLOR_NAME));
        
        // secondary asset highlight
        if (parameters.size() == 2) {
            highlightParameters.setSecondaryViewName(parameters.get(1).get(
                Constants.PARAMETER_VIEW_NAME));
            
            highlightParameters.setSecondaryHighlightDatasourceId(parameters.get(1).get(
                Constants.PARAMETER_HIGHLIGHT_DATASOURCE_ID));
            
            highlightParameters.setSecondaryLabelDataSourceId(parameters.get(1).get(
                Constants.PARAMETER_LABEL_DATASOURCE_ID));
            
            highlightParameters.setSecondaryAssetType(parameters.get(1).get(Constants.ASSET_TYPE));
            
            if (parameters.get(1).get(Constants.PARAMETER_LABEL_HEIGHT) != null) {
                highlightParameters.setSecondaryLabelHeight(Double.valueOf(StringUtil
                    .notNull(parameters.get(1).get(Constants.PARAMETER_LABEL_HEIGHT))));
            }
            
            highlightParameters.setSecondaryLabelColorName(parameters.get(1).get(
                Constants.PARAMETER_LABEL_COLOR_NAME));
        }
        
        return highlightParameters;
    }
}
