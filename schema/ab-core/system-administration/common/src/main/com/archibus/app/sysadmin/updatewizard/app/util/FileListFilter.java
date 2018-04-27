package com.archibus.app.sysadmin.updatewizard.app.util;

import java.io.*;
import java.util.Locale;

/**
 * File Filter.
 * 
 * @author Catalin Purice
 * 
 */
public class FileListFilter implements FilenameFilter {
    /**
     * Name.
     */
    private final transient String name;
    
    /**
     * Extension.
     */
    private final transient String extension;
    
    /**
     * Constructor.
     * 
     * @param name @see {@link FileListFilter#name}
     * @param extension @see {@link FileListFilter#extension}
     */
    public FileListFilter(final String name, final String extension) {
        this.name = name.toLowerCase(Locale.getDefault());
        this.extension = extension.toLowerCase(Locale.getDefault());
    }
    
    /**
     * Returns true if the file matches condition.
     * 
     * @param directory folder name
     * @param filename file name
     * @return boolean
     */
    public boolean accept(final File directory, final String filename) {
        boolean fileOK = true;
        final String fname = filename.toLowerCase(Locale.getDefault());
        
        if (this.name != null) {
            fileOK &= fname.startsWith(this.name);
        }
        
        if (this.extension != null) {
            fileOK &= fname.endsWith('.' + this.extension);
        }
        return fileOK;
    }
}
