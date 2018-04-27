package com.archibus.eventhandler.steps;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringReader;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;
import javax.mail.util.ByteArrayDataSource;

import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.eventhandler.helpdesk.Constants;
import com.archibus.eventhandler.helpdesk.QuestionnaireHandler;
import com.archibus.jobmanager.EventHandlerContext;
import com.archibus.utility.ExceptionBase;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;

public class MessageHelper extends EventHandlerBase{

    public static String processTemplate(String name, String template, Map<String,Object> datamodel) throws TemplateException, IOException {

		Configuration cfg = new Configuration();
		//fix KB3031484- do not format the number type field (Guo 2011/6/3)
		cfg.setNumberFormat("#");
		
		java.io.Reader reader = new StringReader(template);
	
		Template tpl = new Template(name, reader, cfg); 		
	
		StringWriter sw = new StringWriter();
		tpl.process(datamodel, sw);		
	
		return sw.getBuffer().toString();
    }
    
    public static void sendMessage(EventHandlerContext context, Message message, MimeBodyPart[] attachmentBodyParts) throws MessagingException, UnsupportedEncodingException  {
		Properties props = new Properties();
		props.put("mail.transport.protocol", "smtp");
		props.put("mail.smtp.host", getEmailHost(context));		
		props.put("mail.smtp.port", getEmailPort(context));	
		props.put("mail.smtp.user", getEmailUserId(context)); 
		
		String userName = getEmailUserId(context);
		String password = getEmailPassword(context);
		
		Session mailSession = null;
		if (password != null && ! password.equals("")) {
		    props.put("mail.smtp.auth", "true");	
		    mailSession = Session.getDefaultInstance(props, new BasicAuthenticator(password,userName) );     
		} else {
		    props.put("mail.smtp.auth", "false");	
		    mailSession = Session.getDefaultInstance(props);    	    
		}	 
	
		MimeMessage mimeMessage = new MimeMessage(mailSession);
		mimeMessage.setSubject(message.getSubject());
	
		mimeMessage.setContent(message.getText(), "text/plain");
		mimeMessage.setFrom(new InternetAddress(getEmailFrom(context)));
		mimeMessage.addRecipient(javax.mail.Message.RecipientType.TO, new InternetAddress(message.getMailTo(),message.getNameto()));
	
		Multipart multipart = new MimeMultipart();
	
		//set body    		
		MimeBodyPart messageBodyPart = new MimeBodyPart();
		multipart.addBodyPart(messageBodyPart);
		messageBodyPart.setText(message.getText());
	
		for (MimeBodyPart attachmentBodyPart: attachmentBodyParts ) {
		    if(attachmentBodyPart != null){
		    	multipart.addBodyPart(attachmentBodyPart);
		    }
		}
	
		mimeMessage.setContent(multipart);
		mimeMessage.setSentDate(new Date()); 
		
		Transport.send(mimeMessage); 

    }

    public static MimeBodyPart getAttachment(EventHandlerContext context, String tableName,String fieldName,int pkeyValue){

		com.archibus.config.Database.Immutable db = getDatabase(context);
		Connection conn=null;
		PreparedStatement ps=null;
		try {	
		    conn = db.getDataSource().getConnection();
	
		    ps = conn.prepareStatement("SELECT file_contents, doc_file FROM afm_docvers WHERE table_name= ? AND field_name = ? AND pkey_value = ? ORDER BY version DESC");
		    ps.setString(1, tableName);
		    ps.setString(2, fieldName);
		    ps.setInt(3, pkeyValue);
	
		    ResultSet rs = ps.executeQuery();
		    InputStream stream = null;
		    String fileName = null;
		    if (rs.next()) {
				stream = rs.getBinaryStream("file_contents");
		
				MimeBodyPart messageBodyPart = new MimeBodyPart();				
				messageBodyPart.setDataHandler(new DataHandler(new ByteArrayDataSource(stream,"application/octet-stream")));
				fileName = rs.getString("doc_file").trim();    
				messageBodyPart.setFileName(fileName);
				return messageBodyPart;
		    }
	
		} catch(SQLException e){
		    e.printStackTrace();			
		} catch (IOException e) {
		    e.printStackTrace();
		} catch (MessagingException e) {
			e.printStackTrace();
		} finally {
		    try { ps.close(); } catch (SQLException e ) {};	
		    try { conn.close(); } catch (SQLException e ) {};
		}	
		return null;
    }

