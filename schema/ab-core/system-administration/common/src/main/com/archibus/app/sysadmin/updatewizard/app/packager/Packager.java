package com.archibus.app.sysadmin.updatewizard.app.packager;

import java.io.*;
import java.util.List;
import java.util.zip.*;

import com.archibus.app.sysadmin.updatewizard.app.util.AppUpdateWizardConstants;
import com.archibus.context.ContextStore;
import com.archibus.jobmanager.JobStatus;

/**
 * Implements Package functionality.
 * 
 * @author Catalin Purice
 * 
 */
public class Packager {
    
    /**
     * Constant.
     */
    private static final String DOUBLE_PATH_SEPARATOR = "\\";
    
    /**
     * Constant.
     */
    private static final String PATH_SEPARATOR = "/";
    
    /**
     * Constant.
     */
    private static final String TEMP_SUFFIX = "temp_";
    
    /**
     * ARCHIBUS base path.
     */
    private final String afmBase = ContextStore.get().getWebAppPath().toString();
    
    /**
     * Counter.
     */
    private int counter;
    
    /**
     * Current status job.
     */
    private final JobStatus currentJobStatus;
    
    /**
     * temporary ARCHIBUS path.
     */
    private final String tempArchibusPath;
    
    /**
     * Temporary data path.
     */
    private final String tempDataPath;
    
    /**
     * Temporary folder.
     */
    private final String tempDir;
    
    /**
     * Temporary extension path.
     */
    private final String tempExtensionPath;
    
    /**
     * Time stamp.
     */
    private final String timeStamp;
    
    /**
     * Constructor.
     * 
     * @param counter counter
     * @param status JobStatus
     */
    public Packager(final int counter, final JobStatus status) {
        this.counter = counter;
        this.currentJobStatus = status;
        this.timeStamp = PackagerUtilities.calculateTimeStamp();
        this.tempDataPath =
                getArchibusParentPath() + File.separator + TEMP_SUFFIX + this.timeStamp
                        + File.separator + AppUpdateWizardConstants.DATA_PREFIX;
        
        this.tempExtensionPath =
                getArchibusParentPath() + File.separator + TEMP_SUFFIX + this.timeStamp
                        + File.separator + "extensions";
        
        this.tempArchibusPath =
                getArchibusParentPath() + File.separator + TEMP_SUFFIX + this.timeStamp
                        + File.separator + "deployment";
        this.tempDir = getArchibusParentPath() + File.separator + TEMP_SUFFIX + this.timeStamp;
    }
    
    /**
     * Adds specified folder to ZipOutputStream object.
     * 
     * @param dirObj File
     * @param out ZipOutputStream
     * @throws IOException exception
     */
    private void addDir(final File dirObj, final ZipOutputStream out) throws IOException {
        
        final File[] files = dirObj.listFiles();
        
        for (final File element : files) {
            
            if (element.isDirectory()) {
                addDir(element, out);
                continue;
            }
            final String path = element.getAbsolutePath();
            final FileInputStream inStream = new FileInputStream(path);
            
            // ignore the base path when zipping
            final String filePathToZip = path.substring(this.afmBase.length() + 1, path.length());
            
            out.putNextEntry(new ZipEntry(filePathToZip));
            
            writeFileToZip(inStream, out);
            
            inStream.close();
            this.currentJobStatus.setCurrentNumber(this.counter++);
        }
    }
    
