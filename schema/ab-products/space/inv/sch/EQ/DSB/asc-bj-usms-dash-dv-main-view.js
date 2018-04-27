var controller = View.createController('controller', {
	afterInitialDataFetch: function(){
		var AddEq=this.getBaozengAssign();
        if(AddEq!="0"){
     	   	document.getElementById("report1").innerHTML="<font size='5' color='red'>"+AddEq+"</font>";
        }else{
        	document.getElementById("report1").innerHTML="<font size='5'>0</font>";
        }
        var EqAdd=this.getChange();
        if(EqAdd!="0"){
     	   	document.getElementById("report2").innerHTML="<font size='5' color='red'>"+EqAdd+"</font>";
        }else{
        	document.getElementById("report2").innerHTML="<font size='5'>0</font>";
        }
        var EqAttach=this.getAtttachChange();
        if(EqAttach!="0"){
     	   	document.getElementById("report3").innerHTML="<font size='5' color='red'>"+EqAttach+"</font>";
        }else{
        	document.getElementById("report3").innerHTML="<font size='5'>0</font>";
        }
        var Shengxia=this.getShengxia();
        if(Shengxia!="0"){
     	   	document.getElementById("report4").innerHTML="<font size='5' color='red'>"+Shengxia+"</font>";
        }else{
        	document.getElementById("report4").innerHTML="<font size='5'>0</font>";
        }
        var Pandian=this.getPandian();
        if(Pandian!="0"){
     	   	document.getElementById("report5").innerHTML="<font size='5' color='red'>"+Pandian+"</font>";
        }else{
        	document.getElementById("report5").innerHTML="<font size='5'>0</font>";
        }
        
	},
	/**
     * 报增分配
     */
	getBaozengAssign:function(){					
		var dsRtnDis = View.dataSources.get("add_eq_ds");
		var res=new Ab.view.Restriction();
		res.addClause('add_eq.status','2','=');
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	},
	/**
     * 设备可调剂申请
     */
	getChange:function(){
		var user = this.view.user;
		var dv_id=user.employee.organization.divisionId;
		var dsRtnDis = View.dataSources.get("eq_notice_ds");
		var res=new Ab.view.Restriction();
		res.addClause('eq_change.dv_id_old',dv_id,'!=');
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	},
	/**
     * 附件可调剂申请
     */
	getAtttachChange:function(){
		var user = this.view.user;
		var dv_id=user.employee.organization.divisionId;
		var dsRtnDis = View.dataSources.get("eq_attach_change_ds");
		var res=new Ab.view.Restriction();
		res.addClause('eq_attach_change.dv_id_old',dv_id,'!=');
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	},
	/**
     * 部门内多余设备
     */
	getShengxia:function(){
		var dsRtnDis = View.dataSources.get("eq_ds");
		var res=new Ab.view.Restriction();
		res.addClause('eq.sch_status','2','=');
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	},
	/**
     * 清查盘点
     */
	getPandian:function(){
		var dsRtnDis = View.dataSources.get("eq_check_main_ds");
		var res=new Ab.view.Restriction();
		res.addClause('eq_check_main.is_done','1','=');
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	}
});