    private static Map<String,Object> getActivityLogRecord(EventHandlerContext context,int activity_log_id){
		String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "activity_log_hactivity_log");
		Object[] fieldValues = selectDbValues(context,"activity_log_hactivity_log",fields_list,"activity_log_id ="+activity_log_id);
	
		Map<String,Object> values = new HashMap<String,Object>();
		if(fieldValues != null){
		    for(int i=0;i<fieldValues.length;i++){
				if(fields_list[i].equals("status") || fields_list[i].equals("step_status")){
					Map<String,String> valueText = new HashMap<String,String>();
					valueText.put("value", (String) fieldValues[i]);
					valueText.put("text", getEnumFieldDisplayedValue(context, "activity_log",fields_list[i], (String) fieldValues[i]));
				    values.put(fields_list[i],valueText);
				} else {
				    values.put(fields_list[i], fieldValues[i]);
				}
		    }
		    return values;
		} 
		return null;
    }

    private static Map<String,Object> getWrRecord(EventHandlerContext context, int wr_id){
		String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "wrhwr");
		Object[] fieldValues = selectDbValues(context,"wrhwr",fields_list,"wr_id ="+wr_id);
	
		Map<String,Object> values = new HashMap<String,Object>();
		for(int i=0;i<fieldValues.length;i++){
		    if(fields_list[i].equals("status") || fields_list[i].equals("step_status")){
		    	Map<String,String> valueText = new HashMap<String,String>();
				valueText.put("value", (String) fieldValues[i]);
				valueText.put("text", getEnumFieldDisplayedValue(context, "wr",fields_list[i], (String) fieldValues[i]));
			    values.put(fields_list[i],valueText);		    	
		    } else {
		    	values.put(fields_list[i], fieldValues[i]);
		    }
		}
		return values;
    }

    private static Map<String,Object> getWoRecord(EventHandlerContext context, int wo_id){
		String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, "wohwo");
		Object[] fieldValues = selectDbValues(context,"wohwo",fields_list,"wo_id ="+wo_id);
	
		Map<String,Object> values = new HashMap<String,Object>();
		for(int i=0;i<fieldValues.length;i++){
		    if(fields_list[i].equals("wo_type")){
		    	Map<String,String> valueText = new HashMap<String,String>();
				valueText.put("value", (String) fieldValues[i]);
				valueText.put("text", getEnumFieldDisplayedValue(context, "wo",fields_list[i], (String) fieldValues[i]));
			    values.put(fields_list[i],valueText);
		    } else {
		    	values.put(fields_list[i], fieldValues[i]);
		    }
		}
		return values;
    }

	public static Map<String,Object> getRequestDatamodel(EventHandlerContext context, String tableName,String fieldName,int id){
		Map<String,Object> result = new HashMap<String,Object>();
		if(tableName.equals("activity_log")){
			Map<String,Object> values = getActivityLogRecord(context, id);
			if(values != null){
				result.put(tableName, values);
				if(values.get("act_quest") != null){
					QuestionnaireHandler qh = new QuestionnaireHandler();
					List<Map<String,Object>> questions = qh.getQuestionnaireAnswers(context, "activity_log_hactivity_log", fieldName, "act_quest", id);
					result.put("questions", questions);
				}
				if(values.get("wr_id") != null){
					int wr_id = getIntegerValue(context, values.get("wr_id")).intValue();
					Map<String,Object> wrValues = getWrRecord(context, wr_id);
					result.put("wr", wrValues);
					
					Object wo = selectDbValue(context,"wr","wo_id","wr_id = " + wr_id);
					if(wo != null){
						int wo_id = getIntegerValue(context, wo).intValue();
						Map<String,Object> woValues = getWoRecord(context, wo_id);
						result.put("wo", woValues);
					}
				}
			} else {
				throw new ExceptionBase("Record with id " + id +" not found in activity_log_hactivity_log");
			}
		} else if(tableName.equals("wr")){
			Map<String,Object> values = getWrRecord(context, id);
			if(values != null){
				result.put(tableName, values);
				if(values.get("wo_id") != null){
					int wo_id = getIntegerValue(context, values.get("wo_id")).intValue();				
					Map<String,Object> woValues = getWoRecord(context, wo_id);
					result.put("wo", woValues);
				}
				
				if(values.get("activity_log_id") != null){
					int activity_log_id = getIntegerValue(context, values.get("activity_log_id")).intValue();
					result.put("activity_log", getActivityLogRecord(context, activity_log_id));
				}
			} else {
				throw new ExceptionBase("Record with id " + id +" not found in wrhwr");
			}			
		} else if(tableName.equals("wo")){
			Map<String,Object> values = getWoRecord(context, id);
			if(values != null){
				result.put(tableName, values);
				List wrs = selectDbRecords(context,"wr",new String[]{"wr_id"},"wo_id = " + id);
				if(!wrs.isEmpty()){
					List wrRecords = new ArrayList();
					for(Iterator wrIt = wrs.iterator();wrIt.hasNext();){
						Object[] record = (Object[]) wrIt.next();
						wrRecords.add(getWrRecord(context,getIntegerValue(context, record[0])));
					}
					result.put("wr", wrRecords);
				}
				if(values.get("activity_log_id") != null){
					int activity_log_id = getIntegerValue(context, values.get("activity_log_id")).intValue();
					result.put("activity_log", getActivityLogRecord(context, activity_log_id));
				}
			}
		} else {
			String[] fields_list = com.archibus.eventhandler.EventHandlerBase.getAllFieldNames(context, tableName);
			Object[] fieldValues = selectDbValues(context,tableName,fields_list,fieldName+"="+id);
			if(fieldValues != null){
				Map<String,Object> values = new HashMap<String,Object>();
				for(int i=0;i<fieldValues.length;i++){
					values.put(fields_list[i], fieldValues[i]);
				}
				result.put(tableName,values);
			} else {
				throw new ExceptionBase("Record with id " + id +" not found in "+tableName);
			}
		}
		StepHandler sh = new StepHandler();		
		result.put("steps", sh.getStepsList(context, tableName, fieldName, id));
		return result;
	} 
	
	public static String getRequestInfo(EventHandlerContext context, String tableName,String fieldName,int id){
		Object[] record;
		StringBuffer requestInfo = new StringBuffer();
		if (tableName.equals(Constants.WORK_REQUEST_TABLE)) {
		    record = selectDbValues(context, tableName, Constants.WORK_REQUEST_FIELD_NAMES,
			    fieldName + "=" + id);
		    if (record == null) {
		    	requestInfo.append("Notification record not found");
		    }
		    for (int i = 0; i < Constants.WORK_REQUEST_FIELD_NAMES.length; i++) {
		    	if (record[i] != null) {
		    		if(Constants.WORK_REQUEST_FIELD_NAMES[i].equals("status")){
		    			requestInfo.append(Constants.WORK_REQUEST_FIELD_NAMES[i] + ": " + com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(context, Constants.WORK_REQUEST_TABLE, "status", (String) record[i]));
		    		} else {
			    		requestInfo.append(Constants.WORK_REQUEST_FIELD_NAMES[i] + ": " + record[i]
				                                                                             + "\n");	
		    		}
		    	} 
		    }
		} else {
		    record = selectDbValues(context, tableName, Constants.HELP_REQUEST_FIELD_NAMES,
			    fieldName + "=" + id);
		    if (record == null) {
		    	requestInfo.append("Notification record not found");
		    }
		    for (int i = 0; i < Constants.HELP_REQUEST_FIELD_NAMES.length; i++) {
		    	if (record[i] != null){
		    		if(Constants.HELP_REQUEST_FIELD_NAMES[i].equals("status")){
		    			requestInfo.append(Constants.HELP_REQUEST_FIELD_NAMES[i] +": " + com.archibus.eventhandler.EventHandlerBase.getEnumFieldDisplayedValue(context, Constants.ACTION_ITEM_TABLE, "status", (String) record[i]));
		    		} else {
		    			requestInfo.append(Constants.HELP_REQUEST_FIELD_NAMES[i] + ": " + record[i]
				                                                                             + "\n");
		    		}
		    	}
		    }
		}
		return requestInfo.toString();
	}
}
