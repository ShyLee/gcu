var checkoutDispController=View.createController('checkoutDispController', {
	stuYear:"",
	dispDetail:"",
	dateDispForm:"",
	dateDispTo:"",
	countForm:"",
	countTo:"",
	afterInitialDataFetch:function(){
		  var title="";
		  var stuYear=this.view.parameters["stuYear"];
		  var dispDetail=this.view.parameters["dispDetail"];
		  var dateDispForm=this.view.parameters["dateDispForm"];
		  var dateDispTo=this.view.parameters["dateDispTo"];
		  if(stuYear!=""){
				this.dispStaticPanel.addParameter('stuYear',"stu_in_year = '"+stuYear+"'");
				title=title+stuYear+"级";
			}else{
				this.dispStaticPanel.addParameter('stuYear',"1=1");
			}
			
			if(dispDetail!=""){
				this.dispStaticPanel.addParameter('dispDetail',"disp_detail = '"+dispDetail+"'");
				title=title+dispDetail+"统计表";
			}else{
				this.dispStaticPanel.addParameter('dispDetail',"disp_detail = '晚归'");
				title=title+"晚归统计表";
			}
			
			if(dateDispForm!=""){
				this.dispStaticPanel.addParameter('dateDispForm',"date_disp >= to_date('"+dateDispForm+"', 'yyyy/MM/dd')");
				title=title+"("+dateDispForm;
			}else{
				this.dispStaticPanel.addParameter('dateDispForm',"1=1");
			}
			
			if(dateDispTo!=""){
				this.dispStaticPanel.addParameter('dateDispTo',"date_disp <= to_date('"+dateDispTo+"', 'yyyy/MM/dd')");
				title=title+"到"+dateDispTo+")";
			}else{
				this.dispStaticPanel.addParameter('dateDispTo',"1=1");
				if(this.dateDispForm!=""){
					title=title+")";
				}
			}
			
			this.dispStaticPanel.refresh();
			this.dispStaticPanel.setTitle(title);
	},
	show:function(){
		var totalPanel=this.dispStaticPanel;
		var restriction = new Ab.view.Restriction();
		var dv_name = this.consolePanel.getFieldValue("dv.dv_name");
//		var count = this.consolePanel.getFieldValue("dv.count_other");
		this.countForm = this.consolePanel.getFieldValue("dv.count_from");
		this.countTo = this.consolePanel.getFieldValue("dv.count_to");
		if(valueExistsNotEmpty(dv_name)){
			restriction.addClause("sc_stu_disp_log.dv_name",dv_name,"=");
		}
//		if(valueExistsNotEmpty(count)){
//			restriction.addClause("sc_stu_disp_log.count_dis",count,"=");
//		}
		if(this.countForm!=""){
//			totalPanel.addParameter('countForm',sc_stu_disp_log.count_dis >= this.countForm);
			restriction.addClause("sc_stu_disp_log.count_dis",this.countForm,">=");
		}else{
			totalPanel.addParameter('countForm',"1=1");
		}
		
		if(this.countTo!=""){
//			totalPanel.addParameter('countTo',sc_stu_disp_log.count_dis <= this.countTo);
			restriction.addClause("sc_stu_disp_log.count_dis",this.countTo,"<=");
		}else{
			totalPanel.addParameter('countTo',"1=1");
		}
		this.dispStaticPanel.refresh(restriction);
	},
	clear:function(){
		this.consolePanel.setFieldValue("dv.dv_name","");
		this.consolePanel.setFieldValue("dv.count_from","");
		this.consolePanel.setFieldValue("dv.count_to","");
	}
});
