package com.archibus.service.school.tools;

import java.io.*;

import com.archibus.app.solution.common.fileaccess.FileAccessProviderFileSystem;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.utility.*;

/**
 * 
 * @author Administrator upload local file to remote folder which in web server building photo ,
 *         employee photo, parcel land photo, site photo archibus/projects/product/graphics/bl
 *         ---->building photo
 * 
 */
public class FileUpload extends EventHandlerBase {
    
    final String imageFormat = ".jpg";
    
    /**
     * get graphics
     * 
     * @return
     */
    protected static String getProjectGraphicsFolder() {
        return SchTools.getProjectFolder() + File.separator + "Graphics";
    }
    
    protected String getBuildingPhotoSavePath() {
        return getProjectGraphicsFolder() + File.separator + "bl";
    }
    
    protected String getEmpPhotoSavePath() {
        return getProjectGraphicsFolder() + File.separator + "em";
    }
    
    /**
     * parameter check 1 the Extension of fileName must jpg format 2 blId must have value
     * 
     * @param fileName
     * @param blId
     */
    public void uploadBlPhoto(final String fileName, final String blId) {
        if (FileUtil.getExtension(fileName) != this.imageFormat) {
            return;
        }
        final String folderPath = getBuildingPhotoSavePath();
        FileUtil.createFoldersIfNot(folderPath);
        
        final FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        final InputStream inputStream = fileAccessProviderFileSystem.readFile(fileName);
        
        // projects/hq/graphics/bl/01001.jpg
        final String remoteBlPhotoFileName = folderPath + File.separator + blId + this.imageFormat;
        // check if the photo already exist in server folder, first detele file
        if (FileFind.fileExists(remoteBlPhotoFileName)) {
            FileUtil.deleteFile(remoteBlPhotoFileName);
        }
        fileAccessProviderFileSystem.writeFile(inputStream, remoteBlPhotoFileName);
        
    }
    
    /**
     * parameter check 1 the Extension of fileName must jpg format 2 emId must have value
     * 
     * @param fileName
     * @param emId
     */
    public void uploadEmpPhoto(final String fileName, final String emId) {
        if (FileUtil.getExtension(fileName) != this.imageFormat) {
            return;
        }
        
        final String folderPath = getEmpPhotoSavePath();
        FileUtil.createFoldersIfNot(folderPath);
        
        final FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        final InputStream inputStream = fileAccessProviderFileSystem.readFile(fileName);
        
        // projects/hq/graphics/em/1000.jpg
        final String remoteEmpPhotoFileName = folderPath + File.separator + emId + this.imageFormat;
        
        // check if the photo already exist in server folder, first detele file
        if (FileFind.fileExists(remoteEmpPhotoFileName)) {
            FileUtil.deleteFile(remoteEmpPhotoFileName);
        }
        fileAccessProviderFileSystem.writeFile(inputStream, remoteEmpPhotoFileName);
    }
    
}
