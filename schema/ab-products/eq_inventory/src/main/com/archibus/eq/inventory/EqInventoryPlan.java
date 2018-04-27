package com.archibus.eq.inventory;

import java.io.*;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.*;

import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.ext.datatransfer.DataTransferUtility;
import com.archibus.ext.importexport.common.FileHelper;
import com.archibus.ext.importexport.exporter.*;
import com.archibus.jobmanager.JobBase;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.*;

public class EqInventoryPlan extends JobBase {
    private Logger log = Logger.getLogger(this.getClass());
    
    public String exportEqInventoryCheckList(String file_name,String ds,String restriction) {
     return  exportTable(file_name, ds, "taskdata.txt", restriction);
    }
    

    private String exportTable(String viewFile, String ds, String fileName, String restriction) {
        try {
            final DataSource dataSource = DataSourceFactory.loadDataSourceFromFile(viewFile, ds);
            dataSource.setContext();
            dataSource.setMaxRecords(0);
            final List<Map<String, String>> panelFieldsList =
                    DataTransferUtility.getPanelFeldsList(dataSource);
            
            
            final List<String> visibleFieldsFromMainTable =
                    DataTransferUtility.getVisibleFieldsFromMainTable(dataSource, panelFieldsList);
            final List<DataRecord> records = dataSource.getRecords("1=1");
            StringBuffer str =new StringBuffer();
            if(!records.isEmpty()){
                for ( DataRecord record : records) {
                     if(restriction.equals("eq")) {
                         StringBuffer tmpStr = new StringBuffer();
                         String eqId = record.getString("eq.eq_id");
                         String eqName = record.getString("eq.eq_name");
                         String blName = record.getString("bl.name");
                         String blId = record.getString("eq.bl_id");
                         String flId = record.getString("eq.fl_id");
                         String rmId = record.getString("eq.rm_id");
                         String emName = record.getString("eq.em_name");
                         Date purDate = record.getDate("eq.date_purchased");
                         String date ="";
                         if(null!=purDate && !"".equals(purDate)) {
                             SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                             date = sdf.format(purDate);
                         }
                         this.status.incrementCurrentNumber();
                         rmId = rmId==null?"":rmId;
                         String location=blName+"-"+flId+"-"+ rmId;
                         tmpStr.append(eqId).append("|0||").append(eqName).append("|").append(location).append("|").append(emName).append("|").append(date==null?"":date).append("\r\n") ;
                         str.append(tmpStr);
                     }else {
                         StringBuffer tmpStr = new StringBuffer();
                         String eqId = record.getString("eq_attach.eq_attach_id");
                         String eqName = record.getString("eq_attach.eq_attach_name");
                         String blName = record.getString("bl.name");
                         String blId = record.getString("eq_attach.bl_id");
                         String flId = record.getString("eq_attach.fl_id");
                         String rmId = record.getString("eq_attach.rm_id");
                         String emName = record.getString("eq_attach.em_name");
                         Date purDate = record.getDate("eq.date_purchased");
                         String date ="";
                         if(null!=purDate && !"".equals(purDate)) {
                             SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd");
                             date = sdf.format(purDate);
                         }
                         this.status.incrementCurrentNumber();
                         rmId = rmId==null?"":rmId;
                         String location=blName+"-"+flId+"-"+rmId;
                         tmpStr.append(eqId).append("|0||").append(eqName).append("|").append(location).append("|").append(emName).append("|").append(date==null?"":date).append("\r\n") ;
                         str.append(tmpStr);
                     }
                   
                }
            }
            //如果str有数据 保存到txt中
            if(str.length()>0) {
                //C:/ARCHIBUS/project/hg/archibus/projects/users/2006082/dt/
                String filePath = FileHelper.getDefaultStorePath("");
                writeTxtFile(str.toString(),filePath,fileName);
                String validatedFileName = filePath + File.separator + fileName;
              
                this.getStatus().setTotalNumber(records.size());
                final JobResult result = new JobResult("设备盘点接口表", "设备盘点接口表-鼠标右键另存到本地", FileHelper.getFileURL(fileName, ""));
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

    public String writeTxtFile(String content,String filePath,String fileName)
        {                                                                              
            File file = new File(filePath);
            if (!file.exists()) {
                file.mkdir();
            }
            FileOutputStream out =null;
            try {
                
                //File txtFile = File.createTempFile(fileName, ".txt", new File(filePath));
                File txtFile = new File(filePath+ File.separator + fileName);
                if(!txtFile.exists()) {
                    txtFile.createNewFile();
                }
                out = new FileOutputStream(txtFile);
                out.write(content.getBytes());
                             
                return file.getPath();
            } catch (IOException e) {
                e.printStackTrace();
                return null;
            }finally {
                if(out!=null) {
                    try {
                        out.flush();
                        out.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                  
                }
            }    
    }
        
    public String importReturnTaskData(String type,InputStream inputStream) {
        BufferedReader bufferedReader=null;  
        this.status.setCurrentNumber(0);
        try{  
             bufferedReader=new BufferedReader(new InputStreamReader(inputStream));  
             String read=null;  
                 while((read=bufferedReader.readLine())!=null){  
                       String [] eq=read.split("\\|");
                       this.status.incrementCurrentNumber();
                       updateStatus(type,eq[0],eq[1],eq[2]);
                 }  
        this.status.setCurrentNumber(100);
        }catch(Exception e){  
         e.printStackTrace();  
        }  
        return "";
   }
   
   public void  updateStatus(String type,String eqId,String status,String comments) {
       StringBuffer str = new StringBuffer("UPDATE ");
       if(type.equals("eq")) {
           str.append("eq set check_status = '").append(status +"',").append("comments='").append(comments+"' where eq_id='").append(eqId+"'");
       }else {
           str.append("eq_attach set check_status = '").append(status +"',").append("comments='").append(comments+"' where eq_attach_id='").append(eqId+"'"); 
       }
       SqlUtils.executeUpdate(type, str.toString());
       SqlUtils.commit();
   };
}
