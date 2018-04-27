package com.archibus.service.school.equipment;

import java.text.SimpleDateFormat;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.SqlUtils;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

public class EquipmentExtraAdd extends EventHandlerBase {
    public String getEqId() {
        String result = "";
        // 得到系统当前时间并转换成yyyy的格式
        final Date d = new Date();
        final String today = new SimpleDateFormat("yyyy").format(d);
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        
        // 查询DB中最新的一条数据
        final String oneSql = "select eq_id from eq where eq_id is not null order by eq_id desc";
        final List records = retrieveDbRecords(context, oneSql);
        if (!records.isEmpty()) {
            // 把得到的数据截取成2段，第一段为年份，第二段为流水号
            final Map record = (Map) records.get(0);
            final String protocol_code_auto = record.get("eq_id").toString();
            final String new_date_left = protocol_code_auto.substring(0, 4);
            final String new_date_right = protocol_code_auto.substring(4);
            if (today.equals(new_date_left)) {
                // 如果截取的年与当前年一致，把流水号+1
                final int count = Integer.parseInt(new_date_right);
                final int counts = count + 1;
                final String new_count = String.format("%1$05d", counts);
                result = new_date_left + new_count;
            } else {
                // 如果截取的日期与当前日期不一致
                result = today + "00001";
            }
        } else {
            // 如果DB中没有数据
            result = today + "00001";
        }
        SqlUtils.commit();
        return result;
        
    }
}
