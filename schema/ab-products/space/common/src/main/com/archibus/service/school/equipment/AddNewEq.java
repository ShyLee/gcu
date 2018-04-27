package com.archibus.service.school.equipment;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;

public class AddNewEq {
    public static String addNewEq(final DataRecord record) {
        String saveMessageString = "入库操作出现错误，程序终止，请重新操作！";
        final DataSource queryDataSource =
                DataSourceFactory.createDataSourceForFields("eq", new String[] { "eq_id",
                        "eq_name", "brand", "vn_id", "eq_type", "eq_std", "price", "unit",
                        "source", "ctry_name", "ctry_id", "dv_id", "servcont_id",
                        "date_manufactured", "date_purchased", "type_use", "csi_id", "eq_name",
                        "eq_id", "bl_id", "fl_id", "rm_id", "em_id", "attachments_num",
                        "attachments_price", "subject_funds", "handling_em", "image_file",
                        "sci_resh_id", "danju_id", "approved", "comments", "approved_fiance",
                        "date_fin_approved", "approved_by_fin", "sch_status" }, false);
        
        try {
            queryDataSource.saveRecord(record);
            saveMessageString = "入库操作成功！";
        } catch (final Exception e) {
            e.printStackTrace();
        }
        return saveMessageString;
    }
}