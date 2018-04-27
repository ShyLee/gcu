package com.archibus.service.school.house;

import org.apache.log4j.Logger;

import com.archibus.datasource.SqlUtils;

public class ZZFWarnByColor {
    
    protected static Logger logger = Logger.getLogger(ZZFWarnByColor.class);
    
    public void protocolWarn() {
        String sql =
                "UPDATE sc_zzfcard "
                        + " SET color = (CASE WHEN (TRUNC (date_checkout_ought - SYSDATE)) <= 0 THEN '14 0 1 16711680'"
                        + " WHEN (TRUNC (date_checkout_ought - SYSDATE)) <= 30 THEN '14 0 2 16776960'"
                        + " WHEN (TRUNC (date_checkout_ought - SYSDATE)) <= 60 THEN '14 0 3 65280' END)";
        SqlUtils.executeUpdate("sc_zzfcard", sql);
        logger.debug(sql);
    }
}
