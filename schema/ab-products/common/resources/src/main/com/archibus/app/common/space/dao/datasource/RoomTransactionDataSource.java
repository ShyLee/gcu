package com.archibus.app.common.space.dao.datasource;

import java.util.*;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.dao.IRoomTransactionDao;
import com.archibus.app.common.space.domain.*;
import com.archibus.datasource.*;
import com.archibus.datasource.data.DataRecord;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;

/**
 * Implementation of DataSource for RoomTransaction.
 * 
 * @see ObjectDataSourceImpl.
 * 
 * @author Valery Tydykov
 * @author Zhang Yi
 * 
 *         TODO: (VT): refactor this class into several classes - KB3038951
 */
public class RoomTransactionDataSource extends ObjectDataSourceImpl<RoomTransaction> implements
        IRoomTransactionDao {
    
    /**
     * Field names to property names mapping. All fields will be added to the DataSource.
     */
    static final String[][] FIELDS_TO_PROPERTIES = { { "pct_id", Constants.ID },
            { "from_bl_id", "fromBuildingId" }, { "from_fl_id", "fromFloorId" },
            { "from_rm_id", "fromRoomId" }, { Constants.RM_ID, "roomId" },
            { Constants.BL_ID, Constants.BUILDING_ID }, { Constants.FL_ID, Constants.FLOOR_ID },
            { Constants.DP_ID, Constants.DEPARTMENT_ID },
            { Constants.DV_ID, Constants.DIVISION_ID }, { Constants.EM_ID, Constants.EMPLOYEE_ID },
            { Constants.PRORATE, Constants.PRORATE }, { Constants.RM_TYPE, Constants.TYPE },
            { Constants.RM_CAT, Constants.CATEGORY }, { Constants.DATE_START, "dateStart" },
            { Constants.DATE_END, "dateEnd" }, { Constants.STATUS, Constants.STATUS },
            { Constants.PRIMARY_RM, "primaryRoom" }, { Constants.PRIMARY_EM, "primaryEmployee" },
            { "user_name", "userName" }, { "date_created", "dateCreated" },
            { "pct_space", "percentageOfSpace" }, { "del_user_name", "deletionUserName" },
            { "date_deleted", "dateDeleted" }, { "parent_pct_id", "parentId" },
            { "activity_log_id", "activityLogId" }, { "mo_id", "moId" } };
    
    /**
     * Constructs RoomTransactionDataSource, mapped to <code>rmpct</code> table, using
     * <code>roomTransaction</code> bean.
     */
    protected RoomTransactionDataSource() {
        super("roomTransaction", "rmpct");
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForRoom(final Room room, final Date dateTime) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef = prepareRestrictionForRoom(room, dateTime);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findPrimaryForRoom(final Room room, final Date dateTime) {
        // TODO: (VT): duplicated method
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef = prepareRestrictionForRoom(room, dateTime);
        // additional restriction: primary_rm = 1
        restrictionDef.addClause(this.tableName, Constants.PRIMARY_RM, 1, Operation.EQUALS);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    @Override
    protected String[][] getFieldsToProperties() {
        return FIELDS_TO_PROPERTIES.clone();
    }
    
    /**
     * Assembles parsed restriction from room and dateTime. Uses primary key values from the room.
     * Uses status value "1". Uses dateTime to set restrictions on date_start and date_end.
     * 
     * 
     * @param room The room to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    private ParsedRestrictionDef prepareRestrictionForRoom(final Room room, final Date dateTime) {
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        // Use Room primary keys
        restrictionDef.addClause(this.tableName, Constants.BL_ID, room.getBuildingId(),
            Operation.EQUALS);
        restrictionDef.addClause(this.tableName, Constants.FL_ID, room.getFloorId(),
            Operation.EQUALS);
        restrictionDef.addClause(this.tableName, Constants.RM_ID, room.getId(), Operation.EQUALS);
        // status = 1
        restrictionDef.addClause(this.tableName, Constants.STATUS, 1, Operation.EQUALS);
        
        if (dateTime != null) {
            RoomTransactionDataSourceHelper.addClausesForDateStartAndEnd(dateTime, restrictionDef);
        }
        
        return restrictionDef;
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findForEmployee(final Employee employee, final Date dateTime) {
        
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from employee and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionDataSourceHelper.prepareRestrictionForEmployee(employee, dateTime);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findPrimaryForEmployee(final Employee employee, final Date dateTime) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from employee and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionDataSourceHelper.prepareRestrictionForEmployee(employee, dateTime);
        
        // additional restriction: primary_em = 1
        // KB3037748 - the RelativeOperation should use RelativeOperation.AND_BRACKET
        restrictionDef.addClause(this.tableName, Constants.PRIMARY_EM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findNoPrimaryForEmployee(final Employee employee,
            final Date dateTime) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionDataSourceHelper.prepareRestrictionForEmployee(employee, dateTime);
        
        // additional restriction: primary_em = 0
        restrictionDef.addClause(this.tableName, Constants.PRIMARY_EM, 0, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    /** {@inheritDoc} */
    // TODO: (VT): inconsistent naming: Em -> Employee
    public List<RoomTransaction> findEmLocationChange(final Employee employee, final Date dateTime) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionDataSourceHelper.prepareRestrictionForEmployee(employee, dateTime);
        
        restrictionDef.addClause(this.tableName, Constants.PRIMARY_EM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.BL_ID,
            employee.getBuildingId(), true);
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.FL_ID,
            employee.getFloorId(), false);
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.RM_ID,
            employee.getRoomId(), false);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    /** {@inheritDoc} */
    // TODO: (VT): inconsistent naming: Em -> Employee
    public List<RoomTransaction> findEmDepartmentChange(final Employee employee, final Date dateTime) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef =
                RoomTransactionDataSourceHelper.prepareRestrictionForEmployee(employee, dateTime);
        
        restrictionDef.addClause(this.tableName, Constants.PRIMARY_EM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.DV_ID,
            employee.getDivisionId(), true);
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.DP_ID,
            employee.getDepartmentId(), false);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
    /** {@inheritDoc} */
    public List<RoomTransaction> findRoomAttributeChange(final Room room, final Date dateTime) {
        final DataSource dataSource = this.createCopy();
        
        // assemble parsed restriction from room and dateTime
        final ParsedRestrictionDef restrictionDef = prepareRestrictionForRoom(room, dateTime);
        
        restrictionDef.addClause(this.tableName, Constants.PRIMARY_RM, 1, Operation.EQUALS,
            RelativeOperation.AND_BRACKET);
        
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.RM_CAT,
            room.getCategory(), true);
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.RM_TYPE,
            room.getType(), false);
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.DV_ID,
            room.getDivisionId(), false);
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.DP_ID,
            room.getDepartmentId(), false);
        RoomTransactionDataSourceHelper.addExcludeClauseToRestrictionByField(restrictionDef, Constants.PRORATE,
            room.getProrate(), false);
        
        final List<DataRecord> records = dataSource.getRecords(restrictionDef);
        
        return new DataSourceObjectConverter<RoomTransaction>().convertRecordsToObjects(records,
            this.beanName, this.fieldToPropertyMapping, null);
    }
    
}
