package com.archibus.eventhandler.compliance;

import junit.framework.Assert;

import org.json.JSONObject;

import com.archibus.datasource.DataSourceTestBase;
import com.archibus.datasource.data.DataRecord;
import com.archibus.utility.StringUtil;

/**
 * Test class ComplianceEventHelper. file.
 * 
 * @since 20.1
 * 
 */
public class LocationHierarchyTest extends DataSourceTestBase {
    
    /**
     * Constant: location field name.
     */
    public static final String LAT = "lat";
    
    /**
     * Constant: location field name.
     */
    public static final String LON = "lon";
    
    /**
     * Constant: location field name.
     */
    public static final String GEO_REGION_ID = "geo_region_id";
    
    /**
     * Constant: location field name.
     */
    public static final String CTRY_ID = "ctry_id";
    
    /**
     * Constant: location field name.
     */
    public static final String REGN_ID = "regn_id";
    
    /**
     * Constant: location field name.
     */
    
    public static final String STATE_ID = "state_id";
    
    /**
     * Constant: location field name.
     */
    
    public static final String CITY_ID = "city_id";
    
    /**
     * Constant: location field name.
     */
    public static final String COUNTY_ID = "county_id";
    
    /**
     * Constant: location field name.
     */
    public static final String SITE_ID = "site_id";
    
    /**
     * Constant: location field name.
     */
    public static final String PR_ID = "pr_id";
    
    /**
     * Constant: location field name.
     */
    public static final String BL_ID = "bl_id";
    
    /**
     * Constant: location fields of table bl.
     */
    public static final String[] BL_HIERARCHY = new String[] { PR_ID, SITE_ID, CITY_ID, STATE_ID,
            REGN_ID, CTRY_ID, LON, LAT };
    
    /**
     * Constant: location fields of table property.
     */
    public static final String[] PR_HIERARCHY = new String[] { SITE_ID, STATE_ID, REGN_ID, CTRY_ID,
            CITY_ID, COUNTY_ID };
    
    /**
     * Constant: location fields of table site.
     */
    public static final String[] SITE_HIERARCHY = new String[] { CTRY_ID, CITY_ID, STATE_ID,
            REGN_ID };
    
    /**
     * Constant: location fields of table county.
     */
    public static final String[] COUNTY_HIERARCHY = new String[] { STATE_ID, REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields of table city.
     */
    public static final String[] CITY_HIERARCHY = new String[] { STATE_ID, REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields of table state.
     */
    public static final String[] STATE_HIERARCHY = new String[] { REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields of table regn.
     */
    public static final String[] REGN_HIERARCHY = new String[] { CTRY_ID };
    
    /**
     * Constant: location fields of table ctry.
     */
    public static final String[] CTRY_HIERARCHY = new String[] { GEO_REGION_ID };
    
    /**
     * Constant: location fields name array.
     */
    public static final String[] LOC_FIELDS = new String[] { BL_ID, PR_ID, SITE_ID, CITY_ID,
            COUNTY_ID, STATE_ID, REGN_ID, CTRY_ID };
    
    /**
     * Constant: location fields name array.
     */
    public static final String[][] HIERARCHY_FIELDS = new String[][] { BL_HIERARCHY, PR_HIERARCHY,
            SITE_HIERARCHY, COUNTY_HIERARCHY, CITY_HIERARCHY, STATE_HIERARCHY, REGN_HIERARCHY,
            CTRY_HIERARCHY };
    
    /**
     * Constant: location field name.
     */
    private static final String COMPLIANCE_LOCATIONS_SITE_ID = "compliance_locations.site_id";
    
    /**
     * Constant: location field name.
     */
    private static final String COMPLIANCE_LOCATIONS_PR_ID = "compliance_locations.pr_id";
    
    /**
     * Constant: location field name.
     */
    private static final String COMPLIANCE_LOCATIONS_CITY_ID = "compliance_locations.city_id";
    
    /**
     * Define String message1.
     */
    // @translatable
    private static String message1 = "Success";
    
    /**
     * Define String message2.
     */
    // @translatable
    private static String message2 = "Fail";
    
    /**
     * Constant: location field name.
     */
    private static final String LAB1 = "LAB1";
    
    /**
     * Constant: location field name.
     */
    private static final String ALBANY_N = "ALBANY-N";
    
    /**
     * Constant: location field name.
     */
    private static final String ALBANY = "ALBANY";
    
    /**
     * Test getHierarchyRecord method of class LocationHierarchy.
     */
    public void testGetHierarchyRecord() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject locations = getlocationsObj();
        final DataRecord dataRecord = lh.getHierarchyRecord(SITE_ID, ALBANY_N, locations);
        Assert.assertNotNull(dataRecord);
    }
    
    /**
     * Test getPkRestriction method of class LocationHierarchy.
     */
    public void testGetPkRestriction() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject locations = getlocationsObj();
        lh.getPkRestriction(SITE_ID, ALBANY_N, locations);
    }
    
    /**
     * Test fillHierarchyForSingleLocationKey method of class LocationHierarchy.
     */
    public void testFillHierarchyForSingleLocationKey() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject locations = getlocationsObj();
        lh.fillHierarchyForSingleLocationKey(locations, COMPLIANCE_LOCATIONS_SITE_ID);
        
    }
    
    /**
     * Test needFillHierarchy method of class LocationHierarchy.
     */
    public void testNeedFillHierarchy() {
        final LocationHierarchy lh = new LocationHierarchy();
        final boolean b = lh.needFillHierarchy(SITE_ID);
        if (b) {
            System.out.println(message1);
        } else {
            System.out.println(message2);
        }
        
    }
    
    /**
     * Test fillCounty method of class LocationHierarchy.
     */
    public void testFillCounty() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject location = getlocationsObj();
        final JSONObject obj =
                lh.fillCounty(location,
                    location.optString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + PR_ID));
        if (obj.has(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + COUNTY_ID)) {
            
            final String countyId =
                    obj.getString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + COUNTY_ID);
            
            if (StringUtil.notNullOrEmpty(countyId)) {
                System.out.println(message1);
            } else {
                System.out.println(message2);
            }
        }
        
    }
    
    /**
     * Test fillGeoRegn method of class LocationHierarchy.
     */
    public void testFillGeoRegn() {
        final LocationHierarchy lh = new LocationHierarchy();
        final JSONObject location = getlocationsObj();
        
        final JSONObject obj =
                lh.fillGeoRegn(location,
                    location.optString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + CTRY_ID));
        
        if (obj.has(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + CTRY_ID)) {
            final String regionId =
                    obj.getString(Constant.COMPLIANCE_LOCATIONS + Constant.DOT + GEO_REGION_ID);
            
            if (StringUtil.notNullOrEmpty(regionId)) {
                System.out.println(message1);
            } else {
                System.out.println(message2);
            }
        }
        
    }
    
    /**
     * Test calculateLatLon method of class LocationHierarchy.
     */
    public void testCalculateLatLon() {
        final JSONObject location = getlocationsObj();
        final LocationHierarchy lh = new LocationHierarchy();
        lh.calculateLatLon(location, SITE_ID, ALBANY_N);
    }
    
    /**
     * Get locations Obj.
     * 
     * @return JSONObject.
     */
    private JSONObject getlocationsObj() {
        final JSONObject locations = new JSONObject();
        locations.put(COMPLIANCE_LOCATIONS_SITE_ID, ALBANY_N);
        locations.put(COMPLIANCE_LOCATIONS_PR_ID, LAB1);
        locations.put(COMPLIANCE_LOCATIONS_CITY_ID, ALBANY);
        
        return locations;
    }
    
}
