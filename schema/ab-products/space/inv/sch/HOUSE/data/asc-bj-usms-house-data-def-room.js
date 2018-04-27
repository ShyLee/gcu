function jsImport(path){
    var i;
    var ss = document.getElementsByTagName("script");
    for (i = 0; i < ss.length; i++) {
        if (ss[i].src && ss[i].src.indexOf(path) != -1) {
            return;
        }
    }
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = path;
    var head = document.getElementsByTagName("head")[0];
    head.appendChild(s);
}

jQuery().ready(function(){
    var hrefLocation = window.location.protocol + "//" + window.location.host + "\/archibus";
    jsImport(hrefLocation + "/dwr/interface" + "/FileUpload.js");
    jQuery("#startUploadRm").attr('value', "上传");
    jQuery("#startUploadRm").bind("click", function(){
        if (defZzfRoomController.rm_detail.getFieldValue("rm.rm_id") != "") {
            var uploadFile = dwr.util.getValue("uploadFileRm");
            
            if (uploadFile.value != "") {
                var blId = defZzfRoomController.rm_detail.getFieldValue("rm.bl_id");
                var flId = defZzfRoomController.rm_detail.getFieldValue("rm.fl_id");
                var rmId = defZzfRoomController.rm_detail.getFieldValue("rm.rm_id");
                var filename = blId + "~" + flId + "~" + rmId + ".jpg";
                var url = "rm";
                FileUpload.uploadFile(uploadFile, filename, url, function(imageURL){
                    var addr = imageURL + "?id=" + new Date().getTime();
                    dwr.util.setValue('uploadFileRm', "");
                    jQuery.ajax({
                        url: addr,
                        success: function(){
                            jQuery("#rm_photo").removeAttr("src");
                            jQuery("#rm_photo").attr("src", addr);
                            
                        },
                        error: function(e){
                            jQuery("#rm_photo").removeAttr("src");
                            jQuery("#rm_photo").attr("display", "none");
                        }
                    });
                });
            }
            else {
                alert("请先选择房间照片");
            }
        }
        else {
            alert("请先输入房间号");
        }
    });
});

