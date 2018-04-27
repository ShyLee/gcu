package com.archibus.service.school;

import java.io.*;
import java.text.*;
import java.util.*;

import org.json.JSONObject;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.service.school.tools.FileFilterPrefix;
import com.archibus.utility.*;

public class BuildingWholeLifeCycleManage extends EventHandlerBase {
    private static Properties prop;
    
    private static String sourcepath;
    
    private static String targetpath;
    
    public static final String WEBAPP_ABSOLUTE_PATH = ContextStore.get().getWebAppPath();
    
    static final String ACTIVITY_ID = "AbSpaceRoomInventoryBAR";
    
    EventHandlerContext context = ContextStore.get().getEventHandlerContext();
    
    /**
     * 1 修改bl.acc_type的值为已下帐
     * 
     * @param blId
     */
    public void setAccTypeToYxz(final String blId) {
        final String sql = "UPDATE bl SET acc_type = 'yxz' WHERE bl_id='" + blId + "'";
        final DataSource ds = DataSourceFactory.createDataSource().addTable("bl").addQuery(sql);
        ds.executeUpdate();
        ds.commit();
    }
    
    /**
     * 2 将该建筑物数据拷贝到sc_bl_xz表中
     * 
     * @param blId
     */
    public void copyBlRecToXZ(final String blId) {
        
        // final String[] fields_list =
        // com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(this.context, "bl");
        final String[] fields_list =
                { "bl_id", "site_id", "pr_id", "name", "use1", "area_building_manual", "land_code",
                        "area_jianzhu_yuan", "area_rm", "area_use_net", "area_land",
                        "area_land_net", "area_underground", "area_bl_comn_gp", "area_gross_ext",
                        "count_upground", "count_underground", "gongtanlv", "address1",
                        "date_building_end", "date_use", "build_company", "rm_laiyuan",
                        "ownership_code", "acc_type", "ownship_shape", "status", "bl_situation",
                        "quake_grade", "construction_type", "building_cat", "dv_use", "fund_src",
                        "value_book", "value_market", "self_collected_funds", "contact_name",
                        "atype_code", "value_net" };
        String sql = "insert into sc_bl_xz (";
        
        final StringBuffer blField = new StringBuffer();
        final StringBuffer scBlXzField = new StringBuffer();
        
        for (int i = 0; i < fields_list.length; i++) {
            if (i != fields_list.length - 1) {
                scBlXzField.append(fields_list[i]);
                scBlXzField.append(",");
                blField.append("bl.");
                blField.append(fields_list[i]);
                blField.append(",");
            } else {
                scBlXzField.append(fields_list[i]);
                blField.append("bl.");
                blField.append(fields_list[i]);
            }
        }
        sql =
                sql + scBlXzField.toString() + ") select " + blField.toString()
                        + " from   bl where bl.bl_id=" + literal(this.context, blId);
        
        SqlUtils.executeUpdate("sc_bl_xz", sql);
        SqlUtils.commit();
    }
    
    /**
     * 3 补充保存表sc_bl_xz该建筑物有关下账的数据字段
     * 
     * @param blId
     */
    public void saveDataToScBlXz(final JSONObject blJsonRecord) {
        final DataSource scBlXzDS =
                DataSourceFactory.createDataSourceForFields("sc_bl_xz", new String[] { "bl_id",
                        "date_xiazhang", "status", "date_approved", "approved_by", "approved_dv",
                        "approved_doc", "operator_xiazhang", "date_operate" });
        final Map fieldValues = parseJSONObject(this.context, blJsonRecord);
        final Map values = stripPrefix(fieldValues);
        final String blId = (String) values.get("bl_id");
        final DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        Date date_approved;
        Date date_xiazhang;
        final DataRecord scBlXzRecord = scBlXzDS.getRecord(" sc_bl_xz.bl_id ='" + blId + "'");
        try {
            date_approved = df.parse(values.get("date_approved").toString());
            date_xiazhang = df.parse(values.get("date_xiazhang").toString());
        } catch (final ParseException e) {
            // @translatable
            final String msg =
                    "Error Step 3-BuildingWholeLifeCycle:saveDataToScBlXz()-ManageError attempting to parse date service date_approved and date_xiazhang end.";
            throw new ExceptionBase(null, msg, e);
        }
        scBlXzRecord.setValue("sc_bl_xz.date_xiazhang", date_xiazhang);
        scBlXzRecord.setValue("sc_bl_xz.status", values.get("status"));
        scBlXzRecord.setValue("sc_bl_xz.date_approved", date_approved);
        scBlXzRecord.setValue("sc_bl_xz.approved_by", values.get("approved_by"));
        scBlXzRecord.setValue("sc_bl_xz.approved_dv", values.get("approved_dv"));
        scBlXzRecord.setValue("sc_bl_xz.approved_doc", values.get("approved_doc"));
        scBlXzRecord.setValue("sc_bl_xz.operator_xiazhang", values.get("operator_xiazhang"));
        scBlXzRecord.setValue("sc_bl_xz.date_operate", Utility.currentDate());
        scBlXzDS.saveRecord(scBlXzRecord);
        scBlXzDS.commit();
        
    }
    
