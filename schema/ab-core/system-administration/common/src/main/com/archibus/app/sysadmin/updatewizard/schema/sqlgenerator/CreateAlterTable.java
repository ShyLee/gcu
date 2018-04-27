package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import java.util.*;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.dbschema.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.context.ContextStore;
import com.archibus.datasource.*;
import com.archibus.schema.*;
import com.archibus.utility.ListWrapper;

/**
 * Implements Create/recreate/alter new table work-flows.
 * 
 * @author Catalin Purice
 * 
 */
public class CreateAlterTable extends ManageKeys {
    
    /**
     * Constant.
     */
    private static final String APOS = "'";
    
    /**
     * Constant.
     */
    private static final String CREATE_TABLE = "CREATE TABLE ";
    
    /**
     * true if the FK were dropped already for table.
     */
    private boolean isFkDropped;
    
    /**
     * True if the DB will be user CHAR type.
     */
    private boolean nlsToChar;
    
    /**
     * The output.
     */
    private SqlCommandOutput output;
    
    /**
     * true if the command drop/create primary key has been generated.
     */
    private boolean pkAlreadyChanged;
    
    /**
     * postponed statements.
     */
    private final List<String> postponedStmts;
    
    /**
     * Sql table definition.
     */
    private DatabaseSchemaTableDef sqlTableDef;
    
    /**
     * Archibus table definition.
     */
    private TableDef.ThreadSafe tableDef;
    
    /**
     * Name of the table space for oracle.
     */
    private String tableSpaceName;
    
    /**
     * if we recreate the table or not.
     */
    private boolean toBeRecreated;
    
    /**
     * Implicit constructor.
     * 
     */
    public CreateAlterTable() {
        super();
        this.postponedStmts = new ArrayList<String>();
        this.tableSpaceName = "";
    }
    
    /**
     * Constructor.
     * 
     * @param tableDef Archibus table definition
     * @param out Output
     * @param tableSpaceName name of Oracle tablespace
     */
    public CreateAlterTable(final TableDef.ThreadSafe tableDef, final SqlCommandOutput out,
            final String tableSpaceName) {
        super(tableDef, out);
        this.output = out;
        this.tableDef = tableDef;
        this.postponedStmts = new ArrayList<String>();
        this.sqlTableDef = new DatabaseSchemaTableDef(tableDef.getName());
        this.tableSpaceName = tableSpaceName;
    }
    
    /**
     * Alters the table.
     * 
     */
    public void alterTable() {
        
        final String tableName = getTableName();
        
        // check fields
        this.tableDef = ContextStore.get().getProject().loadTableDef(tableName);
        
        verifyFields();
        
        final CompareFieldDef compareTable =
                new CompareFieldDef(this.sqlTableDef, this.tableDef, "PRIMARY KEY");
        
        if (compareTable.hasPrimaryKeysChanged() && !this.pkAlreadyChanged) {
            reCreatePrimaryKeys(true);
            this.pkAlreadyChanged = true;
        }
    }
    
