package com.archibus.app.common.drawing.svg.service.domain;

/**
 * 
 * Supper class for HighlightParameters domain to wrap label parameters.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public class LabelParameters {
    /**
     * the id of label DataSource.
     */
    private String labelDataSourceId;
    
    /**
     * the name of secondary asset-highlight label DataSource.
     */
    private String secondaryLabelDataSourceId;
    
    /**
     * the height of the label.
     */
    private double labelHeight;
    
    /**
     * secondary asset-highlight label height.
     */
    private double secondaryLabelHeight;
    
    /**
     * the color name of the label.
     */
    private String labelColorName;
    
    /**
     * secondary asset-highlight label color name.
     */
    private String secondaryLabelColorName;
    
    /**
     * Getter for the labelDataSourceId property.
     * 
     * @see labelDataSourceId
     * @return the labelDataSourceId property.
     */
    public String getLabelDataSourceId() {
        return this.labelDataSourceId;
    }
    
    /**
     * Setter for the labelDataSourceId property.
     * 
     * @see labelDataSourceId
     * @param labelDataSourceId the labelDataSourceId to set
     */
    
    public void setLabelDataSourceId(final String labelDataSourceId) {
        this.labelDataSourceId = labelDataSourceId;
    }
    
    /**
     * Getter for the labelHeight property.
     * 
     * @see labelHeight
     * @return the labelHeight property.
     */
    public double getLabelHeight() {
        return this.labelHeight;
    }
    
    /**
     * Setter for the labelHeight property.
     * 
     * @see labelHeight
     * @param labelHeight the labelHeight to set
     */
    
    public void setLabelHeight(final double labelHeight) {
        this.labelHeight = labelHeight;
    }
    
    /**
     * Getter for the labelColorName property.
     * 
     * @see labelColorName
     * @return the labelColorName property.
     */
    public String getLabelColorName() {
        return this.labelColorName;
    }
    
    /**
     * Setter for the labelColorName property.
     * 
     * @see labelColorName
     * @param labelColorName the labelColorName to set
     */
    
    public void setLabelColorName(final String labelColorName) {
        this.labelColorName = labelColorName;
    }
    
    /**
     * Getter for the secondaryLabelDataSourceId property.
     * 
     * @see secondaryLabelDataSourceId
     * @return the secondaryLabelDataSourceId property.
     */
    public String getSecondaryLabelDataSourceId() {
        return this.secondaryLabelDataSourceId;
    }
    
    /**
     * Setter for the secondaryLabelDataSourceId property.
     * 
     * @see secondaryLabelDataSourceId
     * @param secondaryLabelDataSourceId the secondaryLabelDataSourceId to set
     */
    
    public void setSecondaryLabelDataSourceId(final String secondaryLabelDataSourceId) {
        this.secondaryLabelDataSourceId = secondaryLabelDataSourceId;
    }
    
    /**
     * Getter for the secondaryLabelHeight property.
     * 
     * @see secondaryLabelHeight
     * @return the secondaryLabelHeight property.
     */
    public double getSecondaryLabelHeight() {
        return this.secondaryLabelHeight;
    }
    
    /**
     * Setter for the secondaryLabelHeight property.
     * 
     * @see secondaryLabelHeight
     * @param secondaryLabelHeight the secondaryLabelHeight to set
     */
    
    public void setSecondaryLabelHeight(final double secondaryLabelHeight) {
        this.secondaryLabelHeight = secondaryLabelHeight;
    }
    
    /**
     * Getter for the secondaryLabelColorName property.
     * 
     * @see secondaryLabelColorName
     * @return the secondaryLabelColorName property.
     */
    public String getSecondaryLabelColorName() {
        return this.secondaryLabelColorName;
    }
    
    /**
     * Setter for the secondaryLabelColorName property.
     * 
     * @see secondaryLabelColorName
     * @param secondaryLabelColorName the secondaryLabelColorName to set
     */
    
    public void setSecondaryLabelColorName(final String secondaryLabelColorName) {
        this.secondaryLabelColorName = secondaryLabelColorName;
    }
}