    /**
     * 4 将建筑物的房屋分类统计数据写入sc_his_rmcat_bl
     * 
     * @param blId
     */
    public void saveBlRmcatHisData(final String blId) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final String sql =
                "insert into sc_his_rmcat_bl(bl_id,dv_id,rm_cat,rm_type,area_rm,area_jianzhu,count_rm)"
                        + " select v.bl_id,v.dv_id,v.rm_cat,v.rm_type,v.area_shiyong,v.area_jianzhu,v.count_rm"
                        + " from sc_view_bldvcat v " + " where v.bl_id=" + literal(context, blId);
        SqlUtils.executeUpdate("sc_his_rmcat_bl", sql);
        SqlUtils.commit();
    }
    
    /**
     * 5 将文件目录中该建筑物的图纸文档保存到指定的“已下帐”目录下 .
     * 
     * @...\archibus\projects\yixiazhang
     * 
     * @param source
     * @param target
     * @param blId
     */
    static {
        InputStream in = null;
        final String dataPath =
                ContextStore.get().getWebAppPath() + File.separator + "WEB-INF" + File.separator
                        + "config" + File.separator + "yixiazhang.properties";
        try {
            in = new BufferedInputStream(new FileInputStream(new File(dataPath)));
            final Properties prop = new Properties();
            prop.load(in);
            sourcepath = prop.getProperty("sourcepath");
            targetpath = prop.getProperty("targetpath");
        } catch (final FileNotFoundException e) {
            e.printStackTrace();
        } catch (final IOException e) {
            e.printStackTrace();
        }
    }
    
    public void copyDrawingFileToYiXiaZhang(final JSONObject blJsonRecord) {
        final EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        final Map fieldValues = parseJSONObject(context, blJsonRecord);
        final Map values = stripPrefix(fieldValues);
        final String blId = (String) values.get("bl_id");
        
        final String sourcFilePath =
                ContextStore.get().getWebAppPath() + File.separator + getPathByString(sourcepath);
        final String tagartFilePath =
                ContextStore.get().getWebAppPath() + File.separator + getPathByString(targetpath);
        final File source = new File(sourcFilePath);
        final File target = new File(tagartFilePath);
        // 复制图形文件加到已下账目录下
        // D:\ARCHIBUS-soft\biulds\archibus\projects\yixiazhang
        createTargetFilePath(target);
        // 只有在复制成功的情况下才能删除图形文件
        if (copyDrawingFile(source, target, blId)) {
            // 删除原来的图形文件
            deleteDrawingFiles(source, blId);
        }
        
    }
    
    private String getPathByString(final String path) {
        final String[] folder = path.split(",");
        String npath = "";
        for (final String str : folder) {
            npath = npath + str + File.separator;
        }
        return npath;
    }
    
    /**
     * 如果目标目录不存在，则创建
     * 
     * @param target
     */
    private void createTargetFilePath(final File target) {
        
        if (!target.exists() && !target.isDirectory()) {
            target.mkdirs();
        }
    }
    
    /**
     * 目录中的文档保存到指定的目录下
     * 
     * @param source
     * @param target
     * @throws IOException
     */
    private boolean copyDrawingFile(final File source, final File target, final String blId) {
        final FileFilterPrefix myFilter = new FileFilterPrefix(blId + "-");
        final File[] files = source.listFiles(myFilter);
        
        for (final File file : files) {
            FileCopy.copy(FileCopy.copyToByteArray(file), new File(target.getPath()
                    + File.separator + file.getName()));
        }
        return true;
    }
    
    /**
     * 删除指定目录下下账建筑物的CAD文件
     * 
     * @param source
     */
    private void deleteDrawingFiles(final File source, final String blId) {
        final FileFilterPrefix myFilter = new FileFilterPrefix(blId + "-");
        final File[] fs = source.listFiles(myFilter);
        for (final File element : fs) {
            element.delete();
        }
    }
    
    /**
     * This function will log the error and throw a new Exception with the desired description
     * 
     * @param context
     * @param logMessage
     * @param exceptionMessage
     * @param originalException
     * @return void
     */
    protected static void handleException(final EventHandlerContext context,
            final String logMessage, final String exceptionMessage,
            final Throwable originalException) {
        context.addResponseParameter("message", exceptionMessage);
        throw new ExceptionBase(null, exceptionMessage, originalException);
    }
}
