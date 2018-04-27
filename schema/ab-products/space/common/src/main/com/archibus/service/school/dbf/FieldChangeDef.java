package com.archibus.service.school.dbf;

import com.archibus.service.school.javadbf.DBFField;

public class FieldChangeDef {
    public static DBFField[] getChangeFields() {
        final DBFField fields[] = new DBFField[58];
        
        fields[0] = new DBFField();
        fields[0].setName("领用单位号");
        fields[0].setDataType(DBFField.FIELD_TYPE_C);
        fields[0].setFieldLength(10);
        
        fields[1] = new DBFField();
        fields[1].setName("领用单位名");
        fields[1].setDataType(DBFField.FIELD_TYPE_C);
        fields[1].setFieldLength(50);
        
        fields[2] = new DBFField();
        fields[2].setName("仪器编号");
        fields[2].setDataType(DBFField.FIELD_TYPE_C);
        fields[2].setFieldLength(8);
        
        fields[3] = new DBFField();
        fields[3].setName("仪器名称");
        fields[3].setDataType(DBFField.FIELD_TYPE_C);
        fields[3].setFieldLength(40);
        
        fields[4] = new DBFField();
        fields[4].setName("现状");
        fields[4].setDataType(DBFField.FIELD_TYPE_C);
        fields[4].setFieldLength(1);
        
        fields[5] = new DBFField();
        fields[5].setName("变动日期");
        fields[5].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[6] = new DBFField();
        fields[6].setName("单价");
        fields[6].setDataType(DBFField.FIELD_TYPE_N);
        fields[6].setFieldLength(12);
        fields[6].setDecimalCount(2);
        
        fields[7] = new DBFField();
        fields[7].setName("变动单价");
        fields[7].setDataType(DBFField.FIELD_TYPE_N);
        fields[7].setFieldLength(12);
        fields[7].setDecimalCount(2);
        
        fields[8] = new DBFField();
        fields[8].setName("转入单位");
        fields[8].setDataType(DBFField.FIELD_TYPE_C);
        fields[8].setFieldLength(10);
        
        fields[9] = new DBFField();
        fields[9].setName("去向");
        fields[9].setDataType(DBFField.FIELD_TYPE_C);
        fields[9].setFieldLength(200);
        
        fields[10] = new DBFField();
        fields[10].setName("变动单据号");
        fields[10].setDataType(DBFField.FIELD_TYPE_C);
        fields[10].setFieldLength(20);
        
        fields[11] = new DBFField();
        fields[11].setName("型号");
        fields[11].setDataType(DBFField.FIELD_TYPE_C);
        fields[11].setFieldLength(30);
        
        fields[12] = new DBFField();
        fields[12].setName("规格");
        fields[12].setDataType(DBFField.FIELD_TYPE_C);
        fields[12].setFieldLength(50);
        
        fields[13] = new DBFField();
        fields[13].setName("国别");
        fields[13].setDataType(DBFField.FIELD_TYPE_C);
        fields[13].setFieldLength(10);
        
        fields[14] = new DBFField();
        fields[14].setName("分类号");
        fields[14].setDataType(DBFField.FIELD_TYPE_C);
        fields[14].setFieldLength(8);
        
        fields[15] = new DBFField();
        fields[15].setName("国别码");
        fields[15].setDataType(DBFField.FIELD_TYPE_C);
        fields[15].setFieldLength(3);
        
        fields[16] = new DBFField();
        fields[16].setName("厂家");
        fields[16].setDataType(DBFField.FIELD_TYPE_C);
        fields[16].setFieldLength(40);
        
        fields[17] = new DBFField();
        fields[17].setName("出厂号");
        fields[17].setDataType(DBFField.FIELD_TYPE_C);
        fields[17].setFieldLength(20);
        
        fields[18] = new DBFField();
        fields[18].setName("出厂日期");
        fields[18].setDataType(DBFField.FIELD_TYPE_C);
        fields[18].setFieldLength(7);
        
        fields[19] = new DBFField();
        fields[19].setName("购置日期");
        fields[19].setDataType(DBFField.FIELD_TYPE_C);
        fields[19].setFieldLength(7);
        
        fields[20] = new DBFField();
        fields[20].setName("附件数量");
        fields[20].setDataType(DBFField.FIELD_TYPE_N);
        fields[20].setFieldLength(3);
        fields[20].setDecimalCount(0);
        
        fields[21] = new DBFField();
        fields[21].setName("附件总价");
        fields[21].setDataType(DBFField.FIELD_TYPE_N);
        fields[21].setFieldLength(12);
        fields[21].setDecimalCount(2);
        
        fields[22] = new DBFField();
        fields[22].setName("管理级别");
        fields[22].setDataType(DBFField.FIELD_TYPE_C);
        fields[22].setFieldLength(1);
        
        fields[23] = new DBFField();
        fields[23].setName("领用人");
        fields[23].setDataType(DBFField.FIELD_TYPE_C);
        fields[23].setFieldLength(10);
        
        fields[24] = new DBFField();
        fields[24].setName("经费科目");
        fields[24].setDataType(DBFField.FIELD_TYPE_C);
        fields[24].setFieldLength(1);
        
        fields[25] = new DBFField();
        fields[25].setName("使用方向");
        fields[25].setDataType(DBFField.FIELD_TYPE_C);
        fields[25].setFieldLength(1);
        
        fields[26] = new DBFField();
        fields[26].setName("资产类别");
        fields[26].setDataType(DBFField.FIELD_TYPE_C);
        fields[26].setFieldLength(2);
        
        fields[27] = new DBFField();
        fields[27].setName("国标分类号");
        fields[27].setDataType(DBFField.FIELD_TYPE_C);
        fields[27].setFieldLength(6);
        
        fields[28] = new DBFField();
        fields[28].setName("经手人");
        fields[28].setDataType(DBFField.FIELD_TYPE_C);
        fields[28].setFieldLength(10);
        
        fields[29] = new DBFField();
        fields[29].setName("记账人");
        fields[29].setDataType(DBFField.FIELD_TYPE_C);
        fields[29].setFieldLength(10);
        
        fields[30] = new DBFField();
        fields[30].setName("标志");
        fields[30].setDataType(DBFField.FIELD_TYPE_C);
        fields[30].setFieldLength(2);
        
        fields[31] = new DBFField();
        fields[31].setName("附件编号");
        fields[31].setDataType(DBFField.FIELD_TYPE_C);
        fields[31].setFieldLength(11);
        
        fields[32] = new DBFField();
        fields[32].setName("附件名称");
        fields[32].setDataType(DBFField.FIELD_TYPE_C);
        fields[32].setFieldLength(20);
        
        fields[33] = new DBFField();
        fields[33].setName("附型号规格");
        fields[33].setDataType(DBFField.FIELD_TYPE_C);
        fields[33].setFieldLength(30);
        
        fields[34] = new DBFField();
        fields[34].setName("附件单价");
        fields[34].setDataType(DBFField.FIELD_TYPE_N);
        fields[34].setFieldLength(12);
        fields[34].setDecimalCount(2);
        
        fields[35] = new DBFField();
        fields[35].setName("附件进口价");
        fields[35].setDataType(DBFField.FIELD_TYPE_N);
        fields[35].setFieldLength(12);
        fields[35].setDecimalCount(2);
        
        fields[36] = new DBFField();
        fields[36].setName("进口单价");
        fields[36].setDataType(DBFField.FIELD_TYPE_N);
        fields[36].setFieldLength(12);
        fields[36].setDecimalCount(2);
        
        fields[37] = new DBFField();
        fields[37].setName("入库时间");
        fields[37].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[38] = new DBFField();
        fields[38].setName("使用单位号");
        fields[38].setDataType(DBFField.FIELD_TYPE_C);
        fields[38].setFieldLength(10);
        
        fields[39] = new DBFField();
        fields[39].setName("科研号");
        fields[39].setDataType(DBFField.FIELD_TYPE_C);
        fields[39].setFieldLength(20);
        
        fields[40] = new DBFField();
        fields[40].setName("单据号");
        fields[40].setDataType(DBFField.FIELD_TYPE_C);
        fields[40].setFieldLength(20);
        
        fields[41] = new DBFField();
        fields[41].setName("设备号");
        fields[41].setDataType(DBFField.FIELD_TYPE_C);
        fields[41].setFieldLength(20);
        
        fields[42] = new DBFField();
        fields[42].setName("字符字段1");
        fields[42].setDataType(DBFField.FIELD_TYPE_C);
        fields[42].setFieldLength(40);
        
        fields[43] = new DBFField();
        fields[43].setName("字符字段2");
        fields[43].setDataType(DBFField.FIELD_TYPE_C);
        fields[43].setFieldLength(40);
        
        fields[44] = new DBFField();
        fields[44].setName("字符字段3");
        fields[44].setDataType(DBFField.FIELD_TYPE_C);
        fields[44].setFieldLength(40);
        
        fields[45] = new DBFField();
        fields[45].setName("数字字段1");
        fields[45].setDataType(DBFField.FIELD_TYPE_N);
        fields[45].setFieldLength(12);
        fields[45].setDecimalCount(2);
        
        fields[46] = new DBFField();
        fields[46].setName("数字字段2");
        fields[46].setDataType(DBFField.FIELD_TYPE_N);
        fields[46].setFieldLength(12);
        fields[46].setDecimalCount(2);
        
        fields[47] = new DBFField();
        fields[47].setName("序号");
        fields[47].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[48] = new DBFField();
        fields[48].setName("审核");
        fields[48].setDataType(DBFField.FIELD_TYPE_L);
        fields[48].setFieldLength(1);
        
        fields[49] = new DBFField();
        fields[49].setName("修改人");
        fields[49].setDataType(DBFField.FIELD_TYPE_C);
        fields[49].setFieldLength(10);
        
        fields[50] = new DBFField();
        fields[50].setName("校区");
        fields[50].setDataType(DBFField.FIELD_TYPE_C);
        fields[50].setFieldLength(1);
        
        fields[51] = new DBFField();
        fields[51].setName("审单人");
        fields[51].setDataType(DBFField.FIELD_TYPE_C);
        fields[51].setFieldLength(10);
        
        fields[52] = new DBFField();
        fields[52].setName("备注");
        fields[52].setDataType(DBFField.FIELD_TYPE_C);
        fields[52].setFieldLength(200);
        
        fields[53] = new DBFField();
        fields[53].setName("图片文件");
        fields[53].setDataType(DBFField.FIELD_TYPE_C);
        fields[53].setFieldLength(40);
        
        fields[54] = new DBFField();
        fields[54].setName("财务审核");
        fields[54].setDataType(DBFField.FIELD_TYPE_L);
        fields[54].setFieldLength(1);
        
        fields[55] = new DBFField();
        fields[55].setName("财审核日期");
        fields[55].setDataType(DBFField.FIELD_TYPE_D);
        
        fields[56] = new DBFField();
        fields[56].setName("财务审核人");
        fields[56].setDataType(DBFField.FIELD_TYPE_C);
        fields[56].setFieldLength(10);
        
        fields[57] = new DBFField();
        fields[57].setName("仪器来源");
        fields[57].setDataType(DBFField.FIELD_TYPE_C);
        fields[57].setFieldLength(1);
        
        return fields;
    }
}
