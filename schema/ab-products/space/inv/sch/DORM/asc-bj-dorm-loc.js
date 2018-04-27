
var defineLocRMController = View.createController('defineLocationRM', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'SITE','PROPERTY','BUILDING','FLOOR','ROOM'
    operDataType: "",
    
    blFlRm: "",
    
    exitRmPhoto: true,
    //siteCode changed
    siteCodeChanged: false,
    
    //----------------event handle--------------------
    afterViewLoad: function(){
       this.site_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    rm_detail_afterRefresh: function(){
        var bld = this.rm_detail.getFieldValue("rm.bl_id");
        var fld = this.rm_detail.getFieldValue("rm.fl_id");
        var rmd = this.rm_detail.getFieldValue("rm.rm_id");
        this.blFlRm = bld + fld + rmd;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('sc_rmphotodoc.blflrm', this.blFlRm, '=');
        var records = View.dataSources.get('ds_ab-sp-def-loc-rm_form_rm_photo').getRecords(restriction);
        if (records.length == 0) {
            this.exitRmPhoto = false;
        }
        this.rmphoto.refresh(restriction);
        this.rmphoto.show(true);
        //consoleCountEm();
    },
    
    rmphoto_afterRefresh: function(){
        showRmPhoto();
    },
    
    site_detail_afterRefresh: function(){
        showSitePhoto();
    },
    
    afterInitialDataFetch: function(){
//        var titleObj = Ext.get('addNew');
//        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('site_tree');
    },
    
    sbfFilterPanel_onShow: function(){
        this.queryTreeview("AND");
        this.site_detail.show(false);
        this.pr_detail.show(false);
        this.bl_detail.show(false);
        this.fl_detail.show(false);
        this.rm_detail.show(false);
        this.rmphoto.show(false);
    },
    
    site_tree_onUpdate: function(){
        updateStaticFieldAboutEmOrRm();
        
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newSite = getMessage("site");
        var menutitle_newProperty = '片区';
        var menutitle_newBuilding = getMessage("building");
        var menutitle_newFloor = getMessage("floor");
        var menutitle_newRoom = getMessage("room");
        
        menuItems.push({
            text: menutitle_newSite,
            handler: this.onAddNewButtonPush.createDelegate(this, ['SITE'])
        });
        menuItems.push({
            text: menutitle_newProperty,
            handler: this.onAddNewButtonPush.createDelegate(this, ['PROPERTY'])
        });
        menuItems.push({
            text: menutitle_newBuilding,
            handler: this.onAddNewButtonPush.createDelegate(this, ['BUILDING'])
        });
        menuItems.push({
            text: menutitle_newFloor,
            handler: this.onAddNewButtonPush.createDelegate(this, ['FLOOR'])
        });
        
        menuItems.push({
            text: menutitle_newRoom,
            handler: this.onAddNewButtonPush.createDelegate(this, ['ROOM'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    onAddNewButtonPush: function(menuItemId){
        var siteId = "";
        var propertyId = "";
        var buildingId = "";
        var floorId = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0: //site
                    siteId = this.curTreeNode.data["site.site_id"];
                    break;
                case 1: //pr
                    siteId = this.curTreeNode.data["property.site_id"];
                    propertyId = this.curTreeNode.data["property.pr_id"];
                    break;
                case 2: //bl
                    siteId = this.curTreeNode.data["bl.site_id"];
                    propertyId = this.curTreeNode.data["bl.pr_id"];
                    buildingId = this.curTreeNode.data["bl.bl_id"];
                    break;
                case 3: //fl
                    siteId = this.curTreeNode.data["bl.site_id"];
                    propertyId = this.curTreeNode.data["bl.pr_id"];
                    buildingId = this.curTreeNode.data["fl.bl_id"];
                    floorId = this.curTreeNode.data["fl.fl_id"];
                    break;
                case 4: //rm
                    siteId = this.curTreeNode.data["bl.site_id"];
                    propertyId = this.curTreeNode.data["bl.pr_id"];
                    buildingId = this.curTreeNode.data["rm.bl_id"];
                    floorId = this.curTreeNode.data["rm.fl_id"];
                    break;
            }
        }
        var regnId = "";
        if (valueExistsNotEmpty(siteId)) {
            var ds = View.dataSources.get('ds_ab-sp-def-loc-rm_form_site');
            var rec = ds.getRecord(new Ab.view.Restriction({
                'site.site_id': siteId
            }));
            regnId = rec.getValue('site.regn_id');
        }
        
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "SITE":
                this.sbfDetailTabs.selectTab("siteTab", null, true, false, false);
                break;
            case "PROPERTY":
                restriction.addClause("property.site_id", siteId, '=');
                restriction.addClause("property.regn_id", regnId, '=');
                this.sbfDetailTabs.selectTab("prTab", restriction, true, false, false);
                break;
            case "BUILDING":
                if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
                    View.showMessage('请选择片区');
                    return;
                }
                restriction.addClause("bl.site_id", siteId, '=');
                restriction.addClause("bl.pr_id", propertyId, '=');
                restriction.addClause("bl.regn_id", regnId, '=');
                this.sbfDetailTabs.selectTab("blTab", restriction, true, false, false);
                break;
            case "FLOOR":
                if (nodeLevelIndex == 0 || nodeLevelIndex == 1 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectBuilding"));
                    return;
                }
                restriction.addClause("fl.bl_id", buildingId, '=');
                this.sbfDetailTabs.selectTab("flTab", restriction, true, false, false);
                
                break;
            case "ROOM":
                if (nodeLevelIndex == 0 || nodeLevelIndex == 1 || nodeLevelIndex == 2 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectFloor"));
                    return;
                }
                restriction.addClause("rm.bl_id", buildingId, '=');
                restriction.addClause("rm.fl_id", floorId, '=');
                this.sbfDetailTabs.selectTab("rmTab", restriction, true, false, false);
                break;
        }
    },
    
    
    
    site_detail_onDelete: function(){
        this.operDataType = "SITE";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_site", "site_detail", "site.site_id");
    },
    pr_detail_onDelete: function(){
        this.operDataType = "PROPERTY";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_pr", "pr_detail", "property.pr_id");
    },
    bl_detail_onDelete: function(){
        this.operDataType = "BUILDING";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_bl", "bl_detail", "bl.bl_id");
    },
    fl_detail_onDelete: function(){
        this.operDataType = "FLOOR";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_fl", "fl_detail", "fl.fl_id");
    },
    rm_detail_onDelete: function(){
        this.operDataType = "ROOM";
        this.AUSC_commonDelete("ds_ab-sp-def-loc-rm_form_rm", "rm_detail", "rm.rm_id");
        this.rmphoto.show(false);
    },
    
    AUSC_commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
        this.operType = "DELETE";
        var dataSource = View.dataSources.get(dataSourceID);
        var formPanel = View.panels.get(formPanelID);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(primaryFieldFullName);
        if (!primaryFieldValue) {
            return;
        }
        var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.refreshTreePanelAfterUpdate(formPanel);
                formPanel.show(false);
                
            }
        })
    },
    refreshBlDetailForm: function(){
//        showDistinctPhoto();
        //added by kevenxi 2011-08-22
//        var accType = this.bl_detail.getFieldValue("bl.acc_type");
//        selectValue("bl.acc_type", accType);
    },
    site_detail_onSave: function(){
        this.operDataType = "SITE";
        this.commonSave("site_detail");
    },
    pr_detail_onSave: function(){
        this.operDataType = "PROPERTY";
        this.commonSave("pr_detail");
    },
    
    bl_detail_onPlupdatebednumbersbybl: function(){
    	
    	var siteId = this.bl_detail.getFieldValue("bl.site_id");
    	var prId = this.bl_detail.getFieldValue("bl.pr_id");
    	var blId = this.bl_detail.getFieldValue("bl.bl_id");
        var thisController = this;
        
        View.openDialog("asc-bj-usms-data-update-bl-rmnumbers.axvw", null, false, 
        		{
        			title: "设置床位数",
        			width: 400, 
        			height: 200,
        			closeButton: false,
        			siteId: siteId,
        			prId: prId,
        			blId: blId
        			
        		}); 	
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bl.site_id", siteId, "=");
        restriction.addClause("bl.pr_id", prId, "=");
        restriction.addClause("bl.bl_id", blId, "=");
    },
    
    bl_detail_onPlupdatermusenamebybl: function(){
    	var siteId = this.bl_detail.getFieldValue("bl.site_id");
    	var prId = this.bl_detail.getFieldValue("bl.pr_id");
    	var blId = this.bl_detail.getFieldValue("bl.bl_id");
        var thisController = this;
        View.openDialog("asc-bj-usms-data-update-bl-rmusenames.axvw", null, false, 
        		{
        			title: "设置房间类型",
        			width: 600, 
        			height: 450,
        			closeButton: false,
        			siteId: siteId,
        			prId: prId,
        			blId: blId
        			
        		}); 
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bl.site_id", siteId, "=");
        restriction.addClause("bl.pr_id", prId, "=");
        restriction.addClause("bl.bl_id", blId, "="); 
    },
    
    fl_detail_onPlupdatebyfloor: function(){
    	var blId = this.fl_detail.getFieldValue("fl.bl_id");
    	var flId = this.fl_detail.getFieldValue("fl.fl_id");
    	var thisController = this;
    	View.openDialog("asc-bj-usms-data-update-fl-rmnumbers.axvw", null, false, 
        		{
        			title: "更改床位数",
        			width: 400, 
        			height: 200,
        			closeButton: false,
        			blId: blId,
        			flId: flId
        		});
    	var restriction = new Ab.view.Restriction();
        restriction.addClause("fl.bl_id", blId, "=");
        restriction.addClause("fl.fl_id", flId, "=");
    },
    
    fl_detail_onPlupdatermusenamebyfloor: function(){
    	var blId = this.fl_detail.getFieldValue("fl.bl_id");
    	var flId = this.fl_detail.getFieldValue("fl.fl_id");
    	var thisController = this;
    	View.openDialog("asc-bj-usms-data-update-fl-rmusenames.axvw", null, false, 
        		{
        			title: "设置房间类型",
        			width: 600, 
        			height: 450,
        			closeButton: false,
        			blId: blId,
        			flId: flId
        		});
    	var restriction = new Ab.view.Restriction();
        restriction.addClause("fl.bl_id", blId, "=");
        restriction.addClause("fl.fl_id", flId, "=");
    	
    },
    
    bl_detail_onSave: function(){
        this.operDataType = "BUILDING";
//        var accType = document.getElementById("bl.acc_type").value;
//        var blForm = View.panels.get("bl_detail");
//        blForm.setFieldValue("bl.acc_type", accType);
        
        //如果建筑物中大楼属性男/女有变动,那么将会影响该楼下的所有楼层及房间。否则不提示。
        var blId=this.bl_detail.getFieldValue("bl.bl_id");
        var value=this.bl_detail.getFieldValue("bl.feormale");
        var oldValue=this.bl_detail.getOldFieldValues()["bl.feormale"]
        if(value==oldValue){
        	this.commonSave("bl_detail");
        }else{
        	var controller=this;
        	var confirmMessage="建筑物【男/女】属性的更改将影响该建筑物下所有楼层及房间，是否确定修改？";
        	View.confirm(confirmMessage,function(button){
        		if (button == 'yes') {
        			try {
        				controller.commonSave("bl_detail");
        				//更新楼层中的feormale
        				controller.updateFlMaleByBl(blId,value);
        				//更新房间中的feormale
        				controller.updateRmMaleByBl(blId,"",value);
        			}catch(e){
        				Workflow.handleError(e);
        				return;
        			}
        		}	
        	});
        }
    },
    fl_detail_onSave: function(){
        this.operDataType = "FLOOR";
      //如果楼层中大楼属性男/女有变动,那么将会影响该楼层下的所有房间。否则不提示。
        var blId=this.fl_detail.getFieldValue("fl.bl_id");
        var flId=this.fl_detail.getFieldValue("fl.fl_id");
        var value=this.fl_detail.getFieldValue("fl.feormale");
        var oldValue=this.fl_detail.getOldFieldValues()["fl.feormale"]
        if(value==oldValue){
        	this.commonSave("fl_detail");
        }else{
        	var controller=this;
        	var confirmMessage="楼层【男/女】属性的更改将影响该楼层的所有房间，是否确定修改？";
        	View.confirm(confirmMessage,function(button){
        		if (button == 'yes') {
        			try {
        				controller.commonSave("fl_detail");
        				//更新房间中的feormale
        				controller.updateRmMaleByBl(blId,flId,value);
        			}catch(e){
        				Workflow.handleError(e);
        				return;
        			}
        		}	
        	});
        }
    },
    rm_detail_onSave: function(){
        this.operDataType = "ROOM";
        
        if (!this.checkBeforeSaveRm()) {
            return;
        }
        
        if (!this.exitRmPhoto) {
            this.rmphoto.setFieldValue('sc_rmphotodoc.blflrm', this.blFlRm, '=');
        }
        
        //Workflow.callMethod('AbSpaceRoomInventoryBAR-SchoolHandler-updateRoomUse');
        
        this.rmphoto.save();
        this.rmphoto.refresh();
        this.commonSave("rm_detail");
    },
    /**
     * 大楼 男/女 属性更改，同时更改该建筑物下的所有楼层的 男/女属性
     * 
     */
    updateFlMaleByBl:function(blId,FEORMALE){
    	var account = View.dataSources.get("ds_ab-sp-def-loc-rm_form_fl");
		var restriction=new Ab.view.Restriction();
		restriction.addClause("fl.bl_id",blId,"=");
		var records = account.getRecords(restriction);
		for(var i=0;i<records.length;i++){
			var flId=records[i].getValue("fl.fl_id");
			var res=new Ab.view.Restriction();
			res.addClause("fl.bl_id",blId,"=");
			res.addClause("fl.fl_id",flId,"=");
			
			var record=account.getRecord(res);
			record.setValue("fl.feormale",FEORMALE);
			account.saveRecord(record);
		}
    },
    /**
     *  大楼 男/女 属性更改，同时更改该建筑物下的所有房间的 男/女属性
     *  
     */
    updateRmMaleByBl:function(blId,flId,FEORMALE){
    	var account = View.dataSources.get("ds_ab-sp-def-loc-rm_form_rm");
    	var restriction=new Ab.view.Restriction();
    	restriction.addClause("rm.bl_id",blId,"=");
    	if(flId!=""){
    		restriction.addClause("rm.fl_id",flId,"=");
    	}
    	var records = account.getRecords(restriction);
		for(var i=0;i<records.length;i++){
			var flId=records[i].getValue("rm.fl_id");
			var rmId=records[i].getValue("rm.rm_id");
			var res=new Ab.view.Restriction();
			res.addClause("rm.bl_id",blId,"=");
			res.addClause("rm.fl_id",flId,"=");
			res.addClause("rm.rm_id",rmId,"=");
			
			var record=account.getRecord(res);
			record.setValue("rm.feormale",FEORMALE);
			account.saveRecord(record);
		}
    },
    
    /**
     *
     */
    checkBeforeSaveRm: function(){
        var checkSuccessed = true;
        return checkSuccessed;
    },
    
    /**
     *
     * @param {Object} formPanelID
     */
    commonSave: function(formPanelID){
        var formPanel = View.panels.get(formPanelID);
        this.siteCodeChanged = this.hasChanged(formPanel);
        if (!formPanel.newRecord) {
            this.operType = "UPDATE";
        }
        else {
            this.operType = "INSERT";
        }
        if (formPanel.save()) {
            formPanel.refresh();
            //refresh tree panel and edit panel
            this.onRefreshPanelsAfterSave(formPanel);
            //get message from view file			 
            var message = getMessage('formSaved');
            //show text message in the form				
            this.showInformationInForm(this, formPanel, message);
        }
        
    },
    /**
     * 更改清华更新面积 使用 手输面积
     */
    bl_detail_onUpdateStatic: function(){
       // updateStaticFieldAboutEmOrRm();
    	this.updateByManual();
    },
   
    updateByManual:function(){
    	window.open("ab-single-job.axvw?ruleId=AbCommonResources-SpaceService-updateRoomAreaFromManualArea");
    },
    /**
     * 建筑物下账
     */
    bl_detail_onOutAccount: function(){
        //show the window of dealing with building out account
    
    },
    
    bl_detail_onEnterRmcatArea: function(){
        var blId = this.bl_detail.getFieldValue("bl.bl_id");
        var thisController = this;
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("sc_bl_rmcat.bl_id", blId, "=");
        View.openDialog('asc-bj-usms-data-def-bl-rmcat.axvw', restriction, false, {
            width: 800,
            height: 600,
            closeButton: false,
            blId: blId,
            
            afterViewLoad: function(dialogView){
                var dialogController = dialogView.controllers.get('ascBjUsmsDataDefBlRmcatController');
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            }
        });
    },
    //建筑物价值变动
    bl_detail_onChangeVal: function(){
    	var blId = this.bl_detail.getFieldValue("bl.bl_id");
    	var blName = this.bl_detail.getFieldValue("bl.name");
    	var valuemarket = this.bl_detail.getFieldValue("bl.value_market");
    	if(blId==""){
    		View.showMessage('您还没有保存，操作失败！');
    		return;
    	}
        var thisController = this;
        View.openDialog('asc-bj-usms-data-bl-value-chg-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            closeButton: false,
            blId: blId,
            blName: blName,
            valuemarket: valuemarket,
            
            afterViewLoad: function(dialogView){
                var dialogController = dialogView.controllers.get('abScDefUnit');
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            }
        });
    },
  //建筑物面积变动
    bl_detail_onChangeArea: function(){
    	var blId = this.bl_detail.getFieldValue("bl.bl_id");
    	var blName = this.bl_detail.getFieldValue("bl.name");
    	var areamarket = this.bl_detail.getFieldValue("bl.area_building_manual");
    	if(blId==""){
    		View.showMessage('您还没有保存，操作失败！');
    		return;
    	}
        var thisController = this;
        View.openDialog('asc-bj-usms-data-bl-area-chg-dialog.axvw', null, false, {
            width: 800,
            height: 600,
            closeButton: false,
            blId: blId,
            blName: blName,
            areamarket: areamarket,
            
            afterViewLoad: function(dialogView){
                var dialogController = dialogView.controllers.get('abScDefUnit');
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            }
        });
    },
    dialog_onClose: function(dialogController){
        this.bl_detail.refresh();
    },
    
    bl_detail_onXiaZhang: function(){
        var form = View.panels.get("bl_detail");
        var blId = form.getFieldValue('bl.bl_id');
        var page = "asc-bj-usms-data-bl-xiazhang-wd.axvw";
        var thisController = this;
        var confirmMessage = ("确定要将建筑物：[" + blId + "] 下账？");
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                var dialog = View.openDialog(page, null, true, {
                    width: 600,
                    height: 450,
                    closeButton: false,
                    blId: blId,
                    
                    afterViewLoad: function(dialogView){
                        // access the dialog controller
                        var dialogController = dialogView.controllers.get('ascBjUsmsDataBlXiazhangWd');
                        // set the dialog controller onClose callback
                        dialogController.onClose = thisController.dialog2_onClose.createDelegate(thisController);
                    }
                });
            }
        });
    },
    
    dialog2_onClose: function(dialogController){
        View.log('defineLocationRM');
        var blController = View.controllers.get('defineLocationRM');
        blController.operDataType = "BUILDING";
        //blController.commonDeleteNoHint("ds_ab-sp-def-loc-rm_form_bl", "bl_detail", "bl.bl_id");
		this.refreshAfterXiaZhang();
    },
	
	refreshAfterXiaZhang:function(){
		var formPanel = View.panels.get('bl_detail');
		this.refreshTreePanelAfterUpdate(formPanel);
		//更新汇总数据
        //  updateStaticFieldAboutEmOrRm();
		this.updateByManual();
		View.showMessage("建筑物：[" + primaryFieldValue + "] 已被移至下账表，下账成功!");
		
	},
    
    
    /**
     * show message in the top row of this form
     * @param {string} message
     */
    showInformationInForm: function(controller, panel, message){
        var messageCell = panel.getMessageCell();
        messageCell.dom.innerHTML = "";
        
        var messageElement = Ext.DomHelper.append(messageCell, '<p>' + message + '</p>', true);
        messageElement.addClass('formMessage');
        messageElement.setVisible(true, {
            duration: 1
        });
        messageElement.setHeight(20, {
            duration: 1
        });
        if (message) {
            panel.dismissMessage.defer(3000, controller, [messageElement]);
        }
    },
    
    /**
     * refresh tree panel after save
     * @param {Object} curEditPanel
     */
    onRefreshPanelsAfterSave: function(curEditPanel){
        if (this.siteCodeChanged) {
            this.site_tree.refresh();
        	this.curTreeNode = null;
        }
        else {
            //refresh the tree panel
            this.refreshTreePanelAfterUpdate(curEditPanel);
        }
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
        var parentNode = this.getParentNode(curEditPanel);
        if (parentNode.isRoot()) {
            this.site_tree.refresh();
        	this.curTreeNode = null;
        }
        else {
            this.treeview.refreshNode(parentNode);
            if (parentNode.parent) {
                parentNode.parent.expand();
            }
            parentNode.expand();
        }
        //reset the global variable :curTreeNode
        this.setCurTreeNodeAfterUpdate(curEditPanel, parentNode);
    },
    
    /**
     * prepare the parentNode parameter for calling refreshNode function
     */
    getParentNode: function(curEditFormPanel){
        var rootNode = this.treeview.treeView.getRoot();
        var levelIndex = -1;
        if (this.curTreeNode) {
            levelIndex = this.curTreeNode.level.levelIndex;
        }
        if ("SITE" == this.operDataType) {
            return rootNode;
        }
        else 
            //PROPERTY
            if ("PROPERTY" == this.operDataType) {
                switch (levelIndex) {
                    case 0:
                        return this.curTreeNode;
                        break;
                    case 1:
                        return this.curTreeNode.parent;
                        break;
                    case 2:
                        return this.curTreeNode.parent.parent;
                        break;
                    case 3:
                        return this.curTreeNode.parent.parent.parent;
                        break;
                    case 4:
                        return this.curTreeNode.parent.parent.parent.parent;
                        break;
                    default:
                        return rootNode;
                        break;
                }
            }
            else 
                //BUILDING
                if ("BUILDING" == this.operDataType) {
                    switch (levelIndex) {
                        case 1:
                            return this.curTreeNode;
                            break;
                        case 2:
                            return this.curTreeNode.parent;
                            break;
                        case 3:
                            return this.curTreeNode.parent.parent;
                            break;
                        case 4:
                            return this.curTreeNode.parent.parent.parent;
                            break;
                        default:
                            View.showMessage("请选择片区");
                            break;
                    }
                }
                else 
                    if ("FLOOR" == this.operDataType) {
                        //FLOOR
                        switch (levelIndex) {
                            case 2:
                                return this.curTreeNode;
                                break;
                            case 3:
                                return this.curTreeNode.parent;
                                break;
                            case 4:
                                return this.curTreeNode.parent.parent;
                                break;
                            default:
                                View.showMessage(getMessage("errorSelectBuilding"));
                                break;
                        }
                    }
                    else {
                        //ROOM
                        switch (levelIndex) {
                            case 3:
                                return this.curTreeNode;
                                break;
                            case 4:
                                return this.curTreeNode.parent;
                                break;
                            default:
                                View.showMessage(getMessage("errorSelectFloor"));
                                break;
                        }
                    }
    },
    
    /**
     * reset the curTreeNode variable after operation
     * @param {Object} curEditPanel : current edit form
     * @param {Object} parentNode
     */
    setCurTreeNodeAfterUpdate: function(curEditPanel, parentNode){
        if (this.operType == "DELETE") {
            this.curTreeNode = null;
        }
        else {
            switch (this.operDataType) {
                case "SITE":
                    var pkFieldName = "site.site_id";
                    break;
                case "PROPERTY":
                    var pkFieldName = "property.pr_id";
                    break;
                case "BUILDING":
                    var pkFieldName = "bl.bl_id";
                    break;
                case "FLOOR":
                    var pkFieldName = "fl.fl_id";
                    break;
                case "ROOM":
                    var pkFieldName = "rm.rm_id";
                    break;
            }
            this.curTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },
    
    /**
     * check the curEditFormPanel.getRecord
     *
     * @param {Object} curEditFormPanel
     * return -- true means the user has changed the site code field
     */
    hasChanged: function(curEditFormPanel){
        if (curEditFormPanel.id == "bl_detail") {
            var oleSiteCode = curEditFormPanel.record.oldValues["bl.site_id"];
            if (curEditFormPanel.getFieldValue("bl.site_id") == oleSiteCode) {
                return false;
            }
            else {
                return true;
            }
        }
    },
    /**
     * get the treeNode according to the current edit from,
     * for example :
     * if current edit form is floor(operation is insert), but the current selected treeNode is building,
     * so need to make the two consistent ,by current edit form
     * @param {Object} curEditForm
     * @param {Object} parentNode
     */
    getTreeNodeByCurEditData: function(curEditForm, pkFieldName, parentNode){
        var pkFieldValue = curEditForm.getFieldValue(pkFieldName);
        for (var i = 0; i < parentNode.children.length; i++) {
            var node = parentNode.children[i];
            if (node.data[pkFieldName] == pkFieldValue) {
                return node;
            }
        }
        return null;
    },
    
    queryTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var siteId = consolePanel.getFieldValue('bl.site_id');
        if (siteId) {
            this.site_tree.addParameter('siteId', "  ='" + siteId + "'");
        }
        else {
            this.site_tree.addParameter('siteId', " IS NOT NULL ");
        }
        
        var propertyId = consolePanel.getFieldValue('bl.pr_id');
        if (propertyId) {
            this.site_tree.addParameter('prId', " = '" + propertyId + "'");
        }
        else {
            this.site_tree.addParameter('prId', " IS NOT NULL ");
        }
        
        var buildingId = consolePanel.getFieldValue('bl.bl_id');
        if (buildingId) {
            this.site_tree.addParameter('blId', " = '" + buildingId + "'");
        }
        else {
            this.site_tree.addParameter('blId', "IS NOT NULL");
        }
        
        
        var blUse1 = consolePanel.getFieldValue('bl.use1');
        if (blUse1) {
            this.site_tree.addParameter('blUseFor', " = '" + blUse1 + "'");
        }
        else {
            this.site_tree.addParameter('blUseFor', "IS NOT NULL");
        }
        
		if (siteId == "" && propertyId =="" && buildingId=="" && blUse1 == ""){
			this.site_tree.addParameter('orand', " OR ");
		}else{
			this.site_tree.addParameter('orand', " AND ");
		}
		
		
        this.site_tree.refresh();
        this.curTreeNode = null;
    }
})


