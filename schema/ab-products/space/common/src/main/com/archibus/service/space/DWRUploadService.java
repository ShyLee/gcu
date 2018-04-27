package com.archibus.service.space;

import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.*;
import java.io.*;

import org.directwebremoting.*;

import com.archibus.utility.*;

public class DWRUploadService {
    String photoLocation = null;
    
    /**
     * @param uploadImage 圖片文件流
     * @param uploadFile 需要用简单的文本文件，如：.txt文件，不然上传会出乱码
     * @param color
     * @return
     */
    public BufferedImage uploadFiles(final BufferedImage uploadImage, final String uploadFile,
            final String color) {
        // uploadImage = scaleToSize(uploadImage);
        // uploadImage =grafitiTextOnImage(uploadImage, uploadFile, color);
        return uploadImage;
    }
    
    /**
     * 文件上传时使用InputStream类进行接收，在DWR官方例中是使用String类接收简单内容
     * 
     * @param uploadFile
     * @return
     */
    public String uploadFile(final InputStream uploadFile, final String filename, final String url)
            throws Exception {
        final WebContext webContext = WebContextFactory.get();
        this.photoLocation =
                webContext.getHttpServletRequest().getSession().getServletContext()
                    .getInitParameter("photoLocation");
        
        final String realtivepath =
                webContext.getContextPath() + this.photoLocation + "/" + url + "/";
        // int size = uploadFile.available();
        final String saveurl =
                webContext.getHttpServletRequest().getSession().getServletContext()
                    .getRealPath(this.photoLocation + "/" + url + "/");
        FileUtil.createFoldersIfNot(saveurl);
        final File file = new File(saveurl + File.separator + filename);
        FileCopy.copy(uploadFile, file);
        return realtivepath + filename;
    }
    
    private BufferedImage scaleToSize(BufferedImage uploadImage) {
        final AffineTransform atx = new AffineTransform();
        atx.scale(200d / uploadImage.getWidth(), 200d / uploadImage.getHeight());
        final AffineTransformOp atfOp = new AffineTransformOp(atx, AffineTransformOp.TYPE_BILINEAR);
        uploadImage = atfOp.filter(uploadImage, null);
        return uploadImage;
    }
    
    private BufferedImage grafitiTextOnImage(final BufferedImage uploadImage, String uploadFile,
            final String color) {
        if (uploadFile.length() < 200) {
            uploadFile += uploadFile + " ";
        }
        final Graphics2D g2d = uploadImage.createGraphics();
        for (int row = 0; row < 10; row++) {
            String output = "";
            if (uploadFile.length() > (row + 1) * 20) {
                output += uploadFile.substring(row * 20, (row + 1) * 20);
            } else {
                output = uploadFile.substring(row * 20);
            }
            g2d.setFont(new Font("SansSerif", Font.BOLD, 16));
            g2d.setColor(Color.blue);
            g2d.drawString(output, 5, (row + 1) * 20);
        }
        return uploadImage;
    }
}
