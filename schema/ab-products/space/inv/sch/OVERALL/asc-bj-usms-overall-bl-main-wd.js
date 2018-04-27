/**
 * @author Keven.xi
 */



View.createController('ascBjUsmsOverallBlMainController', {
	
	siteId:"",
	blId:"",
	mainTabs : null,
	
	afterViewLoad:function(){
		//restriction : Main Campus
		this.mainTabs = View.getControl('', 'campusTabs');
		this.siteId = this.mainTabs.currentSiteId ;
		
		this.ascBjUsmsOverallBlMain_blGrid.addParameter('siteIdRes',this.siteId);
	},
	
	ascBjUsmsOverallBlMain_blGrid_showBlInfo_onClick: function(row){
		this.blId = row.record['bl.bl_id'];
		View.openDialog('asc-bj-usms-bl-pracelland-summary-info.axvw', null, false, {
            width: 1024,
            height: 768,
            closeButton: false,
			openBlId:this.blId
        });
    },
    
    ConsoleForm_onBtnFilter: function(){
    	var mainTitle="";
    	var landCode=this.ConsoleForm.getFieldValue("bl.land_code");
    	var blUse=this.ConsoleForm.getFieldValue("bl.use1");
    	var type=this.ConsoleForm.getFieldValue("bl.construction_type");
    	var blAge=$("groupBandFormat").value;

    	var res=new Ab.view.Restriction();
    	if(valueExistsNotEmpty(landCode)){
    		res.addClause("bl.land_code");
    		mainTitle=mainTitle+landCode;
    	}
    	if(valueExistsNotEmpty(blUse)){
    		res.addClause("bl.use1");
    		mainTitle=mainTitle+"——";
    		mainTitle=mainTitle+blUse
    	}
    	if(valueExistsNotEmpty(type)){
    		res.addClause("bl.construction_type");
    		mainTitle=mainTitle+"——";
    		mainTitle=mainTitle+type;
    	}
    	
    	if(valueExistsNotEmpty(blAge)){
    		if(blAge!="isnull"){
    			var age=null;
    			var date=new Date();
				var year=date.getYear();
				if(year<2000){
					year=year+1900;
				}
				var month=date.getMonth()+1;
				var date=date.getDate();
				
				var b=1;
    			if(blAge=="in_10"){
    				year=year-10;
    				var fullYear=year+"-"+month+"-"+date;
    				res.addClause("bl.date_building_end",fullYear,'&gt;=');
    				mainTitle=mainTitle+"——";
    	    		mainTitle=mainTitle+"房龄10年以内";
    			}
    			if(blAge=="in_20"){
    				year=year-20;
    				var fullYear=year+"-"+month+"-"+date;
    				res.addClause("bl.date_building_end",fullYear,'&gt;=');
    				mainTitle=mainTitle+"——";
    	    		mainTitle=mainTitle+"房龄20年以内";
    			}
    			if(blAge=="30_after"){
    				year=year-30;
    				var fullYear=year+"-"+month+"-"+date;
    				res.addClause("bl.date_building_end",fullYear,'&lt;=');
    				mainTitle=mainTitle+"——";
    	    		mainTitle=mainTitle+"房龄30年以上";
    			}
    			if(blAge=="40_after"){
    				year=year-40;
    				var fullYear=year+"-"+month+"-"+date;
    				res.addClause("bl.date_building_end",fullYear,'&lt;=');
    				mainTitle=mainTitle+"——";
    	    		mainTitle=mainTitle+"房龄40年以上";
    			}
    			if(blAge=="50_after"){
    				year=year-40;
    				var fullYear=year+"-"+month+"-"+date;
    				res.addClause("bl.date_building_end",fullYear,'&lt;=');
    				mainTitle=mainTitle+"——";
    	    		mainTitle=mainTitle+"房龄50年以上";
    			}
    		}
    	}
    	this.ascBjUsmsOverallBlMain_blGrid.refresh(res);
    	var title=this.ascBjUsmsOverallBlMain_blGrid.getTitle();
    	this.ascBjUsmsOverallBlMain_blGrid.setTitle(title+" :" +mainTitle);
    },
    
    ConsoleForm_onBtnClear: function(){
    	this.ConsoleForm.clear();
    	$("groupBandFormat").value="isnull";
    }
	
	
});

