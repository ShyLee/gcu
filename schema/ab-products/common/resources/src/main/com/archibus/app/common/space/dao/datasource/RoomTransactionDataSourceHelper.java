package com.archibus.app.common.space.dao.datasource;

import java.util.Date;

import com.archibus.app.common.organization.domain.Employee;
import com.archibus.app.common.space.domain.Room;
import com.archibus.model.view.datasource.ClauseDef.Operation;
import com.archibus.model.view.datasource.ClauseDef.RelativeOperation;
import com.archibus.model.view.datasource.*;
import com.archibus.utility.StringUtil;

/**
 * Helper class for DataSource Class for RoomTransaction.
 * 
 * 
 * @author Zhang Yi
 * 
 */
public final class RoomTransactionDataSourceHelper {
    
    /**
     * Table name "rmpct".
     */
    public static final String RMPCT = "rmpct";
    
    /**
     * Private Constructor of utility class .
     * 
     */
    private RoomTransactionDataSourceHelper() {
        
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
    public static ParsedRestrictionDef prepareRestrictionForRoom(final Room room,
            final Date dateTime) {
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        // Use Room primary keys
        restrictionDef.addClause(RMPCT, Constants.BL_ID, room.getBuildingId(), Operation.EQUALS);
        restrictionDef.addClause(RMPCT, Constants.FL_ID, room.getFloorId(), Operation.EQUALS);
        restrictionDef.addClause(RMPCT, Constants.RM_ID, room.getId(), Operation.EQUALS);
        // status = 1
        restrictionDef.addClause(RMPCT, Constants.STATUS, 1, Operation.EQUALS);
        
        if (dateTime != null) {
            addClausesForDateStartAndEnd(dateTime, restrictionDef);
        }
        
        return restrictionDef;
    }
    
    /**
     * Adds clauses for dateStart and dateEnd.
     * 
     * @param dateTime The dateTime to assemble the restriction for.
     * @param restrictionDef to add clauses to.
     */
    public static void addClausesForDateStartAndEnd(final Date dateTime,
            final ParsedRestrictionDef restrictionDef) {
        // (date_start IS NULL OR date_start <= dateTime)
        restrictionDef.addClause(RMPCT, Constants.DATE_START, dateTime, Operation.LTE,
            RelativeOperation.AND_BRACKET);
        restrictionDef.addClause(RMPCT, Constants.DATE_START, null, Operation.IS_NULL,
            RelativeOperation.OR);
        
        // (date_end IS NULL OR date_end >= dateTime)
        restrictionDef.addClause(RMPCT, Constants.DATE_END, dateTime, Operation.GTE,
            RelativeOperation.AND_BRACKET);
        restrictionDef.addClause(RMPCT, Constants.DATE_END, null, Operation.IS_NULL,
            RelativeOperation.OR);
    }
    
    /**
     * 
     * Add an exclude clause by a given field's name and value to a restriction to rmpct table. When
     * the field value exists, the SQL is like '(rmpct.dv_id!=fieldValue or rmpct.dv_id is null)';
     * when the field value is not existed, the SQL would be like 'rmpct.dv_id is not null'
     * 
     * 
     * @param restrictionDef The restriction need to add clause.
     * @param fieldName field's name.
     * @param fieldValue field's value.
     * @param needsBracket specify if clause needs a bracket, true or false.
     * 
     */
    public static void addExcludeClauseToRestrictionByField(
            final ParsedRestrictionDef restrictionDef, final String fieldName,
            final Object fieldValue, final boolean needsBracket) {
        
        // initial an RelativeOperation: if the sign 'needsBracket' is true, then use 'AND_BRACKET'
        // else just use a 'OR'.
        RelativeOperation relativeOperation;
        if (needsBracket) {
            relativeOperation = RelativeOperation.AND_BRACKET;
        } else {
            relativeOperation = RelativeOperation.OR;
        }
        
        if (StringUtil.notNullOrEmpty(fieldValue)) {
            
            // if field value exists, then add restriction clause for sql like
            // (rmpct.fieldName!=fieldValue or rmpct.fieldName is null)
            restrictionDef.addClause(RMPCT, fieldName, fieldValue, Operation.NOT_EQUALS,
                relativeOperation);
            restrictionDef.addClause(RMPCT, fieldName, null, Operation.IS_NULL,
                RelativeOperation.OR);
            
        } else {
            
            // if field value is empty or null, then add a clause of 'IS NOT NULL'.
            restrictionDef.addClause(RMPCT, fieldName, null, Operation.IS_NOT_NULL,
                relativeOperation);
            
        }
    }
    
    /**
     * Assembles parsed restriction from employee and dateTime. Uses primary key values from the
     * employee. Uses status value "1". Uses dateTime to set restrictions on date_start and
     * date_end.
     * 
     * 
     * @param employee The employee to assemble the restriction for.
     * @param dateTime The dateTime to assemble the restriction for.
     * @return Assembled parsed restriction.
     */
    public static ParsedRestrictionDef prepareRestrictionForEmployee(final Employee employee,
            final Date dateTime) {
        final ParsedRestrictionDef restrictionDef = new ParsedRestrictionDef();
        // Use Employee primary keys
        restrictionDef.addClause(RMPCT, Constants.EM_ID, employee.getId(), Operation.EQUALS);
        // status = 1
        restrictionDef.addClause(RMPCT, Constants.STATUS, 1, Operation.EQUALS);
        
        addClausesForDateStartAndEnd(dateTime, restrictionDef);
        
        return restrictionDef;
    }
}
