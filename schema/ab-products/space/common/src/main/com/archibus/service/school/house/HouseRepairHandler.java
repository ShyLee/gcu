package com.archibus.service.school.house;

import com.archibus.datasource.SqlUtils;

public class HouseRepairHandler {
    
    public void insertNewData(final String id, final String engineer_name, final String date_apply,
            final String date_report, final String em_apply, final String dv_apply,
            final String dv_copy, final String dv_cons, final String bl_id, final String fl_id,
            final String rm_id, final String cost_estimated, final String address,
            final String type, final String cause, final String malfunction, final String comments) {
        final String sql =
                "INSERT INTO sc_hos_repair (id,engineer_name,date_apply,date_report,em_apply,dv_apply,"
                        + "dv_copy,dv_cons,bl_id,fl_id,rm_id,cost_estimated,address,type,cause,malfunction,comments)"
                        + "values ('"
                        + id
                        + "','"
                        + engineer_name
                        + "',to_date('"
                        + date_apply
                        + "','yyyy-MM-dd'),to_date('"
                        + date_report
                        + "','yyyy-MM-dd'),'"
                        + em_apply
                        + "','"
                        + dv_apply
                        + "','"
                        + dv_copy
                        + "','"
                        + dv_cons
                        + "','"
                        + bl_id
                        + "','"
                        + fl_id
                        + "','"
                        + rm_id
                        + "','"
                        + cost_estimated
                        + "','"
                        + address
                        + "','"
                        + type
                        + "','"
                        + cause
                        + "','"
                        + malfunction
                        + "','"
                        + comments + "')";
        SqlUtils.executeUpdate("sc_hos_repair", sql);
        SqlUtils.commit();
    }
}
