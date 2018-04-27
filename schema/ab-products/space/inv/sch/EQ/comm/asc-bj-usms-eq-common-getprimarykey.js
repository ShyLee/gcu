/**
 * 通过数据库中的表和字段来生成主键规则
 * 即当为YS20120004或YS201203120004的形式
 * 1.主键字符串+年份+4位尾数
 * 2.主键字符串+日期+4位尾数
 * @param tableName 表名
 * @param fieldName 欲生成主键的字段名
 * @returns
 */
function createPrimaryKey(tableName,fieldName,primaryTableFieldVlaue){
	try{
		var result=Workflow.callMethod('AbAssetManagement-EquipmentHandler-updatePrimaryKey',tableName,fieldName,primaryTableFieldVlaue);
	}catch(e){
		Workflow.handleError(e); 
		View.alert("对不起，工作流执行失败!");
	}
	if(result.code='executed'){
		return result.message;
	}
}