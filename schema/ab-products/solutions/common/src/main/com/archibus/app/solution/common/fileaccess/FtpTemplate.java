package com.archibus.app.solution.common.fileaccess;

import java.io.IOException;

import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.*;

/**
 * Helper class that simplifies code which uses FTPClient.
 * <p>
 * FTPClient-specific exceptions are mapped to ExceptionBase.
 * 
 * @author Valery Tydykov
 * @author Yong Shao
 * 
 */
public class FtpTemplate {
    /**
     * Callback interface to be used with FtpTemplate.
     * 
     * @author Valery Tydykov
     * 
     */
    interface Callback {
        Object doWith(FTPClient ftpClient) throws IOException, FTPException;
    }
    
    public FtpTemplate(String host, int port, String password, String username) {
        super();
        com.enterprisedt.util.license.License
            .setLicenseDetails("ARCHIBUSInc", "382-5943-6920-1248");
        this.ftpClient = this.createClient();
        this.host = host;
        this.port = port;
        this.password = password;
        this.username = username;
    }
    
    private final FTPClient ftpClient;
    
    private final String host;
    
    private final int port;
    
    private final String password;
    
    private final String username;
    
    protected FTPClient createClient() throws ExceptionBase {
        return new FTPClient();
    }
    
    /**
     * @param uri
     * @param ftp
     * @throws IOException
     * @throws FTPException
     */
    public void beforeConnect() throws IOException, FTPException {
        this.ftpClient.setRemoteHost(this.host);
        this.ftpClient.setRemotePort(this.port);
    }
    
    /**
     * @param inputStream
     * @param uri
     * @param ftp
     * @throws IOException
     * @throws FTPException
     */
    public void afterConnect() throws IOException, FTPException {
        this.ftpClient.login(this.username, this.password);
        this.ftpClient.setType(com.enterprisedt.net.ftp.FTPTransferType.BINARY);
    }
    
    public Object doOperation(Callback callback) throws ExceptionBase {
        Object result = null;
        try {
            beforeConnect();
            
            // TODO establishing connection might be an expensive operation (like database
            // connection)
            this.ftpClient.connect();
            
            afterConnect();
            
            // perform the actual operation with the ftpClient
            result = callback.doWith(this.ftpClient);
        } catch (Throwable ex) {
            // @translatable
            throw new ExceptionBase(null, "Operation with FTP server failed.", ex);
        } finally {
            cleanUp();
        }
        
        return result;
    }
    
    private void cleanUp() {
        try {
            this.ftpClient.quit();
        } catch (Throwable ex) {
            // @non-translatable
            throw new ExceptionBase(null, "Could not quit FtpClient", ex);
        }
    }
    
    /**
     * @return the ftpClient
     */
    public FTPClient getFtpClient() {
        return this.ftpClient;
    }
}
