package com.archibus.service.school.cad;

import java.io.File;

import com.archibus.context.*;
import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.utility.*;

/**
 * @author Guo Jiangtao gary627@139.com
 * 
 *         Cad drawing file access helper
 */
public class CadDrawingAcessHelper {
    
    /**
     * call back method after checkin new version file
     * 
     * @param fileName file name
     * @param backupFileName backup file name
     */
    static public void afterWriteFile(final String fileName) {
        
        String backupFileName = "";
        final Context context = ContextStore.get();
        final FileAccessProvider fileProvider =
                (FileAccessProvider) context.getBean("fileAccessProviderForDrawings");
        
        if (fileName != null && !"".equalsIgnoreCase(fileName)
                && fileName.toLowerCase().endsWith(".dwg")) {
            final String date = DateTime.dateToString(Utility.currentDate(), "yyyy-MM-dd");
            final String time = DateTime.timeToString(Utility.currentTime(), "HH-mm-ss");
            backupFileName = fileName.split(".dwg")[0] + "_" + date + "-" + time + ".dwg";
        }
        FileCopy.copy(fileProvider.readFile(fileName), new File(fileProvider.getFolder()
                + File.separator + backupFileName));
        CadDrawingVersionDao.updateDwgVersionFileName(fileName, backupFileName);
    }
    
    /**
     * call back method after checkout drawing file
     * 
     * @param fileName file name
     */
    static public void afterReadFile(final String fileName) {
        
    }
    
}
