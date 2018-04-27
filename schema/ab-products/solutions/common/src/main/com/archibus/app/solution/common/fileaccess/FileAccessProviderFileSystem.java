package com.archibus.app.solution.common.fileaccess;

import java.io.*;
import java.util.*;

import com.archibus.context.ContextStore;
import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.service.school.cad.CadDrawingAcessHelper;
import com.archibus.utility.*;

/**
 * Provides read/write access to a file. File is accessed using file system.
 * 
 * @author Valery Tydykov
 * @author Yong Shao
 * 
 */
// TODO unit test
public class FileAccessProviderFileSystem extends AbstractFileAccessProvider implements
        FileAccessProvider {
    // 通过配置文件的形式来确定CAD图纸是否备份
    private static Boolean isBackUp = false;
    static {
        InputStream in = null;
        
        final String dataPath =
                ContextStore.get().getWebAppPath() + File.separator + "WEB-INF" + File.separator
                        + "config" + File.separator + "drawing-backup.properties";
        
        try {
            
            in = new BufferedInputStream(new FileInputStream(new File(dataPath)));
            final Properties prop = new Properties();
            prop.load(in);
            final String flag = (String) prop.get("isBackUp");
            if (null != flag && "true".equals(flag)) {
                isBackUp = true;
            }
        } catch (final FileNotFoundException e) {
            e.printStackTrace();
        } catch (final IOException e) {
            e.printStackTrace();
        }
    }
    
    @Override
    public void writeFile(final InputStream inputStream, final String fileName)
            throws ExceptionBase {
        if (isBackUp) {
            if (null != fileName && fileName.toLowerCase().endsWith(".dwg")) {
                CadDrawingAcessHelper.afterWriteFile(fileName);
            }
        }
        super.writeFile(inputStream, fileName);
        FileCopy.copy(inputStream, getFilePath(fileName));
    }
    
    @Override
    public InputStream readFile(final String fileName) throws ExceptionBase {
        super.readFile(fileName);
        
        InputStream inputStream = null;
        try {
            inputStream = new FileInputStream(getFilePath(fileName));
        } catch (final FileNotFoundException e) {
            // @translatable
            final String pattern =
                    "File=[{0}/{1}] is missing. Please contact your system administrator.";
            
            final ExceptionBase exception =
                    ExceptionBaseFactory.newTranslatableException(pattern,
                        new Object[] { this.getFolder(), fileName });
            exception.setNested(e);
            throw exception;
        }
        
        return inputStream;
    }
    
    @Override
    public Date getLastModified(final String fileName) {
        super.getLastModified(fileName);
        
        return FileUtil.getLastModified(getFilePath(fileName).getPath());
    }
    
    @Override
    public long getSize(final String fileName) {
        super.getSize(fileName);
        
        return FileUtil.getSize(getFilePath(fileName).getPath());
    }
}
