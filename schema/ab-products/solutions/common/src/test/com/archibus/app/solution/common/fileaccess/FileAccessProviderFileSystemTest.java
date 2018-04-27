/**
 * 
 */
package com.archibus.app.solution.common.fileaccess;

import java.io.*;
import java.net.*;
import java.util.Date;

import junit.framework.TestCase;

import com.archibus.app.solution.common.fileaccess.FileAccessProviderFileSystem;
import com.archibus.ext.fileaccess.FileAccessProvider;
import com.archibus.utility.*;

/**
 * @author tydykov
 * 
 */
public class FileAccessProviderFileSystemTest extends TestCase {

    private static final String TEST_FILE_CONTENT = "Test file content.";

    /**
     * Test method for
     * {@link com.archibus.app.solution.common.fileaccess.FileAccessProviderFileSystem#writeFile(java.io.InputStream, String)}
     * .
     * 
     * @throws URISyntaxException
     */
    public void testWriteFile() throws URISyntaxException {
        FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        URL resource = this.getClass().getResource("test.txt");
        String fileName = FileUtil.getName(resource.getPath());
        String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);

        InputStream inputStream = prepareInputStream(TEST_FILE_CONTENT);

        fileAccessProviderFileSystem.writeFile(inputStream, fileName);
    }

    /**
     * Test method for
     * {@link com.archibus.app.solution.common.fileaccess.FileAccessProviderFileSystem#readFile(String)}.
     * 
     * @throws URISyntaxException
     * @throws IOException
     */
    public void testReadFile() throws URISyntaxException, IOException {
        FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        URL resource = this.getClass().getResource("test.txt");
        String fileName = FileUtil.getName(resource.getPath());
        String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);

        InputStream inputStream = fileAccessProviderFileSystem.readFile(fileName);
        byte[] bytes = new byte[inputStream.available()];
        inputStream.read(bytes);
        String fileContent = new String(bytes);

        assertEquals(TEST_FILE_CONTENT, fileContent);
    }

    public void testGetLastModified() throws URISyntaxException, IOException {
        FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        URL resource = this.getClass().getResource("test.txt");
        String fileName = FileUtil.getName(resource.getPath());
        String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);

        Date lastModified = fileAccessProviderFileSystem.getLastModified(fileName);

        // TODO verify
        assertNotNull(lastModified);
    }

    public void testGetSize() throws URISyntaxException, IOException {
        FileAccessProvider fileAccessProviderFileSystem = new FileAccessProviderFileSystem();
        URL resource = this.getClass().getResource("test.txt");
        String fileName = FileUtil.getName(resource.getPath());
        String folder = FileUtil.getParentPath(resource.getPath());
        fileAccessProviderFileSystem.setFolder(folder);

        long size = fileAccessProviderFileSystem.getSize(fileName);

        // verify
        assertEquals(18, size);
    }

    public static InputStream prepareInputStream(String fileContent) throws ExceptionBase {
        InputStream inputStream = null;
        try {
            inputStream = new ByteArrayInputStream(fileContent.getBytes("UTF-8"));
        } catch (UnsupportedEncodingException e) {
            ExceptionBase.throwNew(null, e);
        }

        return inputStream;
    }
}
