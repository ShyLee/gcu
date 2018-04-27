package com.archibus.service.school.equipment;

import java.io.*;
import java.util.*;

import org.apache.log4j.Logger;

import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.common.FileHelper;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.ExceptionBase;

public class EqInventoryPlan extends JobBase {
    private final Logger log = Logger.getLogger(this.getClass());
    
    public String exportEqInventoryCheckList(final String file_name, final String ds,
            final String restriction) {
        return exportTable(file_name, ds, "taskdata.txt", restriction);
    }
    
    private String exportTable(final String viewFile, final String ds, final String fileName,
            final String restriction) {
        try {
            final DataSource dataSource = DataSourceFactory.loadDataSourceFromFile(viewFile, ds);
            dataSource.setContext();
            dataSource.setMaxRecords(0);
            final List<Map<String, String>> panelFieldsList =
                    DataTransferUtility.getPanelFeldsList(dataSource);
            
            DataTransferUtility.getVisibleFieldsFromMainTable(dataSource, panelFieldsList);
            final List<DataRecord> records = dataSource.getRecords("1=1");
            final StringBuffer str = new StringBuffer();
            if (!records.isEmpty()) {
                int temp1 = 0;
                int temp2 = 0;
                for (final DataRecord record : records) {
                    if (restriction.equals("eq")) {
                        final StringBuffer tmpStr = new StringBuffer();
                        final String eqId = record.getString("eq.eq_id");
                        final String eqName = record.getString("eq.eq_name");
                        final String blName = record.getString("bl.name");
                        record.getString("eq.bl_id");
                        final String flId = record.getString("eq.fl_id");
                        final String rmId = record.getString("eq.rm_id");
                        final String emName = record.getString("eq.em_name");
                        // record.getString("eq.date_purchased");
                        this.status.incrementCurrentNumber();
                        String location = "";
                        if (blName == null && flId == null && rmId == null) {
                            location = "";
                        } else if (blName != null && flId != null && rmId == null) {
                            location = blName + "-" + flId;
                        } else if (blName != null && flId == null && rmId == null) {
                            location = blName;
                        } else {
                            location = blName + "-" + flId + "-" + rmId;
                        }
                        if (temp1 == 0) {
                            tmpStr.append("设备编码|盘点数量|备注|资产名称|存放地点|使用人").append("\r\n");
                            temp1 = 1;
                            tmpStr.append(eqId).append("|0||").append(eqName == null ? "" : eqName)
                                .append("|").append(location).append("|")
                                .append(emName == null ? "" : emName).append("\r\n");
                        } else {
                            tmpStr.append(eqId).append("|0||").append(eqName == null ? "" : eqName)
                                .append("|").append(location).append("|")
                                .append(emName == null ? "" : emName).append("\r\n");
                        }
                        
                        str.append(tmpStr);
                    } else {
                        final StringBuffer tmpStr = new StringBuffer();
                        final String eqId = record.getString("eq_attach.eq_attach_id");
                        final String eqName = record.getString("eq_attach.eq_attach_name");
                        final String blName = record.getString("bl.name");
                        // record.getString("eq_attach.bl_id");
                        final String flId = record.getString("eq_attach.fl_id");
                        final String rmId = record.getString("eq_attach.rm_id");
                        final String emName = record.getString("eq_attach.em_name");
                        record.getString("eq_attach.date_purchased");
                        this.status.incrementCurrentNumber();
                        String location = "";
                        if (blName == null && flId == null && rmId == null) {
                            location = "";
                        } else if (blName != null && flId != null && rmId == null) {
                            location = blName + "-" + flId;
                        } else if (blName != null && flId == null && rmId == null) {
                            location = blName;
                        } else {
                            location = blName + "-" + flId + "-" + rmId;
                        }
                        if (temp2 == 0) {
                            tmpStr.append("设备附件编码|盘点数量|备注|资产名称|存放地点|使用人").append("\r\n");
                            temp2 = 1;
                            tmpStr.append(eqId).append("|0||").append(eqName == null ? "" : eqName)
                                .append("|").append(location).append("|")
                                .append(emName == null ? "" : emName).append("\r\n");
                        } else {
                            tmpStr.append(eqId).append("|0||").append(eqName == null ? "" : eqName)
                                .append("|").append(location).append("|")
                                .append(emName == null ? "" : emName).append("\r\n");
                            
                        }
                        str.append(tmpStr);
                    }
                    
                }
            }
            // 如果str有数据 保存到txt中
            if (str.length() > 0) {
                // C:/ARCHIBUS/project/hg/archibus/projects/users/2006082/dt/
                final String filePath = FileHelper.getDefaultStorePath("");
                writeTxtFile(str.toString(), filePath, fileName);
                this.getStatus().setTotalNumber(records.size());
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
            out.write(content.getBytes());
            
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
    
    public String importReturnTaskData(final String type, final InputStream inputStream) {
        BufferedReader bufferedReader = null;
        this.status.setCurrentNumber(0);
        try {
            bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
            String read = null;
            while ((read = bufferedReader.readLine()) != null) {
                final String[] eq = read.split("\\|");
                this.status.incrementCurrentNumber();
                updateStatus(type, eq[0], eq[1], eq[2]);
            }
            this.status.setCurrentNumber(100);
        } catch (final Exception e) {
            e.printStackTrace();
        }
        return "";
    }
    
    public void updateStatus(final String type, final String eqId, final String status,
            final String comments) {
        final StringBuffer str = new StringBuffer("UPDATE ");
        if (type.equals("eq")) {
            str.append("eq set check_status = '").append(status + "',").append("comments='")
                .append(comments + "' where eq_id='").append(eqId + "'");
        } else {
            str.append("eq_attach set check_status = '").append(status + "',").append("comments='")
                .append(comments + "' where eq_attach_id='").append(eqId + "'");
        }
        SqlUtils.executeUpdate(type, str.toString());
        SqlUtils.commit();
    };
}
