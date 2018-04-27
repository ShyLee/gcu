package com.archibus.app.sysadmin.updatewizard.app.packager;

import java.io.*;
import java.util.*;

import com.archibus.app.sysadmin.updatewizard.app.util.*;
import com.archibus.context.ContextStore;

/**
 * @author Catalin Purice
 * 
 */
public class FileElement {
    
    /**
     * Line from property file.
     */
    private String line;
    
    /**
     * Path.
     */
    private String path;
    
    /**
     * Type: extension or jar file.
     */
    private String type;
    
    /**
     * 
     * @return list of elements from file
     * @throws IOException exception
     */
    
    public static List<FileElement> getElementsFromPrefFile() throws IOException {
        
        final List<FileElement> dataToPackageList = new ArrayList<FileElement>();
        
        final String filePath = AppUpdateWizardUtilities.getAppUpdPrefFilePath();
        
        // Open the file. Create if doesn't exist.
        // deployPrefObj.createFile(filePath);
        final FileInputStream fstream = new FileInputStream(filePath);
        final DataInputStream inStream = new DataInputStream(fstream);
        final BufferedReader buffRead = new BufferedReader(new InputStreamReader(inStream));
        String curLine = buffRead.readLine();
        
        // Read File Line By Line
        while (curLine != null) {
            final FileElement elem = new FileElement();
            elem.setLine(curLine);
            // ignore commented lines
            if (!elem.isComment() && elem.isValid()) {
                elem.setPathFromLine(curLine);
                elem.setTypeFromLine(curLine);
                if (elem.isAllFiles()) {
                    addAllFilesForElem(elem, dataToPackageList);
                } else {
                    addSomeFilesForElem(elem, dataToPackageList);
                }
            }
            curLine = buffRead.readLine();
        } // end while
          // Close the input stream
        buffRead.close();
        return dataToPackageList;
        
    }
    
    /**
     * 
     * @param elem file element
     * @param dataToPackageList all files
     */
    private static void addAllFilesForElem(final FileElement elem,
            final List<FileElement> dataToPackageList) {
        
        FileElement fileEntry = elem;
        
        final String parentPath = fileEntry.getParent();
        final File folder = new File(parentPath);
        if (folder.exists()) {
            final File[] filesList = folder.listFiles();
            int len = filesList.length;
            for (final File file : filesList) {
                fileEntry.setPath(file.getPath());
                fileEntry.setType(elem.getType());
                if (PackagerUtilities.isValidAndUniquePath(fileEntry, dataToPackageList)) {
                    dataToPackageList.add(fileEntry);
                }
                if (len > 1) {
                    fileEntry = new FileElement();
                    len--;
                }
            }
            if (len == 0) {
                // we need to pack the folder
                fileEntry.setType(fileEntry.getType());
                fileEntry.setPath(parentPath);
                dataToPackageList.add(fileEntry);
            }
        }
    }
    
    /**
     * 
     * @param elem file element
     * @param dataToPackageList all files
     */
    private static void addSomeFilesForElem(final FileElement elem,
            final List<FileElement> dataToPackageList) {
        // the entry is a wildcard
        if (elem.isWildcard()) {
            final String prefix = elem.getPrefix();
            final String extension = elem.getExtension();
            final String parent = elem.getParent();
            
            if (new File(parent).exists()) {
                getFilesFromFolder(dataToPackageList, elem, prefix, extension, parent);
            }
        } else if (elem.isFile() && PackagerUtilities.isValidAndUniquePath(elem, dataToPackageList)) {
            dataToPackageList.add(elem);
            /**
             * end if for wildcards the entry is a format <folder>\<filename>.<extension>
             */
        }
    }
    
    /**
     * 
     * @param folder path
     * @param prefix prefix
     * @param extension file extension
     * @return files from folder that match
     */
    private static File[] getFilenameByFilter(final String folder, final String prefix,
            final String extension) {
        final File dir = new File(folder);
        
        final FilenameFilter select = new FileListFilter(prefix, extension);
        return dir.listFiles(select);
    }
    
    /**
     * 
     * @param dataToPackageList all files in package
     * @param fileEntry file entry
     * @param prefix prefix
     * @param extension extension
     * @param parent parent folder
     */
    private static void getFilesFromFolder(final List<FileElement> dataToPackageList,
            final FileElement fileEntry, final String prefix, final String extension,
            final String parent) {
        
        FileElement localEntry = fileEntry;
        final File[] selectedFiles = getFilenameByFilter(parent, prefix, extension);
        int len = selectedFiles.length;
        for (final File f : selectedFiles) {
            localEntry.setPath(f.getPath());
            localEntry.setType(localEntry.getType());
            if (PackagerUtilities.isValidAndUniquePath(localEntry, dataToPackageList)) {
                dataToPackageList.add(localEntry);
            }
            if (len > 1) {
                localEntry = new FileElement();
                len--;
            }
        } // end for
    }
    
