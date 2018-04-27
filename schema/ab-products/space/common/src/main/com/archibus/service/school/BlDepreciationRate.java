package com.archibus.service.school;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class BlDepreciationRate extends EventHandlerBase {
    
    /**
     * @param args
     */
    public static void ZheJiu() {
        // 折旧率默认为0.02
        final float afm_activity_params = (float) 0.02;
        final List records = getBlRecords();
        final String year = getThisYear();
        for (int i = 0; i < records.size(); i++) {
            final Map map = (Map) records.get(i);
            final String bl_id = map.get("bl_id").toString();
            final float valueNet = Float(map.get("value_net"));
            final float value_book = Float(map.get("value_book"));
            // 一：计算折旧额=折旧基数*折旧率
            final float value_current_dep = value_book * afm_activity_params;
            // 二：计算净值=净值-折旧额
            final float value_net = valueNet - value_current_dep;
            // 三：计算 累计折旧额
            final float value_accum_dep = getAccumDep(value_current_dep, bl_id);
            // 四：像sc_bl_dep表中插入折旧记录
            final String insertSql =
                    "insert into sc_bl_dep(bl_id,report_id,value_accum_dep,value_book,value_current_dep,value_net)values('"
                            + bl_id
                            + "','"
                            + year
                            + "','"
                            + value_accum_dep
                            + "','"
                            + value_book
                            + "','" + value_current_dep + "','" + value_net + "')";
            SqlUtils.executeUpdate("sc_bl_dep", insertSql);
            // 五：更新bl表中的净值（折旧后价值）
            final String updateSql =
                    "update bl set value_net='" + value_net + "' where bl_id = '" + bl_id + "'";
            SqlUtils.executeUpdate("bl", updateSql);
        }
        SqlUtils.commit();
    }
    
    // 获取bl表中的数据
    private static List getBlRecords() {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql = "select bl_id,value_net,value_book from bl";
        final List records = retrieveDbRecords(context, sql);
        return records;
    }
    
    // 获取折旧年份
    private static String getThisYear() {
        final Date date = new Date();
        final SimpleDateFormat format = new SimpleDateFormat("yyyy");
        final String year = format.format(date);
        return year;
    }
    
    // 转换成小数类型
    private static float Float(final Object obj) {
        final float num = Float.parseFloat((String) obj);
        return num;
    }
    
    // 计算累计折旧额
    private static float getAccumDep(final float val, final String bl_id) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        float value_accum_dep = val;
        // 找出折旧记录表中的这个建筑物所有折旧额
        final String sql2 = "select value_current_dep from sc_bl_dep where bl_id = '" + bl_id + "'";
        final List record = retrieveDbRecords(context, sql2);
        if (!record.isEmpty()) {
            // 如果不为空，累加起来
            for (int s = 0; s < record.size(); s++) {
                final Map map1 = (Map) record.get(s);
                final float value_current_dep_ago = Float(map1.get("value_current_dep"));
                value_accum_dep += value_current_dep_ago;
            }
        }
        return value_accum_dep;
    }
    
}
