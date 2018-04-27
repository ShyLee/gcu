package com.archibus.app.solution.common.fileaccess;

import java.io.*;

import com.archibus.utility.ExceptionBase;
import com.enterprisedt.net.ftp.*;
import com.enterprisedt.net.ftp.ssl.*;

/**
 * Helper class that simplifies code which uses SSLFTPClient.
 * <p>
 * SSLFTPClient-specific exceptions are mapped to ExceptionBase.
 * 
 * @author Valery Tydykov
 * @author Yong Shao
 * 
 */
public class FtpsTemplate extends FtpTemplate {
    
    /**
     * TODO absolute path? File name of the server certificate.
     */
    private final String serverCertificateFileName;
    
    /**
     * TODO absolute path? File name of the client certificate.
     */
    private final String clientCertificateFileName;
    
    private final String clientKeyPassphrase;
    
    public FtpsTemplate(String host, int port, String password, String username,
            String serverCertificateFileName, String clientCertificateFileName,
            String clientKeyPassphrase) {
        super(host, port, password, username);
        this.serverCertificateFileName = serverCertificateFileName;
        this.clientCertificateFileName = clientCertificateFileName;
        this.clientKeyPassphrase = clientKeyPassphrase;
    }
    
    @Override
    protected FTPClient createClient() throws ExceptionBase {
        try {
            return new SSLFTPClient();
        } catch (FTPException e) {
            // should not happen
            // @non-translatable
            throw new ExceptionBase(null, "Could not create SSLFTPClient", e);
        }
    }
    
    protected void doValidation() throws FileNotFoundException, IOException,
            SSLFTPCertificateException, FTPException {
        // TODO server validation?
        this.getFtpsClient().getRootCertificateStore()
            .importPEMFile(this.serverCertificateFileName);
        // TODO client validation?
        this.getFtpsClient().loadClientCertificate(this.clientCertificateFileName,
            this.clientKeyPassphrase);
    }
    
    SSLFTPClient getFtpsClient() {
        return (SSLFTPClient) this.getFtpClient();
    }
    
    @Override
    public void afterConnect() throws IOException, FTPException {
        // TODO ??? switch to SSL on control channel
        this.getFtpsClient().auth(SSLFTPClient.AUTH_TLS);
        
        super.afterConnect();
    }
    
    @Override
    public void beforeConnect() throws IOException, FTPException {
        super.beforeConnect();
        
        doValidation();
    }
}
