package com.archibus.service.school;

import java.util.Date;

import org.apache.log4j.Logger;

import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.service.school.house.ZZFHandler;
import com.archibus.service.school.log.SchOperatorLog;
import com.archibus.service.school.tools.SchTools;

public class SchoolService extends EventHandlerBase {
    
    protected static Logger Classlog = Logger.getLogger(SchoolService.class);
    
    /**
     * update all data except room.use1, which is updated in the WFR updateRoomUse()
     */
    public void updateArea() {
        
        UpdateSchoolCount.updateCount();
        
        UpdateSchoolArea.updateArea();
        
        Classlog.info("SchoolService updateArea  rule called at " + new Date());
    }
    
    public void updateEmArea(final String blId, final String flId, final String rmId) {
        UpdateSchoolArea.updateEmArea(blId, flId, rmId);
    }
    
    /**
     * called to create the changed record for the table 'sc_zzfrent_change'
     */
    public void huoquChangedCards(final String year, final String month) {
        ZZFHandler.doHuoquChangedCards();
    }
    
    /**
     * called to create the bao pan report
     * 
     * @param year
     * @param month
     */
    public void createBaoPanRpt(final String year, final String month) {
        Integer.parseInt(year);
        Integer.parseInt(month);
    }
    
    /**
     * create butie tongji report
     * 
     * @param year
     * @param newDate
     */
    public void createBaoPanBT(final String year, final String newDate) {
        ZZFHandler.createBaoPanBT(year, newDate);
    }
    
    /**
     * check this employee is existed in the cards table 'sc_zzfcard'-- select 1 from sc_zzfcard
     * where card_statuls='1' and em_id=emcode
     * 
     * @param emcode
     * @return
     */
    public boolean hasExistedTheEmpInCards(final String emcode) {
        return ZZFHandler.hasExistedTheEmpInCards(emcode);
    }
    
    /**
     * 
     * @param cardId
     * @return
     */
    public double getCurCardMonthRent(final String cardId) {
        return ZZFHandler.getCurCardMonthRent(cardId);
    }
    
    /**
     * get sys date
     */
    public String getSysDate() {
        return SchTools.getSysDate();
    }
    
    public void writeLog(final DataRecord updatedRecord, final String operation) {
        SchOperatorLog.writeUsmsUpdateLog(updatedRecord, operation);
    }
    
    public void updateUserEmail(final String emailFrom, final String emailTo) {
        SchTools.updateUserEmail(emailFrom, emailTo);
    }
    
    public void createFixedIndex(final String table, final String field, final String sysDate) {
        ZZFHandler.doCreateFixedIndex(table, field, sysDate);
    }
}
