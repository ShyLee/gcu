package com.archibus.service.school.tools;

import java.io.*;
import java.util.List;

import javax.servlet.*;
import javax.servlet.http.*;

import org.apache.commons.fileupload.*;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;

import com.archibus.config.*;
import com.archibus.context.ContextStore;
import com.archibus.context.utility.EventHandlerContextTemplate;
import com.archibus.utility.*;

public class PhotoUploadService extends HttpServlet {
    
    private static final long serialVersionUID = 1L;
    
    private static final Logger logger = Logger.getLogger(PhotoUploadService.class);
    
    String path = null;
    
    /**
     * get graphics
     * 
     * @return
     */
    protected String getProjectGraphicsFolder() {
        return getServletContext().getRealPath("/projects/gcu/graphics");
    }
    
    protected String getDefaultUploadPhotoPath(final String defaultUploadFolder) {
        return getProjectGraphicsFolder() + File.separator + defaultUploadFolder;
    }
    
    @Override
    public void init(final ServletConfig config) throws ServletException {
        super.init(config);
        this.path = getProjectGraphicsFolder();
        logger.info(this.path);
    }
    
    @Override
    public void doGet(final HttpServletRequest request, final HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        final PrintWriter out = response.getWriter();
        out.println("<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01 Transitional//EN\">");
        out.println("<HTML>");
        out.println("  <HEAD><TITLE>A Servlet</TITLE></HEAD>");
        out.println("  <BODY>");
        out.print("不支持get上传");
        out.println("  </BODY>");
        out.println("</HTML>");
        out.flush();
        out.close();
    }
    
    @Override
    public void doPost(final HttpServletRequest req, final HttpServletResponse resp)
            throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        // getContext();
        // String graphicsFolder = ContextStore.get().getProject().getEnterpriseGraphicsFolder();
        // System.err.println(graphicsFolder);
        
        final String defaultUploadFolder = req.getParameter("defaultUploadFolder");
        final String photoName = req.getParameter("photoName");
        getServletContext().getRealPath("/projects/temp");
        final File tempForder = new File(this.path);
        
        if (!tempForder.exists()) {
            tempForder.mkdirs();
        }
        
        final DiskFileItemFactory f = new DiskFileItemFactory();
        f.setSizeThreshold(1024 * 10);
        f.setRepository(tempForder);
        final ServletFileUpload sf = new ServletFileUpload(f);
        
        try {
            final List<FileItem> list = sf.parseRequest(req);
            for (final FileItem fi : list) {
                if (fi.isFormField()) {
                    // String val = fi.getString("UTF-8"); //设置uTF-8获取表单的值
                    // System.err.println(val);
                } else {
                    String fileName = fi.getName();
                    
                    String fileDestName = null;
                    if (null != photoName && !"".equalsIgnoreCase(photoName)) {
                        fileDestName = fileName.substring(fileName.lastIndexOf("\\") + 1);
                        final String ext = fileName.substring(fileName.lastIndexOf("."));
                        fileDestName = photoName + ext;
                        fileName = fileDestName;
                    }
                    
                    fi.getContentType();
                    final InputStream in = fi.getInputStream();
                    in.available();
                    final String destFolder = getDefaultUploadPhotoPath(defaultUploadFolder);
                    logger.info(destFolder);
                    FileUtil.createFoldersIfNot(destFolder);
                    FileCopy.copy(in, new File(destFolder + File.separator + fileName));
                    
                    fi.delete();
                }
            }
        } catch (final FileUploadException e) {
            e.printStackTrace();
        }
        
    }
    
    private void getContext() {
        final CoreUserSessionTemplate template = new CoreUserSessionTemplate();
        template.execute(new Runnable() {
            public void run() {
                prepareContext();
            }
        });
    }
    
    private void prepareContext() {
        final ConfigManager.Immutable configManager = ContextStore.get().getConfigManager();
        final List<Project.Immutable> projects = configManager.getProjects();
        for (final Project.Immutable project : projects) {
            if (project.isOpen()) {
                ContextStore.get().setProject(project);
                ContextStore.get().setUserSession(project.loadCoreUserSession());
            }
        }
        if (ContextStore.get().getEventHandlerContext() == null) {
            ContextStore.get().setEventHandlerContext(
                EventHandlerContextTemplate.prepareEventHandlerContext());
        }
        
    }
    
}
