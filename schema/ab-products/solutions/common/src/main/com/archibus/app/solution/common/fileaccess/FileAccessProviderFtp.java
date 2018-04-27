package com.archibus.app.solution.common.fileaccess;

import com.archibus.utility.ExceptionBase;

/**
 * Provides read/write access to a file, using FTP protocol.
 * <p>
 * Each method invocation in this class opens, uses, and closes connection to FTP server. TODO
 * Opening connection to the FTP server might be an expensive operation (like database connection)
 * <p>
 * Documentation for the FTP library: @link
 * http://www.enterprisedt.com/products/edtftpjssl/examples/howto/index.html
 * 
 * @author Valery Tydykov
 * @author Yong Shao
 * 
 */
// TODO unit test
public class FileAccessProviderFtp extends AbstractFileAccessProviderFtp {
    
    /**
     * @param uri
     * @return
     */
    @Override
    protected FtpTemplate createTemplate(String host, int port) throws ExceptionBase {
        FtpTemplate ftp = new FtpTemplate(host, port, this.getPassword(), this.getUsername());
        return ftp;
    }
}