/*
 * set the global variable 'curTreeNode' in controller 'defineLocationRM'
 */
function onClickTreeNode(){
	var curNode = View.panels.get("site_tree").lastNodeClicked;
    defineLocRMController.curTreeNode = curNode;
	if (curNode.level.levelIndex == 2){
		defineLocRMController.refreshBlDetailForm();
	}
}

function onClickSiteNode(){
    var curTreeNode = View.panels.get("site_tree").lastNodeClicked;
    var siteId = curTreeNode.data['site.site_id'];
    View.controllers.get('defineLocationRM').curTreeNode = curTreeNode;
    if (!siteId) {
        View.panels.get("site_detail").show(false);
        View.panels.get("pr_detail").show(false);
        View.panels.get("bl_detail").show(false);
        View.panels.get("fl_detail").show(false);
        View.panels.get("rm_detail").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("site.site_id", siteId, '=');
        View.panels.get('sbfDetailTabs').selectTab("siteTab", restriction, false, false, false);
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'site_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var propertyName = treeNode.data['property.name'];
        var propertyId = treeNode.data['property.pr_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + propertyId+" "+propertyName+ "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    
    if (treeNode.level.levelIndex == 2) {
        var buildingName = treeNode.data['bl.name'];
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 3) {
        var floorId = treeNode.data['fl.fl_id'];
        var floorName = treeNode.data['fl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + floorId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 4) {
        var roomId = treeNode.data['rm.rm_id'];
        var roomName = treeNode.data['rm.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssClassName + "'>" + roomId + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        if (level == 1) {
            var siteId = parentNode.data['site.site_id'];
            if (!siteId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('property.site_id', '', 'IS NULL', 'AND', true);
            }
        }
        if (level == 2) {
            var propertyId = parentNode.data['property.pr_id'];
            if (!propertyId) {
                restriction = new Ab.view.Restriction();
                restriction.addClause('bl.pr_id', '', 'IS NULL', 'AND', true);
            }
        }
    }
    return restriction;
}

function showDistinctPhoto(){
//    var distinctPanel = View.panels.get('bl_detail');
//    
//    var bldg_photo = distinctPanel.getFieldValue('bl.bldg_photo').toLowerCase();
//    var bl_id = distinctPanel.getFieldValue('bl.bl_id');
//    
//    if (valueExistsNotEmpty(bldg_photo)) {
//        distinctPanel.showImageDoc('image_field', 'bl.bl_id', 'bl.bldg_photo');
//    }
//    else {
//        distinctPanel.fields.get('image_field').dom.src = null;
//        distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
//    }
}


function showRmPhoto(){
    var distinctPanel = View.panels.get('rmphoto');
    
    var em_photo = distinctPanel.getFieldValue('sc_rmphotodoc.rm_photo').toLowerCase();
    var em_id = distinctPanel.getFieldValue('sc_rmphotodoc.blflrm');
    
    if (valueExistsNotEmpty(em_photo)) {
        distinctPanel.showImageDoc('image_field', 'sc_rmphotodoc.blflrm', 'sc_rmphotodoc.rm_photo');
    }
    else {
        distinctPanel.fields.get('image_field').dom.src = null;
        distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
    }
}

function showSitePhoto(){
    var distinctPanel = View.panels.get('site_detail');
    
    var em_photo = distinctPanel.getFieldValue('site.site_image').toLowerCase();
    var em_id = distinctPanel.getFieldValue('site.site_id');
    
    if (valueExistsNotEmpty(em_photo)) {
        distinctPanel.showImageDoc('image_field', 'site.site_id', 'site.site_image');
    }
    else {
        distinctPanel.fields.get('image_field').dom.src = null;
        distinctPanel.fields.get('image_field').dom.alt = getMessage('noImage');
    }
}

function onchangeBlCat(){
    var blPanel = View.panels.get('bl_detail');
    var building_cat = blPanel.getFieldValue("bl.building_cat");
    if (building_cat) {
        blPanel.enableField("bl.count_rm_keyong", true);
        blPanel.actions.get("enterRmcatArea").enabled = false;
    }
    else {
        blPanel.enableField("bl.count_rm_keyong", false);
        blPanel.actions.get("enterRmcatArea").enabled = true;
    }
    
}

function selectValue(sId, value){
    var s = document.getElementById(sId);
    var ops = s.options;
    for (var i = 0; i < ops.length; i++) {
        var tempValue = ops[i].value;
        if (tempValue == value) {
            ops.selectedIndex = i;
        }
    }
}



function onSelectBuliding(){
	var controlPanel=View.panels.get('sbfFilterPanel');
	var siteId=controlPanel.getFieldValue('bl.site_id');
	var prId=controlPanel.getFieldValue('bl.pr_id');
	var res="bl.acc_type !='yxz' and bl.bl_id in(select bl_id from rm where rm.rm_cat='301') "
	if(valueExistsNotEmpty(siteId)){
		res+=" and bl.site_id='"+siteId+"'";
	}
	if(valueExistsNotEmpty(prId)){
		res+=" and bl.pr_id='"+prId+"'";
	}
	
    View.selectValue({
        formId: 'sbfFilterPanel',
        title: "大厦",
        fieldNames: ['bl.bl_id','bl.pr_id','bl.site_id'],
        selectTableName: 'bl',
        selectFieldNames: ['bl.bl_id','bl.pr_id','bl.site_id'],
        visibleFieldNames: ['bl.site_id','bl.pr_id','bl.grp_uid','bl.name'],
		filterFieldNames:['bl.site_id','bl.pr_id'],
        restriction:res
    });
}
