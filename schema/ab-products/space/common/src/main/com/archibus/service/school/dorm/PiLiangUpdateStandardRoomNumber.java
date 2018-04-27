package com.archibus.service.school.dorm;

import org.codehaus.jettison.json.JSONException;
import org.json.JSONObject;

import com.archibus.datasource.SqlUtils;
import com.archibus.jobmanager.JobBase;

public class PiLiangUpdateStandardRoomNumber extends JobBase {
    private final String assetDepTbl = "rm";
    
    /*
     * 将计算出的值对应更新到（rm表）
     */
    
    public void plUpdateRoomStandardBedNumber(final JSONObject obj) throws JSONException, Exception {
        final JSONObject jsonblId_rmCap = new JSONObject(obj.toString());
        
        final String blId = (String) jsonblId_rmCap.get("blId");
        final String rmCap = (String) jsonblId_rmCap.get("rmCap");
        // final String newRmArr = (String) jsonblId_rmCap.get("newRmArr");
        // System.out.println(blId + "   " + rmCap + " " + newRmArr);
        // final String[] arr = newRmArr.split("-");
        // for (final String element : arr) {
        // System.out.println(element);
        final StringBuilder sqlUpdate = new StringBuilder("UPDATE rm SET");
        sqlUpdate.append(" rm.cap_em = " + Integer.parseInt(rmCap));
        sqlUpdate.append(" WHERE rm.bl_id = " + "'" + blId + "'");
        SqlUtils.executeUpdate(this.assetDepTbl, sqlUpdate.toString());
        SqlUtils.commit();
        
    }
    
    public void plUpdateByFloorRoomStandardBedNumber(final JSONObject obj) throws Exception {
        final JSONObject jsonflId_rmcap = new JSONObject(obj.toString());
        // final String blId = (String) jsonflId_rmcap.get("blId");
        final String flId = (String) jsonflId_rmcap.get("flId");
        final String rmCap = (String) jsonflId_rmcap.get("rmCap");
        final StringBuilder sqlUpdate = new StringBuilder("UPDATE rm SET");
        sqlUpdate.append(" rm.cap_em = " + Integer.parseInt(rmCap));
        sqlUpdate.append(" WHERE rm.fl_id = " + "'" + flId + "'");
        SqlUtils.executeUpdate(this.assetDepTbl, sqlUpdate.toString());
        SqlUtils.commit();
    }
    
    public void plUpdateRoomUseNameByBl(final JSONObject obj) throws Exception {
        final JSONObject jsonblId_rmUsename = new JSONObject(obj.toString());
        final String blId = (String) jsonblId_rmUsename.get("blId");
        final String rmUsename = (String) jsonblId_rmUsename.get("rmUsename");
        final String rmCategory = (String) jsonblId_rmUsename.get("rmCategory");
        final String rmType = (String) jsonblId_rmUsename.get("rmType");
        final StringBuilder sqlUpdate = new StringBuilder("UPDATE rm SET");
        sqlUpdate.append(" rm.rm_use = '" + rmUsename + "',");
        sqlUpdate.append(" rm.rm_cat = '" + rmCategory + "',");
        sqlUpdate.append(" rm.rm_type = '" + rmType + "'");
        sqlUpdate.append(" WHERE rm.bl_id = " + "'" + blId + "'");
        SqlUtils.executeUpdate(this.assetDepTbl, sqlUpdate.toString());
        SqlUtils.commit();
    }
    
    public void plUpdateRoomUseNameByFl(final JSONObject obj) throws Exception {
        final JSONObject jsonflId_rmUsename = new JSONObject(obj.toString());
        final String flId = (String) jsonflId_rmUsename.get("flId");
        final String rmUsename = (String) jsonflId_rmUsename.get("rmUsename");
        final String rmCategory = (String) jsonflId_rmUsename.get("rmCategory");
        final String rmType = (String) jsonflId_rmUsename.get("rmType");
        System.out.println(flId);
        System.out.println(rmUsename);
        System.out.println(rmCategory);
        System.out.println(rmType);
        final StringBuilder sqlUpdate = new StringBuilder("UPDATE rm SET");
        sqlUpdate.append(" rm.rm_use = '" + rmUsename + "',");
        sqlUpdate.append(" rm.rm_cat = '" + rmCategory + "',");
        sqlUpdate.append(" rm.rm_type = '" + rmType + "'");
        sqlUpdate.append(" WHERE rm.fl_id = " + "'" + flId + "'");
        SqlUtils.executeUpdate(this.assetDepTbl, sqlUpdate.toString());
        SqlUtils.commit();
        
    }
}