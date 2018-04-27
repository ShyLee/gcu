package com.archibus.service.common.svg;

import java.io.InputStream;
import java.util.*;

import org.apache.log4j.Logger;
import org.dom4j.Element;

import com.archibus.datasource.DataSourceFactory;
import com.archibus.ext.drawing.highlight.*;
import com.archibus.model.view.report.ReportPropertiesDef;
import com.archibus.utility.*;

/**
 * 
 * Provides methods for processing html5-based drawing svg document.
 * <p>
 * Loads requested enterprise-graphics svg file.
 * <p>
 * Processes svg document with specified highlight and label datatSources.
 * <p>
 * Invoked by other WFR.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public class SvgReport {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * drawing name like HQ18.
     */
    private final String drawingName;
    
    /**
     * svgDocument svg document object.
     */
    private final org.dom4j.Document svgDocument;
    
    /**
     * Constant: asset to highlight.
     */
    private String assetToHighlight = "rm";
    
    /**
     * 
     * Default constructor: initialize svg Document by its inputStream object.
     * 
     * @param svgFile svg inputStream object.
     * @param drawingName the drawing name.
     */
    public SvgReport(final String drawingName, final InputStream svgFile) {
        this.svgDocument = ReportUtilities.loadSvg(svgFile);
        this.drawingName = drawingName;
    }
    
    /**
     * 
     * Processes asset's highlighting and labeling.
     * 
     * @param viewName - the name of axvw view in which highlight and label dataSources are defined.
     * @param highlightDatasourceId - highlight DataSource Id.
     * @param labelDataSourceId - label DataSource Id.
     * @param assetType - the type of the asset to be highlighted.
     * @param labelHeight - label height.
     * @param labelColorName - label color name.
     * 
     * @throws ExceptionBase if SvgReport.processAssets() throws an exception.
     */
    public void processAsset(final String viewName, final String highlightDatasourceId,
            final String labelDataSourceId, final String assetType, final double labelHeight,
            final String labelColorName) throws ExceptionBase {
        if (this.logger.isInfoEnabled()) {
            this.logger.info(String.format(
                "SvgHighlight: drawingName=[%s], view_file=[%s], hl_ds=[%s], label_ds=[%s]",
                this.drawingName, viewName, highlightDatasourceId, labelDataSourceId));
        }
        
        final com.archibus.datasource.DataSource highlightDataSource =
                DataSourceFactory.loadDataSourceFromFile(viewName, highlightDatasourceId);
        
        com.archibus.datasource.DataSource labelDataSource = null;
        if (StringUtil.notNullOrEmpty(labelDataSourceId)) {
            labelDataSource = DataSourceFactory.loadDataSourceFromFile(viewName, labelDataSourceId);
        }
        
        processAsset(highlightDataSource, labelDataSource, assetType, labelHeight, labelColorName);
        
    }
    
    /**
     * Processes svg drawing by highlighting and labeling the asset.
     * 
     * 
     * @param highlightDataSource - highlight DataSource object.
     * @param labelDataSource - label DataSource object.
     * @param assetToHighlighted - asset to be highlighted.
     * @param labelHeight - label height display.
     * @param labelColor - label color to display.
     * 
     * @throws ExceptionBase if highlighting svg throws an exception.
     */
    public void processAsset(final com.archibus.datasource.DataSource highlightDataSource,
            final com.archibus.datasource.DataSource labelDataSource,
            final String assetToHighlighted, final double labelHeight, final String labelColor)
            throws ExceptionBase {
        if (StringUtil.isNullOrEmpty(assetToHighlighted) && highlightDataSource != null) {
            this.setAssetToHighlight(highlightDataSource.getMainTableName());
        } else {
            this.setAssetToHighlight(assetToHighlighted);
        }
        
        final DrawingHighlightProperties drawingHighlightProperties =
                getDrawingHighlightProperties(highlightDataSource, labelDataSource);
        
        {
            final Element assetsElement =
                    (Element) this.svgDocument.selectSingleNode(String.format(
                        Constants.ASSETS_ELEMENT_XPATH, this.assetToHighlight));
            
            final Map<String, String> colors = drawingHighlightProperties.getColors();
            
            highlightAssets(assetsElement, colors);
        }
        
        {
            final Element labelsElement =
                    (Element) this.svgDocument.selectSingleNode(Constants.LABELS_ELEMENT_XPATH);
            
            final Map<String, List<String>> labels = drawingHighlightProperties.getLabels();
            
            LabelUtilities.processLabeling(labelsElement, this.assetToHighlight, labels,
                labelHeight, labelColor);
        }
    }
    
    /**
     * 
     * Gets highlighted assets properties.
     * 
     * @param highlightDataSource - highlight DataSource object.
     * @param labelDataSource - label DataSource object.
     * @return DrawingHighlightProperties - highlighted assets properties.
     */
    private DrawingHighlightProperties getDrawingHighlightProperties(
            final com.archibus.datasource.DataSource highlightDataSource,
            final com.archibus.datasource.DataSource labelDataSource) {
        final ReportPropertiesDef reportPropertiesDef = ReportUtilities.getReportPropertiesDef();
        reportPropertiesDef.setAssetTables(this.getAssetToHighlight());
        
        final HighlightImageService highlightImageService =
                new HighlightImageService(reportPropertiesDef);
        
        return highlightImageService.retrieveDrawingHighlightProperties(this.drawingName,
            highlightDataSource, labelDataSource, true);
    }
    
    /**
     * 
     * Highlights assets with colors.
     * 
     * @param assetsElement svg element to present assets.
     * @param colors Map<String, String> - colors from highlight dataSource.
     * 
     */
    private void highlightAssets(final Element assetsElement, final Map<String, String> colors) {
        if (assetsElement == null || colors.isEmpty()) {
            return;
        }
        
        final List<Element> assets = assetsElement.elements();
        
        for (final Element asset : assets) {
            final String assetId = asset.attributeValue(Constants.ELEMENT_ID);
            final String color = colors.get(assetId);
            
            if (color != null) {
                asset.addAttribute(Constants.STYLE, Constants.STYLE_FILL + ':' + color);
            }
            
            final Boolean highlighted = color != null;
            asset.addAttribute(Constants.HIGHLIGHTED_ASSET, highlighted.toString());
        }
    }
    
    /**
     * Getter for assetToHighlight.
     * 
     * @see assetToHighlight
     * @return property.assetToHighlight
     */
    public String getAssetToHighlight() {
        return this.assetToHighlight;
    }
    
    /**
     * Setter for assetToHighlight.
     * 
     * @see assetToHighlight
     * @param assetToHighlight - String value like "bl"
     */
    public void setAssetToHighlight(final String assetToHighlight) {
        this.assetToHighlight = assetToHighlight;
    }
    
    /**
     * 
     * Gets svg Document.
     * 
     * @return svg org.dom4j.Document.
     */
    public org.dom4j.Document getSvgDocument() {
        return this.svgDocument;
    }
    
}
