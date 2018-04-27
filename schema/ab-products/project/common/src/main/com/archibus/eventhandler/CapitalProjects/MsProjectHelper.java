package com.archibus.eventhandler.CapitalProjects;

import java.text.*;
import java.util.*;

import org.dom4j.Element;

import com.archibus.config.*;
import com.archibus.db.*;
import com.archibus.docmanager.PersistenceBaseImpl;
import com.archibus.utility.*;

/**
 * <p>
 * 
 * Title: WebCentral
 * </p>
 * <p>
 * 
 * Description: WebCentral - Trinidad project
 * </p>
 * <p>
 * 
 * Copyright: Copyright © 1984-2005 ARCHIBUS, Inc. All Rights Reserved.
 * </p>
 * <p>
 * 
 * Company: ARCHIBUS, Inc.
 * </p>
 * 
 * @author Ying Qin
 * @since August 3, 2005
 * @version 1.0
 */

public class MsProjectHelper {
    
    /**
     * Adds a feature to the ProjectElement attribute of the MsProjectHandlers object
     * 
     * @param project_id The feature to be added to the ProjectElement attribute
     * @param project The feature to be added to the ProjectElement attribute
     * @param context The feature to be added to the ProjectElement attribute
     * @exception ExceptionBase Description of the Exception
     */
    public static void addProjectElement(String project_id, Element project,
            ContextCacheable.Immutable context) throws ExceptionBase {
        
        project.addAttribute("xmlns", "http://schemas.microsoft.com/project");
        
        Element name = XmlImpl.addElementNoDuplicate(project, "Name");
        if (project_id != null) {
            name.addText(project_id);
        }
        
        Element durationFormat = XmlImpl.addElementNoDuplicate(project, "DurationFormat");
        durationFormat.addText("7");
        
        Element workFormat = XmlImpl.addElementNoDuplicate(project, "WorkFormat");
        workFormat.addText("2");
        
        Element uid = XmlImpl.addElementNoDuplicate(project, "Subject");
        uid.addText(retrieveMaxUid(context).toString());
        
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    static Integer retrieveMaxUid(ContextCacheable.Immutable context) throws ExceptionBase {
        
        // retrieve the last version number
        Database.Immutable database = context.findDatabase(PersistenceBaseImpl.DATABASE_ROLE);
        Statistic.Immutable statistic = StatisticLoader
            .getInstance(
                database,
                null,
                true,
                false,
                "MAX",
                null,
                MsProjectHandlers.ACTIVITY_LOG_TRANS_TBL,
                MsProjectHandlers.ACTIVITY_LOG_TRANS_FLDS[MsProjectHandlers.ACTIVITY_LOG_TRANS_UID_MS_PROJECT]);
        // statistic.
        final Double uid = statistic.retrieveValue(null);
        
        Integer result = Integer.valueOf(1);
        if (uid != null) {
            result = Integer.valueOf(uid.intValue() + 1);
        }
        
        return result;
    }
    
    /**
     * Description of the Method
     * 
     * @param context Description of the Parameter
     * @param actMap Description of the Parameter
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    public static Integer retrieveMaxActLogId(ContextCacheable.Immutable context, Map actMap)
            throws ExceptionBase {
        
        // retrieve the last version number
        Database.Immutable database = context.findDatabase(PersistenceBaseImpl.DATABASE_ROLE);
        
        Statistic.Immutable statistic = StatisticLoader.getInstance(database, null, true, false,
            "MAX", "", MsProjectHandlers.ACTIVITY_LOG_TBL,
            MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ID]);
        
        Vector restrictions = new Vector();
        RestrictionSqlBaseImpl restriction = (RestrictionSqlBaseImpl) RestrictionBaseImpl
            .getInstance("parsed");
        addRestrictionClause(restriction, MsProjectHandlers.ACTIVITY_LOG_ACTIVITY_TYPE, actMap);
        addRestrictionClause(restriction, MsProjectHandlers.ACTION_TITLE, actMap);
        addRestrictionClause(restriction, MsProjectHandlers.ACTIVITY_LOG_PROJECT_ID, actMap);
        addRestrictionClause(restriction, MsProjectHandlers.PCT_COMPLETE, actMap);
        addRestrictionClause(restriction, MsProjectHandlers.DURATION, actMap);
        restrictions.add(restriction);
        
        // statistic.
        Double activityLog = statistic.retrieveValue(restrictions);
        
        Integer result = new Integer(1);
        if (activityLog != null) {
            result = new Integer(activityLog.intValue());
        }
        
        return result;
    }
    
    private static void addRestrictionClause(RestrictionSqlBaseImpl restriction, int fieldId,
            Map values) {
        String tableName = MsProjectHandlers.ACTIVITY_LOG_TBL;
        String fieldName = MsProjectHandlers.ACTIVITY_LOG_FLDS[fieldId];
        Object fieldValue = values.get(fieldName);
        if (fieldValue != null) {
            restriction.addClause(tableName, fieldName, fieldValue);
        }
    }
    
    /**
     * Adds a feature to the TaskElement attribute of the MsProjectHandlers object
     * 
     * @param map The feature to be added to the TaskElement attribute
     * @param project The feature to be added to the TaskElement attribute
     * @param count The feature to be added to the TaskElement attribute
     * @return Description of the Return Value
     * @exception ExceptionBase Description of the Exception
     */
    public static HashMap<String, String> addTaskElement(HashMap map, Element project, int count)
            throws ExceptionBase {
        Element tasks = XmlImpl.getOrAddElement(project, "Tasks");
        Element task = tasks.addElement("Task");
        
        Element taskUid = XmlImpl.addElementNoDuplicate(task, "UID");
        taskUid.addText(Integer.toString(count));
        
        HashMap<String, String> uidMap = new HashMap<String, String>();
        Object actLogId = map
            .get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ID]);
        if (StringUtil.notNullOrEmpty(actLogId)) {
            uidMap.put(actLogId.toString(), Integer.toString(count));
        }
        
