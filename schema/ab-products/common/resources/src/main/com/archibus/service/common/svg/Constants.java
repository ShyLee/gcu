package com.archibus.service.common.svg;

/**
 * 
 * Constants for the classes in this package.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public final class Constants {
    
    /**
     * Constant: text element tag name.
     */
    public static final String TEXT_ELEMENT_NAME = "text";
    
    /**
     * Constant: text element font size unit name.
     */
    public static final String TEXT_ELEMENT_FONT_SIZE_UNIT = "em";
    
    /**
     * Constant: text element tag name.
     */
    public static final String TEXT_ELEMENT_VERTICAL_COORDINATE = "y";
    
    /**
     * Constant: XML element's style property name.
     */
    public static final String STYLE = "style";
    
    /**
     * Constant: XML element's style fill property name.
     */
    public static final String STYLE_FILL = "fill";
    
    /**
     * Constant: XML element's style font-size property name.
     */
    public static final String STYLE_FONT_SIZE = "font-size";
    
    /**
     * Constant: asset element's attribute name to indicate if the asset is highlighted.
     */
    public static final String HIGHLIGHTED_ASSET = "highlighted";
    
    /**
     * Constant: XPATH for labels element.
     */
    public static final String LABELS_ELEMENT_XPATH = "//svg:g[@id='asset-labels']";
    
    /**
     * Constant: XPATH for assets element.
     */
    public static final String ASSETS_ELEMENT_XPATH = "//svg:g[@id='%s-assets']";
    
    /**
     * Constant:svg label element id prefix.
     */
    public static final String LABEL_ID_PREFIX = "l-%s-";
    
    /**
     * Constant: XML element id name.
     */
    public static final String ELEMENT_ID = "id";
    
    /**
     * Constant: svg file loading exception message.
     */
    // @translatable
    public static final String SVG_FILE_LOAD_EXCEPTION_MESSAGE = "Fail to load the svg file";
    
    /**
     * Private default constructor: utility class is non-instantiable.
     */
    private Constants() {
    }
}
