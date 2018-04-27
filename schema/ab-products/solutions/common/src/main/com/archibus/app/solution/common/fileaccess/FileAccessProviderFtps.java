/**
 * 
 */
package com.archibus.app.solution.common.fileaccess;

import com.archibus.utility.ExceptionBase;

/**
 * Provides read/write access to a file, using FTPS protocol.
 * <p>
 * FTPS is a secure implementation of FTP, whereby the FTP commands and the data are transmitted
 * over secure channels via SSL/TLS.
 * <p>
 * Each method invocation in this class opens, uses, and closes connection to FTP server. TODO
 * Opening connection to the FTP server might be an expensive operation (like database connection)
 * <p>
 * TODO Loading certificate file for each method invocation might be an expensive operation.
 * Documentation for the FTP library: @link
 * http://www.enterprisedt.com/products/edtftpjssl/examples/howto/index.html
 * 
 * @author Valery Tydykov
 * @author Yong Shao
 * 
 */
// TODO unit test
public class FileAccessProviderFtps extends AbstractFileAccessProviderFtp {
    
    /**
     * TODO absolute path? File name of the server certificate.
     */
    private String serverCertificateFileName;
    
    /**
     * TODO absolute path? File name of the client certificate.
     */
    private String clientCertificateFileName;
    
    /**
     * Passphrase for the client key.
     */
    private String clientKeyPassphrase;
    
    /**
     * @return the serverCertificateFileName
     */
    public String getServerCertificateFileName() {
        return this.serverCertificateFileName;
    }
    
    /**
     * @param serverCertificateFileName the serverCertificateFileName to set
     */
    public void setServerCertificateFileName(String serverCertificateFileName) {
        this.serverCertificateFileName = serverCertificateFileName;
    }
    
    /**
     * @return the clientKeyPassphrase
     */
    public String getClientKeyPassphrase() {
        return this.clientKeyPassphrase;
    }
    
    /**
     * @param clientKeyPassphrase the clientKeyPassphrase to set
     */
    public void setClientKeyPassphrase(String clientKeyPassphrase) {
        this.clientKeyPassphrase = clientKeyPassphrase;
    }
    
    /**
     * @return the clientCertificateFileName
     */
    public String getClientCertificateFileName() {
        return this.clientCertificateFileName;
    }
    
    /**
     * @param clientCertificateFileName the clientCertificateFileName to set
     */
    public void setClientCertificateFileName(String clientCertificateFileName) {
        this.clientCertificateFileName = clientCertificateFileName;
    }
    
    /**
     * @param uri
     * @return
     */
    @Override
    protected FtpTemplate createTemplate(String host, int port) throws ExceptionBase {
        FtpTemplate ftp = new FtpsTemplate(host, port, this.getPassword(), this.getUsername(),
            this.serverCertificateFileName, this.clientCertificateFileName,
            this.clientKeyPassphrase);
        
        return ftp;
    }
}
