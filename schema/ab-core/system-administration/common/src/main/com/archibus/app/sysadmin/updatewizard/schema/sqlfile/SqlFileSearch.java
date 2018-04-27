package com.archibus.app.sysadmin.updatewizard.schema.sqlfile;

import java.io.File;
import java.util.*;

/**
 * Search for files in /archibus based on pattern.
 * 
 * @author Catalin
 * 
 */
public class SqlFileSearch extends SqlFileFilter {
    
    /**
     * sql finded files.
     */
    private final List<File> findedFiles;
    
    /**
     * Constructor.
     * 
     * @param dbType database type
     */
    public SqlFileSearch(final String dbType) {
        super(dbType);
        this.findedFiles = new ArrayList<File>();
    }
    
    /**
     * search for files and initialize the member files.
     * 
     * @param dir folder
     * @return this
     */
    public SqlFileSearch search(final File dir) {
        final File[] sqlFiles = dir.listFiles(this);
        if (sqlFiles.length > 0) {
            addFiles(sqlFiles);
        }
        final File[] files = dir.listFiles();
        for (final File file : files) {
            if (file.isDirectory()) {
                search(file);
            }
        }
        return this;
    }
    
    /**
     * Adds files.
     * 
     * @param filesFound founded files
     */
    private void addFiles(final File[] filesFound) {
        if (filesFound.length > 0) {
            for (final File file : filesFound) {
                this.findedFiles.add(file);
            }
        }
    }
    
    /**
     * @return the findedFiles
     */
    public List<File> getFindedFiles() {
        return this.findedFiles;
    }
    
}
