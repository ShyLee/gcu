package com.archibus.eventhandler.emergencypreparedness;

import java.util.List;

import org.json.*;

import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.eventhandler.EventHandlerBase;
import com.archibus.jobmanager.EventHandlerContext;

/**
 * 
 * Event handler class that implements a few WFRs for supporting operations in
 * risk/EmergencyPreparedness module.
 * 
 * @author Weijie
 */

public class EmergencyPreparednessCommonHandler extends EventHandlerBase {

    final static boolean throwException = false;

    /**
     * Update equipment's recovery status.
     * 
     * @param jsonArrayObjects JSONArray contains DataRecord Object
     * @param recoveryStatus
     * @param tableName
     * @param fieldName
     * @param targetFieldName
     */

    public void updateEquipmentRecoveryStatus(final JSONArray jsonArrayObjects,
            final String recoveryStatus) {

        this.updateRecoveryStatus(jsonArrayObjects, recoveryStatus, "eq", "recovery_status");
    }

    /**
     * Update room's recovery status.
     * 
     * @param jsonArrayObjects JSONArray contains DataRecord Object
     * @param recoveryStatus
     * @param tableName
     * @param fieldName
     * @param targetFieldName
     */

    public void updateRoomRecoveryStatus(final JSONArray jsonArrayObjects,
            final String recoveryStatus) {

        this.updateRecoveryStatus(jsonArrayObjects, recoveryStatus, "rm", "recovery_status");
    }

    /**
     * It used for updating recovery status of room and equipment.
     * 
     * the method name should be refactored for more generic later!.
     * 
     * for example: updateOneField.
     * 
     * @param jsonArrayObjects
     * @param recoveryStatus
     * @param tableName
     * @param fieldName
     * @param targetFieldName
     */

    private void updateRecoveryStatus(JSONArray jsonArrayObjects, String recoveryStatus,
            String tableName, String targetFieldName) {

        if (jsonArrayObjects.length() > 0) {
            DataSource updateDs = DataRecord.createDataSourceForRecord(jsonArrayObjects
                .getJSONObject(0));
            List<DataRecord> dataRecords = DataRecord.createRecordsFromJSON(jsonArrayObjects);

            for (DataRecord dataRecord : dataRecords) {
                dataRecord.setValue(tableName + "." + targetFieldName, recoveryStatus);
                updateDs.updateRecord(dataRecord);
            }
            updateDs.commit();
        }
    }

    /**
     * This WFR method replaced previous database trigger fired when updating the
     * system_bl.recovery_status
     */
    /*
     * ALTER TRIGGER "system_status_t".system_status_t after update of recovery_status order 1 on
     * AFM.system_bl referencing new as newsystem for each row begin declare v_new_recovery_status
     * char(12);if newsystem.recovery_status = 'UNFIT-TEMP' or newsystem.recovery_status =
     * 'UNFIT-PERM' then set v_new_recovery_status='FIT-OFFLINE' else set
     * v_new_recovery_status=newsystem.recovery_status end if; update system_bl set
     * system_bl.recovery_status = v_new_recovery_status where system_bl.system_id = any(select
     * system_id_depend from system_dep where system_dep.system_id_master = newsystem.system_id and
     * system_dep.propagate_status = 1) and system_bl.recovery_status not
     * in('UNFIT-TEMP','UNFIT-PERM',v_new_recovery_status) end
     */
    public void updateSystemStatus(JSONObject record) {
        if (record == null || !record.has("values")) {
            return;
        }

        // Firstly remove the associated trigger 'system_status_t' if it exists
        String sSystemTable = "", sTrigNameField = "";

        EventHandlerContext context = ContextStore.get().getEventHandlerContext();
        // according to different database, set proper name of system table and trigger field
        if (isOracle(context)) {
            sSystemTable = "USER_TRIGGERS";
            sTrigNameField = "trigger_name";
        } else if (isSybase(context)) {
            sSystemTable = "SYSTRIGGER";
            sTrigNameField = "trigger_name";
        } else if (isSqlServer(context)) {
            sSystemTable = "SYSOBJECTS";
            sTrigNameField = "name";
        }
        // for SYBASE and SQLSERVER, determine if trigger exists then delete it
        if (isSybase(context) || isSqlServer(context)) {
            String selTriggerSql = " SELECT " + sTrigNameField + " FROM " + sSystemTable
                    + " WHERE " + sTrigNameField + " ='system_status_t' ";
            List tList = selectDbRecords(context, selTriggerSql);
            if (tList != null && tList.size() > 0) {
                executeDbSql(context, "DROP TRIGGER system_status_t", false);
                executeDbCommit(context);
            }
        }

        // Secondly save the system_bl record
        DataSource systemBlDS = DataSourceFactory.createDataSourceForFields("system_bl",
            new String[] { "system_id", "recovery_status", "bl_id", "description", "system_type",
                    "comments" });

        JSONObject values = record.getJSONObject("values");
        JSONObject oldValues = record.getJSONObject("oldValues");
        boolean isNew = record.getBoolean("isNew");
        DataRecord systemBlRec = null;
        if (isNew) {// if record is new created on client then create a new data-record

            systemBlRec = systemBlDS.createNewRecord();
            systemBlRec.fromJSON(values);// set values from transfered record object's values
            systemBlDS.saveRecord(systemBlRec);

        } else { // else query the data-record

            systemBlRec = systemBlDS.getRecord(" system_bl.system_id='"
                    + oldValues.getString("system_bl.system_id") + "'");
            systemBlRec.fromJSON(values);
            systemBlDS.saveRecord(systemBlRec);

        }
        systemBlDS.commit();

        // Finally according to business logic of previous trigger, update the status of all system
        // depend on current one.
        DataSource systemDepDS = DataSourceFactory.createDataSourceForFields("system_dep",
            new String[] { "system_id_master", "propagate_status", "system_id_depend" });

        updateDepencySystemStatus(systemDepDS, systemBlRec.getString("system_bl.system_id"),
            systemBlDS, systemBlRec.getString("system_bl.recovery_status"));

        return;

    }

    /*
     * For given master system id: 1. get all system depend on it 2. for each system got in first
     * step, update system status and call updateDepencySystemStatus() again
     */
    private void updateDepencySystemStatus(DataSource systemDepDS, String masterSystemId,
            DataSource systemBlDS, String parentStatus) {
        List<DataRecord> depList = systemDepDS
            .getRecords("propagate_status=1 AND system_dep.system_id_master='" + masterSystemId
                    + "' ");
        for (DataRecord systemDep : depList) {
            String depSystemId = systemDep.getString("system_dep.system_id_depend");
            DataRecord systemRec = systemBlDS.getRecord(" system_bl.system_id='" + depSystemId
                    + "'");
            if (systemRec == null) {
                continue;
            }
            systemRec.getString("system_bl.recovery_status");
            String newStatus = null;
            if ("UNFIT-TEMP".equals(parentStatus) || "UNFIT-PERM".equals(parentStatus)) {
                newStatus = "FIT-OFFLINE";
            } else {
                newStatus = parentStatus;
            }
            systemRec.setValue("system_bl.recovery_status", newStatus);
            systemBlDS.saveRecord(systemRec);

            systemBlDS.commit();
            updateDepencySystemStatus(systemDepDS, depSystemId, systemBlDS, newStatus);
        }
    }
}