    /**
     * 
     * @param dirObj folder
     * @param out ZipOutputStream
     * @throws IOException exception
     */
    private void addDirToFinalWAR(final File dirObj, final ZipOutputStream out) throws IOException {
        final String afmBasePath = this.tempArchibusPath;
        
        // find all files and sub-directories at the top level
        final File[] files = dirObj.listFiles();
        for (final File element : files) {
            
            // form the relative file path for the ZIP entry
            final String path = element.getAbsolutePath();
            String filePathToZip = path.substring(afmBasePath.length() + 1, path.length());
            
            // add directory ZIP entry (otherwise servlet containers will not deploy the WAR)
            filePathToZip = filePathToZip.replace(DOUBLE_PATH_SEPARATOR, PATH_SEPARATOR);
            
            if (element.isDirectory()) {
                out.putNextEntry(new ZipEntry(filePathToZip + PATH_SEPARATOR));
                
                // process all files inside this sub-directory
                addDirToFinalWAR(element, out);
                
            } else {
                out.putNextEntry(new ZipEntry(filePathToZip));
                
                // read the file content and copy it into the ZIP output stream
                final FileInputStream input = new FileInputStream(path);
                
                writeFileToZip(input, out);
                
                input.close();
            }
            
            this.currentJobStatus.setCurrentNumber(this.counter++);
        }
    }
    
    /**
     * Gets parent folder of ARCHIBUS path.
     * 
     * @return parent folder
     */
    private String getArchibusParentPath() {
        final String path = ContextStore.get().getWebAppPath().toString();
        return new File(path).getParent().toString();
    }
    
    /**
     * @return the currentJobStatus
     */
    public JobStatus getCurrentJobStatus() {
        return this.currentJobStatus;
    }
    
