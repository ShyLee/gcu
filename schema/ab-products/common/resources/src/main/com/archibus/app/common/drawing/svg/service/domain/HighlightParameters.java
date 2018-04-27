package com.archibus.app.common.drawing.svg.service.domain;

import com.archibus.utility.StringUtil;

/**
 * Domain class for highlight parameters.
 * <p>
 * Mapped to active_plantypes table.
 * 
 * <p>
 * Designed to have prototype scope.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public class HighlightParameters extends LabelParameters {
    /**
     * the name of the axvw view.
     * <p>
     * In view, highlight and label dataSources are defined.
     */
    private String viewName;
    
    /**
     * the name of axvw view for secondary asset highlight.
     */
    private String secondaryViewName;
    
    /**
     * the id of highlight DataSource.
     */
    private String highlightDatasourceId;
    
    /**
     * the id of secondary asset highlight DataSource.
     */
    private String secondaryHighlightDatasourceId;
    
    /**
     * the type of the highlight asset.
     */
    private String assetType;
    
    /**
     * the type of the secondary highlight asset.
     */
    private String secondaryAssetType;
    
    /**
     * Getter for the highlightDatasourceId property.
     * 
     * @see highlightDatasourceId
     * @return the highlightDatasourceId property.
     */
    public String getHighlightDatasourceId() {
        return this.highlightDatasourceId;
    }
    
    /**
     * Setter for the highlightDatasourceId property.
     * 
     * @see datasourceId
     * @param datasourceId the highlightDatasourceId to set
     */
    
    public void setHighlightDatasourceId(final String datasourceId) {
        this.highlightDatasourceId = datasourceId;
    }
    
    /**
     * Getter for the assetType property.
     * 
     * @see assetType
     * @return the assetType property.
     */
    public String getAssetType() {
        return this.assetType;
    }
    
    /**
     * Setter for the assetType property.
     * 
     * @see assetType
     * @param assetType the assetType to set
     */
    public void setAssetType(final String assetType) {
        this.assetType = assetType;
    }
    
    /**
     * Getter for the viewName property.
     * 
     * @see viewName
     * @return the viewName property.
     */
    public String getViewName() {
        return this.viewName;
    }
    
    /**
     * Setter for the viewName property.
     * 
     * @see viewName
     * @param viewName the viewName to set
     */
    public void setViewName(final String viewName) {
        this.viewName = viewName;
    }
    
    /**
     * Getter for the secondaryViewName property.
     * 
     * @see secondaryViewName
     * @return the secondaryViewName property.
     */
    public String getSecondaryViewName() {
        return this.secondaryViewName;
    }
    
    /**
     * Setter for the secondaryViewName property.
     * 
     * @see secondaryViewName
     * @param secondaryViewName the secondaryViewName to set
     */
    
    public void setSecondaryViewName(final String secondaryViewName) {
        this.secondaryViewName = secondaryViewName;
    }
    
    /**
     * Getter for the secondaryHighlightDatasourceId property.
     * 
     * @see secondaryHighlightDatasourceId
     * @return the secondaryHighlightDatasourceId property.
     */
    public String getSecondaryHighlightDatasourceId() {
        return this.secondaryHighlightDatasourceId;
    }
    
    /**
     * Setter for the secondaryHighlightDatasourceId property.
     * 
     * @see secondaryHighlightDatasourceId
     * @param secondaryHighlightDatasourceId the secondaryHighlightDatasourceId to set
     */
    
    public void setSecondaryHighlightDatasourceId(final String secondaryHighlightDatasourceId) {
        this.secondaryHighlightDatasourceId = secondaryHighlightDatasourceId;
    }
    
    /**
     * Getter for the secondaryAssetType property.
     * 
     * @see secondaryAssetType
     * @return the secondaryAssetType property.
     */
    public String getSecondaryAssetType() {
        return this.secondaryAssetType;
    }
    
    /**
     * Setter for the secondaryAssetType property.
     * 
     * @see secondaryAssetType
     * @param secondaryAssetType the secondaryAssetType to set
     */
    
    public void setSecondaryAssetType(final String secondaryAssetType) {
        this.secondaryAssetType = secondaryAssetType;
    }
    
    /**
     * 
     * Checks if there is secondary asset highlight.
     * 
     * @return boolean
     */
    public boolean hasSecondaryAssetHighlight() {
        return StringUtil.notNullOrEmpty(this.secondaryViewName)
                && StringUtil.notNullOrEmpty(this.secondaryHighlightDatasourceId);
    }
    
}
