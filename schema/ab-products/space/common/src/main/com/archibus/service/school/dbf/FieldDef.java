package com.archibus.service.school.dbf;

import com.archibus.service.school.javadbf.DBFField;

public class FieldDef {
    
    public static DBFField[] getEqFields() {
        final DBFField fields[] = new DBFField[53];
        
        fields[0] = new DBFField();
        fields[0].setName("领用单位号");
        fields[0].setDataType(DBFField.FIELD_TYPE_C);
        fields[0].setFieldLength(10);
        
        fields[1] = new DBFField();
        fields[1].setName("仪器编号");
        fields[1].setDataType(DBFField.FIELD_TYPE_C);
        fields[1].setFieldLength(8);
        
        fields[2] = new DBFField();
        fields[2].setName("分类号");
        fields[2].setDataType(DBFField.FIELD_TYPE_C);
        fields[2].setFieldLength(8);
        
        fields[3] = new DBFField();
        fields[3].setName("仪器名称");
        fields[3].setDataType(DBFField.FIELD_TYPE_C);
        fields[3].setFieldLength(40);
        
        fields[4] = new DBFField();
        fields[4].setName("型号");
        fields[4].setDataType(DBFField.FIELD_TYPE_C);
        fields[4].setFieldLength(30);
        
        fields[5] = new DBFField();
        fields[5].setName("规格");
        fields[5].setDataType(DBFField.FIELD_TYPE_C);
        fields[5].setFieldLength(50);
        
        fields[6] = new DBFField();
        fields[6].setName("单价");
        fields[6].setDataType(DBFField.FIELD_TYPE_N);
        fields[6].setFieldLength(12);
        fields[6].setDecimalCount(2);
        
        fields[7] = new DBFField();
        fields[7].setName("国别");
        fields[7].setDataType(DBFField.FIELD_TYPE_C);
        fields[7].setFieldLength(10);
        
        fields[8] = new DBFField();
        fields[8].setName("国别码");
        fields[8].setDataType(DBFField.FIELD_TYPE_C);
        fields[8].setFieldLength(3);
        
        fields[9] = new DBFField();
        fields[9].setName("厂家");
        fields[9].setDataType(DBFField.FIELD_TYPE_C);
        fields[9].setFieldLength(40);
        
        fields[10] = new DBFField();
        fields[10].setName("出厂号");
        fields[10].setDataType(DBFField.FIELD_TYPE_C);
        fields[10].setFieldLength(20);
        
        fields[11] = new DBFField();
        fields[11].setName("出厂日期");
        fields[11].setDataType(DBFField.FIELD_TYPE_C);
        fields[11].setFieldLength(7);
        
        fields[12] = new DBFField();
        fields[12].setName("购置日期");
        fields[12].setDataType(DBFField.FIELD_TYPE_C);
        fields[12].setFieldLength(7);
        
        fields[13] = new DBFField();
        fields[13].setName("附件数量");
        fields[13].setDataType(DBFField.FIELD_TYPE_N);
        fields[13].setFieldLength(3);
        fields[13].setDecimalCount(0);
        
        fields[14] = new DBFField();
        fields[14].setName("附件总价");
        fields[14].setDataType(DBFField.FIELD_TYPE_N);
        fields[14].setFieldLength(12);
        fields[14].setDecimalCount(2);
        
        fields[15] = new DBFField();
        fields[15].setName("现状");
        fields[15].setDataType(DBFField.FIELD_TYPE_C);
        fields[15].setFieldLength(1);
        
        fields[16] = new DBFField();
        fields[16].setName("管理级别");
        fields[16].setDataType(DBFField.FIELD_TYPE_C);
        fields[16].setFieldLength(1);
        
        fields[17] = new DBFField();
        fields[17].setName("领用人");
        fields[17].setDataType(DBFField.FIELD_TYPE_C);
        fields[17].setFieldLength(10);
        
        fields[18] = new DBFField();
        fields[18].setName("经费科目");
        fields[18].setDataType(DBFField.FIELD_TYPE_C);
        fields[18].setFieldLength(1);
        
        fields[19] = new DBFField();
        fields[19].setName("使用方向");
        fields[19].setDataType(DBFField.FIELD_TYPE_C);
        fields[19].setFieldLength(1);
        
        fields[20] = new DBFField();
        fields[20].setName("经手人");
        fields[20].setDataType(DBFField.FIELD_TYPE_C);
        fields[20].setFieldLength(10);
        
        fields[21] = new DBFField();
        fields[21].setName("变动日期");
        fields[21].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[22] = new DBFField();
        fields[22].setName("使用单位号");
        fields[22].setDataType(DBFField.FIELD_TYPE_C);
        fields[22].setFieldLength(10);
        
        fields[23] = new DBFField();
        fields[23].setName("国标分类号");
        fields[23].setDataType(DBFField.FIELD_TYPE_C);
        fields[23].setFieldLength(6);
        
        fields[24] = new DBFField();
        fields[24].setName("资产类别");
        fields[24].setDataType(DBFField.FIELD_TYPE_C);
        fields[24].setFieldLength(2);
        
        fields[25] = new DBFField();
        fields[25].setName("入库时间");
        fields[25].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[26] = new DBFField();
        fields[26].setName("科研号");
        fields[26].setDataType(DBFField.FIELD_TYPE_C);
        fields[26].setFieldLength(20);
        
        fields[27] = new DBFField();
        fields[27].setName("设备号");
        fields[27].setDataType(DBFField.FIELD_TYPE_C);
        fields[27].setFieldLength(20);
        
        fields[28] = new DBFField();
        fields[28].setName("单据号");
        fields[28].setDataType(DBFField.FIELD_TYPE_C);
        fields[28].setFieldLength(20);
        
        fields[29] = new DBFField();
        fields[29].setName("记账人");
        fields[29].setDataType(DBFField.FIELD_TYPE_C);
        fields[29].setFieldLength(10);
        
        fields[30] = new DBFField();
        fields[30].setName("字符字段1");
        fields[30].setDataType(DBFField.FIELD_TYPE_C);
        fields[30].setFieldLength(40);
        
        fields[31] = new DBFField();
        fields[31].setName("字符字段2");
        fields[31].setDataType(DBFField.FIELD_TYPE_C);
        fields[31].setFieldLength(40);
        
        fields[32] = new DBFField();
        fields[32].setName("字符字段3");
        fields[32].setDataType(DBFField.FIELD_TYPE_C);
        fields[32].setFieldLength(40);
        
        fields[33] = new DBFField();
        fields[33].setName("数字字段1");
        fields[33].setDataType(DBFField.FIELD_TYPE_N);
        fields[33].setFieldLength(12);
        fields[33].setDecimalCount(2);
        
        fields[34] = new DBFField();
        fields[34].setName("数字字段2");
        fields[34].setDataType(DBFField.FIELD_TYPE_N);
        fields[34].setFieldLength(12);
        fields[34].setDecimalCount(2);
        
        fields[35] = new DBFField();
        fields[35].setName("审核");
        fields[35].setDataType(DBFField.FIELD_TYPE_L);
        fields[35].setFieldLength(1);
        
        fields[36] = new DBFField();
        fields[36].setName("序号");
        fields[36].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[37] = new DBFField();
        fields[37].setName("标志");
        fields[37].setDataType(DBFField.FIELD_TYPE_C);
        fields[37].setFieldLength(2);
        
        fields[38] = new DBFField();
        fields[38].setName("清查方式");
        fields[38].setDataType(DBFField.FIELD_TYPE_C);
        fields[38].setFieldLength(1);
        
        fields[39] = new DBFField();
        fields[39].setName("清查日期");
        fields[39].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[40] = new DBFField();
        fields[40].setName("清查异常");
        fields[40].setDataType(DBFField.FIELD_TYPE_C);
        fields[40].setFieldLength(20);
        
        fields[41] = new DBFField();
        fields[41].setName("财务审核");
        fields[41].setDataType(DBFField.FIELD_TYPE_L);
        fields[41].setFieldLength(1);
        
        fields[42] = new DBFField();
        fields[42].setName("财审核日期");
        fields[42].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[43] = new DBFField();
        fields[43].setName("财务审核人");
        fields[43].setDataType(DBFField.FIELD_TYPE_C);
        fields[43].setFieldLength(10);
        
        fields[44] = new DBFField();
        fields[44].setName("审单人");
        fields[44].setDataType(DBFField.FIELD_TYPE_C);
        fields[44].setFieldLength(10);
        
        fields[45] = new DBFField();
        fields[45].setName("图片文件");
        fields[45].setDataType(DBFField.FIELD_TYPE_C);
        fields[45].setFieldLength(40);
        
        fields[46] = new DBFField();
        fields[46].setName("校区");
        fields[46].setDataType(DBFField.FIELD_TYPE_C);
        fields[46].setFieldLength(1);
        
        fields[47] = new DBFField();
        fields[47].setName("备注");
        fields[47].setDataType(DBFField.FIELD_TYPE_C);
        fields[47].setFieldLength(200);
        
        fields[48] = new DBFField();
        fields[48].setName("领用单位名");
        fields[48].setDataType(DBFField.FIELD_TYPE_C);
        fields[48].setFieldLength(50);
        
        fields[49] = new DBFField();
        fields[49].setName("仪器来源");
        fields[49].setDataType(DBFField.FIELD_TYPE_C);
        fields[49].setFieldLength(1);
        
        fields[50] = new DBFField();
        fields[50].setName("编号");
        fields[50].setDataType(DBFField.FIELD_TYPE_C);
        fields[50].setFieldLength(200);
        
        fields[51] = new DBFField();
        fields[51].setName("替换标志");
        fields[51].setDataType(DBFField.FIELD_TYPE_C);
        fields[51].setFieldLength(30);
        
        fields[52] = new DBFField();
        fields[52].setName("审核日期");
        fields[52].setDataType(DBFField.FIELD_TYPE_D);
        
        return fields;
    }
}