    /**
     * Used for Job counter.
     * 
     * @return no of files to ZIP
     */
    public int getNoArchibusFilesToZip() {
        int count = 0;
        final String path = this.tempArchibusPath;
        final File file = new File(path);
        final File[] elements = file.listFiles();
        for (final File element : elements) {
            if (element.isDirectory()) {
                count = count + PackagerUtilities.countFiles(element);
            } else {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @return the tempArchibusPath
     */
    public String getTempArchibusPath() {
        return this.tempArchibusPath;
    }
    
    /**
     * @return the tempDataPath
     */
    public String getTempDataPath() {
        return this.tempDataPath;
    }
    
    /**
     * @return the tempDir
     */
    public String getTempDir() {
        return this.tempDir;
    }
    
    /**
     * @return the tempExtensionPath
     */
    public String getTempExtensionPath() {
        return this.tempExtensionPath;
    }
    
    /**
     * @return the timeStamp
     */
    public String getTimeStamp() {
        return this.timeStamp;
    }
    
    /**
     * Increments job counter.
     */
    public void incrementJobCounter() {
        this.currentJobStatus.setCurrentNumber(this.counter++);
    }
    
    /*
     * private void mergeAppPropertiesFile(File source, File dest) throws IOException {
     * 
     * FileInputStream fstream = new FileInputStream(dest); DataInputStream in = new
     * DataInputStream(fstream); BufferedReader br = new BufferedReader(new InputStreamReader(in));
     * String strLine; // Read File Line By Line List<Data> destParameters = new ArrayList<Data>();
     * while ((strLine = br.readLine()) != null) { Data elem = new Data(); elem.setLine(strLine); if
     * (!elem.isComment() && elem.isValid()) { // ignore commented lines elem.setType(strLine);
     * elem.setPath(strLine); destParameters.add(elem); } } // Close the input stream in.close();
     * List<Data> sourceParameters = getElementsFromPrefFile(); List<Data> toAddParameters = new
     * ArrayList<Data>();
     * 
     * for (Data sParam : sourceParameters) { for (Data dParam : destParameters) { if
     * (sParam.getType().equals(dParam.getType()) && !sParam.getPath().equals(dParam.getPath())) {
     * toAddParameters.add(sParam); } } }
     * 
     * FileWriter fw = new FileWriter(dest, true); for (Data param : toAddParameters) {
     * fw.write(param.line); fw.write("\r\n"); } }
     */
    
    /**
     * 
     */
    protected void resetCounter() {
        this.counter = 0;
    }
    
    /**
     * 
     * @throws IOException exception
     */
    public void writeAppDataZip() throws IOException {
        
        final List<FileElement> dataToPackageList = FileElement.getElementsFromPrefFile();
        final List<String> dataPathsToZip = PackagerUtilities.getDataPathsToZip(dataToPackageList);
        if (!dataPathsToZip.isEmpty()) {
            
            final FileOutputStream dest =
                    new FileOutputStream(this.afmBase + File.separator
                            + AppUpdateWizardConstants.DATA_WAR_FILE_NAME);
            final ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(dest));
            
            try {
                writeEntriesToZip(dataPathsToZip, out);
            } catch (final IOException ioEx) {
                throw ioEx;
            } finally {
                if (out != null) {
                    out.flush();
                    out.close();
                }
            }
        }
    }
    
    /**
     * 
     * @throws IOException exception
     */
    public void writeAppExtensionsZip() throws IOException {
        
        final List<FileElement> dataToPackageList = FileElement.getElementsFromPrefFile();
        final List<String> extensionFilesToZip =
                PackagerUtilities.getExtensionPathsToZip(dataToPackageList);
        
        if (!extensionFilesToZip.isEmpty()) {
            
            final FileOutputStream dest =
                    new FileOutputStream(this.afmBase + File.separator
                            + AppUpdateWizardConstants.EXTENSION_WAR_FILE_NAME);
            final ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(dest));
            
            try {
                writeEntriesToZip(extensionFilesToZip, out);
            } catch (final IOException ioEx) {
                throw ioEx;
            } finally {
                if (out != null) {
                    out.flush();
                    out.close();
                }
            }
        }
        
    }
    
    /**
     * 
     * @param filesToZip files to package
     * @param outputZip output ZIP
     * @throws IOException throw in case there are any issues writing the ZIP file.
     */
    private void writeEntriesToZip(final List<String> filesToZip, final ZipOutputStream outputZip)
            throws IOException {
        for (final String path : filesToZip) {
            final String newPath = path.replace(PackagerConstants.ALL_CHAR, "");
            final File elemObj = new File(newPath);
            
            if (elemObj.exists()) {
                
                if (elemObj.isDirectory()) {
                    addDir(elemObj, outputZip);
                } else {
                    
                    final String filePath = elemObj.getAbsolutePath();
                    final FileInputStream input = new FileInputStream(newPath);
                    
                    // ignore the base path when zipping
                    // path = path.replace(tempArchibusPath + "\\", "");
                    final String filePathToZip =
                            filePath.substring(this.afmBase.length() + 1, filePath.length());
                    
                    outputZip.putNextEntry(new ZipEntry(filePathToZip));
                    
                    writeFileToZip(input, outputZip);
                    
                    input.close();
                    this.currentJobStatus.setCurrentNumber(this.counter++);
                }
            }
        }
    }
    
    /**
     * 
     * @param input input stream
     * @param outputZip output archive
     * @throws IOException exception
     */
    private void writeFileToZip(final FileInputStream input, final ZipOutputStream outputZip)
            throws IOException {
        final byte[] data = new byte[PackagerConstants.BUFFER_SIZE];
        int count = input.read(data, 0, PackagerConstants.BUFFER_SIZE);
        while (count != -1) {
            outputZip.write(data, 0, count);
            count = input.read(data, 0, PackagerConstants.BUFFER_SIZE);
        }
    }
    
    /**
     * 
     * @throws IOException throws exception in case WAR file cannot be written
     */
    public void writeFinalArchibusWAR() throws IOException {
        
        final FileOutputStream dest =
                new FileOutputStream(this.tempDir + File.separator
                        + AppUpdateWizardConstants.ARCHIBUS_WAR);
        final ZipOutputStream out = new ZipOutputStream(new BufferedOutputStream(dest));
        
        final File dirObj = new File(this.tempArchibusPath);
        try {
            addDirToFinalWAR(dirObj, out);
        } catch (final IOException ioEx) {
            throw ioEx;
        } finally {
            if (out != null) {
                out.flush();
                out.close();
            }
        }
    }
}