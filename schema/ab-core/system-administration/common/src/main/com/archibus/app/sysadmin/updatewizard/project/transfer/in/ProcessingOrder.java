package com.archibus.app.sysadmin.updatewizard.project.transfer.in;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.project.util.*;
import com.archibus.context.ContextStore;
import com.archibus.schema.*;

/**
 * Sets processing order for transfer in based on table's dependencies.
 * 
 * @author Catalin Purice
 * 
 */
public class ProcessingOrder {
    
    /**
     * List of tables selected by the user.
     */
    private final List<String> tablesToTransferIn;
    
    /**
     * List of tables ordered.
     */
    private final List<String> tablesByProcOrder = new ArrayList<String>();
    
    /**
     * Current branch.
     */
    private List<String> currentBranch;
    
    /**
     * Tells if the references will be dropped or not.
     */
    private final boolean isDropReferences;
    
    /**
     * Circular references in format Table name,field name.
     */
    private final List<Map<String, String>> circularRefFound = new ArrayList<Map<String, String>>();
    
    /**
     * Constructor.
     * 
     * @param tablesToTransferIn tables to be transfered in
     * @param isDropReferences tells if the references will be dropped or not
     */
    public ProcessingOrder(final List<String> tablesToTransferIn, final boolean isDropReferences) {
        super();
        this.isDropReferences = isDropReferences;
        this.tablesToTransferIn = tablesToTransferIn;
        for (final String tableName : this.tablesToTransferIn) {
            this.tablesByProcOrder.add(tableName);
        }
    }
    
    /**
     * @return the tablesByProcOrder
     */
    public List<String> getTablesByProcOrder() {
        return this.tablesByProcOrder;
    }
    
    /**
     * @return the circularRefFound
     */
    public List<Map<String, String>> getCircularRefFound() {
        return this.circularRefFound;
    }
    
    /**
     * Order the table names in the list according to dependencies.
     */
    public void calculatePrecedence() {
        for (final String tableName : this.tablesToTransferIn) {
            this.currentBranch = new ArrayList<String>();
            processParents(tableName);
        }
    }
    
    /**
     * 
     * @param tableName table name
     */
    private void processParents(final String tableName) {
        this.currentBranch.add(tableName);
        final List<String> parentTables = getParentTables(tableName);
        
        for (final String parentTable : parentTables) {
            if (this.currentBranch.contains(parentTable)) {
                ProjectUpdateWizardLogger.logWarning(String.format(
                    "Found circular reference on branch:%s", getCircularRefBranch(parentTable)));
                if (this.isDropReferences) {
                    removeCircularRefTable(tableName, parentTable);
                }
                addCircularReference(tableName, parentTable);
                break;
            } else {
                processParents(parentTable);
                switchTables(tableName, parentTable);
            }
        }
        this.currentBranch.remove(tableName);
    }
    
    /**
     * 
     * @param childTable table name
     * @param parentTable parent table
     */
    private void addCircularReference(final String childTable, final String parentTable) {
        final TableDef.ThreadSafe childTableDef =
                ContextStore.get().getProject().loadTableDef(childTable);
        String childFieldName = "";
        for (final ForeignKey.Immutable foreignKey : childTableDef.getForeignKeys()) {
            if (parentTable.equalsIgnoreCase(foreignKey.getReferenceTable())) {
                childFieldName = foreignKey.getName();
                if (!isCircRefAlreadyExists(childTable, childFieldName)) {
                    final Map<String, String> circularReference = new HashMap<String, String>();
                    circularReference.put(ProjectUpdateWizardUtilities.TABLE_NAME, childTable);
                    circularReference.put(ProjectUpdateWizardUtilities.FIELD_NAME, childFieldName);
                    this.circularRefFound.add(circularReference);
                }
            }
        }
    }
    
    /**
     * Returns true if the reference has been already added or false otherwise.
     * 
     * @param tableName table name
     * @param fieldName field name
     * @return true if the reference has been already added
     */
    private boolean isCircRefAlreadyExists(final String tableName, final String fieldName) {
        boolean alreadyExists = false;
        for (final Map<String, String> circRef : this.circularRefFound) {
            if (tableName.equals(circRef.get(ProjectUpdateWizardUtilities.TABLE_NAME))
                    && fieldName.equals(circRef.get(ProjectUpdateWizardUtilities.FIELD_NAME))) {
                alreadyExists = true;
                break;
            }
        }
        return alreadyExists;
    }
    
    /**
     * Switch tables to respect the dependency.
     * 
     * @param tableName table name
     * @param parentTable parent table name
     */
    private void switchTables(final String tableName, final String parentTable) {
        final int tableIndex = this.tablesByProcOrder.indexOf(tableName);
        final int parentIndex = this.tablesByProcOrder.indexOf(parentTable);
        if (parentIndex > tableIndex) {
            this.tablesByProcOrder.set(tableIndex, parentTable);
            this.tablesByProcOrder.set(parentIndex, tableName);
        }
    }
    
    /**
     * 
     * @param loopTableName table name
     * @return circular reference as a String in the format table1-->table2-->table1
     */
    private String getCircularRefBranch(final String loopTableName) {
        final StringBuffer branch = new StringBuffer();
        for (final String node : this.currentBranch) {
            branch.append(node);
            branch.append("-->");
        }
        return branch.append(loopTableName).toString();
    }
    
    /**
     * Drops foreign keys in ARCHBUS and Sql database.
     * 
     * @param childTable child table name
     * @param parentTable parent table name
     */
    private void removeCircularRefTable(final String childTable, final String parentTable) {
        final TableDef.ThreadSafe childTableDef =
                ContextStore.get().getProject().loadTableDef(childTable);
        String childFieldName = "";
        for (final ForeignKey.Immutable foreignKey : childTableDef.getForeignKeys()) {
            if (parentTable.equalsIgnoreCase(foreignKey.getReferenceTable())) {
                childFieldName = foreignKey.getName();
            }
        }
        final CircularReference cRef = new CircularReference(childTable, childFieldName);
        cRef.dropArchibusReference();
        cRef.dropSqlReference();
        ContextStore.get().getProject().clearCachedTableDefs();
    }
    
    /**
     * 
     * @param tableName table name
     * @return list of children tables
     */
    private List<String> getParentTables(final String tableName) {
        final TableDef.ThreadSafe tableDef =
                ContextStore.get().getProject().loadTableDef(tableName);
        
        final List<String> parentTables = new ArrayList<String>();
        for (final ForeignKey.Immutable foreignKey : tableDef.getForeignKeys()) {
            if (tableDef.getFieldDef(foreignKey.getName()).isValidateData()) {
                final String parentName = foreignKey.getReferenceTable();
                if (!parentTables.contains(parentName)
                        && this.tablesToTransferIn.contains(parentName)) {
                    parentTables.add(foreignKey.getReferenceTable());
                }
            }
        }
        return parentTables;
    }
}
