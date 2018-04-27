package com.archibus.service.school.equipment;

import java.io.*;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.http.*;

import org.apache.commons.fileupload.*;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;

@SuppressWarnings("serial")
public class Upload extends HttpServlet {
    @Override
    @SuppressWarnings("unchecked")
    public void doPost(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException, IOException {
        String savePath = this.getServletConfig().getServletContext().getRealPath("");
        savePath = savePath + "/uploads/";
        final File f1 = new File(savePath);
        System.out.println(savePath);
        if (!f1.exists()) {
            f1.mkdirs();
        }
        final DiskFileItemFactory fac = new DiskFileItemFactory();
        final ServletFileUpload upload = new ServletFileUpload(fac);
        upload.setHeaderEncoding("utf-8");
        List fileList = null;
        try {
            fileList = upload.parseRequest(request);
        } catch (final FileUploadException ex) {
            return;
        }
        final Iterator<FileItem> it = fileList.iterator();
        String name = "";
        String extName = "";
        while (it.hasNext()) {
            final FileItem item = it.next();
            if (!item.isFormField()) {
                name = item.getName();
                final long size = item.getSize();
                final String type = item.getContentType();
                System.out.println(size + " " + type);
                if (name == null || name.trim().equals("")) {
                    continue;
                }
                // 扩展名格式：
                if (name.lastIndexOf(".") >= 0) {
                    extName = name.substring(name.lastIndexOf("."));
                }
                File file = null;
                do {
                    // 生成文件名：
                    name = UUID.randomUUID().toString();
                    file = new File(savePath + name + extName);
                } while (file.exists());
                final File saveFile = new File(savePath + name + extName);
                try {
                    item.write(saveFile);
                } catch (final Exception e) {
                    e.printStackTrace();
                }
            }
        }
        response.getWriter().print(name + extName);
    }
}
