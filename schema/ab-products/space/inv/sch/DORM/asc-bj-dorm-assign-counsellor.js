/**
 * @author Keven.xi
 */
var ascBjUsmsOverallBl = View.createController('ascBjUsmsOverallBlController', {
	
	tabSelected:"",
	siteCount:0,
	campusTabs:null,
	
	afterViewLoad: function(){
		this.campusTabs = View.getControl('', 'campusTabs');
	},
	afterInitialDataFetch: function() {
		this.inherit();
 	 	this.campusTabs.addEventListener('afterTabChange',this.campusTabs_afterTabChange.createDelegate(this));	
	},
		
	campusTabs_afterTabChange:function(tabPanel,selectedTabName, newTabName){
		this.campusTabs.curSelectedTabName = selectedTabName;
		
		for  (var i=0; i < this.siteCount; i++){
			if(selectedTabName == 'subcampus_tab_'+i){
				var siteId = this.campusTabs.findTab(selectedTabName).siteId;
				this.campusTabs.currentSiteId = siteId;
	 		}
		}
	},
	ConsoleForm_onShowTree: function(){
		this.tabs = View.getControlsByType(self, 'tabs')[0];
        var blName=this.ConsoleForm.getFieldValue("bl.name");
        var emId=this.ConsoleForm.getFieldValue("em.em_id");
        var emName=this.ConsoleForm.getFieldValue("em.name");
        //this.tabs.dvId=dvId; //this.tabs.A 可以再任何一个tab中取到变量A的值
        this.tabs.emId=emId;
        this.tabs.emName=emName;
        this.tabs.blName=blName;
        var nextTabName ='male_tab'; //定义一个变量，'assignRm_male_tab'是指<tab/>中的name值
        this.tabs.selectTab(nextTabName,null,false,true,false); //显示刷新tab界面
    },
    ConsoleForm_onClear:function(){
    	this.tabs = View.getControlsByType(self, 'tabs')[0];
    	var blName=this.ConsoleForm.setFieldValue("bl.name","");
    	var emId=this.ConsoleForm.setFieldValue("em.em_id","");
    	var emName=this.ConsoleForm.setFieldValue("em.name","");
        this.tabs.emId=emId;
        this.tabs.emName=emName;
        this.tabs.blName=blName;
		var nextTabName ='male_tab';
		this.tabs.selectTab(nextTabName,null,false,true,false); 
	},
	ConsoleForm_onAllocated:function(){
		var controller=this;
   	    View.openDialog('asc-bj-dorm-assign-counsellor-allocated.axvw', null, false, {
            width: 800,
            height: 600,
  		    closeButton: false,
			afterViewLoad:function(dialogView){
				var dialogController=dialogView.controllers.get("controller");
				dialogController.onSave=ascBjUsmsOverallBl.GridForm_onSubmitChanges.createDelegate(controller);
				}
   	    });
	},
	GridForm_onSubmitChanges:function(){
		this.campusTabs.refresh();
	},
	ConsoleForm_onSelectEm:function(){
        var restriction = "sc_em.gangwei_id='辅导员岗'";
        View.selectValue({
            formId: 'ConsoleForm',
            selectTableName: 'sc_em',
            title: "辅导员",
            fieldNames: ['sc_em.em_id', 'sc_em.name'],
            selectFieldNames: ['sc_em.em_id', 'sc_em.name'],
            visibleFieldNames: ['sc_em.em_id', 'sc_em.name','sc_em.sex'],
            sortFieldNames: ['sc_em.em_id'],
            restriction: restriction,
            selectValueType: 'grid'
        });
	},
	ConsoleForm_onSelectEmName:function(){
		this.ConsoleForm_onSelectEm();
	}
});