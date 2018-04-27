package com.archibus.service.school.equipment;

import java.io.*;

import org.apache.log4j.Logger;

import com.archibus.ext.importexport.common.FileHelper;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

public class EqInventoryDownload extends JobBase {
    private final Logger log = Logger.getLogger(this.getClass());
    
    public String exportEqInventoryCheckList(final String file_name, final String dv_id,
            final String dp_id, final String chechMianId, final String table) {
        return exportTable(file_name, "taskdata.txt", dv_id, dp_id, chechMianId, table);
    }
    
    private String exportTable(final String viewFile, final String fileName, final String dv_id,
            final String dp_id, final String chechMianId, final String table) {
        try {
            final StringBuffer str =
                    new EqInventoryDDetail().getEqThInfo(dv_id, dp_id, chechMianId, table);
            // 如果str有数据 保存到txt中
            if (str.length() > 0) {
                // C:/ARCHIBUS/project/hg/archibus/projects/users/2006082/dt/
                final String filePath = FileHelper.getDefaultStorePath("");
                writeTxtFile(str.toString(), filePath, fileName);
                this.getStatus().setTotalNumber(100);
                final JobResult result =
                        new JobResult("设备盘点接口表", "设备盘点接口表-鼠标右键另存到本地", FileHelper.getFileURL(
                            fileName, ""));
                this.status.setResult(result);
                
                return FileHelper.getFileURL(fileName, "");
            }
            return null;
            
        } catch (final Exception e) {
            // @non-translatable
            throw new ExceptionBase(String.format("Fail to tansfer data with view name [%s]",
                viewFile), e);
        }
    }
    
    public String writeTxtFile(final String content, final String filePath, final String fileName) {
        final File file = new File(filePath);
        if (!file.exists()) {
            file.mkdir();
        }
        FileOutputStream out = null;
        try {
            
            // File txtFile = File.createTempFile(fileName, ".txt", new File(filePath));
            final File txtFile = new File(filePath + File.separator + fileName);
            if (!txtFile.exists()) {
                txtFile.createNewFile();
            }
            out = new FileOutputStream(txtFile);
            out.write(content.getBytes("GBK"));
            
            return file.getPath();
        } catch (final IOException e) {
            e.printStackTrace();
            return null;
        } finally {
            if (out != null) {
                try {
                    out.flush();
                    out.close();
                } catch (final IOException e) {
                    e.printStackTrace();
                }
                
            }
        }
    }
}
