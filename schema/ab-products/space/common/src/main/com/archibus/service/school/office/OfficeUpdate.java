package com.archibus.service.school.office;

import java.text.*;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class OfficeUpdate extends EventHandlerBase {
    public void officeGuiDang() {
        final String sql =
                "Insert Into Sc_Room_History(Id,Bl_Id,Fl_Id,Rm_Id,Area,Area_Dinge,Rm_Name,Dv_Id,Count_Em,Em_Use,Em_Use_Id,Em_Use_Zj,Dv_Name,Bl_Name,Bu_Class,Area_Chaobiao,Date_Guidang) "
                        + " Select Null,"
                        + "  rm.bl_id,"
                        + "  rm.fl_id,"
                        + "  rm.rm_id,"
                        + "  rm.area,"
                        + "  rm.area_dinge,"
                        + "  rm.rm_name,"
                        + "  rm.dv_id,"
                        + "  rm.count_em,"
                        + "  rm.em_use,"
                        + "  rm.em_use_id,"
                        + "  rm.em_use_zj,"
                        + "  dv.dv_name,"
                        + "  bl.name,"
                        + "  '党政管理',"
                        + "  (Round(Rm.Area-Rm.Area_Dinge,2)) As Area_Chaobiao,"
                        + "  sysdate"
                        + " FROM Rm"
                        + " LEFT OUTER JOIN Dv"
                        + " ON Rm.Dv_Id=Dv.Dv_Id"
                        + " LEFT OUTER JOIN Bl"
                        + " ON Rm.Bl_Id=Bl.Bl_Id"
                        + " LEFT OUTER JOIN Rmtype"
                        + " ON Rm.Rm_Cat=Rmtype.Rm_Cat"
                        + " AND Rm.Rm_Type=Rmtype.Rm_Type"
                        + " WHERE (((Rm.Rm_Type=Rmtype.Rm_Type"
                        + " AND Rmtype.Is_Office='1')"
                        + " AND (Rm.Dv_Id IN"
                        + "  (SELECT Dv_Id"
                        + "  FROM Dv"
                        + "  WHERE (Dv.Bu_Id="
                        + "    (SELECT Bu_Id FROM Bu WHERE Bu_Class='DZGL'" + "    ))" + "  )))) ";
        SqlUtils.executeUpdate("sc_room_history", sql);
        SqlUtils.commit();
    }
    
    public void updateRmpctArea(final String bl_id, final String fl_id, final String rm_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final DecimalFormat df = new DecimalFormat("######0.00");
        final String sql =
                "select count(em_id) count_em from rmpct where em_id is not null and bl_id="
                        + literal(context, bl_id) + " and fl_id=" + literal(context, fl_id)
                        + " and rm_id=" + literal(context, rm_id);
        final List records = retrieveDbRecords(context, sql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            final String count_em_old = record.get("count_em").toString();
            if (!count_em_old.equals("0")) {
                // 房间办公人数
                final int count_em = Integer.parseInt(count_em_old);
                // 房间面积
                final Double area = Double.parseDouble(getRmArea(context, bl_id, fl_id, rm_id));
                
                // 计算area_rm
                final String areaRmText = df.format(area / count_em);
                final Double areaRm = Double.parseDouble(areaRmText);
                // 计算pct_space
                final String spaceText = df.format(100 / count_em);
                final Double space = Double.parseDouble(spaceText);
                // 更新rmpct表
                updateSpaceAndArea(context, areaRm, space, bl_id, fl_id, rm_id);
                calculateEmCount();
            }
        }
    }
    
    private String getRmArea(final EventHandlerContext context, final String bl_id,
            final String fl_id, final String rm_id) {
        String area = "0";
        final String sql =
                "select area from rm where  bl_id=" + literal(context, bl_id) + " and fl_id="
                        + literal(context, fl_id) + " and rm_id=" + literal(context, rm_id);
        final List records = retrieveDbRecords(context, sql);
        if (!records.isEmpty()) {
            final Map record = (Map) records.get(0);
            area = record.get("area").toString();
        }
        return area;
    }
    
    private void updateSpaceAndArea(final EventHandlerContext context, final Double areaRm,
            final Double space, final String bl_id, final String fl_id, final String rm_id) {
        final String sql =
                "update rmpct set pct_space=" + space + ",area_rm=" + areaRm + " where  bl_id="
                        + literal(context, bl_id) + " and fl_id=" + literal(context, fl_id)
                        + " and rm_id=" + literal(context, rm_id);
        SqlUtils.executeUpdate("rmpct", sql);
        SqlUtils.commit();
    }
    
    private void calculateEmCount() {
        final String sql =
                "update rm set count_em=(select nvl(count(em_id),0) from rmpct where rmpct.em_id is not null and rmpct.bl_id=rm.bl_id and rmpct.fl_id=rm.fl_id and rmpct.rm_id=rm.rm_id )"
                        + " where rm.bl_id ||rm.fl_id||rm.rm_id in (select distinct rmpct.bl_id||rmpct.fl_id||rmpct.rm_id from rmpct where rmpct.em_id is not null)";
        
        SqlUtils.executeUpdate("rm", sql);
        SqlUtils.commit();
        
    }
    
    public static String getLeaseId() {
        // 得到系统当前时间并转换成yyyy的格式
        final Date d = new Date();
        final String today = new SimpleDateFormat("yyyy").format(d);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        String result = "";
        // 查询DB中最新的一条数据
        final String oneSql =
                "select lease_id from sc_zzfcard where lease_id is not null and lease_id like '"
                        + today + "%' order by lease_id desc";
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            // 把得到的数据截取成两段，第一段为年份，第二段为流水号
            final Map record = (Map) records.get(0);
            final String lease_id = record.get("lease_id").toString();
            final String lease_id_left = lease_id.substring(0, 4);
            final String lease_id_right = lease_id.substring(4);
            if (today.equals(lease_id_left)) {
                // 如果截取的年份与当前年份一致，把流水号+1
                final int count = Integer.parseInt(lease_id_right);
                final int counts = count + 1;
                final String new_count = String.format("%1$,04d", counts);
                result = lease_id_left + new_count;
            } else {
                // 如果截取的年份与当前年份不一致
                result = today + "0001";
            }
        } else {
            // 如果DB中没有数据
            result = today + "0001";
        }
        SqlUtils.commit();
        return result;
    }
    
    public void insertHrmpctFromRmpct(final String pct_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "insert into hrmpct(Ac_Id,Activity_Log_Id,Area_Chargable,Area_Comn,Area_Comn_Nocup,Area_Comn_Ocup,Area_Comn_Rm,"
                        + "Area_Comn_Serv,Area_Rm,Bl_Id,Confirmed,Cost,Date_Created,Date_Deleted,Date_End,Date_Start,"
                        + "Day_Part,Del_User_Name,Dp_Id,Dv_Id,Em_Id,Fl_Id,From_Bl_Id,From_Fl_Id,From_Rm_Id,Mo_Id,"
                        + "Org_Id,Parent_Pct_Id,pct_id,Pct_Space,Pct_Time,Primary_Em,Primary_Rm,Prorate,Resources,"
                        + "Rm_Cat,rm_id,rm_type,status,user_name,Visitor_Id) "
                        + "select Ac_Id,Activity_Log_Id,Area_Chargable,Area_Comn,Area_Comn_Nocup,Area_Comn_Ocup,Area_Comn_Rm,"
                        + "Area_Comn_Serv,Area_Rm,Bl_Id,Confirmed,Cost,Date_Created,sysdate,sysdate,Date_Start,"
                        + "Day_Part,Del_User_Name,Dp_Id,Dv_Id,Em_Id,Fl_Id,From_Bl_Id,From_Fl_Id,From_Rm_Id,Mo_Id,"
                        + "Org_Id,Parent_Pct_Id,pct_id,Pct_Space,Pct_Time,Primary_Em,Primary_Rm,Prorate,Resources,"
                        + "Rm_Cat,rm_id,rm_type,status,user_name,Visitor_Id from rmpct where pct_id="
                        + literal(context, pct_id);
        
        SqlUtils.executeUpdate("hrmpct", sql);
        SqlUtils.commit();
        
    }
    
}
