package com.archibus.app.common.drawing.svg.service;

import java.util.*;

import com.archibus.utility.ExceptionBase;

/**
 * 
 * 
 * API of the Service for html5-based svg drawing application.
 * 
 * @author shao
 * @since 21.1
 * 
 */
public interface IDrawingSvgService {
    /**
     * Highlights svg drawing document.
     * 
     * <p>
     * 1. loads required published svg file;
     * <p>
     * 2. processes the svg with specified highlight and label datasources to highlight and label.
     * <p>
     * 3. Returns highlighted svg.
     * 
     * @param pkeyValues -Map<String, Object> primary key fields values
     *            <p>
     *            like {"bl_id": "HQ", "fl_id": "18"}.
     * @param planTypeValue - String plan type value (record values defined in database table
     *            active_plantypes.plan_type).
     * @param parameters - List of Map<String, Object> to specify highlight parameters
     *            <p>
     *            like [{"view_file": "ab-sp-space-book-rmxrmstd.axvw", "hs_ds":
     *            "ds_ab-sp-space-book-rmxrmstd_rmHighlight"
     *            ,"label_ds":"ds_ab-sp-space-book-rmxrmstd_rmLabel"}].
     * 
     * @return svg xml as String.
     * 
     * @throws ExceptionBase if loading svg or highlighting it throws an exception.
     */
    String highlightSvgDrawing(final Map<String, String> pkeyValues, final String planTypeValue,
            final List<Map<String, String>> parameters) throws ExceptionBase;
}
