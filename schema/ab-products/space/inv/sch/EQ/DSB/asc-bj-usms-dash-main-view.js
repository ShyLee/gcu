var controller = View.createController('controller', {
	afterInitialDataFetch: function(){
		//0;设备退还;1;设备报减;2;资产追加;3;附件退还;4;附件报减
		var AddEq=this.getBaoZengNum();
        if(AddEq!="0"){
     	   	document.getElementById("report1").innerHTML="<font size='5' color='red'>"+AddEq+"</font>";
        }else{
        	document.getElementById("report1").innerHTML="<font size='5'>0</font>";
        }
        var EqAdd=this.getJiShuAdjust('2');
        if(EqAdd!="0"){
     	   	document.getElementById("report2").innerHTML="<font size='5' color='red'>"+EqAdd+"</font>";
        }else{
        	document.getElementById("report2").innerHTML="<font size='5'>0</font>";
        }
        var EqDispose=this.getEqDispose('1');
        if(EqDispose!="0"){
     	   	document.getElementById("report3").innerHTML="<font size='5' color='red'>"+EqDispose+"</font>";
        }else{
        	document.getElementById("report3").innerHTML="<font size='5'>0</font>";
        }
        var EqAttachDispose=this.getBaoJianNum('4');
        if(EqAttachDispose!="0"){
     	   	document.getElementById("report4").innerHTML="<font size='5' color='red'>"+EqAttachDispose+"</font>";
        }else{
        	document.getElementById("report4").innerHTML="<font size='5'>0</font>";
        }
        var EqChange=this.getEqChangeNum();
        if(EqChange!="0"){
     	   	document.getElementById("report5").innerHTML="<font size='5' color='red'>"+EqChange+"</font>";
        }else{
        	document.getElementById("report5").innerHTML="<font size='5'>0</font>";
        }
        var EqAttachChange=this.getEqAttachChangeNum();
        if(EqAttachChange!="0"){
     	   	document.getElementById("report6").innerHTML="<font size='5' color='red'>"+EqAttachChange+"</font>";
        }else{
        	document.getElementById("report6").innerHTML="<font size='5'>0</font>";
        }
        var EqReturn=this.getJiShuAdjust('0');
        if(EqReturn!="0"){
     	   	document.getElementById("report7").innerHTML="<font size='5' color='red'>"+EqReturn+"</font>";
        }else{
        	document.getElementById("report7").innerHTML="<font size='5'>0</font>";
        }
        var EqAttachReturn=this.getJiShuAdjust('3');
        if(EqAttachReturn!="0"){
     	   	document.getElementById("report8").innerHTML="<font size='5' color='red'>"+EqAttachReturn+"</font>";
        }else{
        	document.getElementById("report8").innerHTML="<font size='5'>0</font>";
        }
        var EqCheckChange=this.getEqCheckChange();
        if(EqCheckChange!="0"){
     	   	document.getElementById("report9").innerHTML="<font size='5' color='red'>"+EqCheckChange+"</font>";
        }else{
        	document.getElementById("report9").innerHTML="<font size='5'>0</font>";
        }
        
	},
	/**
     * 资产追加、设备退还、附件退还
     */
	getJiShuAdjust:function(Num){			
		var dsRtnDis = View.dataSources.get("return_dispose_ds");
		var res=new Ab.view.Restriction();
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			res.addClause('return_dispose.data_type',Num,'=');
			res.addClause('return_dispose.audit_status','1','=');
		}
		if(user.role == "UNV EQ HEAD")
		{
			res.addClause('return_dispose.data_type',Num,'=');
			res.addClause('return_dispose.audit_status','2','=');
		}
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	},
	/**
     * 报增审批
     */
	getBaoZengNum:function(){
		var dsRtnDis = View.dataSources.get("activity_log_ds");
		var res=new Ab.view.Restriction();
		res.addClause('activity_log.prob_type','设备管理','=');
		res.addClause('activity_log.activity_type','SD -设备报增','=');
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	},
	/**
     * 设备报减
     */
	getEqDispose:function(Num){			
		var dsRtnDis = View.dataSources.get("return_dispose_ds");
		var res=new Ab.view.Restriction();
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			return '0';
		}
		if(user.role == "UNV EQ HEAD")
		{
			res.addClause('return_dispose.data_type',Num,'=');
			res.addClause('return_dispose.audit_status','2','=');
			var Record=dsRtnDis.getRecords(res);
			if(Record.length==0){
				return '0';
			}else{
				return Record.length;
			}
		}
	},
	/**
     * 附件报减
     */
	getBaoJianNum:function(Num){
		var dsRtnDis = View.dataSources.get("return_dispose_ds");
		var res=new Ab.view.Restriction();
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			return '0';
		}
		if(user.role == "UNV EQ HEAD")
		{
			res.addClause('return_dispose.data_type',Num,'=');
			res.addClause('return_dispose.audit_status','1','=');
			var Record=dsRtnDis.getRecords(res);
			if(Record.length==0){
				return '0';
			}else{
				return Record.length;
			}
		}		
	},
	/**
     * 设备调剂
     */
	getEqChangeNum:function(){
		var dsRtnDis = View.dataSources.get("eq_change_ds");
		var res=new Ab.view.Restriction();
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			return '0';
		}
		if(user.role == "UNV EQ HEAD")
		{
			res.addClause('eq_change.adjust_status','1','=');
			var Record=dsRtnDis.getRecords(res);
			if(Record.length==0){
				return '0';
			}else{
				return Record.length;
			}
		}
		
		
	},
	/**
     * 附件调剂
     */
	getEqAttachChangeNum:function(Num){
		var dsRtnDis = View.dataSources.get("eq_attach_change_ds");
		var res=new Ab.view.Restriction();
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			return '0';
		}
		if(user.role == "UNV EQ HEAD")
		{
			res.addClause('eq_attach_change.adjust_status','1','=');
			var Record=dsRtnDis.getRecords(res);
			if(Record.length==0){
				return '0';
			}else{
				return Record.length;
			}
		}	
		
	},
	/**
     * 盘亏审批
     */
	getEqCheckChange:function(){
		var dsRtnDis = View.dataSources.get("eq_check_change_ds");
		var res=new Ab.view.Restriction();
		var user = this.view.user;
		if(user.role == "UNV EQ ADMIN")
		{
			res.addClause('eq_check_main.is_done','1','=');
		}
		if(user.role == "UNV EQ HEAD")
		{
			res.addClause('eq_check_main.is_done','3','=');
		}	
		var Record=dsRtnDis.getRecords(res);
		if(Record.length==0){
			return '0';
		}else{
			return Record.length;
		}
	}
});

