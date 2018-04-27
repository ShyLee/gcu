package com.archibus.service.space;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

/**
 * Lease Area Calculations.
 * 
 * <p>
 * Calculates the measured lease areas (ls.area_usable and ls.area_rentable).
 * 
 * <p>
 * Calculations are based on the Lease Area method specified in the Schema Preferences table
 * (afm_scmpref). Lease Area Methods are: Suite, Group, Room - Composite, and Room - All Room. If
 * measured areas are being used then one and only one of the above methods must be used to assign
 * physical floor areas to particular leases. Lease Negotiated areas can always be used to manually
 * enter negotiated lease area.
 * 
 * <p>
 * ls.area_usable is calculated by summing the areas for those Suite, Groups, or rooms (depending on
 * the Lease Area method) assigned to a lease.
 * 
 * <p>
 * To obtain the ls.area_rentable we automatically run the Space Module chargeback (proration)
 * calculations to prorate the common areas to Suites, Groups, or Rooms prior to summing the
 * chargeable areas to lease rentable. The chargeback calculation used also depend on the Lease Area
 * method. There are six chargeback methods:
 * <li>Suite
 * <li>Group - Group
 * <li>Group - Boma
 * <li>Group - Enhanced Boma
 * <li>Room - Composite
 * <li>Room - All Room
 * 
 * <p>
 * If you are using the Group Lease Area Method then the chargeback calculations executed will
 * depend on the value entered in the Schema Preferences Table for: Group Area Prorate Method.
 * 
 * <p>
 * The Suite chargeback method sums Suite usable areas to Floors, Buildings, and Sites and then
 * prorates Service common areas to suites.
 * <p>
 * The Group chargeback methods prorate Service and Group common areas to Groups. (see Space On-line
 * Help for details and differences between the Group, BOMA, and Enhanced BOMA methods.)
 * <p>
 * The Room - Composite chargeback method prorates Service and common area Rooms to Rooms. (see
 * Space On-line Help for details.)
 * <p>
 * The Room - All Room chargeback method prorates common area Rooms to Rooms which have an
 * occupiable room category. (see Space On-line Help for details.)
 * 
 * <p>
 * Once the chargeble areas are determined for Suites, Groups, or Rooms they are then summed up to
 * the Lease rentable area.
 * 
 * <p>
 * History:
 * <li>Web Central 17.3: Initial implementation, only supports the Room - All Room chargeback
 * method. Ported from lsarea.abs.
 * <li>Web Central 19.2: KB 3029709 IOAN 01/05/2011 Exclude lease templates from calculation
 * 
 * @author Sergey Kuramshin
 */
public class LeaseAreaUpdate {

    // ----------------------- constants ---------------------------------------

    public static final String LEASE_AREA_METHOD_ROOM_SUITE = "su";

    public static final String LEASE_AREA_METHOD_ROOM_GROUP = "gp";

    public static final String LEASE_AREA_METHOD_ROOM_COMPOSITE = "cr";

    public static final String LEASE_AREA_METHOD_ROOM_ALLROOM = "ar";

    public static final String LEASE_PRORATION_METHOD_GENERAL = "G";

    public static final String LEASE_PRORATION_METHOD_BOMA = "B";

    public static final String LEASE_PRORATION_METHOD_BOMA_ENHANCED = "E";

    public static final String LEASE_PRORATION_METHOD_BOMA_96 = "9";

    // ----------------------- business methods --------------------------------

    public static String getLeaseAreaMethod() {
        DataRecord record = getLeasePreferences();
        return record.getString("afm_scmpref.lease_area_type");
    }

    public static String getLeaseProrationMethod() {
        DataRecord record = getLeasePreferences();
        return record.getString("afm_scmpref.lease_proration_method");
    }

