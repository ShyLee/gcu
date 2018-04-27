/**
 * 
 */

var abScDefBlMaintainController = View.createController('abScDefBlMaintain', {
	abScDefBlMaintainForm_afterRefresh : function() {
		var form = this.abScDefBlMaintainForm;
		if (form.newRecord == false) {
			form.enableField("sc_bl_maintain.bl_id", false);
			form.enableField("sc_bl_maintain.maintain_items", false);
			
		} else {
			form.enableField("sc_bl_maintain.bl_id", true);
			form.enableField("sc_bl_maintain.maintain_items", true);
			form.setFieldValue("sc_bl_maintain.value_book", "");
		}

	},
	abScDefBlMaintainForm_onSave : function() {
		var form = this.abScDefBlMaintainForm;
		var grid = this.abScDefBlMaintainGrid;
		var isAddToCost = null;
		var is_addtocost = form.getFieldValue('sc_bl_maintain.is_addtocost');
		isAddToCost = parseInt(is_addtocost);
		var value_book = form.getFieldValue('sc_bl_maintain.value_book');
		var cost = form.getFieldValue('sc_bl_maintain.cost');
		
		
		var blId = form.getFieldValue('sc_bl_maintain.bl_id');
		var maintain_items = form.getFieldValue('sc_bl_maintain.maintain_items');
		var blDS = View.dataSources.get("abScDefBlDS");
		var maintainDS = View.dataSources.get("abScDefBlMaintainDS");
		var restriction = new AFM.view.Restriction();
		restriction.addClause('bl.bl_id', blId, '=');
		var blRecord = blDS.getRecord(restriction);
		var bl_value_book = blRecord.getValue("bl.value_book");
		
		if (!form.canSave()) {
			return false;
		}
		if (form.newRecord == true)// 新增时保存处理
		{ // validate data
		// if(bl_value_book!=parseFloat(value_book) || bl_value_book==0){
		// View.showMessage(getMessage("dataDifferentErr"));
		// return;
		// }
			if (isAddToCost == 1) {// 被勾选状态
				var value_book_after = parseFloat(value_book)
						+ parseFloat(cost)
				form.setFieldValue("sc_bl_maintain.value_book_after",
						value_book_after);

				if (form.save()) {
					blRecord.setValue("bl.value_book", value_book_after);
					// 更新bl表的value_book值
					blDS.saveRecord(blRecord);
					grid.refresh();
					View.showMessage(getMessage("saveRecordSuccess"));
				} else {
					View.showMessage(getMessage("saveRecordFail"));
				}
			} else {// 不被勾选状态
				form.setFieldValue("sc_bl_maintain.value_book_after",
						value_book);
				if (form.save()) {
					View.showMessage(getMessage("saveRecordSuccess"));
					grid.refresh();
				}else {
					View.showMessage(getMessage("saveRecordFail"));
				}
			}
		} else {// 修改状态
			var maintainDS = View.dataSources.get("abScDefBlMaintainDS");
			var restriction2 = new AFM.view.Restriction();
			restriction2.addClause('sc_bl_maintain.bl_id', blId, '=');
			restriction2.addClause('sc_bl_maintain.maintain_items', maintain_items, '=');
			var maintainRecord = maintainDS.getRecord(restriction2);
			var oldCost = maintainRecord.getValue("sc_bl_maintain.cost");
			var oldValue_book = maintainRecord
					.getValue("sc_bl_maintain.value_book");
			var value_book_after = maintainRecord
					.getValue("sc_bl_maintain.value_book_after");
			var isAddToCost_field = maintainRecord.getValue("sc_bl_maintain.is_addtocost");
			isAddToCost_field = parseInt(isAddToCost_field);
			if (isAddToCost == 1) {// 修改状态下，如果被勾选
				var diffFee = parseFloat(cost) - parseFloat(oldCost);
				if (diffFee == 0) {// 如果价值没有修改
					// 如果原来的状态为不勾选，现在改为勾选

					if (value_book_after != parseFloat(value_book)
							+ parseFloat(cost)) {
						value_book_after = parseFloat(value_book)
								+ parseFloat(cost);

					}
				} else {// 如果价值改变
					// 如果原来的状态为不勾选，现在改为勾选，并且价值有修改
					if (isAddToCost_field != 1) {
						value_book_after = parseFloat(cost)
								+ parseFloat(value_book);
					} else {// 原来被勾选
						value_book_after = parseFloat(value_book_after)
								+ parseFloat(diffFee);
					}

				}
				form.setFieldValue("sc_bl_maintain.value_book_after",
						value_book_after);
				if (form.save()) {
					blRecord.setValue("bl.value_book", value_book_after);
					blDS.saveRecord(blRecord);
					View.showMessage(getMessage("saveRecordSuccess"));
					grid.refresh();
				} else {
					View.showMessage(getMessage("saveRecordFail"));
				}
			} else {// 修改状态下，如果不被勾选
				// 如果原来的状态为不勾选，现在也为不勾选，并且价值没有修改
				if (isAddToCost_field == 0) {//原来为不勾选，现在也是不勾选
					if (form.save()) {
						View.showMessage(getMessage("saveRecordSuccess"));
						grid.refresh();
					} else {
						View.showMessage(getMessage("saveRecordFail"));
					}
				} else {//原来勾选，现在不勾选
					value_book_after = parseFloat(value_book_after)
							- parseFloat(oldCost);
					form.setFieldValue("sc_bl_maintain.value_book_after",
							value_book_after);
					if (form.save()) {
						blRecord.setValue("bl.value_book", value_book_after);
						// 更新bl表的value_book值
						blDS.saveRecord(blRecord);
						View.showMessage(getMessage("saveRecordSuccess"));
						grid.refresh();
					} else {
						View.showMessage(getMessage("saveRecordFail"));
					}
				}

			}
		}
	},
	abScDefBlMaintainGrid_onAddNew : function() {
		var form = this.abScDefBlMaintainForm;
		form.newRecord = true;
		form.refresh({}, true);
	}
});
function autoGetValue(){
//	var form =View.panels.get("abScDefBlMaintainForm");
//	form.enableField("sc_bl_maintain.value_book", false);
//	var value_book =  form.getFieldValue('sc_bl_maintain.value_book');
//	form.setFieldValue("sc_bl_maintain.value_book",value_book);
}
