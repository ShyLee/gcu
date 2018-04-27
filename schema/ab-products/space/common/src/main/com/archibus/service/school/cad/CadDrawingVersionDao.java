package com.archibus.service.school.cad;

import java.util.List;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.*;

/**
 * @author Guo Jiangtao gary627@139.com
 * 
 *         Cad drawing version data access object
 */
public class CadDrawingVersionDao {
    
    /**
     * update file name of drawing.
     * 
     * @param dwgName drawing name
     * @param fileName file name
     */
    static public void updateDwgVersionFileName(final String dwgName, final String fileName) {
        // define datasource
        final DataSource dwgVersionDS = DataSourceFactory.createDataSource();
        dwgVersionDS.addTable("afm_dwgvers").addField("dwg_name").addField("auto_number")
            .addField("file_name").addField("action")
            .addSort("afm_dwgvers", "auto_number", DataSource.SORT_DESC);
        
        // add restriction
        final ParsedRestrictionDef restriction = new ParsedRestrictionDef();
        restriction.addClause("afm_dwgvers", "dwg_name",
            dwgName.toUpperCase().substring(0, dwgName.lastIndexOf(".dwg")), Operation.EQUALS);
        restriction.addClause("afm_dwgvers", "action", "In", Operation.EQUALS);
        
        // get drawing version record and update latest version file name
        final List<DataRecord> list = dwgVersionDS.getRecords(restriction);
        if (!list.isEmpty()) {
            final DataRecord record = list.get(0);
            record.setValue("afm_dwgvers.file_name", fileName);
            dwgVersionDS.saveRecord(record);
        }
    }
}
