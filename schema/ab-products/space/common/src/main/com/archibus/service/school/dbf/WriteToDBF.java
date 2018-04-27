package com.archibus.service.school.dbf;

import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;

public class WriteToDBF extends JobBase {
    
    public void write() {
        
        this.status.setResult(new JobResult("Building ZJ_DBF Files"));
        
        this.status.setTotalNumber(100);
        this.status.setCurrentNumber(3);
        this.status.setMessage("正在写入主机库");
        
        // 向S_ZJ.DBF中写入数据
        final WriteEqToSZJ wtszj = new WriteEqToSZJ();
        wtszj.writeToSzj(this.status);
        this.status.setCurrentNumber(70);
        // System.out.println("向主机库中写入数据完成");
        // 向变动库中写入数据
        this.status.setMessage("正在写入变动库");
        this.status.setResult(new JobResult("Building BDK_DBF Files"));
        final WriteEqToSBDK wtsbdk = new WriteEqToSBDK();
        wtsbdk.writeToSbdk();
        this.status.setCurrentNumber(90);
        
        this.status.setMessage("正在写入单位库");
        this.status.setResult(new JobResult("Building DW_DBF Files"));
        final WriteDvToSDW wtsdw = new WriteDvToSDW();
        wtsdw.writeToSdw();
        this.status.setCurrentNumber(100);
        this.status.setMessage("写入完成,请下载文件");
        
    }
    
    // public static void main(String[] args) {
    // new WriteToDBF().write();
    // }
}
