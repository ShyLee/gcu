package com.archibus.service.school;

import java.util.Map;

import com.archibus.context.ContextStore;
import com.archibus.context.utility.DataSourceContextTemplate;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;

public class SaveUploadFileItem extends EventHandlerBase {
    final static DataSource ds = DataSourceFactory.createDataSourceForFields("ts_doc_center",
        new String[] { "doc_name", "doc_encode", "doc_type", "doc_desc", "doc_uploader",
                "doc_download", "target_id", "file_type", "doc_id", "table_name" });
    
    public static void save(Map<String, String> map) {
        final String pk = map.get("pk");
        final String uploader = map.get("uploader");
        final String desc = map.get("desc");
        final String fileName = map.get("fileName");
        final String fileType = map.get("fileType");
        final String fileCodedName = map.get("fileCodedName");
        final String fileDownload = map.get("fileDownload");
        final String filetype = map.get("filetype");
        final String tableName = map.get("tableName");
        
        prepareDataSourceContext(ds);
        DataRecord dr = ds.createNewRecord();
        dr.setValue("ts_doc_center.doc_name", fileName);
        dr.setValue("ts_doc_center.doc_encode", fileCodedName);
        dr.setValue("ts_doc_center.doc_type", fileType);
        dr.setValue("ts_doc_center.doc_desc", desc);
        dr.setValue("ts_doc_center.doc_uploader", uploader);
        dr.setValue("ts_doc_center.doc_download", fileDownload);
        dr.setValue("ts_doc_center.target_id", pk);
        dr.setValue("ts_doc_center.file_type", filetype);
        dr.setValue("ts_doc_center.table_name", tableName);
        // final String sql =
        // "insert into ts_doc_center(doc_name,doc_encode,doc_type,doc_desc,doc_uploader,doc_download,) values("
        // + fileName
        // + ","
        // + fileCodedName
        // + ","
        // + fileType
        // + ","
        // + desc
        // + ","
        // + uploader + "," + fileDownload + "," + pk + ")";
        // System.err.println(SqlUtils.class.getName());
        // SqlUtils.executeUpdate("ts_doc_center", sql);
        // SqlUtils.commit();
        ds.saveRecord(dr);
        ds.commit();
    }
    
    public void delete(String docId) {
        prepareDataSourceContext(ds);
        DataRecord record = ds.getRecord("doc_id='" + docId + "'");
        ds.deleteRecord(record);
    }
    
    private static void prepareDataSourceContext(final DataSource ds) {
        if (ContextStore.get().getDbConnection() == null) {
            ContextStore.get().setDbConnection(
                ContextStore.get().getDatabase().getPool().getConnection());
        }
        
        if (ContextStore.get().getEventHandlerContext() == null) {
            DataSourceContextTemplate.prepareDataSourceContext(ds);
        }
        
    }
    
}
