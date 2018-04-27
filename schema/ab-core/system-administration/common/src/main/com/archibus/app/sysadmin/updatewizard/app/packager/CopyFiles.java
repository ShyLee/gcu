package com.archibus.app.sysadmin.updatewizard.app.packager;

import java.io.*;

import com.archibus.app.sysadmin.updatewizard.app.property.MergePropertyFiles;
import com.archibus.app.sysadmin.updatewizard.app.util.AppUpdateWizardConstants;
import com.archibus.jobmanager.*;
import com.archibus.jobmanager.JobStatus.JobResult;
import com.archibus.utility.*;

/**
 * Copies files from ARCHIBUS path to a temporary one.
 * 
 * @author Catalin Purice
 * 
 */
public class CopyFiles {
    
    /**
     * Counter.
     */
    private long counter;
    
    /**
     * Job status.
     */
    private final JobStatus currentJobStatus;
    
    /**
     * Temporary ARCHIBUS war path.
     */
    private final String tempArchibusPath;
    
    /**
     * Temporary ARCHIBUS data war path.
     */
    private final String tempDataPath;
    
    /**
     * Temporary ARCHIBUS extension war path.
     */
    private final String tempExtensionPath;
    
    /**
     * Constructor.
     * 
     * @param appPackager Packager object
     */
    public CopyFiles(final Packager appPackager) {
        this.tempArchibusPath = appPackager.getTempArchibusPath();
        this.tempDataPath = appPackager.getTempDataPath();
        this.tempExtensionPath = appPackager.getTempExtensionPath();
        this.currentJobStatus = appPackager.getCurrentJobStatus();
        this.counter = appPackager.getCurrentJobStatus().getCurrentNumber();
    }
    
    /**
     * 
     * @param path path to copy files from
     * @throws IOException exception
     */
    public void copyDataFiles(final String path) throws IOException {
        
        String sourcePath = path;
        String destPath = "";
        
        if (StringUtil.isNullOrEmpty(path)) {
            sourcePath = this.tempDataPath;
            destPath = this.tempArchibusPath;
        } else {
            destPath = path.replace(this.tempDataPath, this.tempArchibusPath);
        }
        
        copyFilesFromTo(sourcePath, destPath);
    }
    
    /**
     * 
     * @param path path
     * @throws IOException exception
     */
    public void copyExtensionsFiles(final String path) throws IOException {
        
        String sourcePath = path;
        String destPath = "";
        
        if (StringUtil.isNullOrEmpty(path)) {
            sourcePath = this.tempExtensionPath;
            destPath = this.tempArchibusPath;
        } else {
            destPath = path.replace(this.tempExtensionPath, this.tempArchibusPath);
        }
        
        copyFilesFromTo(sourcePath, destPath);
    }
    
    /**
     * 
     * @param sourcePath source path
     * @param destPath destination path
     * @throws IOException exception
     */
    private void copyFilesFromTo(final String sourcePath, final String destPath) throws IOException {
        final File fSource = new File(sourcePath);
        final File[] files = fSource.listFiles();
        
        for (final File sourceFile : files) {
            
            if (sourceFile.isDirectory()) {
                final String folderPath = sourceFile.getPath();
                
                // check if the folder exist in destination. if not create it
                final String destFolderPath =
                        folderPath.replace(this.tempDataPath, this.tempArchibusPath).replace(
                            this.tempExtensionPath, this.tempArchibusPath);
                FileUtil.createFoldersIfNot(destFolderPath);
                copyFilesFromTo(sourceFile.getAbsolutePath(), destFolderPath);
            } else {
                copyFileTo(sourceFile, destPath);
            }
            this.currentJobStatus.setCurrentNumber(this.counter++);
        }
    }
    
    /**
     * 
     * @param sourceFile source file
     * @param destPath destination where the file will be copied
     * @throws IOException exception
     */
    private void copyFileTo(final File sourceFile, final String destPath) throws IOException {
        final String fullName = sourceFile.getName();
        final File destFile =
                PackagerUtilities.createFileNameIfNotExist(destPath + File.separator + fullName);
        
        final InputStream source = new FileInputStream(sourceFile);
        String fileExtension = "";
        
        if (destFile.getName().contains(PackagerConstants.SEPARATOR)) {
            fileExtension = fullName.substring(fullName.lastIndexOf('.'), fullName.length());
        }
        if (fileExtension.equals(PackagerConstants.CONFIGURATION_FILE_EXTENSION)
                && destFile.exists()
                && !fullName.equals(AppUpdateWizardConstants.DEPLOY_PACKAGE_FILE_NAME)) {
            final MergePropertyFiles mergeFiles = new MergePropertyFiles(sourceFile, destFile);
            mergeFiles.mergeFiles();
        } else {
            if (fileExtension.equals(PackagerConstants.CONFIGURATION_FILE_EXTENSION)
                    && !destFile.exists()) {
                this.currentJobStatus.addPartialResult(new JobResult("File copied: " + fullName));
            }
            final OutputStream dest = new FileOutputStream(destFile);
            
            final byte[] data = new byte[PackagerConstants.BUFFER_SIZE];
            int count = source.read(data, 0, PackagerConstants.BUFFER_SIZE);
            while (count != -1) {
                dest.write(data, 0, count);
                count = source.read(data, 0, PackagerConstants.BUFFER_SIZE);
            }
            dest.close();
        }
        source.close();
    }
    
}