var defZzfRoomController = View.createController('defZzfRoomController', {

    afterViewLoad: function(){
        this.bl_tree.createRestrictionForLevel = createRestrictionForLevel;
        this.bl_tree.addParameter('rmType', " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
        this.treeFlDS.addParameter('rmType', " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
        this.treeRmDS.addParameter('rmType', " rm_type in "+houseConstantControl.HOUSR_RM_TYPES);
    },
    
    onClickRmNode: function(){
        var currentNode = this.bl_tree.lastNodeClicked;
        var blId = currentNode.data['rm.bl_id'];
        var flId = currentNode.data['rm.fl_id'];
        var rmId = currentNode.data['rm.rm_id'];
        res1 = new Ab.view.Restriction();
        res1.addClause('rm.bl_id', blId);
        res1.addClause('rm.fl_id', flId);
        res1.addClause('rm.rm_id', rmId);
        this.rm_detail.refresh(res1, false);
    },
    
    sbfFilterPanel_onShow: function(){
        var siteid = this.sbfFilterPanel.getFieldValue("bl.site_id");
        var prId = this.sbfFilterPanel.getFieldValue("bl.pr_id");
        var blId = this.sbfFilterPanel.getFieldValue("bl.bl_id");
        var treeRes = new Ab.view.Restriction();
        if (siteid != "") {
            treeRes.addClause("bl.site_id", siteid, "=");
        }
        if (prId != "") {
            treeRes.addClause("bl.pr_id", prId, "=");
        }
        if (blId != "") {
            treeRes.addClause("bl.bl_id", blId, "=");
        }
        this.bl_tree.refresh(treeRes);
    },
    
    sbfFilterPanel_onClear: function(){
        this.sbfFilterPanel.clear();
    },
    
    onChangeZys:function(){
    	//count_house_all
    	var totalRes = this.rm_detail.getFieldValue("rm.count_house_all");
    	var yzRes = this.rm_detail.getFieldValue("rm.count_house_yz");
    	if(Number(totalRes)<0){
    		View.alert("【设计户数】不能为负数！");
    		this.rm_detail.setFieldValue("rm.total_res","0");
    		return;
    	}
    	
    	if(Number(yzRes)<0){
    		View.alert("【已租户数】不能为负数！");
    		this.rm_detail.setFieldValue("rm.count_house_yz","0");
    		return;
    	}
    	
    	if(Number(totalRes)<Number(yzRes)){
    		View.alert("【已租户数】不能大于【设计户数】");
    		this.rm_detail.setFieldValue("rm.count_house_yz",totalRes);
    		return;
    	}
    },
    
    rm_detail_onSave: function(){
    	var totalRes = this.rm_detail.getFieldValue("rm.count_house_all");
    	var yzRes = this.rm_detail.getFieldValue("rm.count_house_yz");
    	if(Number(totalRes)<0){
    		View.alert("【设计户数】不能为负数！");
    		this.rm_detail.setFieldValue("rm.total_res","0");
    		return;
    	}
    	
    	if(Number(yzRes)<0){
    		View.alert("【已租户数】不能为负数！");
    		this.rm_detail.setFieldValue("rm.count_house_yz","0");
    		return;
    	}
    	
    	if(Number(totalRes)<Number(yzRes)){
    		View.alert("【已租户数】不能大于【设计户数】");
    		this.rm_detail.setFieldValue("rm.count_house_yz",totalRes);
    		return;
    	}
    	
    	var rm_total_res = this.rm_detail.getFieldValue("rm.count_house_all");
    	var regs = /^\d+$/;
    	//var regs = /^\\d+$/;
    	//这里没有做总的租赁资源与已租赁资源的判断是应为在入住登记页面对其做了判断
    	if(regs.test(rm_total_res)){
    		var yzlzys = this.rm_detail.getFieldValue("rm.count_house_yz");
    		var kzlzys = Number(rm_total_res)-Number(yzlzys);
    			this.rm_detail.setFieldValue("rm.count_house_all",rm_total_res);
    			this.rm_detail.setFieldValue("rm.count_house_kz",kzlzys);
        		this.rm_detail.save();
        		view.showMessage("保存成功!");
    	}else{
    		View.alert("可租户数输入有误，请重新输入！");
    		return;
    	}
    },
    
    rm_detail_afterRefresh: function(){
        showRmPhoto();
    }
});

function showRmPhoto(){
    var distinctPanel = View.panels.get('rm_detail');
    var blid = distinctPanel.getFieldValue('rm.bl_id');
    var flid = distinctPanel.getFieldValue('rm.fl_id');
    var rmid = distinctPanel.getFieldValue('rm.rm_id');
    var rm_photoImg = Ext.get('rm_photo');
    if (!rmid) {
        return;
    }
    if (valueExistsNotEmpty(rmid)) {
        rm_photoImg.setVisible(true);
        rm_photoImg.dom.src = View.project.projectGraphicsFolder + "/rm/" + blid + "~" + flid + "~" + rmid + ".jpg";
        rm_photoImg.dom.alt = "";
    }
    else {
        rm_photoImg.setVisible(false);
        rm_photoImg.dom.src = null;
        rm_photoImg.dom.alt = getMessage('noImage');
    }
}

function getRmcatByType(type){
    var rm_cat = "";
    var parameters = {
        tableName: 'rmtype',
        fieldNames: toJSON(['rmtype.rm_cat', 'rmtype.rm_type']),
        restriction: toJSON({
            'rmtype.rm_type': type
        })
    };
    
    var result = Workflow.runRuleAndReturnResult('AbCommonResources-getDataRecords', parameters);
    
    if (result.code == 'executed') {
        var record = result.data.records[0];
        var rm_cat = record['rmtype.rm_cat'];
    }
    else {
        Workflow.handleError(result);
    }
    return rm_cat;
}

function onSelectSite(){
    var controlPanel = View.panels.get('sbfFilterPanel');
    var res = "bl.acc_type !='yxz' and bl.bl_id in(select bl_id from rm where rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES+")";
    
    View.selectValue({
        formId: 'sbfFilterPanel',
        title: "校区",
        fieldNames: ['bl.site_id'],
        selectTableName: 'bl',
        selectFieldNames: ['bl.site_id'],
        visibleFieldNames: ['bl.site_id', 'site.name'],
        restriction: res
    });
}

function onSelectPr(){
    var controlPanel = View.panels.get('sbfFilterPanel');
    var siteId = controlPanel.getFieldValue('bl.site_id');
    var res = "bl.acc_type !='yxz' and bl.bl_id in(select bl_id from rm where rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES+")";
    if (valueExistsNotEmpty(siteId)) {
        res += " and bl.site_id='" + siteId + "'";
    }
    
    View.selectValue({
        formId: 'sbfFilterPanel',
        title: "片区",
        fieldNames: ['bl.site_id', 'bl.pr_id'],
        selectTableName: 'bl',
        selectFieldNames: ['bl.site_id', 'bl.pr_id'],
        visibleFieldNames: ['bl.site_id', 'site.name', 'bl.pr_id', ],
        filterFieldNames: ['bl.site_id'],
        restriction: res
    });
}

function onSelectBl(){
    var controlPanel = View.panels.get('sbfFilterPanel');
    var siteId = controlPanel.getFieldValue('bl.site_id');
    var prId = controlPanel.getFieldValue('bl.pr_id');
    var res = "bl.acc_type !='yxz' and bl.bl_id in(select bl_id from rm where rm.rm_type in "+houseConstantControl.HOUSR_RM_TYPES+")";
    if (valueExistsNotEmpty(siteId)) {
        res += " and bl.site_id='" + siteId + "'";
    }
    if (valueExistsNotEmpty(prId)) {
        res += " and bl.pr_id='" + prId + "'";
    }
    
    View.selectValue({
        formId: 'sbfFilterPanel',
        title: "建筑物",
        fieldNames: ['bl.site_id', 'bl.pr_id', 'bl.bl_id'],
        selectTableName: 'bl',
        selectFieldNames: ['bl.site_id', 'bl.pr_id', 'bl.bl_id'],
        visibleFieldNames: ['bl.site_id', 'site.name', 'bl.pr_id', 'bl.bl_id', 'bl.name'],
        filterFieldNames: ['bl.site_id', 'bl.pr_id'],
        restriction: res
    });
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var blId = parentNode.data['bl.bl_id'];
        if (blId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.bl_id', blId);
        }
        if (level == 2) {
            var blId = parentNode.data['fl.bl_id'];
            var flId = parentNode.data['fl.fl_id'];
            restriction = new Ab.view.Restriction();
            restriction.addClause('fl.fl_id', flId);
            restriction.addClause('fl.bl_id', blId);
        }
    }
    return restriction;
}

