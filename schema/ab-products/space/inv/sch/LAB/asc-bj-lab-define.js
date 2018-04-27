var controller = View.createController('controller', {
	saveType:"edit",
	editLabPanel_onSave:function(){
		var dv_id = this.editLabPanel.getFieldValue("sc_lab.dv_id");
		var dp_id = this.editLabPanel.getFieldValue("sc_lab.dp_id");
		if(this.saveType=="save"){
			var id="";
			 try {
		         var result = Workflow.callMethod('AbSpaceRoomInventoryBAR-HousePKValueHander-getLabValue',dv_id,dp_id);
		         if (result.code == 'executed') {
					id=result.message;
		         }
		        } 
		        catch (e) {
		            //Workflow.handleError(e);
		        	View.alert('工作流失败');
		        }         
		    this.editLabPanel.setFieldValue('sc_lab.lab_id',id);
		    if(this.editLabPanel.canSave()){			
				var success=this.editLabPanel.save();
				if(success){
					this.labListPanel.refresh();
				}
			}
		}else if(this.saveType=="edit"){
			if(this.editLabPanel.canSave()){				
				var success=this.editLabPanel.save();
				if(success){					
					this.labListPanel.refresh();
				}
			}
		}	
	},
	labListPanel_onAddNew: function (){
		this.editLabPanel.refresh([],true);
		this.editLabPanel.getFieldElement('sc_lab.option1').disabled = true;
		this.editLabPanel.getFieldElement('sc_lab.em_name').disabled = true;
		this.saveType="save";
	},
	showLabDeatil: function (){
		var panel = this.labListPanel;
		var selectedIndex = panel.selectedRowIndex;
		var paramId = panel.rows[selectedIndex]["sc_lab.id"];
        var res = new Ab.view.Restriction();
        res.addClause("sc_lab.id", paramId, '=');
        this.editLabPanel.refresh(res,false);
        this.editLabPanel.getFieldElement('sc_lab.option1').disabled = true;
        this.editLabPanel.getFieldElement('sc_lab.em_name').disabled = true;
        this.saveType="edit";
	},
	editLabPanel_onSelectRm:function(){
    	var restriction = new Ab.view.Restriction();
    	this.rmPanel.refresh(restriction);
    	
    	this.rmPanel.showInWindow({
    		x:250,
    		y:200,
            width: 700,
            height: 600
        });
    },
    editLabPanel_onClearRm:function(){
    	this.editLabPanel.setFieldValue("sc_lab.option1","");
    	this.editLabPanel.setFieldValue("sc_lab.rm_area","0.00");
    },
    rmPanel_onSure:function(){
    	var rows = this.rmPanel.getSelectedRows();
		if(rows.length == 0){
			View.alert('请选择房间号！');
			return;
		}
		var option1=this.editLabPanel.getFieldValue("sc_lab.option1");
		var option2=this.editLabPanel.getFieldValue("sc_lab.rm_area");
		for(var i = 0; i < rows.length; i++){
			//房间号的集合
			var blId=rows[i]['rm.bl_id'];
			var flId=rows[i]['rm.fl_id'];
			var rmId=rows[i]['rm.rm_id'];
			var area=parseFloat(rows[i]['rm.area']);
			var roomId=blId+"|"+flId+"|"+rmId;
			if(option1==""){
				option1=roomId;
				option2=parseFloat(area);
			}else{
				
				option1=option1+","+roomId;
				option2=parseFloat(option2)+parseFloat(area);
			}
		}
		option2=option2.toFixed(2);
		this.editLabPanel.setFieldValue("sc_lab.option1",option1);
		this.editLabPanel.setFieldValue("sc_lab.rm_area",option2);
		this.rmPanel.closeWindow();
    },
    editLabPanel_onSelectEm:function(){
    	var restriction = new Ab.view.Restriction();
    	this.emPanel.refresh(restriction);
    	
    	this.emPanel.showInWindow({
    		x:250,
    		y:200,
            width: 700,
            height: 600
        });
    },
    editLabPanel_onClearEm:function(){
    	this.editLabPanel.setFieldValue("sc_lab.em_name","");
    },
    selectEm:function(){
    	var rows = this.emPanel.getSelectedRows();
		if(rows.length == 0){
			View.alert('请选择责任人！');
			return;
		}
		var em_name=this.editLabPanel.getFieldValue("sc_lab.em_name");
		for(var i = 0; i < rows.length; i++){
			//责任人的集合
			var name=rows[i]['em.name'];
			if(em_name==""){
				em_name=name;
			}else{			
				em_name=em_name+","+name;
			}
		}
		this.editLabPanel.setFieldValue("sc_lab.em_name",em_name);
		this.emPanel.closeWindow();
    },
	editLabPanel_onDelete:function(){
		var message="确定要删除";
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				controller.editLabPanel.deleteRecord();
				controller.labListPanel.refresh();
				controller.editLabPanel.show(false);
				View.alert('删除成功');
			}else{
				
			}
		});		
	}
});
