package com.archibus.app.solution.common.fileaccess;

import java.io.*;
import java.util.Date;

import com.archibus.app.solution.common.fileaccess.FtpTemplate.Callback;
import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.*;

/**
 * Provides functionality common to all classes implementing FileAccessProvider for FTP: FTP and
 * FTPS.
 * 
 * @author Valery Tydykov
 * @author Yong Shao
 * 
 */
public abstract class AbstractFileAccessProviderFtp extends AbstractFileAccessProvider {
    
    /**
     * Host of FTP server.
     */
    private String host;
    
    /**
     * Port of FTP server.
     */
    private int port;
    
    /**
     * Username for FTP server.
     */
    private String username;
    
    /**
     * Password for FTP server.
     */
    private String password;
    
    /**
     * @return the username
     */
    public String getUsername() {
        return this.username;
    }
    
    /**
     * @param username the username to set
     */
    public void setUsername(String username) {
        this.username = username;
    }
    
    /**
     * @return the password
     */
    public String getPassword() {
        return this.password;
    }
    
    /**
     * @param password the password to set
     */
    public void setPassword(String password) {
        this.password = password;
    }
    
    @Override
    public void writeFile(final InputStream inputStream, final String fileName)
            throws ExceptionBase {
        super.writeFile(inputStream, fileName);
        
        FtpTemplate ftp = createTemplate(this.host, this.port);
        
        final String filePath = getFilePath(fileName).getPath();
        
        ftp.doOperation(new Callback() {
            public Object doWith(FTPClient ftpClient) throws IOException, FTPException {
                return ftpClient.put(inputStream, filePath);
            }
        });
    }
    
    @Override
    public InputStream readFile(final String fileName) throws ExceptionBase {
        super.readFile(fileName);
        
        FtpTemplate ftp = createTemplate(this.host, this.port);
        
        final String filePath = getFilePath(fileName).getPath();
        
        final InputStream inputStream = (InputStream) ftp.doOperation(new Callback() {
            public Object doWith(FTPClient ftpClient) throws IOException, FTPException {
                InputStream inputStream = null;
                if (ftpClient.exists(filePath)) {
                    // TODO: a better way???
                    ByteArrayOutputStream read = new ByteArrayOutputStream();
                    ftpClient.get(read, filePath);
                    inputStream = new ByteArrayInputStream(read.toByteArray());
                }
                
                return inputStream;
            }
        });
        
        return inputStream;
    }
    
    @Override
    public Date getLastModified(final String fileName) throws ExceptionBase {
        super.getLastModified(fileName);
        
        FtpTemplate ftp = createTemplate(this.host, this.port);
        
        final String filePath = getFilePath(fileName).getPath();
        
        final Date lastModified = (Date) ftp.doOperation(new Callback() {
            public Object doWith(FTPClient ftpClient) throws IOException, FTPException {
                Date lastModified = null;
                if (ftpClient.exists(filePath)) {
                    lastModified = ftpClient.modtime(filePath);
                }
                
                return lastModified;
            }
        });
        
        return lastModified;
    }
    
    @Override
    public long getSize(final String fileName) throws ExceptionBase {
        super.getSize(fileName);
        
        FtpTemplate ftp = createTemplate(this.host, this.port);
        
        final String filePath = getFilePath(fileName).getPath();
        
        final Long size = (Long) ftp.doOperation(new Callback() {
            public Object doWith(FTPClient ftpClient) throws IOException, FTPException {
                long size = 0;
                if (ftpClient.exists(filePath)) {
                    size = ftpClient.size(filePath);
                }
                
                return Long.valueOf(size);
            }
        });
        
        return size;
    }
    
    abstract protected FtpTemplate createTemplate(String host, int port) throws ExceptionBase;
    
    /**
     * @return the host
     */
    public String getHost() {
        return this.host;
    }
    
    /**
     * @param host the host to set
     */
    public void setHost(String host) {
        this.host = host;
    }
    
    /**
     * @return the port
     */
    public int getPort() {
        return this.port;
    }
    
    /**
     * @param port the port to set
     */
    public void setPort(int port) {
        this.port = port;
    }
}