    /**
     * Gets extension of file.
     * 
     * @return string after "."
     */
    public String getExtension() {
        final String elementName = new File(this.getPath()).getName();
        final int beginIndex = elementName.lastIndexOf('.') + 1;
        final int endIndex = elementName.length();
        
        return elementName.substring(beginIndex, endIndex);
    }
    
    /**
     * @return the line
     */
    public String getLine() {
        return this.line;
    }
    
    /**
     * Get parent folder path.
     * 
     * @return parent folder path
     */
    public String getParent() {
        return new File(this.getPath()).getParent();
    }
    
    /**
     * Gets path.
     * 
     * @return this.path
     */
    public String getPath() {
        return this.path;
    }
    
    /**
     * Get file name with no extension.
     * 
     * @return prefix
     */
    public String getPrefix() {
        String prefix = "";
        final String elementName = new File(this.getPath()).getName();
        final int endIndex = elementName.indexOf('*');
        if (endIndex != 0) {
            prefix = elementName.substring(0, endIndex);
        }
        return prefix;
    }
    
    /**
     * Get type.
     * 
     * @return this.type
     */
    public String getType() {
        return this.type;
    }
    
    /**
     * @return true if all files were specified
     */
    public boolean isAllFiles() {
        boolean allFiles = false;
        if (this.getPath().endsWith(PackagerConstants.ALL_CHAR)) {
            allFiles = true;
        }
        return allFiles;
    }
    
    /**
     * Line is commented.
     * 
     * @return true if the line is commented
     */
    public boolean isComment() {
        return (this.line.length() > 0 && this.line.charAt(0) == AppUpdateWizardConstants.COMMENT_CHAR) ? true
                : false;
    }
    
    /**
     * @return true if the file exists
     */
    public boolean isFile() {
        boolean exists = false;
        final File file = new File(this.getPath());
        if (file.exists()) {
            exists = true;
        }
        return exists;
    }
    
    /**
     * 
     * @return true if is a jar file
     */
    public boolean isJarExpression() {
        final String entry = this.getPath();
        boolean isJar = false;
        if (entry.contains(AppUpdateWizardConstants.JAREXT)
                || entry.contains(AppUpdateWizardConstants.JAREXT.toUpperCase())) {
            isJar = true;
        }
        return isJar;
    }
    
    /**
     * Validate the line from file.
     * 
     * @return true if the line is valid
     */
    public boolean isValid() {
        boolean isValidLine = false;
        if (this.line.length() > 0 && PackagerUtilities.isValidLine(this.line)) {
            isValidLine = true;
        }
        return isValidLine;
    }
    
    /**
     * 
     * @return true if the line is a WILDCARD
     */
    public boolean isWildcard() {
        boolean isWildCard = false;
        final String parentName = new File(this.getPath()).getParent();
        if (new File(parentName).isDirectory()) {
            final String elementName = new File(this.path).getName();
            if (elementName.contains(PackagerConstants.ALL_CHAR)) {
                isWildCard = true;
            }
        }
        return isWildCard;
        
    }
    
    /**
     * @param lineStr line from file
     */
    public void setLine(final String lineStr) {
        this.line = lineStr;
    }
    
    /**
     * @param path the path to set
     */
    public void setPath(final String path) {
        this.path = path;
    }
    
    /**
     * Sets path.
     * 
     * @param curLine from file
     */
    public void setPathFromLine(final String curLine) {
        final int pos = curLine.indexOf('=') + 1;
        final String fileName = curLine.substring(pos, curLine.length());
        this.path = ContextStore.get().getWebAppPath().toString() + fileName;
    }
    
    /**
     * @param type the type to set
     */
    public void setType(final String type) {
        this.type = type;
    }
    
    /**
     * Set type of file.
     * 
     * @param curLine from file
     */
    public void setTypeFromLine(final String curLine) {
        final int pos = curLine.indexOf('=');
        final String lineRead = curLine.substring(0, pos);
        if (lineRead.contains(AppUpdateWizardConstants.DATA_PREFIX)) {
            this.type = AppUpdateWizardConstants.DATA_PREFIX;
        } else {
            this.type = AppUpdateWizardConstants.EXTENSION_PREFIX;
        }
    }
}
