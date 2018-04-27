package com.archibus.app.common.drawing.svg.service.dao.datasource;

import com.archibus.app.common.drawing.svg.service.dao.IHighlightParametersDao;
import com.archibus.app.common.drawing.svg.service.domain.HighlightParameters;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecordField;
import com.archibus.utility.ExceptionBase;

/**
 * DataSource for HighlightParameters.
 * <p>
 * A bean named as "svgHighlightParametersDataSource".
 * <p>
 * configured in /schema/ab-products/common/resources/appContext-services.xml
 * <p>
 * Designed to have prototype scope.
 * 
 * @author Shao
 * @since 21.1
 */
public class HighlightParametersDataSource extends ObjectDataSourceImpl<HighlightParameters>
        implements IHighlightParametersDao {
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    private static final String[][] FIELDS_TO_PROPERTIES = {
            { Constants.VIEW_FILE_NAME, "viewName" },
            { Constants.HIGHLIGHT_DATASOURCE, "highlightDatasourceId" },
            { Constants.LABEL_DATASOURCE, "labelDataSourceId" },
            { Constants.LABEL_HEIGHT, "labelHeight" },
            { Constants.LABEL_COLOR, "labelColorName" },
            { Constants.VIEW_FILE_NAME + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryViewName" },
            {
                    Constants.HIGHLIGHT_DATASOURCE
                            + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryHighlightDatasourceId" },
            { Constants.LABEL_DATASOURCE + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryLabelDataSourceId" },
            { Constants.LABEL_HEIGHT + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryLabelHeight" },
            { Constants.LABEL_COLOR + Constants.SECONDARY_ASSET_HIGHLIGHT_FIELD_NAMES_SUFFIX,
                    "secondaryLabelColorName" }
    
    };
    
    /**
     * Constructs HighlightParametersDataSource, mapped to <code>active_plantypes</code> table,
     * using <code>svgHighlightParameters</code> bean.
     */
    public HighlightParametersDataSource() {
        super("svgHighlightParameters", Constants.ACTIVE_PLAN_TYPES);
    }
    
    /**
     * 
     * Gets HighlightParameters by a plan type.
     * 
     * @param planType plan type value.
     * @return HighlightParameters.
     * 
     * @throws ExceptionBase if DataSource throws an exception.
     */
    public HighlightParameters getByPlanType(final String planType) throws ExceptionBase {
        final PrimaryKeysValues primaryKeysValues = new PrimaryKeysValues();
        {
            final DataRecordField pkField = new DataRecordField();
            pkField.setName(Constants.ACTIVE_PLAN_TYPES + '.' + Constants.PLAN_TYPE);
            pkField.setValue(planType);
            
            primaryKeysValues.getFieldsValues().add(pkField);
        }
        return this.get(primaryKeysValues);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
}
