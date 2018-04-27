package com.archibus.app.sysadmin.updatewizard.schema.sqlgenerator;

import com.archibus.app.sysadmin.updatewizard.schema.compare.*;
import com.archibus.app.sysadmin.updatewizard.schema.output.SqlCommandOutput;
import com.archibus.app.sysadmin.updatewizard.schema.util.*;
import com.archibus.datasource.*;

/**
 * Alter a table field.
 * 
 * @author Catalin Purice
 * 
 */
public class AlterField extends SqlFieldDefinition {
    
    /**
     * Constant.
     */
    private static final String SPACE = " ";
    
    /**
     * compared field.
     */
    private final CompareFieldDef fieldToCompare;
    
    /**
     * alter field statement prefix.
     */
    private final String alterFieldStatementPrefix;
    
    /**
     * sql field commands.
     */
    // private final SqlFieldDefinition fieldSqlCommands;
    
    /**
     * field definition.
     */
    private final String fieldDefinition;
    
    /**
     * Output.
     */
    private final SqlCommandOutput output;
    
    /**
     * Constructor.
     * 
     * @param fieldToCompare compared field
     * @param alterFieldStatementPrefix alter field statement
     * @param fieldSqlCommands sql field commands
     * @param fieldDefinition field definition
     * @param output output
     */
    /*
     * public AlterField(final CompareFieldDef fieldToCompare, final String
     * alterFieldStatementPrefix, final SqlFieldDefinition fieldSqlCommands, final String
     * fieldDefinition, final SqlCommandOutput output) { this.fieldToCompare = fieldToCompare;
     * this.alterFieldStatementPrefix = alterFieldStatementPrefix; this.fieldSqlCommands =
     * fieldSqlCommands; this.fieldDefinition = fieldDefinition; this.output = output; }
     */
    
    /**
     * Constructor.
     * 
     * @param fieldToCompareDefn compared field
     * @param isNlsToChar for Oracle only
     * @param dontSetNotNull whether or not the field is to be set not null
     * @param output output
     */
    public AlterField(final CompareFieldDef fieldToCompareDefn, final boolean isNlsToChar,
            final boolean dontSetNotNull, final SqlCommandOutput output) {
        // final SqlFieldDefinition fieldSqlCommands =
        super(fieldToCompareDefn.getArcFieldDef(), isNlsToChar);
        this.fieldToCompare = fieldToCompareDefn;
        this.fieldDefinition = fieldDefinition(dontSetNotNull, null, null, true, "");
        String alterFieldStmt = SchemaUpdateWizardConstants.ALTER_TABLE;
        if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(fieldToCompareDefn
            .getArcFieldDef().getTableName())) {
            alterFieldStmt += SchemaUpdateWizardConstants.getSecureUser() + SchemaUpdateWizardConstants.DOT;
        }
        alterFieldStmt += fieldToCompareDefn.getArcFieldDef().getTableName();
        if (SqlUtils.isSqlServer()) {
            alterFieldStmt += SchemaUpdateWizardConstants.ALTER_COLUMN;
        } else {
            alterFieldStmt += SchemaUpdateWizardConstants.MODIFY;
        }
        this.alterFieldStatementPrefix = alterFieldStmt;
        this.output = output;
    }
    
    /**
     * Getter for the alterFieldStatementPrefix property.
     * 
     * @see alterFieldStatementPrefix
     * @return the alterFieldStatementPrefix property.
     */
    public String getAlterFieldStatementPrefix() {
        return this.alterFieldStatementPrefix;
    }
    
    /**
     * Alter the field when autoincrement changed.
     */
    private void alterAutoincrement() {
        final String alterFieldStmt = this.alterFieldStatementPrefix + this.fieldDefinition;
        this.output.runCommand(alterFieldStmt, DataSource.ROLE_STANDARD);
    }
    
    /**
     * Alter the field when DEFAULT changed.
     */
    private void alterDefault() {
        if (SqlUtils.isSqlServer()) {
            final String dropDfltConstr =
                    SqlServerActions.dropDefaultValueConstraintIfExists(
                        this.fieldToCompare.getArchTableDef().getName(), 
                        this.fieldToCompare.getArcFieldDef().getName());
            this.output.runCommand(dropDfltConstr, DataSource.ROLE_STANDARD);
            final String addDfltConstr =
                    SqlServerActions.changeDefaultValue(this.fieldToCompare.getArcFieldDef());
            this.output.runCommand(addDfltConstr, DataSource.ROLE_STANDARD);
        } else {
            String alterDefaultStmt =
                    this.alterFieldStatementPrefix + this.fieldToCompare.getArcFieldDef().getName();
            alterDefaultStmt += this.getDefaultStatement();
            this.output.runCommand(alterDefaultStmt, DataSource.ROLE_STANDARD);
        }
    }
    
    /**
     * Alter the field when ALLOW NULL changed.
     */
    private void alterAllowNull() {
        String alterAllowNullStmt =
                this.alterFieldStatementPrefix + this.fieldToCompare.getArcFieldDef().getName();
        if (SqlUtils.isSqlServer()) {
            alterAllowNullStmt += SPACE + this.getDataTypeStatement();
        }
        alterAllowNullStmt += this.getAllowNullStatement();
        this.output.runCommand(alterAllowNullStmt, DataSource.ROLE_STANDARD);
    }
    
    /**
     * Alter the field when SIZE and/or TYPE changed.
     */
    private void alterTypeAndSize() {
        String alterFieldStmt = this.alterFieldStatementPrefix + this.fieldDefinition;
        if (SqlUtils.isSqlServer() || SqlUtils.isOracle()) {
            alterFieldStmt =
                    this.alterFieldStatementPrefix + this.fieldToCompare.getArcFieldDef().getName() + SPACE
                            + this.getDataTypeStatement() + this.getAllowNullStatement();
        }
        this.output.runCommand(alterFieldStmt, DataSource.ROLE_STANDARD);
    }
    
    /**
     * alter field.
     */
    public void alterField() {
        if (this.fieldToCompare.get(PropertyType.DEFAULT).isChanged()) {
            alterDefault();
        }
        if (this.fieldToCompare.get(PropertyType.ALLOWNULL).isChanged()) {
            alterAllowNull();
        }
        if (this.fieldToCompare.get(PropertyType.SIZE).isChanged()
                || this.fieldToCompare.get(PropertyType.DECIMALS).isChanged()
                || this.fieldToCompare.get(PropertyType.TYPE).isChanged()
                || this.fieldToCompare.get(PropertyType.PK_CHG).isChanged()) {
            alterTypeAndSize();
        }
        if (this.fieldToCompare.get(PropertyType.AUTONUM).isChanged()) {
            alterAutoincrement();
        }
    }
    
    /**
     * Renames the fieldName.
     * 
     * @param tableName table name
     * @param oldFieldName old field name
     * @param newFieldName new field name
     * @return rename field statement
     */
    public static String renameField(final String tableName, final String oldFieldName, final String newFieldName) {
        String renameFieldStmt = SchemaUpdateWizardConstants.ALTER_TABLE;
        if (SchemaUpdateWizardUtilities.useAfmSecurePrefixForTable(tableName)) {
            renameFieldStmt += SchemaUpdateWizardConstants.getSecureUser() + SchemaUpdateWizardConstants.DOT;
        }
        renameFieldStmt +=
                tableName + SchemaUpdateWizardConstants.RENAME + oldFieldName + " TO "
                        + newFieldName;
        return renameFieldStmt;
    }

}
