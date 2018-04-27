package com.archibus.service.school.cad;

import java.io.File;

import com.archibus.context.*;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.ext.report.ReportUtility;
import com.archibus.jobmanager.JobBase;
import com.archibus.utility.FileCopy;

/**
 * CAD drawings download service.
 * 
 * @author Guo Jiangtao gary627@139.com
 */
public class CadDrawingDownloadService extends JobBase {
    
    /**
     * download cad drawing.
     * D:\ProgramFiles\eclipse-archibus\workspaces\tsing\/projects/hq/drawings
     * @param fileName file name.
     */
    public String download(final String fileName) {
        
        final Context context = ContextStore.get();
        final FileAccessProvider fileProvider =
                (FileAccessProvider) context.getBean("fileAccessProviderForDrawings");
        
        // set the total number of steps
        this.status.setTotalNumber(50);
        
        // backup before save new check in file
        if (fileProvider.getFilePath(fileName).exists()) {
            deleteOldFilesInUserFolder();
            String folder=ReportUtility.getReportFilesStorePath(context);
            File storeFolder =new File(folder);    
            //如果文件夹不存在则创建    
            if  (!storeFolder .exists()  && !storeFolder .isDirectory())      
            {       
                storeFolder .mkdir();    
            }
            FileCopy.copy(fileProvider.readFile(fileName),
                new File(folder + fileName));

            FileCopy.copy(fileProvider.readFile(fileName),
                new File(folder + fileName));
            // this.status.setResult(new JobResult(getLocalMessage(JOB_TITLE) + " " + fileName,
            // fileName, context.getContextPath()
            // + ReportUtility.getPerUserReportFilesPath(context) + fileName));
            // this.status.setMessage(getLocalMessage(success_message));
            
            // } else {
            // this.status
            // .setResult(new JobResult(getLocalMessage(JOB_TITLE) + " " + fileName, "", ""));
            // this.status.setMessage(getLocalMessage(file_not_exist_message));
            // }
            //
            // this.status.setTotalNumber(100);
            final String url =
                    context.getContextPath() + ReportUtility.getPerUserReportFilesPath(context)
                            + fileName;
            return url;
        }
        return "The selected drawing not exist in server!";
        
    }
    
    /**
     * delete old files of users.
     * 
     */
    private void deleteOldFilesInUserFolder() {
        final String folder = ReportUtility.getReportFilesStorePath(ContextStore.get());
        final File folderDir = new File(folder);
        if (folderDir.exists() && folderDir.isDirectory()) {
            final File[] files = folderDir.listFiles();
            for (final File file : files) {
                if (file.isFile()) {
                    file.delete();
                }
            }
        }
        
    }
    
    /**
     * delete old files of users.
     * 
     */
    private String getLocalMessage(final String message) {
        return EventHandlerBase.localizeString(ContextStore.get().getCurrentContext(), message,
            CadDrawingDownloadService.class.getName());
        
    }
}
