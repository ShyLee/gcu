package com.archibus.app.solution.common.fileaccess;

import java.io.*;
import java.util.Date;

import org.apache.log4j.Logger;

import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.utility.ExceptionBase;

/**
 * Provides functionality common to all classes implementing FileAccessProvider.
 * 
 * @author Valery Tydykov
 * @author Yong Shao
 * 
 */
public abstract class AbstractFileAccessProvider implements FileAccessProvider {
    /**
     * Logger for this class and subclasses.
     */
    protected final Logger logger = Logger.getLogger(this.getClass());
    
    /**
     * The folder where the accessed file is located. If file system is used as implementation, than
     * it must contain absolute folder path.
     */
    private String folder;
    
    public void writeFile(InputStream inputStream, String fileName) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("writeFile to [" + this.folder + "][" + fileName + "]");
        }
    }
    
    public InputStream readFile(String fileName) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("readFile from [" + this.folder + "][" + fileName + "]");
        }
        
        return null;
    }
    
    public Date getLastModified(String fileName) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("getLastModified for [" + this.folder + "][" + fileName + "]");
        }
        
        return null;
    }
    
    public long getSize(String fileName) throws ExceptionBase {
        if (this.logger.isDebugEnabled()) {
            this.logger.debug("getSize for [" + this.folder + "][" + fileName + "]");
        }
        
        return 0;
    }
    
    /**
     * @return the folder
     */
    public String getFolder() {
        return this.folder;
    }
    
    /**
     * @param folder the folder to set
     */
    public void setFolder(String folder) {
        this.folder = folder;
    }
    
    public File getFilePath(String fileName) {
        // combine folder with fileName.
        return new File(new File(this.getFolder()), fileName);
    }
}