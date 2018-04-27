package com.archibus.service.school.tools;

import java.io.*;

public class FileFilterPrefix implements FilenameFilter {
    String prefix = ".";
    
    public FileFilterPrefix(final String fileBeginWith) {
        this.prefix = fileBeginWith;
    }
    
    public boolean accept(final File dir, final String name) {
        return name.startsWith(this.prefix);
    }
}