    /**
     * Create table.
     */
    public void createTable() {
        String tableName = getTableName();
        if (this.toBeRecreated) {
            tableName = SchemaUpdateWizardConstants.TEMP_TABLE;
        }
        
        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> tableFieldsDef =
                this.tableDef.getFieldsList();
        
        final int noOfFields = tableFieldsDef.size();
        
        if (noOfFields > 0) {
            String createStatement = CREATE_TABLE;
            
            if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(tableName)) {
                createStatement +=
                        SchemaUpdateWizardConstants.getSecureUser()
                                + SchemaUpdateWizardConstants.DOT;
            }
            
            createStatement += tableName;
            
            createStatement +=
                    TableUtilities.buildTableFields(this.nlsToChar, this.tableSpaceName,
                        tableFieldsDef);
            
            this.output.runCommand(createStatement, DataSource.DB_ROLE_SCHEMA);
            
            if (!this.toBeRecreated) {
                // create primary keys
                reCreatePrimaryKeys(true);
            }
            TableUtilities.grantPermissionToTable(tableName, this.output);
        }
    }
    
    /**
     * Drops the table.
     * 
     * @param tableName name of table
     */
    public void dropTable(final String tableName) {
        dropAllFK();
        final String dropStmt = "DROP TABLE " + tableName;
        this.output.runCommand(dropStmt, DataSource.DB_ROLE_SCHEMA);
    }
    
    /**
     * @return the postponedStmts
     */
    public List<String> getPostponedStmts() {
        return this.postponedStmts;
    }
    
    /**
     * @return the sysTableDef
     */
    public DatabaseSchemaTableDef getSqlTableDef() {
        return this.sqlTableDef;
    }
    
    /**
     * @return the tableDef
     */
    public TableDef.ThreadSafe getTableDef() {
        return this.tableDef;
    }
    
    /**
     * Getter for the nlsToChar property.
     * 
     * @see nlsToChar
     * @return the nlsToChar property.
     */
    public boolean isNlsToChar() {
        return this.nlsToChar;
    }
    
    /**
     * Modifies the field.
     * 
     * @param fieldToCompare compared field
     */
    public void modifyFieldDefn(final CompareFieldDef fieldToCompare) {
        boolean dontSetNotNull = false;
        final boolean allowNullChanged = fieldToCompare.get(PropertyType.ALLOWNULL).isChanged();
        final boolean newValue =
                Boolean
                    .valueOf(fieldToCompare.get(PropertyType.ALLOWNULL).getNewValue().toString());
        
        if (!allowNullChanged) {
            dontSetNotNull = true;
        }
        if (allowNullChanged && !newValue) {
            final String updateNullFields =
                    TableUtilities.updateNullFields(fieldToCompare.getArcFieldDef());
            this.output.runCommand(updateNullFields, DataSource.DB_ROLE_DATA);
        }
        
        final AlterField fieldToAlter =
                new AlterField(fieldToCompare, this.nlsToChar, dontSetNotNull, this.output);
        fieldToAlter.alterField();
    }
    
    /**
     * 
     * Recreate the table with primary keys.
     */
    public void recreateTable() {
        
        this.toBeRecreated = true;
        if (DatabaseSchemaUtilities.isTableInSql(SchemaUpdateWizardConstants.TEMP_TABLE)) {
            dropTable(SchemaUpdateWizardConstants.TEMP_TABLE);
        }
        // Create table
        createTable();
        
        final CopyProjectData copyData =
                new CopyProjectData(this.tableDef, this.sqlTableDef, this.output);
        copyData.copyData();
        // Drop constraints from/to table
        this.dropAllFK();
        // Drop Primary Key
        dropPrimaryKeys();
        // drop current table
        dropTable(this.sqlTableDef.getTableName());
        // rename temporary table to actual table name
        renameTable();
        // create primary keys. For table that become AUTOINCREMENT, the sequence is already
        // created.
        createPrimaryKeys(!copyData.isTableAutoincrementNow());
    }
    
    /**
     * Setter for the nlsToChar property.
     * 
     * @see nlsToChar
     * @param nlsToChar the nlsToChar to set
     */
    
    public void setNlsToChar(final boolean nlsToChar) {
        this.nlsToChar = nlsToChar;
    }
    
    /**
     * @param output the output to set
     */
    public void setOutput(final SqlCommandOutput output) {
        this.output = output;
        this.setManagerKeysOutput(output);
    }
    
    /**
     * @param sysTableDef the sysTableDef to set
     */
    public void setSqlTableDef(final DatabaseSchemaTableDef sysTableDef) {
        this.sqlTableDef = sysTableDef;
        this.setManagerSqlTableDef(sysTableDef);
    }
    
    /**
     * @param tableDef the tableDef to set
     */
    public void setTableDef(final TableDef.ThreadSafe tableDef) {
        this.tableDef = tableDef;
    }
    
    /**
     * @param tableSpaceName the tableSpaceName to set
     */
    public void setTableSpaceName(final String tableSpaceName) {
        this.tableSpaceName = tableSpaceName;
    }
    
    /**
     * @return table name
     */
    protected String getTableName() {
        return this.tableDef.getName();
    }
    
    /**
     * Rename this.tableName.
     */
    private void renameTable() {
        
        String renameTableStmt = "";
        final String tableName = getTableName();
        if (SqlUtils.isSqlServer()) {
            renameTableStmt = "EXEC sp_rename '";
            renameTableStmt += SchemaUpdateWizardConstants.TEMP_TABLE;
            renameTableStmt += "','";
            renameTableStmt += tableName;
            renameTableStmt += APOS;
        } else {
            renameTableStmt = SchemaUpdateWizardConstants.ALTER_TABLE;
            
            /*
             * for Oracle, tables afm_users and afm_groups are owned by afm_secure. thus when
             * issuing the Alter Table statement, we need to specify the owner.
             */
            if (SqlUtils.isOracle()
                    && SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(tableName)) {
                renameTableStmt +=
                        SchemaUpdateWizardConstants.getSecureUser()
                                + SchemaUpdateWizardConstants.DOT;
            }
            
            renameTableStmt += SchemaUpdateWizardConstants.TEMP_TABLE;
            
            if (SqlUtils.isOracle()) {
                renameTableStmt += " RENAME TO ";
            } else {
                renameTableStmt += " RENAME ";
            }
            
            renameTableStmt += tableName;
        }
        
        if (SqlUtils.isOracle()
                && SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(tableName)) {
            this.output.runCommand(renameTableStmt, DataSource.DB_ROLE_SECURITY);
        } else {
            this.output.runCommand(renameTableStmt, DataSource.DB_ROLE_SCHEMA);
        }
        
        TableUtilities.grantPermissionToTable(tableName, this.output);
    }
    
    /**
     * @return true if the table was changed
     */
    private boolean verifyFields() {
        
        boolean tableChanged = false;
        final ListWrapper.Immutable<ArchibusFieldDefBase.Immutable> arcFieldsDef =
                this.tableDef.getFieldsList();
        
        for (final ArchibusFieldDefBase.Immutable arcFieldDef : arcFieldsDef) {
            
            final String fieldName = arcFieldDef.getName();
            
            // in case field does not exists add it and continue with the next field.
            if (this.sqlTableDef.isNewField(fieldName)) {
                continue;
            }
            // these fields are not Primary Key, Foreign/Key or new, so they can be easy changed
            final CompareFieldDef compareField =
                    new CompareFieldDef(this.sqlTableDef, this.tableDef, fieldName)
                        .compareFieldProperties();
            if (compareField.isChanged()) {
                tableChanged = true;
                if (TableUtilities.isRecreateTable(compareField)) {
                    recreateTable();
                } else {
                    if (TableUtilities.isPkOrFkChanged(compareField)) {
                        whenPkOrFkChanged(compareField);
                        this.isFkDropped = true;
                    } else {
                        modifyFieldDefn(compareField);
                    }
                }
            }
        }
        return tableChanged;
    }
    
    /**
     * 
     * @param changedFieldDef compared field definition
     */
    private void whenPkOrFkChanged(final CompareFieldDef changedFieldDef) {
        
        final boolean pkChanged =
                changedFieldDef.getArcFieldDef().isPrimaryKey()
                        || changedFieldDef.getSysFieldDef().isPrimaryKey();
        if (!this.isFkDropped) {
            dropAllFK();
        }
        
        if (pkChanged) {
            dropPrimaryKeys();
        }
        
        modifyFieldDefn(changedFieldDef);
        
        if (pkChanged) {
            createPrimaryKeys(true);
            this.pkAlreadyChanged = true;
        }
        /**
         * Disable cascade changes
         */
        // get all tables related to that field
        // final String tableName = changedFieldDef.getTableName();
        // final String fieldName = changedFieldDef.getFieldName();
        // final String newSize = changedFieldDef.get(PropTypes.SIZE).getNewValue().toString();
        // final int newDataType = Integer.valueOf(changedFieldDef.get(PropTypes.TYPE)
        // .getNewValue().toString());
        // final CascadeManager cascadeField = new CascadeManager(tableName, fieldName, newSize,
        // newDataType, this.nlsToChar);
        // cascadeField.setRootField();
        // cascadeField.loadCascadeFields();
        
        // cascadeField.dropPrimaryKeysCascade(this.output);
        // cascadeField.dropForeignKeysCascade(this.output);
        
        // modify fields
        // final List<String> alterFieldsStmts = cascadeField.modifyFieldsCascade(this.output,
        // this.tableSpaceName);
        // this.output.runCommands(alterFieldsStmts);
        
        // cascadeField.createPrimaryKeysCascade(this.output);
        
    }
}