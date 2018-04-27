var controller = View.createController('controller', {
	restration:"1=1",
	afterViewLoad: function(){
		var selDom=jQuery("#selectYear");
		var curYear=new Date().getFullYear();
		for ( var i = 2012; i <=curYear; i++) {
			selDom.append("<option value='"+i+"'>"+i+"</option>");
		}
		jQuery("#selectYear").find("option[value = '"+curYear+"']").attr("selected","selected");
	},
	afterInitialDataFetch: function(){
		this.requestConsole_onShow();
	},
	requestConsole_onShow:function(){
		var yearInput = jQuery('#selectYear option:selected').text();
		var dateFrom=yearInput+"-01-01";
		var dateTo=Number(yearInput)+1+"-01-01";;
		var restration="1=1";
		if(valueExistsNotEmpty(dateFrom)){
			restration="to_char(return_dispose.date_request,'YYYY-MM-dd')>='"+dateFrom+"'";
		}
		if(valueExistsNotEmpty(dateTo)){
			restration="to_char(return_dispose.date_request,'YYYY-MM-dd')<='"+dateTo+"'";
		}
		if(dateFrom!="" && dateTo!=""){
			restration="to_char(return_dispose.date_request,'YYYY-MM-dd')>='"+dateFrom+"' and to_char(return_dispose.date_request,'YYYY-MM-dd')<='"+dateTo+"'";
		}
		this.restration=restration;
		this.eqPanel.addParameter("requestDate",restration);
		this.eqPanel.refresh();
		this.eqPanel.setTitle("【"+yearInput+"】年设备报减列表");
		
		this.eqAttachPanel.addParameter("requestDate",restration);
		this.eqAttachPanel.refresh();
		this.eqAttachPanel.setTitle("【"+yearInput+"】年设备附件报减列表");
		
	},
	requestConsole_onCancel: function(){
		this.requestConsole.clear();
		var restration="1=1";
		this.restration=restration;
		this.eqPanel.addParameter("requestDate",restration);
		this.eqPanel.refresh();
		
		this.eqAttachPanel.addParameter("requestDate",restration);
		this.eqAttachPanel.refresh();
	}
});