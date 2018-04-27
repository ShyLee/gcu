package com.archibus.eventhandler.CapitalProjects;

import java.io.*;
import java.util.*;

import org.apache.commons.collections.map.LinkedMap;
import org.dom4j.*;

import com.archibus.config.*;
import com.archibus.config.ContextCacheable.Immutable;
import com.archibus.db.*;
import com.archibus.docmanager.*;
import com.archibus.docmanager.Document;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.*;
import com.archibus.schema.*;
import com.archibus.utility.*;

/**
 * This event handler implements business logic related to Export/Import to MS Project. Copyright
 * (c) 2005, ARCHIBUS, Inc.
 * 
 * @author Ying Qin
 * @since July 28, 2005
 * @version 1.0
 */

public class MsProjectHandlers extends EventHandlerBase {
    
    private String act_project_id = "";
    
    private String act_workpkg_id = "";
    
    private String export_filename = "";
    
    private boolean hasWorkpkg = false;
    
    private static final String ACTION_TITLE_KEY = "1";
    
    private static final String ACTION_LOG_ID_KEY = "2";
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    public final void exportToMsProject(final EventHandlerContext context) throws ExceptionBase {
        
        final ContextCacheable.Immutable contextParent = getParentContext(context);
        
        this.act_project_id = (String) context.getParameter("project_id");
        this.act_workpkg_id = (String) context.getParameter("work_pkg_id");
        
        if (this.act_workpkg_id.equals("")) {
            this.hasWorkpkg = false;
            this.export_filename = this.act_project_id + ".xml";
        } else {
            this.hasWorkpkg = true;
            this.export_filename = this.act_project_id + "-" + this.act_workpkg_id + ".xml";
        }
        
        this.export_filename = FileUtil.returnValidFileName(this.export_filename);
        
        final Element project = storeRecordsAsXml(context, contextParent);
        
        saveXmlToDB(context, contextParent, project.asXML());
        
        final InputStream inputStream = new ByteArrayInputStream(project.asXML().getBytes());
        context.addResponseParameter("inputStream", inputStream);
        context.addResponseParameter("rendered", "true");
        context.addResponseParameter("fileName", this.export_filename);
        context.addResponseParameter("contentType", "application/octet-stream");
        context.addResponseParameter("contentDisposition", "attachment; filename=");
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     * @exception IOException Description of the Exception
     */
    public void importFromMsProject(final EventHandlerContext context) throws ExceptionBase,
            IOException {
        
        final ContextCacheable.Immutable contextParent = getParentContext(context);
        
        this.act_project_id = (String) context.getParameter("project_id");
        this.act_workpkg_id = (String) context.getParameter("work_pkg_id");
        
        if (this.act_workpkg_id.equals("")) {
            this.hasWorkpkg = false;
        } else {
            this.hasWorkpkg = true;
        }
        
        final Integer projectUID = importIntoDb(context, contextParent);
        
        context.addResponseParameter("project_uid", projectUID);
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     * @exception IOException Description of the Exception
     */
    public void importClearTransactions(final EventHandlerContext context) throws ExceptionBase,
            IOException {
        
        final ContextCacheable.Immutable contextParent = getParentContext(context);
        
        getProjectWorkpkgID(context);
        
        clearTransFromDb(context, contextParent);
    }
    
    /**
     * Gets the projectWorkpkgID attribute of the MsProjectHandlers object
     * 
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    private void getProjectWorkpkgID(final EventHandlerContext context) throws ExceptionBase {
        final String project_work_pkg_id = (String) context.getParameter("project_work_pkg_id");
        
        final Map map = splitContent(project_work_pkg_id);
        this.act_project_id = (String) map.get(ACTION_TITLE_KEY);
        this.act_workpkg_id = (String) map.get(ACTION_LOG_ID_KEY);
        if (this.act_workpkg_id.length() == 0) {
            this.hasWorkpkg = false;
        } else {
            this.hasWorkpkg = true;
        }
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     * @exception IOException Description of the Exception
     */
    public void importPostTransactions(final EventHandlerContext context) throws ExceptionBase,
            IOException {
        
        final ContextCacheable.Immutable contextParent = getParentContext(context);
        
        getProjectWorkpkgID(context);
        
        postTransFromDb(context, contextParent);
        
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     */
    void clearTransFromDb(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent) {
        try {
            final org.dom4j.Document doc = getXMLDocument(context, contextParent);
            
            final List projects = doc.content();
            
            for (final Iterator it = projects.iterator(); it.hasNext();) {
                final Node projectNode = (Node) it.next();
                final Element project = (Element) projectNode;
                
                final String uid = project.elementText("Subject");
                
                // clear the acticity_log_trans record for uid (project unique id)
                clearActLogTransRecord(context, uid);
            }
        } catch (final IOException ex) {
            // XXX error handling
            throw new ExceptionBase(ex.getLocalizedMessage());
        }
        
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     */
    void postTransFromDb(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent) {
        
        try {
            final org.dom4j.Document doc = getXMLDocument(context, contextParent);
            
            final List projects = doc.content();
            
            for (final Iterator it = projects.iterator(); it.hasNext();) {
                final Node projectNode = (Node) it.next();
                final Element project = (Element) projectNode;
                
                final String uid = project.elementText("Subject");
                
                final Element tasksParent = project.element("Tasks");
                final List tasks = tasksParent.elements("Task");
                
                final Map taskAndActLogIdMap = new HashMap<String, Integer>();
                String activityLogIds = "";
                
                // for each task
                for (final Iterator it1 = tasks.iterator(); it1.hasNext();) {
                    // hashmap for actvity_log_trans table (this is used to get the activity_log
                    // status)
                    Map map = storeProjWorkpkgsIntoMap(project);
                    
                    // hashMap for activity_log table
                    Map actMap = storeProjWorkpkgsIntoActMap(project);
                    
                    final Element task = (Element) it1.next();
                    
                    final String taskUID = task.elementText("UID");
                    
                    if (new Integer(taskUID).intValue() > 0) {
                        final String resourceUID = getResourceID(project, taskUID);
                        
                        map = storeResourcesIntoMap(project, map, resourceUID);
                        actMap = storeResourcesIntoActMap(project, actMap, resourceUID);
                        
                        map = storeAssignmentIntoMap(project, map, task);
                        actMap = storeAssignmentIntoActMap(project, actMap, task);
                        
                        // DO NOT change the order of the following two lines
                        actMap = storeTasksIntoActMap(actMap, task, contextParent);
                        map = storeTasksIntoMap(map, actMap, task, contextParent);
                        
                        Integer activity_log_id =
                                (Integer) actMap.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID]);
                        if (activity_log_id == null) {
                            actMap = setPredecessorValue(project, task, actMap, false, true);
                            map = setPredecessorValue(project, task, map, false, true);
                        } else {
                            // fixes for KB# 3037151 - When importing a project with tasks with
                            // multiple predecessors only one predecessor is imported
                            actMap = setPredecessorValue(project, task, actMap, false, false);
                            map = setPredecessorValue(project, task, map, false, false);
                        }
                        
                        // add the record into activity_log_trans table
                        activity_log_id = addActLogRecord(context, contextParent, map, actMap);
                        if (activity_log_id != null) {
                            taskAndActLogIdMap.put(taskUID, activity_log_id.toString());
                            if (activityLogIds.length() > 0) {
                                activityLogIds += ",'" + activity_log_id + "'";
                            } else {
                                activityLogIds = "'" + activity_log_id + "'";
                            }
                        }
                    }
                    
                    map.clear();
                    actMap.clear();
                }
                
                // recalculate activity_date_scheduled_end
                reCalcActLogDateSchedEnd(context, project);
                
                setActLogsStatus(context, contextParent, uid);
                
                updateActLogsPredecessors(context, taskAndActLogIdMap, activityLogIds);
            }
        } catch (final IOException ex) {
            // XXX error handling
            throw new ExceptionBase(ex.getLocalizedMessage());
        }
        
    }
    
    /**
     * Updates the activity_log table's predecessors field for the new records
     * 
     * @param context - Event Handler Context
     * @param taskAndActLogIdMap - the map of task's UID and the activity_log id.
     * @param activityLogIds - the newly inserted activity logs
     */
    private void updateActLogsPredecessors(final EventHandlerContext context,
            final Map taskAndActLogIdMap, final String activityLogIds) {
        final Iterator it2 = taskAndActLogIdMap.entrySet().iterator();
        while (it2.hasNext()) {
            final Map.Entry<String, String> pairs = (Map.Entry<String, String>) it2.next();
            String sql =
                    "UPDATE " + ACTIVITY_LOG_TBL + " SET predecessors = '" + pairs.getValue()
                            + "' WHERE predecessors ='" + pairs.getKey()
                            + "' AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);
            
            // The following three SQL is the fixes for KB# 3037151 - When importing a project with
            // tasks with multiple predecessors only one predecessor is imported
            // first element
            sql =
                    "UPDATE " + ACTIVITY_LOG_TBL + " SET predecessors = REPLACE(predecessors,'"
                            + pairs.getKey() + ",','" + pairs.getValue() + ",')"
                            + " WHERE predecessors LIKE '" + pairs.getKey() + ",%"
                            + "' AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);
            
            // last element
            sql =
                    "UPDATE " + ACTIVITY_LOG_TBL + " SET predecessors = REPLACE(predecessors,',"
                            + pairs.getKey() + "','," + pairs.getValue() + "')"
                            + " WHERE predecessors LIKE '%," + pairs.getKey() + "'"
                            + " AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);
            
            // middle element
            sql =
                    "UPDATE " + ACTIVITY_LOG_TBL + " SET predecessors = REPLACE(predecessors,',"
                            + pairs.getKey() + ",','," + pairs.getValue() + ",')"
                            + " WHERE predecessors LIKE '%," + pairs.getKey() + ",%'"
                            + " AND activity_log_id IN (" + activityLogIds + ")";
            executeDbSql(context, sql, false);
            
            it2.remove(); // avoids a ConcurrentModificationException
        }
    }
    
    private void setActLogsStatus(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent, final String uid) {
        String strWhereClause = "uid_ms_proj IS NULL ";
        if (uid != null) {
            strWhereClause = "uid_ms_proj = " + uid.toString();
        }
        
        // prepare restriction to restrict on project_id
        final Vector restrictions = new Vector();
        final RestrictionSqlImpl restriction =
                (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
        restriction.setSql(strWhereClause);
        restrictions.add(restriction);
        final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords =
                retrieveRecordsForTable(contextParent, ACTIVITY_LOG_TRANS_TBL, restrictions);
        for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            final Integer activity_log_id =
                    (Integer) record.findFieldValue(ACTIVITY_LOG_TRANS_TBL + "."
                            + ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_LOG_ID]);
            record.findFieldValue(ACTIVITY_LOG_TRANS_TBL + "."
                    + ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_PCT_COMPLETE]);
            
            if (activity_log_id != null) {
                setActivityLogStatus(context, contextParent, activity_log_id.toString());
            }
        }
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param project Description of the Parameter
     */
    private void reCalcActLogDateSchedEnd(final EventHandlerContext context, final Element project) {
        
        // hashmap for actvity_log_trans table (this is used to get the activity_log status)
        final Map map = storeProjWorkpkgsIntoMap(project);
        
        final String project_id = (String) map.get("project_id");
        final String work_pkg_id = (String) map.get("work_pkg_id");
        
        context.addResponseParameter("project_id", project_id);
        context.addResponseParameter("work_pkg_id", work_pkg_id);
        
        final WorkflowRulesContainer.Immutable container = getWorkflowRulesContainer(context);
        final WorkflowRule.Immutable workflowRule =
                container.getWorkflowRule("AbCommonResources-ActionService");
        
        if (work_pkg_id != null && work_pkg_id.length() > 0) {
            container.runRule(workflowRule, "calcActivityLogDateSchedEndForWorkPkg", context);
        } else {
            container.runRule(workflowRule, "calcActivityLogDateSchedEndForProject", context);
        }
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param contextParent The feature to be added to the ActLogRecord attribute
     * @param map The feature to be added to the ActLogRecord attribute
     * @param actMap The feature to be added to the ActLogRecord attribute
     * 
     * @return new activity_log_id if the record is new, return null otherwise.
     */
    Integer addActLogRecord(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent, final Map map, final Map actMap) {
        
        final RecordPersistenceImpl record = new RecordPersistenceImpl();
        record.setDatabase(this.getDatabase(context));
        
        // add the status field to the view
        // if pct_complete = 100, then set status to 'Complete'
        final Integer pct_complete = (Integer) actMap.get(ACTIVITY_LOG_FLDS[PCT_COMPLETE]);
        if (pct_complete.intValue() == 100) {
            actMap.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_STATUS], "COMPLETED");
        }
        
        final QueryDef.ThreadSafe queryDef =
                QueryDefLoader.getInstanceFromFields(contextParent, this.getDatabase(context),
                    actMap.keySet().iterator(), ACTIVITY_LOG_TBL, false);
        record.setQueryDef(queryDef);
        
        // remove the activity_log_id as this is autonumbered field.
        Integer activity_log_id = (Integer) actMap.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID]);
        
        // we update the activity_log id for existing action item
        boolean isMatch = false;
        final Integer actionItem =
                (Integer) map.get(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_LOG_ID]);
        if (activity_log_id != null && actionItem != null
                && (activity_log_id.intValue() == actionItem.intValue())) {
            isMatch = true;
        }
        
        record.addOrUpdate(actMap);
        
        activity_log_id = MsProjectHelper.retrieveMaxActLogId(contextParent, actMap);
        if (activity_log_id != null && actionItem != null && !isMatch) {
            updateActLogTransPredecessors(context, contextParent, map, activity_log_id);
            return null;
        } else {
            return activity_log_id;
        }
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     * @param map Description of the Parameter
     * @param activity_log_id Description of the Parameter
     */
    void updateActLogTransPredecessors(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent, final Map map,
            final Integer activity_log_id) {
        
        final RecordPersistenceImpl record = new RecordPersistenceImpl();
        record.setDatabase(this.getDatabase(context));
        
        final QueryDef.ThreadSafe queryDef =
                QueryDefLoader.getInstanceFromFields(contextParent, this.getDatabase(context), map
                    .keySet().iterator(), ACTIVITY_LOG_TRANS_TBL, false);
        record.setQueryDef(queryDef);
        
        map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_PREDECESSORS],
            activity_log_id.toString());
        record.update(map);
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     * @return Description of the Return Value
     */
    Integer importIntoDb(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent) {
        try {
            final org.dom4j.Document doc = getXMLDocument(context, contextParent);
            
            final List projects = doc.content();
            
            Integer projUid = null;
            
            for (final Iterator it = projects.iterator(); it.hasNext();) {
                final Node projectNode = (Node) it.next();
                final Element project = (Element) projectNode;
                
                final Element tasksParent = project.element("Tasks");
                final List tasks = tasksParent.elements("Task");
                
                // array to hold the list of updated items
                final List actLogIds = new ArrayList();
                
                // for each task
                for (final Iterator it1 = tasks.iterator(); it1.hasNext();) {
                    final Element task = (Element) it1.next();
                    
                    final String taskUID = task.elementText("UID");
                    
                    // get the project and work package names ans store them to the map
                    // hashmap for actvity_log_trans table
                    Map map = storeProjWorkpkgsIntoMap(project);
                    
                    // hashMap for activity_log table
                    Map actMap = storeProjWorkpkgsIntoActMap(project);
                    
                    if (Integer.valueOf(taskUID) > 0) {
                        
                        final String resourceUID = getResourceID(project, taskUID);
                        
                        map = storeResourcesIntoMap(project, map, resourceUID);
                        actMap = storeResourcesIntoActMap(project, actMap, resourceUID);
                        
                        map = storeAssignmentIntoMap(project, map, task);
                        actMap = storeAssignmentIntoActMap(project, actMap, task);
                        
                        // DO NOT change the order of the following two lines
                        actMap = storeTasksIntoActMap(actMap, task, contextParent);
                        map = storeTasksIntoMap(map, actMap, task, contextParent);
                        
                        final Integer activity_log_id =
                                (Integer) actMap.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID]);
                        if (activity_log_id != null) {
                            actLogIds.add(activity_log_id);
                            // exisitng records
                            map = setPredecessorValue(project, task, map, true, false);
                        } else {
                            // new records
                            map = setPredecessorValue(project, task, map, true, true);
                        }
                        
                        // add the record into activity_log_trans table
                        addActLogTransRecord(context, contextParent, map);
                        
                    }
                    
                    projUid =
                            (Integer) map
                                .get(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_UID_MS_PROJECT]);
                    
                    map.clear();
                    actMap.clear();
                }
                
                addDeletedActRecordsToTrans(context, contextParent, projUid);
                
                // prepare restriction to restrict on project_id
                final Vector restrictions = new Vector();
                String strWhereClause = "uid_ms_proj IS NULL ";
                if (projUid != null) {
                    strWhereClause = "uid_ms_proj = " + projUid.toString();
                }
                final RestrictionSqlImpl restriction =
                        (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
                restriction.setSql(strWhereClause);
                restrictions.add(restriction);
                final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords =
                        retrieveRecordsForTable(contextParent, ACTIVITY_LOG_TRANS_TBL, restrictions);
                for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
                    final Record.Immutable record = (Record.Immutable) element;
                    final Integer actLogId =
                            (Integer) record.findFieldValue(ACTIVITY_LOG_TRANS_TBL + "."
                                    + ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_LOG_ID]);
                    final String status =
                            (String) record.findFieldValue(ACTIVITY_LOG_TRANS_TBL + "."
                                    + ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_STATUS]);
                    if (!status.equalsIgnoreCase("New")
                            && (actLogIds.size() == 0 || !actLogIds.contains(actLogId))) {
                        final HashMap actMap1 = new HashMap();
                        actMap1.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_LOG_ID], actLogId);
                        actMap1.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_STATUS], new String(
                            "Deleted"));
                        executeDbSave(context, ACTIVITY_LOG_TRANS_TBL, actMap1);
                    }
                }
                
                return projUid;
            }
            
        } catch (final IOException ex) {
            // XXX error handling
            throw new ExceptionBase(ex.getLocalizedMessage());
        }
        
        return null;
    }
    
    /**
     * Sets predecessor value for existing and new records
     * 
     * @param project the project element
     * @param task the task element
     * @param map the map for the task's sub elements
     * @param isTransTable true if we try to set the predecessors field for activity_log_trans
     *            table, false for activity_log table
     * @param newActLogRecord true of no matching exist activity_log record for the record to be
     *            insert, false otherwise.
     * 
     * @return a map with the updated predecessors field and values.
     */
    private Map setPredecessorValue(final Element project, final Element task, final Map map,
            final boolean isTransTable, final boolean newActLogRecord) {
        final List<Element> taskElements = project.element("Tasks").elements("Task");
        
        final List<Element> predecessorLinkElements = task.elements("PredecessorLink");
        if (predecessorLinkElements == null || predecessorLinkElements.size() < 1) {
            return map;
        }
        
        String predsContent = "";
        for (int index = 0; index < predecessorLinkElements.size(); index++) {
            final Element predecessorUIDElement =
                    predecessorLinkElements.get(index).element("PredecessorUID");
            
            if (predecessorUIDElement != null) {
                final String predecessorUID = predecessorUIDElement.getText();
                for (int indexInner = 0; indexInner < taskElements.size(); indexInner++) {
                    final Node predecessorNode = taskElements.get(indexInner).element("UID");
                    if (predecessorNode.getText().compareTo(predecessorUID) == 0) {
                        if (newActLogRecord) {
                            // fixes for KB# 3037151 - When importing a project with tasks with
                            // multiple predecessors only one predecessor is imported
                            if (StringUtil.notNullOrEmpty(predsContent)) {
                                predsContent = predsContent + "," + predecessorUID;
                            } else {
                                predsContent = predecessorUID;
                            }
                        } else {
                            final String predecessorTaskName =
                                    predecessorNode.getParent().element("Name").getTextTrim();
                            final Map content = splitContent(predecessorTaskName);
                            if (StringUtil.notNullOrEmpty(predsContent)) {
                                predsContent = predsContent + "," + content.get(ACTION_LOG_ID_KEY);
                            } else {
                                predsContent = (String) content.get(ACTION_LOG_ID_KEY);
                            }
                        }
                    }
                }
                
            }
        }
        
        if (StringUtil.notNullOrEmpty(predsContent)) {
            if (isTransTable) {
                map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_PREDECESSORS], predsContent);
            } else {
                map.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_PREDECESSORS], predsContent);
            }
        }
        return map;
    }
    
    /**
     * Adds a feature to the DeletedActRecordsToTrans attribute of the MsProjectHandlers object
     * 
     * @param context The feature to be added to the DeletedActRecordsToTrans attribute
     * @param contextParent The feature to be added to the DeletedActRecordsToTrans attribute
     * @param projUid The feature to be added to the DeletedActRecordsToTrans attribute
     */
    void addDeletedActRecordsToTrans(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent, final Integer projUid) {
        
        final Vector restrictions = new Vector();
        {
            final String strWhereClause =
                    "NOT EXISTS (SELECT activity_log_id FROM activity_log_trans WHERE activity_log.activity_log_id = activity_log_trans.activity_log_id) ";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        {
            final String strWhereClause = "project_id ='" + this.act_project_id + "'";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        
        String projectName = this.act_project_id;
        if (this.hasWorkpkg) {
            projectName = projectName + "|" + this.act_workpkg_id;
            final String strWhereClause = "work_pkg_id ='" + this.act_workpkg_id + "'";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        {
            final String strWhereClause =
                    "status IN ('N/A', 'REQUESTED', 'PLANNED', 'SCHEDULED', 'IN PROGRESS')";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        
        final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords =
                retrieveRecordsForTable(contextParent, ACTIVITY_LOG_TBL, restrictions);
        for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            final HashMap map = new HashMap();
            
            // set the project is field for activity_log_trans table
            map.put("project_id", this.act_project_id);
            
            if (this.hasWorkpkg) {
                map.put("work_pkg_id", this.act_workpkg_id);
            }
            
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_WORK_PKG_ID], projectName);
            
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_UID_MS_PROJECT], projUid);
            
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_PREDECESSORS],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[PREDECESSORS]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_ASSIGNED_TO],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[ASSIGNED_TO]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_DURATION],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[DURATION]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_LOG_ID],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_ACTION_TITLE],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[ACTION_TITLE]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_DATE_SCHEDULED],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[DATE_SCHEDULED]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_WBS_ID],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[WBS_ID]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_PCT_COMPLETE],
                record.findFieldValue(ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[PCT_COMPLETE]));
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_STATUS], "Deleted");
            
            addActLogTransRecord(context, contextParent, map);
        }
    }
    
    /**
     * Sets the activityLogStatus attribute of the MsProjectHandlers object
     * 
     * @param contextParent The new activityLogStatus value
     * @param actLogId The new activityLogStatus value
     * @param context The new activityLogStatus value
     */
    void setActivityLogStatus(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent, final String actLogId) {
        String status = "";
        String actStatus = "";
        
        final Vector restrictions = new Vector();
        if (actLogId != null) {
            final String strWhereClause = "activity_log_id = " + actLogId;
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        
        final com.archibus.db.RetrievedRecords.Immutable retrievedLogTransRecords =
                retrieveRecordsForTable(contextParent, ACTIVITY_LOG_TRANS_TBL, restrictions);
        for (final Object element : retrievedLogTransRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            status =
                    (String) record.findFieldValue(ACTIVITY_LOG_TRANS_TBL + "."
                            + ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_STATUS]);
        }
        
        final com.archibus.db.RetrievedRecords.Immutable retrievedLogRecords =
                retrieveRecordsForTable(contextParent, ACTIVITY_LOG_TBL, restrictions);
        for (final Object element : retrievedLogRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            actStatus =
                    (String) record.findFieldValue(ACTIVITY_LOG_TBL + "."
                            + ACTIVITY_LOG_FLDS[ACTIVITY_LOG_STATUS]);
            
            if (actStatus.equalsIgnoreCase("")) {
                actStatus = "N/A";
            }
            
            if (status.equalsIgnoreCase("Deleted")) {
                if (actStatus.equalsIgnoreCase("N/A") || actStatus.equalsIgnoreCase("REQUESTED")
                        || actStatus.equalsIgnoreCase("PLANNED")
                        || actStatus.equalsIgnoreCase("SCHEDULED")) {
                    actStatus = "CANCELLED";
                }
                
                if (actStatus.equalsIgnoreCase("IN PROGRESS")) {
                    actStatus = "STOPPED";
                }
            }
            
            if (!status.equalsIgnoreCase("Unchange")) {
                final HashMap map = new HashMap();
                map.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID], new Integer(actLogId));
                map.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_STATUS], actStatus);
                executeDbSave(context, ACTIVITY_LOG_TBL, map);
            }
        }
    }
    
    // store the assign_to and comments field into maps
    /**
     * Description of the Method
     * 
     * @param project Description of the Parameter
     * @param map Description of the Parameter
     * @param resourceUID Description of the Parameter
     * @return Description of the Return Value
     */
    private Map storeResourcesIntoMap(final Element project, final Map map, final String resourceUID) {
        
        // get the resource for the project
        final List resources = project.element("Resources").elements("Resource");
        
        // loop through each resources
        for (final Iterator it3 = resources.iterator(); it3.hasNext();) {
            final Element resource = (Element) it3.next();
            
            // find out the resource belongs to certain resource UID (certain task)
            if (resource.elementText("UID") != null
                    && resource.elementText("UID").equalsIgnoreCase(resourceUID)) {
                
                // store the assigned_to and comments fields to mapszz
                map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_ASSIGNED_TO],
                    resource.elementText("Name"));
                // map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_COMMENTS],
                // resource.elementText("Notes"));
            }
        }
        
        return map;
    }
    
    /**
     * Description of the Method
     * 
     * @param project Description of the Parameter
     * @param actMap Description of the Parameter
     * @param resourceUID Description of the Parameter
     * @return Description of the Return Value
     */
    private Map storeResourcesIntoActMap(final Element project, final Map actMap,
            final String resourceUID) {
        
        // get the resource for the project
        final List resources = project.element("Resources").elements("Resource");
        boolean isFound = false;
        
        // loop through each resources
        for (final Iterator it3 = resources.iterator(); it3.hasNext();) {
            final Element resource = (Element) it3.next();
            
            // find out the resource belongs to certain resource UID (certain task)
            if (resource.elementText("UID") != null
                    && resource.elementText("UID").equalsIgnoreCase(resourceUID)) {
                
                // store the assigned_to and comments fields to maps
                actMap.put(ACTIVITY_LOG_FLDS[ASSIGNED_TO], resource.elementText("Name"));
                // actMap.put(ACTIVITY_LOG_FLDS[COMMENTS], resource.elementText("Notes"));
                
                final String activityType = resource.elementText("Hyperlink");
                if (!StringUtil.notNull(activityType).equalsIgnoreCase("")) {
                    actMap.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ACTIVITY_TYPE],
                        resource.elementText("Hyperlink"));
                } else {
                    actMap.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ACTIVITY_TYPE], new String(
                        "PROJECT - TASK"));
                }
                
                isFound = true;
            }
        }
        
        if (!isFound) {
            actMap.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ACTIVITY_TYPE], new String("PROJECT - TASK"));
        }
        
        return actMap;
    }
    
    /**
     * Description of the Method
     * 
     * @param project Description of the Parameter
     * @param map Description of the Parameter
     * @param task Description of the Parameter
     * @return Description of the Return Value
     */
    private Map storeAssignmentIntoMap(final Element project, final Map map, final Element task) {
        
        final String taskUID = task.elementText("UID");
        final List assignments = project.element("Assignments").elements("Assignment");
        
        // loop through each resources
        for (final Iterator it3 = assignments.iterator(); it3.hasNext();) {
            final Element assignment = (Element) it3.next();
            
            // find out the resource belongs to certain resource UID (certain task)
            if (assignment.elementText("TaskUID").equalsIgnoreCase(taskUID)) {
                final String works = task.elementText("Duration");
                
                if (works != null) {
                    final String duration = getDuration(works);
                    map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_DURATION], new Integer(
                        duration));
                } else {
                    map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_DURATION], new Integer(0));
                }
            }
        }
        
        return map;
    }
    
    /**
     * Description of the Method
     * 
     * @param project Description of the Parameter
     * @param actMap Description of the Parameter
     * @param task Description of the Parameter
     * @return Description of the Return Value
     */
    private Map storeAssignmentIntoActMap(final Element project, final Map actMap,
            final Element task) {
        
        final String taskUID = task.elementText("UID");
        final List assignments = project.element("Assignments").elements("Assignment");
        
        // loop through each resources
        for (final Iterator it3 = assignments.iterator(); it3.hasNext();) {
            final Element assignment = (Element) it3.next();
            
            // find out the resource belongs to certain resource UID (certain task)
            if (assignment.elementText("TaskUID").equalsIgnoreCase(taskUID)) {
                final String works = task.elementText("Duration");
                
                if (works != null) {
                    final String duration = getDuration(works);
                    actMap.put(ACTIVITY_LOG_FLDS[DURATION], Integer.valueOf(duration));
                } else {
                    actMap.put(ACTIVITY_LOG_FLDS[DURATION], Integer.valueOf(0));
                }
            }
        }
        
        return actMap;
    }
    
    // based on TaskUID the get the resourceUID
    /**
     * Description of the Method
     * 
     * @param project Description of the Parameter
     * @param taskUID Description of the Parameter
     * @return Description of the Return Value
     */
    private String getResourceID(final Element project, final String taskUID) {
        
        // get the assignment element
        final List assignments = project.element("Assignments").elements("Assignment");
        String resourceUID = "";
        
        // loop through all assignments
        for (final Iterator it2 = assignments.iterator(); it2.hasNext();) {
            final Element assignment = (Element) it2.next();
            
            // find out the assignment belongs to task
            if (assignment.elementText("TaskUID").equalsIgnoreCase(taskUID)) {
                // the resource UID to be used to find out the resource related with this task.
                resourceUID = assignment.elementText("ResourceUID");
            }
        }
        return resourceUID;
    }
    
    /**
     * Description of the Method
     * 
     * @param map Map to store field values for activity_log_trans table
     * @param actMap Map to store field values for activity_log table
     * @param task Task element
     * @param contextParent Description of the Parameter
     * @return to be referenced for assignments and resources
     * @exception NumberFormatException if can not format into integer
     */
    private Map storeTasksIntoMap(final Map map, final Map actMap, final Element task,
            final ContextCacheable.Immutable contextParent) throws NumberFormatException {
        
        // get task name (action_title|activity_log_id)
        final String taskName = task.elementText("Name");
        
        if (taskName != null) {
            
            // find the value for action_title and activity_log_id
            final Map content = splitContent(taskName);
            final String action_title = (String) content.get(this.ACTION_TITLE_KEY);
            final String activity_log_id = (String) content.get(this.ACTION_LOG_ID_KEY);
            
            // store activity_log_id into maps - Integer type
            if (!StringUtil.notNull(activity_log_id).equals("")) {
                map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_LOG_ID], new Integer(
                    activity_log_id));
            }
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_ACTION_TITLE], action_title);
        }
        
        // store date_scheduled into maps - Date type
        if (task.element("Start") != null && task.elementText("Start") != "") {
            String start_date = task.elementText("Start");
            if (start_date.indexOf("T") > 0) {
                start_date = start_date.substring(0, start_date.indexOf("T"));
            }
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_DATE_SCHEDULED],
                java.sql.Date.valueOf(start_date));
        }
        
        task.elementText("UID");
        
        // store predecessors into maps - String type
        final Element predecessorLink = task.element("PredecessorLink");
        if (predecessorLink != null) {
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_PREDECESSORS],
                predecessorLink.elementText("PredecessorUID"));
        }
        
        // sore pct_complete into maps - Integer type
        map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_PCT_COMPLETE],
            new Integer(task.elementText("PercentComplete")));
        
        // based on map and actMap values, find out the status then store into activity_log_trans
        // table
        map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_STATUS],
            getActLogTransStatus(actMap, contextParent));
        
        return map;
    }
    
    /**
     * Description of the Method
     * 
     * @param actMap Description of the Parameter
     * @param task Description of the Parameter
     * @param contextParent Description of the Parameter
     * @return Description of the Return Value
     * @exception NumberFormatException Description of the Exception
     */
    private Map storeTasksIntoActMap(final Map actMap, final Element task,
            final ContextCacheable.Immutable contextParent) throws NumberFormatException {
        
        // get task name (action_title|activity_log_id)
        final String taskName = task.elementText("Name");
        
        if (taskName != null) {
            // find the value for action_title and activity_log_id
            final Map content = splitContent(taskName);
            final String action_title = (String) content.get(this.ACTION_TITLE_KEY);
            final String activity_log_id = (String) content.get(this.ACTION_LOG_ID_KEY);
            
            // store activity_log_id into maps - Integer type
            if (!StringUtil.notNull(activity_log_id).equals("")) {
                actMap.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID], new Integer(activity_log_id));
            }
            actMap.put(ACTIVITY_LOG_FLDS[ACTION_TITLE], action_title);
        }
        
        // store date_scheduled into maps - Date type
        
        if (task.element("Start") != null && task.elementText("Start") != "") {
            String start_date = task.elementText("Start");
            if (start_date.indexOf("T") > 0) {
                start_date = start_date.substring(0, start_date.indexOf("T"));
            }
            actMap.put(ACTIVITY_LOG_FLDS[DATE_SCHEDULED], java.sql.Date.valueOf(start_date));
        }
        
        // store duration into maps - Integer type
        /*
         * For MS Project: duration = assignment's work/(8*units) String durDays =
         * task.elementText("Duration"); String duration = getDuration(durDays);
         * actMap.put(ACTIVITY_LOG_FLDS[DURATION], new Integer(duration));
         */
        // store wbs_id into maps - String type
        // actMap.put(ACTIVITY_LOG_FLDS[WBS_ID], task.elementText("WBS"));
        // store predecessors into maps - String type
        final Element predecessorLink = task.element("PredecessorLink");
        if (predecessorLink != null) {
            actMap.put(ACTIVITY_LOG_FLDS[PREDECESSORS],
                predecessorLink.elementText("PredecessorUID"));
        }
        
        // sore pct_complete into maps - Integer type
        actMap.put(ACTIVITY_LOG_FLDS[PCT_COMPLETE],
            new Integer(task.elementText("PercentComplete")));
        
        return actMap;
    }
    
    /**
     * Description of the Method
     * 
     * @param taskName Description of the Parameter
     * @return Description of the Return Value
     */
    private Map splitContent(final String taskName) {
        
        final Map map = new HashMap<String, String>();
        final int index = taskName.indexOf("|");
        
        if (index < 0) {
            if (taskName.length() == 0) {
                map.put(this.ACTION_TITLE_KEY, "");
                map.put(this.ACTION_LOG_ID_KEY, "");
            } else {
                map.put(this.ACTION_TITLE_KEY, taskName);
                map.put(this.ACTION_LOG_ID_KEY, "");
            }
        } else if (index == 0) {
            map.put(this.ACTION_TITLE_KEY, "");
            map.put(this.ACTION_LOG_ID_KEY, taskName.substring(index + 1));
        } else if (index == taskName.length() - 1) {
            map.put(this.ACTION_TITLE_KEY, taskName.substring(0, index));
            map.put(this.ACTION_LOG_ID_KEY, "");
        } else {
            map.put(this.ACTION_TITLE_KEY, taskName.substring(0, index));
            map.put(this.ACTION_LOG_ID_KEY, taskName.substring(index + 1));
        }
        
        return map;
    }
    
    /**
     * Description of the Method
     * 
     * @param project Description of the Parameter
     * @return Description of the Return Value
     */
    private Map storeProjWorkpkgsIntoMap(final Element project) {
        
        final Map map = new HashMap<String, Object>();
        
        // get project|work_pkg name
        String projectName = this.act_project_id;
        
        // XXX
        map.put("project_id", this.act_project_id);
        if (this.hasWorkpkg) {
            map.put("work_pkg_id", this.act_workpkg_id);
            projectName = projectName + "|" + this.act_workpkg_id;
        }
        
        // set the project is field for activity_log_trans table
        map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_WORK_PKG_ID], projectName);
        
        final String uid = project.elementText("Subject");
        if (uid != null) {
            map.put(ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_UID_MS_PROJECT], new Integer(uid));
        }
        
        return map;
    }
    
    /**
     * Description of the Method
     * 
     * @param project Description of the Parameter
     * @return Description of the Return Value
     */
    private Map storeProjWorkpkgsIntoActMap(final Element project) {
        
        final Map actMap = new HashMap<String, Object>();
        
        // set the project_id and work_package_id fields for activity_Log table
        actMap.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_PROJECT_ID], this.act_project_id);
        // XXX
        if (this.hasWorkpkg) {
            actMap.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_WORK_PKG_ID], this.act_workpkg_id);
        }
        return actMap;
    }
    
    /**
     * Gets the actLogTransStatus attribute of the MsProjectHandlers object
     * 
     * @param map Description of the Parameter
     * @param contextParent Description of the Parameter
     * @return The actLogTransStatus value
     */
    private String getActLogTransStatus(final Map map,
            final ContextCacheable.Immutable contextParent) {
        final Integer activity_log_id = (Integer) map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID]);
        
        if (activity_log_id == null) {
            return "New";
        }
        
        final RecordPersistenceImpl recordImpl =
                preparePersistence(new HashMap(), ACTIVITY_LOG_TBL, contextParent);
        
        // retrieve and compare
        Record.Immutable record = recordImpl.retrieve(false, map);
        
        if (record == null) {
            final HashMap fieldValues = new HashMap();
            fieldValues.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_PROJECT_ID],
                map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_PROJECT_ID]));
            if (map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_WORK_PKG_ID]) != null) {
                fieldValues.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_WORK_PKG_ID],
                    map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_WORK_PKG_ID]));
            }
            fieldValues.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID],
                map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_ID]));
            
            record = recordImpl.retrieve(false, fieldValues);
            if (record == null) {
                fieldValues.clear();
                fieldValues.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_PROJECT_ID],
                    map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_PROJECT_ID]));
                if (map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_WORK_PKG_ID]) != null) {
                    fieldValues.put(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_WORK_PKG_ID],
                        map.get(ACTIVITY_LOG_FLDS[ACTIVITY_LOG_WORK_PKG_ID]));
                }
                record = recordImpl.retrieve(false, fieldValues);
                if (record != null) {
                    return "Deleted";
                } else {
                    return "New";
                }
            } else {
                return "Changed";
            }
        } else {
            return "Unchange";
        }
        
    }
    
    /**
     * add the record into activity_log_trans table
     * 
     * @param context The feature to be added to the ActLogTransRecord attribute
     * @param contextParent The feature to be added to the ActLogTransRecord attribute
     * @param map The feature to be added to the ActLogTransRecord attribute
     */
    private void addActLogTransRecord(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent, final Map map) {
        
        final RecordPersistenceImpl record = new RecordPersistenceImpl();
        record.setDatabase(this.getDatabase(context));
        
        final QueryDef.ThreadSafe queryDef =
                QueryDefLoader.getInstanceFromFields(contextParent, this.getDatabase(context), map
                    .keySet().iterator(), ACTIVITY_LOG_TRANS_TBL, false);
        record.setQueryDef(queryDef);
        
        record.addOrUpdate(map);
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param uid Description of the Parameter
     */
    private void clearActLogTransRecord(final EventHandlerContext context, final String uid) {
        
        String sql =
                "DELETE FROM " + ACTIVITY_LOG_TRANS_TBL + " WHERE "
                        + ACTIVITY_LOG_TRANS_FLDS[ACTIVITY_LOG_TRANS_UID_MS_PROJECT];
        
        if (uid != null) {
            sql = sql + "=" + uid;
        } else {
            sql = sql + " IS NULL";
        }
        
        executeDbSql(context, sql, false);
        
    }
    
    /**
     * Gets the duration attribute of the MsProjectHandlers object
     * 
     * @param durDays Description of the Parameter
     * @return The duration value
     * @exception NumberFormatException Description of the Exception
     */
    private String getDuration(final String durDays) throws NumberFormatException {
        int duration = 0;
        int start = durDays.indexOf("P");
        int end = durDays.indexOf("D");
        if (end < 0) {
            start = durDays.indexOf("T");
            end = durDays.indexOf("H");
            if (end < 0) {
                start = durDays.indexOf("H");
                end = durDays.indexOf("M");
                if (end < 0) {
                    start = durDays.indexOf("M");
                    end = durDays.indexOf("S");
                    if (end >= 0) {
                        duration = Integer.parseInt(durDays.substring(start + 1, end)) / 14400;
                    }
                } else {
                    duration = Integer.parseInt(durDays.substring(start + 1, end)) / 240;
                }
                
            } else {
                duration = Integer.parseInt(durDays.substring(start + 1, end)) / 8;
            }
        } else {
            duration = Integer.parseInt(durDays.substring(start + 1, end));
        }
        
        return Integer.toString(duration);
    }
    
    /**
     * Gets the docContent attribute of the MsProjectHandlers object
     * 
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     * @return The docContent value
     * @exception IOException Description of the Exception
     */
    private org.dom4j.Document getXMLDocument(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent) throws IOException {
        final HashMap fieldPkValues = getPkValues();
        final HashMap fieldValues = getFieldValues(fieldPkValues);
        
        final com.archibus.docmanager.Document document =
                new com.archibus.docmanager.Document(contextParent, fieldValues,
                    (DbConnection.ThreadSafe) context
                        .getParameter(WorkflowRulesContainerImpl.KEY_CONNECTION));
        document.download(null, null, true, null, null);
        
        return document.getXMLDocument();
    }
    
    /**
     * Gets the fieldValues attribute of the MsProjectHandlers object
     * 
     * @param fieldPkValues Description of the Parameter
     * @return The fieldValues value
     */
    private HashMap getFieldValues(final HashMap fieldPkValues) {
        final HashMap fieldValues = fieldPkValues;
        if (this.hasWorkpkg) {
            final Map pkeys = new LinkedMap();
            pkeys.put(PROJECT_FLDS[this.PROJECT_PROJECT_ID], this.act_project_id);
            pkeys.put(WORK_PKGS_FLDS[WORK_PKG_ID], this.act_workpkg_id);
            fieldValues.put(Document.PKEY_VALUES, pkeys);
        } else {
            final Map pkeys = new LinkedMap();
            pkeys.put(PROJECT_FLDS[this.PROJECT_PROJECT_ID], this.act_project_id);
            fieldValues.put(Document.PKEY_VALUES, pkeys);
        }
        return fieldValues;
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     * @param xmlString Description of the Parameter
     * @exception ExceptionBase Description of the Exception
     */
    private void saveXmlToDB(final EventHandlerContext context, final Immutable contextParent,
            final String xmlString) throws ExceptionBase {
        // get database connection from context
        final DbConnection.ThreadSafe connection = getDbConnection(context);
        
        final HashMap fieldValues = prepareValues(xmlString);
        
        final Document document = new Document(contextParent, fieldValues, connection);
        
        final boolean newDocument = isNewDocument(contextParent);
        document.checkin(newDocument, contextParent);
        
    }
    
    /**
     * Gets the newDocument attribute of the MsProjectHandlers object
     * 
     * @param context Description of the Parameter
     * @return The newDocument value
     */
    boolean isNewDocument(final ContextCacheable.Immutable context) {
        boolean newDocument = false;
        
        final HashMap fieldPkValues = getPkValues();
        fieldPkValues.put(DocumentVersion.VERSION, new Integer(1));
        final RecordPersistenceImpl recordImpl =
                preparePersistence(new HashMap(), DocumentVersion.TABLE, context);
        
        // retrieve and compare
        final Record.Immutable record = recordImpl.retrieve(false, fieldPkValues);
        
        if (record == null) {
            newDocument = true;
        }
        
        return newDocument;
    }
    
    /**
     * Gets the pkValues attribute of the MsProjectHandlers object
     * 
     * @return The pkValues value
     */
    private HashMap getPkValues() {
        final HashMap fieldPkValues = new HashMap();
        if (this.hasWorkpkg) {
            fieldPkValues.put(Document.TABLE_NAME, WORK_PKGS_TBL);
            fieldPkValues.put(Document.FIELD_NAME, WORK_PKGS_FLDS[WORK_PKGS_DOC_ACTS_XFER]);
            fieldPkValues.put(Document.PKEY_VALUE, this.act_project_id + "|" + this.act_workpkg_id);
        } else {
            fieldPkValues.put(Document.TABLE_NAME, PROJECT_TBL);
            fieldPkValues.put(Document.FIELD_NAME, PROJECT_FLDS[this.PROJECT_DOC_ACTS_XFER]);
            fieldPkValues.put(Document.PKEY_VALUE, this.act_project_id);
        }
        return fieldPkValues;
    }
    
    /**
     * Description of the Method
     * 
     * @param fieldValues Description of the Parameter
     * @param tableName Description of the Parameter
     * @param context Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    private static RecordPersistenceImpl preparePersistence(final HashMap fieldValues,
            final String tableName, final ContextCacheable.Immutable context) throws ExceptionBase {
        
        final RecordPersistenceImpl record = new RecordPersistenceImpl();
        final Database.Immutable database = context.findDatabase("data");
        record.setDatabase(database);
        final QueryDef.ThreadSafe queryDef =
                QueryDefLoader.getInstanceFromFields(context, database, fieldValues.keySet()
                    .iterator(), tableName, false);
        record.setQueryDef(queryDef);
        
        return record;
    }
    
    /**
     * Description of the Method
     * 
     * @param file_contents Description of the Parameter
     * @return Description of the Return Value
     */
    private HashMap prepareValues(final String file_contents) {
        // prepare Pk values for afm_docs table
        final HashMap fieldValues = getFieldValues(getPkValues());
        
        // prepare doc_file field for afm_docvers table
        fieldValues.put(DocumentVersion.DOC_FILE, this.export_filename);
        {
            // prepare file_contents field for afm_docvers table
            final byte[] bt = file_contents.getBytes();
            final InputStream inputStream = new ByteArrayInputStream(file_contents.getBytes());
            // Test for BLOB
            fieldValues.put(DocumentVersion.FILE_CONTENTS, inputStream);
            final double size = bt.length;
            fieldValues.put(DocumentVersion.DOC_SIZE, new Double(size / 1000.0));
            
        }
        
        // prepare doc_file field for inventory table
        fieldValues.put(fieldValues.get(Document.FIELD_NAME), this.export_filename);
        
        return fieldValues;
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param contextParent Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    private Element storeRecordsAsXml(final EventHandlerContext context,
            final ContextCacheable.Immutable contextParent) throws ExceptionBase {
        
        final com.archibus.db.RetrievedRecords.Immutable retrievedRecords =
                retrieveRecords(contextParent);
        
        // create XML DOM object and root node
        final XmlImpl xml = new XmlImpl();
        final Element project = xml.createRootNodeIfNot("Project");
        
        // add project element
        if (this.hasWorkpkg) {
            MsProjectHelper.addProjectElement(this.act_project_id + "|" + this.act_workpkg_id,
                project, contextParent);
        } else {
            MsProjectHelper.addProjectElement(this.act_project_id, project, contextParent);
        }
        
        int count = 1;
        // this map contains a map of ARCHIBUS activity_log_id value and its corresponding ms
        // project's task uid pair.
        final HashMap<String, String> predecessorMap = new HashMap<String, String>();
        for (final Object element : retrievedRecords.getRecordset().getRecords()) {
            final Record.Immutable record = (Record.Immutable) element;
            final HashMap map = new HashMap();
            for (int i = 0; i < 13; i++) {
                final String fieldFullName1 = ACTIVITY_LOG_TBL + "." + ACTIVITY_LOG_FLDS[i];
                map.put(ACTIVITY_LOG_FLDS[i], record.findFieldValue(fieldFullName1));
            }
            
            final String fieldFullName2 = WORK_PKGS_TBL + "." + WORK_PKGS_FLDS[DAYS_PER_WEEK];
            map.put(WORK_PKGS_FLDS[DAYS_PER_WEEK], record.findFieldValue(fieldFullName2));
            
            // add Task element
            final HashMap uidMap = MsProjectHelper.addTaskElement(map, project, count);
            
            // add the activity_log_id and UID entry to predecessor map.
            predecessorMap.putAll(uidMap);
            
            map.clear();
            
            count++;
        }
        
        // retireve all elements with prodecessors
        setPredecessorNode(project, predecessorMap);
        
        return project;
    }
    
    private void setPredecessorNode(final Element project,
            final HashMap<String, String> predecessorMap) {
        final List<Element> predecessorUIDs =
                project.selectNodes("//Tasks/Task/PredecessorLink/PredecessorUID");
        
        // loop through them, reset the value with ms project's task uid
        for (int index = 0; index < predecessorUIDs.size(); index++) {
            // find the predecessors uid element
            final Element predecessorNode = predecessorUIDs.get(index);
            final String predecessorUID = predecessorNode.getText();
            
            final StringTokenizer preds =
                    new StringTokenizer(predecessorUID == null ? "" : predecessorUID, ",");
            boolean isFirst = true;
            while (preds.hasMoreTokens()) {
                final String pred = preds.nextToken().trim();
                
                // the uid must exists in the map (activity_log_id, uid)
                if (StringUtil.notNullOrEmpty(pred) && predecessorMap.containsKey(pred)) {
                    if (isFirst) {
                        // set predecessorLink for the task to the first uid of task.
                        predecessorNode.setText(predecessorMap.get(pred));
                        isFirst = false;
                    } else {
                        final Element taskElement = predecessorNode.getParent().getParent();
                        final Element predecessorUIDElem =
                                taskElement.addElement("PredecessorLink").addElement(
                                    "PredecessorUID");
                        predecessorUIDElem.addText(predecessorMap.get(pred));
                    }
                }
            }
        }
    }
    
    /**
     * Description of the Method
     * 
     * @param contextParent Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    private com.archibus.db.RetrievedRecords.Immutable retrieveRecords(final Immutable contextParent)
            throws ExceptionBase {
        final RecordsPersistenceImpl records = new RecordsPersistenceImpl();
        records.setDatabase(contextParent.findDatabase("schema"));
        
        final QueryDefJoinImpl joinQueryDef =
                new QueryDefJoinImpl(contextParent.findDatabase("schema"));
        joinQueryDef.setTableName(ACTIVITY_LOG_TBL);
        
        final TableDef.ThreadSafe tableDef1 =
                contextParent.findProject().loadTableDef(ACTIVITY_LOG_TBL);
        for (int i = 0; i < 13; i++) {
            final ViewField.Immutable viewField =
                    ViewFieldLoader.getInstance(tableDef1.getFieldDef(ACTIVITY_LOG_FLDS[i]),
                        contextParent, true, true, true, null, false);
            joinQueryDef.addField(viewField);
        }
        
        final TableDef.ThreadSafe tableDef2 =
                contextParent.findProject().loadTableDef(WORK_PKGS_TBL);
        for (int i = 0; i <= 2; i++) {
            final ViewField.Immutable viewField =
                    ViewFieldLoader.getInstance(tableDef2.getFieldDef(WORK_PKGS_FLDS[i]),
                        contextParent, true, true, true, null, false);
            joinQueryDef.addField(viewField);
        }
        
        final SortImpl sort = new SortImpl();
        sort.getFields().add(new SortFieldImpl(ACTIVITY_LOG_TBL, "project_id"));
        sort.getFields().add(new SortFieldImpl(ACTIVITY_LOG_TBL, "action_title"));
        joinQueryDef.setSort(sort);
        
        records.setQueryDef(joinQueryDef);
        
        // prepare restriction to restrict on project_id and a set of valid status ('N/A',
        // 'REQUESTED', 'PLANNED', 'SCHEDULED', 'IN PROGRESS')
        final Vector restrictions = prepareRestrictions();
        
        // retrive records
        final RetrievedRecords.Immutable retrievedRecords =
                records.searchAndRetrieve(false, new HashMap(), restrictions,
                    contextParent.getLocale());
        return retrievedRecords;
    }
    
    /**
     * Description of the Method
     * 
     * @param contextParent Description of the Parameter
     * @param tableName Description of the Parameter
     * @param restrictions Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    private com.archibus.db.RetrievedRecords.Immutable retrieveRecordsForTable(
            final Immutable contextParent, final String tableName, final Vector restrictions)
            throws ExceptionBase {
        final RecordsPersistenceImpl records = new RecordsPersistenceImpl();
        records.setDatabase(contextParent.findDatabase("schema"));
        
        // prepare queryDef
        final QueryDefImpl queryDef =
                new QueryDefImpl(contextParent.findDatabase("schema"), tableName);
        final TableDef.ThreadSafe tableDef =
                contextParent.findDatabase("schema").findProject().loadTableDef(tableName);
        
        // use fieldDefs from the TableDef as quiery fields
        queryDef.setViewFields(new ArrayList(tableDef.getFields().values()));
        queryDef.setTableDef(tableDef);
        
        records.setQueryDef(queryDef);
        
        // retrive records
        final RetrievedRecords.Immutable retrievedRecords =
                records.searchAndRetrieve(false, new HashMap(), restrictions,
                    contextParent.getLocale());
        
        return retrievedRecords;
    }
    
    /**
     * Description of the Method
     * 
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    private Vector prepareRestrictions() throws ExceptionBase {
        final Vector restrictions = new Vector();
        {
            final RestrictionSqlBaseImpl restriction =
                    (RestrictionSqlBaseImpl) RestrictionBaseImpl.getInstance("parsed");
            restriction.addClause(ACTIVITY_LOG_TBL, ACTIVITY_LOG_FLDS[ACTIVITY_LOG_PROJECT_ID],
                this.act_project_id);
            restrictions.add(restriction);
        }
        {
            final String strWhereClause =
                    "activity_log.status IN ('N/A', 'REQUESTED', 'PLANNED', 'SCHEDULED', 'IN PROGRESS')";
            final RestrictionSqlImpl restriction =
                    (RestrictionSqlImpl) RestrictionBaseImpl.getInstance("sql");
            restriction.setSql(strWhereClause);
            restrictions.add(restriction);
        }
        
        if (this.hasWorkpkg) {
            final RestrictionSqlBaseImpl restriction =
                    (RestrictionSqlBaseImpl) RestrictionBaseImpl.getInstance("parsed");
            restriction.addClause(ACTIVITY_LOG_TBL, WORK_PKGS_FLDS[WORK_PKG_ID],
                this.act_workpkg_id);
            restrictions.add(restriction);
        }
        
        return restrictions;
    }
    
    /**
     * Description of the Method
     * 
     * @param database Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    private RecordsPersistence.ThreadSafe prepareRecords(final Database.Immutable database)
            throws ExceptionBase {
        // XXX
        final RecordsPersistenceImpl records = new RecordsPersistenceImpl();
        records.setDatabase(database);
        {
            // prepare queryDef
            final QueryDefImpl queryDef = new QueryDefImpl(database, ACTIVITY_LOG_TBL);
            {
                final TableDef.ThreadSafe tableDef =
                        database.findProject().loadTableDef(ACTIVITY_LOG_TBL);
                
                // use fieldDefs from the TableDef as quiery fields
                queryDef.setViewFields(new ArrayList(tableDef.getFields().values()));
                queryDef.setTableDef(tableDef);
            }
            
            records.setQueryDef(queryDef);
        }
        
        return records;
    }
    
    /**
     * Table and Field names used in Activity_log database operations.
     */
    protected final static String ACTIVITY_LOG_TBL = "activity_log";
    
    /**
     * Description of the Field
     */
    protected final static String WORK_PKGS_TBL = "work_pkgs";
    
    /**
     * Description of the Field
     */
    protected final static String PROJECT_TBL = "project";
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_PROJECT_ID = 0;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_ID = 1;
    
    /**
     * Description of the Field
     */
    protected final static int ACTION_TITLE = 2;
    
    /**
     * Description of the Field
     */
    protected final static int DATE_SCHEDULED = 3;
    
    /**
     * Description of the Field
     */
    protected final static int DURATION = 4;
    
    /**
     * Description of the Field
     */
    protected final static int WBS_ID = 5;
    
    /**
     * Description of the Field
     */
    protected final static int PREDECESSORS = 6;
    
    /**
     * Description of the Field
     */
    protected final static int ASSIGNED_TO = 7;
    
    /**
     * Description of the Field
     */
    protected final static int COMMENTS = 8;
    
    /**
     * Description of the Field
     */
    protected final static int PCT_COMPLETE = 9;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_WORK_PKG_ID = 10;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_ACTIVITY_TYPE = 11;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_STATUS = 12;
    
    /**
     * Description of the Field
     */
    protected final static String[] ACTIVITY_LOG_FLDS = new String[] { "project_id",
            "activity_log_id", "action_title", "date_scheduled", "duration", "wbs_id",
            "predecessors", "assigned_to", "comments", "pct_complete", "work_pkg_id",
            "activity_type", "status" };
    
    /**
     * Description of the Field
     */
    protected final static int DAYS_PER_WEEK = 0;
    
    /**
     * Description of the Field
     */
    protected final static int WORK_PKG_ID = 1;
    
    /**
     * Description of the Field
     */
    protected final static int WORK_PKGS_DOC_ACTS_XFER = 2;
    
    /**
     * Description of the Field
     */
    protected final static String[] WORK_PKGS_FLDS = new String[] { "days_per_week", "work_pkg_id",
            "doc_acts_xfer" };
    
    /**
     * Description of the Field
     */
    protected final int PROJECT_PROJECT_ID = 0;
    
    /**
     * Description of the Field
     */
    protected final int PROJECT_DOC_ACTS_XFER = 1;
    
    /**
     * Description of the Field
     */
    protected final static String[] PROJECT_FLDS = new String[] { "project_id", "doc_acts_xfer" };
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_LOG_ID = 0;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_ID = 1;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_DATE_SCHEDULED = 2;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_DURATION = 3;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_WBS_ID = 4;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_PREDECESSORS = 5;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_ASSIGNED_TO = 6;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_COMMENTS = 7;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_PCT_COMPLETE = 8;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_WORK_PKG_ID = 9;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_STATUS = 10;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_UID_MS_PROJECT = 11;
    
    /**
     * Description of the Field
     */
    protected final static int ACTIVITY_LOG_TRANS_ACTION_TITLE = 12;
    
    /**
     * Description of the Field
     */
    protected final static String ACTIVITY_LOG_TRANS_TBL = "activity_log_trans";
    
    /**
     * Description of the Field
     */
    protected final static String[] ACTIVITY_LOG_TRANS_FLDS = new String[] { "activity_log_id",
            "activity_log_trans_id", "date_scheduled", "duration", "wbs_id", "predecessors",
            "assigned_to", "comments", "pct_complete", "project_work_pkg_id", "status",
            "uid_ms_proj", "action_title" };
    
    protected final static int ACTIVITY_LOG_PREDECESSORS = 6;
}
