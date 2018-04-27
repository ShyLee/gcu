package com.archibus.service.school.dbf;

import com.archibus.service.school.javadbf.DBFField;

public class FieldSDWDef {
    public static DBFField[] getDwFields() {
        final DBFField fields[] = new DBFField[12];
        
        fields[0] = new DBFField();
        fields[0].setName("单位编号");
        fields[0].setDataType(DBFField.FIELD_TYPE_C);
        fields[0].setFieldLength(10);
        
        fields[1] = new DBFField();
        fields[1].setName("单位名称");
        fields[1].setDataType(DBFField.FIELD_TYPE_C);
        fields[1].setFieldLength(40);
        
        fields[2] = new DBFField();
        fields[2].setName("单位简称");
        fields[2].setDataType(DBFField.FIELD_TYPE_C);
        fields[2].setFieldLength(20);
        
        fields[3] = new DBFField();
        fields[3].setName("单位简码");
        fields[3].setDataType(DBFField.FIELD_TYPE_C);
        fields[3].setFieldLength(10);
        
        fields[4] = new DBFField();
        fields[4].setName("建立年份");
        fields[4].setDataType(DBFField.FIELD_TYPE_C);
        fields[4].setFieldLength(4);
        
        fields[5] = new DBFField();
        fields[5].setName("单位性质");
        fields[5].setDataType(DBFField.FIELD_TYPE_C);
        fields[5].setFieldLength(1);
        
        fields[6] = new DBFField();
        fields[6].setName("使用方向值");
        fields[6].setDataType(DBFField.FIELD_TYPE_C);
        fields[6].setFieldLength(1);
        
        fields[7] = new DBFField();
        fields[7].setName("经费科目值");
        fields[7].setDataType(DBFField.FIELD_TYPE_C);
        fields[7].setFieldLength(1);
        
        fields[8] = new DBFField();
        fields[8].setName("单位标志");
        fields[8].setDataType(DBFField.FIELD_TYPE_C);
        fields[8].setFieldLength(1);
        
        fields[9] = new DBFField();
        fields[9].setName("标志");
        fields[9].setDataType(DBFField.FIELD_TYPE_C);
        fields[9].setFieldLength(1);
        
        fields[10] = new DBFField();
        fields[10].setName("审核");
        fields[10].setDataType(DBFField.FIELD_TYPE_C);
        fields[10].setFieldLength(1);
        
        fields[11] = new DBFField();
        fields[11].setName("校区");
        fields[11].setDataType(DBFField.FIELD_TYPE_C);
        fields[11].setFieldLength(1);
        
        return fields;
    }
}