    public static String getLeaseAreaTable() {
        String leaseAreaTable = "rm";
        String leaseAreaMethod = getLeaseAreaMethod();
        if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_SUITE)) {
            leaseAreaTable = "su";

        } else if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_GROUP)) {
            leaseAreaTable = "gp";
        }
        return leaseAreaTable;
    }

    /**
     * <ul>
     * <li>1) Update Space Areas (Sites, Bldgs, Floors)
     * <li>2) Chargeback common areas to Suites, Groups, or Rooms
     * <li>3) Calculate ls.area_usable and ls.area_rentable
     */
    public static void updateLeaseAreas() {
        String leaseAreaMethod = getLeaseAreaMethod();

        AllRoomAreaUpdate.calculateGros();
        AllRoomAreaUpdate.calculateOccupiable();
        AllRoomAreaUpdate.calculateNonoccupiable();

        if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_SUITE)) {
            runSuiteAreaChargeback();

        } else { // LEASE_AREA_METHOD_ROOM_ALLROOM
            AllRoomAreaUpdate.calculateGroups();
            AllRoomChargeback.performChargeback();
        }

        calculateLeaseAreas(leaseAreaMethod);
    }

    // ----------------------- implementation ----------------------------------

    /**
     * Calculate ls.area_usable, ls.area_rentable, ls.qty_suite_occupancy once Area rollup and
     * chargeback has been run
     */
    private static void calculateLeaseAreas(String leaseAreaMethod) {
        String areaTable;
        String areaUsableField;
        String areaRentableField;

        if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_SUITE)) {
            areaTable = "su";
            areaUsableField = "area_usable";
            areaRentableField = "area_rentable";

        } else if (leaseAreaMethod.equalsIgnoreCase(LEASE_AREA_METHOD_ROOM_GROUP)) {
            areaTable = "gp";
            areaUsableField = "area";
            areaRentableField = "area_chargable";

        } else { // LEASE_AREA_METHOD_ROOM_ALLROOM or LEASE_AREA_METHOD_ROOM_COMPOSITE
            areaTable = "rm";
            areaUsableField = "area";
            areaRentableField = "area_chargable";
        }

        FieldOperation fo = new FieldOperation();
        fo.setOwner("ls");
        fo.setAssigned(areaTable);
        fo.setOwnerRestriction("ls.use_as_template = 0");
        fo.addOperation("ls.area_usable", "SUM", areaTable + "." + areaUsableField);
        fo.addOperation("ls.area_rentable", "SUM", areaTable + "." + areaRentableField);
        fo.addOperation("ls.area_common", "SUM", areaTable + ".area_comn");
        fo.calculate();

        fo = new FieldOperation();
        fo.setOwner("ls");
        fo.setAssigned("su");
        fo.setOwnerRestriction("ls.use_as_template = 0");
        fo.calculate("ls.qty_suite_occupancy", "SUM", "su.occupancy");
    }

    private static void runSuiteAreaChargeback() {
        // the next 3 calculations are EXACTLY the same as in GroupChargeback.java:

        // Sum SERVICE FLOOR COMMON area from SERV to FL

        new FieldOperation("fl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.supercat = 'SERV' AND rm.prorate = 'FLOOR'").calculate("fl.area_fl_comn_serv",
            "SUM", "rm.area");

        // Sum SERVICE BLDG. COMMON area from SERV to BL

        new FieldOperation("bl", "rm", "rmcat").setAssignedRestriction(
            "rmcat.supercat = 'SERV' AND rm.prorate = 'BUILDING'").calculate(
            "bl.area_bl_comn_serv", "SUM", "rm.area");

        // Sum SERVICE SITE COMMON area from SERV to SITE

        String sql = "UPDATE site SET area_st_comn_serv = (SELECT ${sql.isNull('SUM(rm.area)', 0.0)}"
                + " FROM bl, rm, rmcat"
                + " WHERE site.site_id = bl.site_id"
                + " AND bl.bl_id = rm.bl_id"
                + " AND rmcat.rm_cat = rm.rm_cat"
                + " AND rmcat.supercat = 'SERV'" + " AND rm.prorate = 'SITE')";
        SqlUtils.executeUpdate("site", sql);

        new FieldOperation("fl", "su").calculate("fl.area_su", "SUM", "su.area_usable");

        new FieldOperation("bl", "fl").calculate("bl.area_su", "SUM", "fl.area_su");

        new FieldOperation("site", "bl").calculate("site.area_su", "SUM", "bl.area_su");

        sql = "UPDATE su SET area_comn =" + " ( SELECT ${sql.isNull"
                + "('fl.area_fl_comn_serv * su.area_usable / ("
                + SqlUtils.formatSqlReplace0WithHuge("fl.area_su") + ")', 0.0)}"
                + " + ${sql.isNull" + "('bl.area_bl_comn_serv * su.area_usable / ("
                + SqlUtils.formatSqlReplace0WithHuge("bl.area_su") + ")', 0.0)}"
                + " + ${sql.isNull" + "('site.area_st_comn_serv * su.area_usable / ("
                + SqlUtils.formatSqlReplace0WithHuge("site.area_su") + ")', 0.0)}";

        if (SqlUtils.isOracle()) {
            sql = sql + " FROM fl, bl, site";
        } else if (SqlUtils.isSybase()) {
            sql = sql + " FROM fl, bl KEY LEFT OUTER JOIN site";
        } else {
            sql = sql + " FROM fl, bl LEFT OUTER JOIN site ON site.site_id = bl.site_id";
        }

        sql = sql + " WHERE fl.bl_id = su.bl_id" + " AND fl.fl_id =su.fl_id"
                + " AND bl.bl_id = su.bl_id";

        if (SqlUtils.isOracle()) {
            sql = sql + " AND site.site_id (+) = bl.site_id)";
        } else {
            sql = sql + ")";
        }

        SqlUtils.executeUpdate("su", sql);

        sql = "UPDATE su SET area_rentable = ${sql.isNull('area_usable + area_comn', 0.0)}";
        SqlUtils.executeUpdate("su", sql);
    }

    /**
     * Returns data record containing lease calculation preferences.
     * 
     * @return
     */
    private static DataRecord getLeasePreferences() {
        String tableName = "afm_scmpref";
        String[] fieldNames = { "lease_area_type", "lease_proration_method" };
        DataSource ds = DataSourceFactory.createDataSourceForFields(tableName, fieldNames);
        return ds.getRecord();
    }
}
