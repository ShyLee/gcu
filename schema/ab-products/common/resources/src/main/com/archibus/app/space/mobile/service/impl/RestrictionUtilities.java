package com.archibus.app.space.mobile.service.impl;

import com.archibus.app.common.mobile.util.*;

/**
 * Utility class. Provides supporting methods for retrieving restrictions for Space Survey Mobile
 * and Inventory tables (surveyrm_sync and rm).
 * 
 * @author Ying Qin
 * @since 21.1
 * 
 */
// TODO avoid SQL - use parsed restriction
final class RestrictionUtilities {
    /**
     * Hide default constructor - should never be instantiated.
     */
    private RestrictionUtilities() {
    }
    
    /**
     * Composes a restriction based on values for survey code, building code and floor code for
     * survey room sync table (surveyrm_sync).
     * 
     * @param surveyId survey code
     * @param buildingId building code
     * @param floorId floor code
     * @return a restriction string
     */
    static String composeRoomSyncRestriction(final String surveyId, final String buildingId,
            final String floorId) {
        String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.SURVEY_RM_SYNC_TABLE,
                    ServiceConstants.SURVEY_ID, surveyId);
        restriction =
                ServiceUtilities.composeFieldRestriction(restriction,
                    Constants.SURVEY_RM_SYNC_TABLE, ServiceConstants.BL_ID, buildingId);
        
        restriction =
                ServiceUtilities.composeFieldRestriction(restriction,
                    Constants.SURVEY_RM_SYNC_TABLE, ServiceConstants.FL_ID, floorId);
        return restriction;
    }
    
    /**
     * Composes a restriction based on values for building code, floor code and room code for room
     * table (rm).
     * 
     * @param buildingId building code
     * @param floorId floor code
     * @param roomId room code
     * 
     * @return a restriction string
     */
    static String composeRoomRestriction(final String buildingId, final String floorId,
            final String roomId) {
        String restriction =
                ServiceUtilities.composeFieldRestriction("", Constants.RM_TABLE,
                    ServiceConstants.BL_ID, buildingId);
        
        restriction =
                ServiceUtilities.composeFieldRestriction(restriction, Constants.RM_TABLE,
                    ServiceConstants.FL_ID, floorId);
        
        restriction =
                ServiceUtilities.composeFieldRestriction(restriction, Constants.RM_TABLE,
                    ServiceConstants.RM_ID, roomId);
        return restriction;
    }
}
