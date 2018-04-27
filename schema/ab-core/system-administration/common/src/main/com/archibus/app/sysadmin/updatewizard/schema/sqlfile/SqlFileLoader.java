package com.archibus.app.sysadmin.updatewizard.schema.sqlfile;

import java.io.*;
import java.util.*;

/**
 * Loads files based on pattern.
 * 
 * @author Catalin
 * 
 */
public class SqlFileLoader {
    
    /**
     * Constant.
     */
    private static final String END_OF_SQL_CMD = ";";
    
    /**
     * Constant.
     */
    private static final String NEW_LINE = "\r\n";
    
    /**
     * File.
     */
    private final File file;
    
    /**
     * Partial job status.
     */
    private String partialJobStatus;
    
    /**
     * Constructor.
     * 
     * @param sqlFile sql file
     */
    public SqlFileLoader(final File sqlFile) {
        this.file = sqlFile;
        this.partialJobStatus = "";
    }
    
    /**
     * returns the sql commands from file.
     * 
     * @return sql commands
     * @throws IOException throws exception if file not found
     */
    public List<String> getSqlCommands() throws IOException {
        final FileReader fileReader = new FileReader(this.file);
        final LineNumberReader lnreader = new LineNumberReader(fileReader);
        final List<String> sqlCommands = new ArrayList<String>();
        String sqlCommand = "";
        String line = lnreader.readLine();
        while (line != null) {
            if (line.startsWith("--partialJobStatus=")) {
                this.partialJobStatus = line.substring(line.indexOf('=') + 1, line.length());
            } else if (line.length() > 0) {
                sqlCommand = loadSqlCommand(line, lnreader);
                sqlCommands.add(sqlCommand);
            }
            line = lnreader.readLine();
        }
        fileReader.close();
        lnreader.close();
        return sqlCommands;
    }
    
    /**
     * 
     * @param currentLine current line
     * @param lnreader line reader
     * @return sql command
     * @throws IOException exception
     */
    private String loadSqlCommand(final String currentLine, final LineNumberReader lnreader)
            throws IOException {
        String sqlCommand = currentLine;
        if (!currentLine.endsWith(END_OF_SQL_CMD)) {
            // check next line
            String line = lnreader.readLine();
            while (line != null) {
                if (line.length() == 0) {
                    break;
                } else if (line.endsWith(END_OF_SQL_CMD)) {
                    sqlCommand += NEW_LINE;
                    sqlCommand += line;
                    break;
                }
                sqlCommand += NEW_LINE;
                sqlCommand += line;
                line = lnreader.readLine();
            }
        }
        return (sqlCommand.endsWith(END_OF_SQL_CMD)) ? sqlCommand.substring(0,
            sqlCommand.length() - 1) : sqlCommand;
    }
    
    /**
     * 
     * @return partial job status
     */
    public String getPartialStatus() {
        return this.partialJobStatus;
    }
    
    /**
     * @return the file
     */
    public File getFile() {
        return this.file;
    }
}