        Element taskName = XmlImpl.addElementNoDuplicate(task, "Name");
        if (map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTION_TITLE]) != null
                && map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ID]) != null) {
            taskName.addText(map.get(
                MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTION_TITLE]).toString()
                    + "|"
                    + map.get(
                        MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ID])
                        .toString());
        } else if (map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ID]) != null) {
            taskName.addText("|"
                    + map.get(
                        MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ID])
                        .toString());
        } else if (map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTION_TITLE]) != null) {
            taskName.addText(map.get(
                MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTION_TITLE]).toString()
                    + "|");
        } else {
            taskName.addText("");
        }
        
        Element isNull = XmlImpl.addElementNoDuplicate(task, "IsNull");
        isNull.addText("0");
        
        Element fixedCostAccrual = XmlImpl.addElementNoDuplicate(task, "FixedCostAccrual");
        fixedCostAccrual.addText("3");
        
        Element startDate = XmlImpl.addElementNoDuplicate(task, "Start");
        Element actualStartDate = XmlImpl.addElementNoDuplicate(task, "ActualStart");
        java.sql.Date taskStartDate = (java.sql.Date) map
            .get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.DATE_SCHEDULED]);
        if (taskStartDate != null) {
            startDate.addText(taskStartDate.toString());
            actualStartDate.addText(taskStartDate.toString());
            
            String projectStart = project.elementText("StartDate");
            if (projectStart == null || projectStart.length() == 0) {
                Element projDate = XmlImpl.addElementNoDuplicate(project, "StartDate");
                projDate.setText(taskStartDate.toString());
            } else {
                SimpleDateFormat ts = new SimpleDateFormat("yyyy-MM-dd");
                Date projectStartDate = null;
                try {
                    projectStartDate = new java.sql.Date(ts.parse(projectStart).getTime());
                } catch (ParseException ex) {
                }
                if (projectStartDate.after(taskStartDate)) {
                    Element projDate = XmlImpl.addElementNoDuplicate(project, "StartDate");
                    projDate.setText(taskStartDate.toString());
                }
            }
            
        }
        
        Element durationFormat = XmlImpl.addElementNoDuplicate(task, "DurationFormat");
        durationFormat.addText("7");
        
        Element duration = XmlImpl.addElementNoDuplicate(task, "Duration");
        Integer dur = (Integer) map
            .get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.DURATION]);
        
        // For MS project, duration will be calculate by assignemnet's work by hours*units/8
        // (assumne 8 is standard working days)
        if (dur != null) {
            if (dur.intValue() < 0) {
                // @translatable
                final String errorMsg = "Export Failed: The value [{0}] of field [Duration - Est. Design (Days)] for Action Item ID [{1}] cannot be a negative number. Please modify the value in the database and try to export again.";
                final ExceptionBase exception = new ExceptionBase();
                exception.setPattern(errorMsg);
                exception.setTranslatable(true);
                exception
                    .setArgs(new Object[] {
                            dur,
                            map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ID]) });
                
                throw exception;
            }
            duration.addText("PT" + Integer.toString(dur.intValue() * 8) + "H0M0S");
        }
        
        Element percentWorkComplete = XmlImpl.addElementNoDuplicate(task, "PercentComplete");
        Integer pctComplete = (Integer) map
            .get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.PCT_COMPLETE]);
        if (pctComplete != null) {
            percentWorkComplete.addText(pctComplete.toString());
        }
        
        // Element wbs = XmlImpl.addElementNoDuplicate(task, "WBS");
        // if (map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.WBS_ID]) != null) {
        // wbs.addText(map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.WBS_ID]).toString());
        // }
        
        // add the predecessor uid as activity_log_id, this value will be overwritten later with the
        // ms project's task uid.
        Element predecessorLink = XmlImpl.getOrAddElement(task, "PredecessorLink");
        if (map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.PREDECESSORS]) != null) {
            Element predecessorUID = XmlImpl.getOrAddElement(predecessorLink, "PredecessorUID");
            predecessorUID.addText(map.get(
                MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.PREDECESSORS]).toString());
        }
        
        Element calendarUID = XmlImpl.addElementNoDuplicate(task, "CalendarUID");
        calendarUID.addText(Integer.toString(count));
        
        addCalenderElement(map, project, count);
        
        addAssignmentElement(map, project, count, dur, pctComplete);
        
        addResourceElement(map, project, count);
        
        return uidMap;
    }
    
    /**
     * Adds a feature to the CalenderElement attribute of the MsProjectHandlers object
     * 
     * @param map The feature to be added to the CalenderElement attribute
     * @param project The feature to be added to the CalenderElement attribute
     * @param count The feature to be added to the CalenderElement attribute
     * @exception ExceptionBase Description of the Exception
     */
    private static void addCalenderElement(HashMap map, Element project, int count)
            throws ExceptionBase {
        
        // no work pkgs for the project
        Integer workDays = (Integer) map
            .get(MsProjectHandlers.WORK_PKGS_FLDS[MsProjectHandlers.DAYS_PER_WEEK]);
        
        Element calendars = XmlImpl.getOrAddElement(project, "Calendars");
        Element calendar = calendars.addElement("Calendar");
        
        Element uid = XmlImpl.getOrAddElement(calendar, "UID");
        uid.addText(Integer.toString(count));
        
        Element weekDays = XmlImpl.getOrAddElement(calendar, "WeekDays");
        
        if (workDays == null) {
            workDays = new Integer(5);
        }
        
        for (int i = 0; i < 7; i++) {
            Element weekDay = weekDays.addElement("WeekDay");
            Element dayType = XmlImpl.getOrAddElement(weekDay, "DayType");
            dayType.addText((new Integer(i)).toString());
            Element dayWorking = XmlImpl.getOrAddElement(weekDay, "DayWorking");
            
            if (i < 1 || i > workDays.intValue()) {
                dayWorking.addText("0");
            } else {
                dayWorking.addText("1");
                Element workingTimes = weekDay.addElement("WorkingTimes");
                {
                    Element workingTime = workingTimes.addElement("WorkingTime");
                    Element fromTime = XmlImpl.getOrAddElement(workingTime, "FromTime");
                    fromTime.addText("08:00:00");
                    Element toTime = XmlImpl.getOrAddElement(workingTime, "ToTime");
                    toTime.addText("12:00:00");
                }
                {
                    Element workingTime = workingTimes.addElement("WorkingTime");
                    Element fromTime = XmlImpl.getOrAddElement(workingTime, "FromTime");
                    fromTime.addText("13:00:00");
                    Element toTime = XmlImpl.getOrAddElement(workingTime, "ToTime");
                    toTime.addText("17:00:00");
                }
            }
        }
    }
    
    /**
     * Adds a feature to the ResourceElement attribute of the MsProjectHandlers object
     * 
     * @param map The feature to be added to the ResourceElement attribute
     * @param project The feature to be added to the ResourceElement attribute
     * @param count The feature to be added to the ResourceElement attribute
     * @exception ExceptionBase Description of the Exception
     */
    private static void addResourceElement(HashMap map, Element project, int count)
            throws ExceptionBase {
        Element resources = XmlImpl.getOrAddElement(project, "Resources");
        Element resource = resources.addElement("Resource");
        
        Element resourceUID = XmlImpl.getOrAddElement(resource, "UID");
        resourceUID.addText(Integer.toString(count));
        
        Element name = XmlImpl.getOrAddElement(resource, "Name");
        if (map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ASSIGNED_TO]) != null) {
            name.addText(map
                .get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ASSIGNED_TO]).toString());
        }
        
        // Element notes = XmlImpl.getOrAddElement(resource, "Notes");
        // if (map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.COMMENTS]) != null) {
        // notes.addText(map.get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.COMMENTS]).toString());
        // }
        
        Element activityType = XmlImpl.getOrAddElement(resource, "Hyperlink");
        if (map
            .get(MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ACTIVITY_TYPE]) != null) {
            activityType.addText(map.get(
                MsProjectHandlers.ACTIVITY_LOG_FLDS[MsProjectHandlers.ACTIVITY_LOG_ACTIVITY_TYPE])
                .toString());
        }
    }
    
    /**
     * Adds a feature to the AssignmentElement attribute of the MsProjectHandlers object
     * 
     * @param map The feature to be added to the AssignmentElement attribute
     * @param project The feature to be added to the AssignmentElement attribute
     * @param count The feature to be added to the AssignmentElement attribute
     * @param dur The feature to be added to the AssignmentElement attribute
     * @param pctComplete The feature to be added to the AssignmentElement attribute
     * @exception ExceptionBase Description of the Exception
     */
    private static void addAssignmentElement(HashMap map, Element project, int count, Integer dur,
            Integer pctComplete) throws ExceptionBase {
        Element assignments = XmlImpl.getOrAddElement(project, "Assignments");
        Element assignment = assignments.addElement("Assignment");
        
        Element uid = XmlImpl.getOrAddElement(assignment, "UID");
        uid.addText(Integer.toString(count));
        
        Element taskUID = XmlImpl.getOrAddElement(assignment, "TaskUID");
        taskUID.addText(Integer.toString(count));
        
        Element resourceUID = XmlImpl.getOrAddElement(assignment, "ResourceUID");
        resourceUID.addText(Integer.toString(count));
        
        Element unit = XmlImpl.getOrAddElement(assignment, "Units");
        unit.addText("1");
        
        if (dur != null) {
            Element work = XmlImpl.getOrAddElement(assignment, "Work");
            work.addText("PT" + Integer.toString(dur.intValue() * 8) + "H0M0S");
        }
        
        if (pctComplete != null) {
            int actWork = dur.intValue() * pctComplete.intValue() * 8 / 100;
            int remainWork = dur.intValue() * (100 - pctComplete.intValue()) * 8 / 100;
            Element actualWork = XmlImpl.getOrAddElement(assignment, "ActualWork");
            actualWork.addText("PT" + Integer.toString(actWork) + "H0M0S");
            Element remainingWork = XmlImpl.getOrAddElement(assignment, "RemainingWork");
            remainingWork.addText("PT" + Integer.toString(remainWork) + "H0M0S");
        }
    }
    
}
