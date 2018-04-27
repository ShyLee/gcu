var controller=View.createController('EqSumForm',{
	
	afterViewLoad: function(){
		
		controller.showAll();
		
	},
	showAll: function(){
		this.eqSumByYearPanel.show(false);
		this.eqSumByTypeUsePanel.show(false);
		this.eqSumByYearGrid.show(false);
		this.chartSumByDvPanel.show(false);
		this.eqSumByBuIdPanel.show(false);
		this.eqSumByDvDpIdPanel.show(false);
		
		this.gridPanel.addParameter('dv_id_change','1=1');
		
		this.chartPie_chart.addParameter('5070', '1950-1970年设备');
		this.chartPie_chart.addParameter('7090', '1970-1990年设备');
		this.chartPie_chart.addParameter('902010', '1990-2010年设备');
		this.chartPie_chart.addParameter('2010after', '2010年以后的设备');
		
		this.chartPie_chart.addParameter('dv_id_byYear', "1=1");
		this.chartPie_chart.refresh();
		
		this.eqSumByYearPanel.addParameter('5070', '1950-1970年设备');
		this.eqSumByYearPanel.addParameter('7090', '1970-1990年设备');
		this.eqSumByYearPanel.addParameter('902010', '1990-2010年设备');
		this.eqSumByYearPanel.addParameter('2010after', '2010年以后的设备');
		this.eqSumByYearPanel.addParameter('dv_id_byYear', "1=1");
		//this.eqSumByYearPanel.refresh();
		this.eqSumByYearPanel.show(false);
		
		this.chartByType.addParameter('01', '房屋及建筑物');
		this.chartByType.addParameter('02', '土地及植物');
		this.chartByType.addParameter('03', '仪器仪表');
		this.chartByType.addParameter('04', '机电设备');
		this.chartByType.addParameter('05', '电子设备');
		this.chartByType.addParameter('06', '印刷机械');
		this.chartByType.addParameter('07', '卫生医疗器械');
		this.chartByType.addParameter('08', '文体设备');
		this.chartByType.addParameter('09', '标本模型');
		this.chartByType.addParameter('10', '文物及陈列品');
		this.chartByType.addParameter('11', '图书');
		this.chartByType.addParameter('12', '工具、量具和器皿');
		this.chartByType.addParameter('13', '家具');
		this.chartByType.addParameter('14', '行政办公设备');
		this.chartByType.addParameter('15', '被服装具');
		this.chartByType.addParameter('16', '牲畜');
		this.chartByType.addParameter('dv_id_byCsi', "1=1");
		this.chartByType.refresh();
		
		this.eqSumByCSIPanel.addParameter('01', '房屋及建筑物');
		this.eqSumByCSIPanel.addParameter('02', '土地及植物');
		this.eqSumByCSIPanel.addParameter('03', '仪器仪表');
		this.eqSumByCSIPanel.addParameter('04', '机电设备');
		this.eqSumByCSIPanel.addParameter('05', '电子设备');
		this.eqSumByCSIPanel.addParameter('06', '印刷机械');
		this.eqSumByCSIPanel.addParameter('07', '卫生医疗器械');
		this.eqSumByCSIPanel.addParameter('08', '文体设备');
		this.eqSumByCSIPanel.addParameter('09', '标本模型');
		this.eqSumByCSIPanel.addParameter('10', '文物及陈列品');
		this.eqSumByCSIPanel.addParameter('11', '图书');
		this.eqSumByCSIPanel.addParameter('12', '工具、量具和器皿');
		this.eqSumByCSIPanel.addParameter('13', '家具');
		this.eqSumByCSIPanel.addParameter('14', '行政办公设备');
		this.eqSumByCSIPanel.addParameter('15', '被服装具');
		this.eqSumByCSIPanel.addParameter('16', '牲畜');
		this.eqSumByCSIPanel.addParameter('dv_id_byCsi', "1=1");
		//this.eqSumByCSIPanel.refresh();
		this.eqSumByCSIPanel.show(false);
		
		
	},
	afterInitialDataFetch: function(){
		
		
		//筛选单位大类为教学类的单位
		var jxRes=new Ab.view.Restriction();
		jxRes.addClause('dv.bu_id','教学类','=');
		jxRes.addClause('dv.bu_id','科研类','=',')OR(');
//		this.dvJiaoXueListPanel.addParameter('BUID',"('教学类','科研类')");
		this.dvJiaoXueListPanel.refresh(jxRes);
		//筛选单位大类为教学类以外的单位
		var otherRes=new Ab.view.Restriction();
		otherRes.addClause('dv.bu_id','教学类','!=');
		otherRes.addClause('dv.bu_id','科研类','!=','AND');
		this.dvOtherListPanel.refresh(otherRes);
		
		//增减变动
		this.gridPanel.addParameter('dv_id_change','1=1');
		this.gridPanel.refresh();
	},
	
	gridPanel_onReport: function(){
		View.openDialog('asc-bj-usms-select-fixed-rpt-format.axvw', null, false, {width:470, height:200, xmlName:"eqDvByChangeReport",closeButton:false});
	},
	showTongJiByDv: function(){
		var selectIndex=this.dvJiaoXueListPanel.selectedRowIndex;
		var dv_id=this.dvJiaoXueListPanel.gridRows.get(selectIndex).getRecord().getValue('dv.dv_id');
		controller.getDv(dv_id);
	},
	showOtherByDv: function(){
		var selectIndex=this.dvOtherListPanel.selectedRowIndex;
		var dv_id=this.dvOtherListPanel.gridRows.get(selectIndex).getRecord().getValue('dv.dv_id');
		controller.getDv(dv_id);
	},
	getDv: function(dv_id){
		var dv_id=dv_id;
		
		//按单位进行统计
		this.gridPanel.addParameter('dv_id_change',"dvName='"+dv_id+"'");
		
		this.gridPanel.refresh();
		//controller.addCloumnHeadOfDv();
		//按单位和按年代统计设备
		this.chartPie_chart.addParameter('5070', '1950-1970年设备');
		this.chartPie_chart.addParameter('7090', '1970-1990年设备');
		this.chartPie_chart.addParameter('902010', '1990-2010年设备');
		this.chartPie_chart.addParameter('2010after', '2010年以后的设备');
		
		this.chartPie_chart.addParameter('dv_id_byYear', "dv_id='"+dv_id+"'");
		this.chartPie_chart.refresh();
		
		this.eqSumByYearPanel.addParameter('5070', '1950-1970年设备');
		this.eqSumByYearPanel.addParameter('7090', '1970-1990年设备');
		this.eqSumByYearPanel.addParameter('902010', '1990-2010年设备');
		this.eqSumByYearPanel.addParameter('2010after', '2010年以后的设备');
		this.eqSumByYearPanel.addParameter('dv_id_byYear',  "dv_id='"+dv_id+"'");
		//this.eqSumByYearPanel.refresh();
		this.eqSumByYearPanel.show(false);
		
		//按单位和设备用途统计进行筛选
		var byStdRes=new Ab.view.Restriction();
		byStdRes.addClause('eq.dv_id',dv_id,'=');
		this.chartByStd.refresh(byStdRes);
		
		var byStdPanelRes=new Ab.view.Restriction();
		byStdPanelRes.addClause('eq.dv_id',dv_id,'=');
		this.eqSumByTypeUsePanel.refresh(byStdPanelRes);
		//根据16大类统计
		this.chartByType.addParameter('01', '房屋及建筑物');
		this.chartByType.addParameter('02', '土地及植物');
		this.chartByType.addParameter('03', '仪器仪表');
		this.chartByType.addParameter('04', '机电设备');
		this.chartByType.addParameter('05', '电子设备');
		this.chartByType.addParameter('06', '印刷机械');
		this.chartByType.addParameter('07', '卫生医疗器械');
		this.chartByType.addParameter('08', '文体设备');
		this.chartByType.addParameter('09', '标本模型');
		this.chartByType.addParameter('10', '文物及陈列品');
		this.chartByType.addParameter('11', '图书');
		this.chartByType.addParameter('12', '工具、量具和器皿');
		this.chartByType.addParameter('13', '家具');
		this.chartByType.addParameter('14', '行政办公设备');
		this.chartByType.addParameter('15', '被服装具');
		this.chartByType.addParameter('16', '牲畜');
		this.chartByType.addParameter('dv_id_byCsi', "dv_id='"+dv_id+"'");
		this.chartByType.refresh();
		
		this.eqSumByCSIPanel.addParameter('01', '房屋及建筑物');
		this.eqSumByCSIPanel.addParameter('02', '土地及植物');
		this.eqSumByCSIPanel.addParameter('03', '仪器仪表');
		this.eqSumByCSIPanel.addParameter('04', '机电设备');
		this.eqSumByCSIPanel.addParameter('05', '电子设备');
		this.eqSumByCSIPanel.addParameter('06', '印刷机械');
		this.eqSumByCSIPanel.addParameter('07', '卫生医疗器械');
		this.eqSumByCSIPanel.addParameter('08', '文体设备');
		this.eqSumByCSIPanel.addParameter('09', '标本模型');
		this.eqSumByCSIPanel.addParameter('10', '文物及陈列品');
		this.eqSumByCSIPanel.addParameter('11', '图书');
		this.eqSumByCSIPanel.addParameter('12', '工具、量具和器皿');
		this.eqSumByCSIPanel.addParameter('13', '家具');
		this.eqSumByCSIPanel.addParameter('14', '行政办公设备');
		this.eqSumByCSIPanel.addParameter('15', '被服装具');
		this.eqSumByCSIPanel.addParameter('16', '牲畜');
		this.eqSumByCSIPanel.addParameter('dv_id_byCsi', "dv_id='"+dv_id+"'");
		//this.eqSumByCSIPanel.refresh();
		this.eqSumByCSIPanel.show(false);
		//隐藏根据单位类别统计设备
		this.chartByDv.show(false);
		//增加title
		this.gridPanel.setTitle('查看本年度设备增减情况--'+dv_id);
		this.chartPie_chart.setTitle('根据年代统计设备总价值--'+dv_id);
		this.chartByStd.setTitle('根据设备用途统计设备总价值(元)--'+dv_id);
		this.chartByType.setTitle('根据设备大类统计设备总价值(元)--'+dv_id);
		
		this.eqSumByYearPanel.show(false);
		this.eqSumByTypeUsePanel.show(false);
		this.eqSumByYearGrid.show(false);
		this.chartSumByDvPanel.show(false);
		this.eqSumByBuIdPanel.show(false);
		this.eqSumByDvDpIdPanel.show(false);
		
		
	},
	//查看全校设备统计
	viewWholeSchoolEq: function(){
		controller.showAll();
		this.gridPanel.refresh();
//		this.eqSumByTypeUsePanel.restriction=null;
//		this.eqSumByTypeUsePanel.refresh("");
		this.chartByStd.restriction=null;
		this.chartByStd.refresh("");
		this.chartPie_chart.setTitle('根据年代统计设备总价值--全校');
		this.chartByStd.setTitle('根据设备用途统计设备总价值(元)--全校');
		this.chartByType.setTitle('根据设备大类统计设备总价值(元)--全校');
		this.chartByDv.show(true);
		this.chartByDv.setTitle('根据部门类别统计设备总价值(元)--全校');
		this.gridPanel.setTitle('查看本年度设备增减情况--全校');
	}
	
});

function selectEqByYear(obj){
	var niandai=obj.selectedChartData['eq.niandai'];
	var res=new Ab.view.Restriction();
	if(niandai=='1950-1970年设备'){
		res.addClause('eq.date_purchased','1950-01-01','&gt;=');
		res.addClause('eq.date_purchased','1970-01-01','&lt;');
	}
	if(niandai=='1970-1990年设备'){
		res.addClause('eq.date_purchased','1970-01-01','&gt;=');
		res.addClause('eq.date_purchased','1990-01-01','&lt;');
	}
	if(niandai=='1990-2010年设备'){
		res.addClause('eq.date_purchased','1990-01-01','&gt;=');
		res.addClause('eq.date_purchased','2010-01-01','&lt;');
	}
	if(niandai=='2010年以后的设备'){
		res.addClause('eq.date_purchased','2010-01-01','&gt;=');
	}
	var eqSumByYearGrid=View.panels.get('eqSumByYearGrid');
	eqSumByYearGrid.show(true);
	
	eqSumByYearGrid.showInWindow({
	        width: 900,
	        height: 700
	});
	eqSumByYearGrid.refresh(res);
	eqSumByYearGrid.setTitle(niandai+'列表');
	
}

function selectEqByStd(obj){
	var type=obj.selectedChartData['eq.type_use'];
	var eqRes=new Ab.view.Restriction();
	var typeInt='';
	if(type=='教学'){
		typeInt='1';
	}
	if(type=='科研'){
		typeInt='2';
	}
	if(type=='行政'){
		typeInt='3';
	}
	if(type=='生活与后勤'){
		typeInt='4';
	}
	if(type=='生产'){
		typeInt='5';
	}
	if(type=='技术开发'){
		typeInt='6';
	}
	if(type=='社会服务'){
		typeInt='7';
	}
	if(type=='其它'){
		typeInt='8';
	}
	eqRes.addClause('eq.type_use',typeInt,'=');
	 var eqSumByYearGrid=View.panels.get('eqSumByYearGrid');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 900,
	        height: 700
	 });
	 eqSumByYearGrid.refresh(eqRes);
	 eqSumByYearGrid.setTitle('使用方向为<'+type+'>的设备列表');
}

function selectEqByType(obj){
	var type=obj.selectedChartData['eq.csi'];
	var csi='';
	if(type=='房屋及建筑物'){
		csi='01';
	}
	if(type=='土地及植物'){
		csi='02';
	}
	if(type=='仪器仪表'){
		csi='03';
	}
	if(type=='机电设备'){
		csi='04';
	}
	if(type=='电子设备'){
		csi='05';
	}
	if(type=='印刷机械'){
		csi='06';
	}
	if(type=='卫生医疗器械'){
		csi='07';
	}
	if(type=='文体设备'){
		csi='08';
	}
	if(type=='标本模型'){
		csi='09';
	}
	if(type=='文物及陈列品'){
		csi='10';
	}
	if(type=='图书'){
		csi='11';
	}
	if(type=='工具、量具和器皿'){
		csi='12';
	}
	if(type=='家具'){
		csi='13';
	}
	if(type=='行政办公设备'){
		csi='14';
	}
	if(type=='被服装具'){
		csi='15';
	}
	if(type=='牲畜'){
		csi='16';
	}
	var typeRes=new Ab.view.Restriction();
	typeRes.addClause('eq.csi_id',csi+'%','LIKE');
	var eqSumByYearGrid=View.panels.get('eqSumByYearGrid');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 900,
	        height: 700
	 });
	 eqSumByYearGrid.refresh(typeRes);
	 eqSumByYearGrid.setTitle('属于16大类中<'+type+'>的设备列表');
}

function selectEqByDvAll(obj){
	var type=obj.selectedChartData['dv.bu_id'];
	var chartSumByDvPanel=View.panels.get('chartSumByDvPanel');
	var eqSumByDvDpIdPanel=View.panels.get('eqSumByDvDpIdPanel');
	chartSumByDvPanel.addParameter('buId',type);
	eqSumByDvDpIdPanel.addParameter('buId',type);
	chartSumByDvPanel.show(true);
	chartSumByDvPanel.showInWindow({
	        width: 800,
	        height: 600
	 });
	chartSumByDvPanel.show(true);
	chartSumByDvPanel.refresh();
	chartSumByDvPanel.setTitle('属于<'+type+'>的单位及其设备总价');
}
//点击单位大类，弹出此大类下所有的单位
function selectEqSumByDv(obj){
	var type=obj.selectedChartData['dv.dvId'];
	var eqRes=new Ab.view.Restriction();
	eqRes.addClause('eq.dv_id',type,'=');
	var eqSumByYearGrid=View.panels.get('eqSumByYearGrid');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 700,
	        height: 500
	 });
	 eqSumByYearGrid.refresh(eqRes);
	 eqSumByYearGrid.setTitle('部门为<'+type+'>的设备列表');
}

//导出根据年代分组统计的报表Grid
function exportEqSumByYear(){
	var eqSumByYearGrid=View.panels.get('eqSumByYearPanel');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 700,
	        height: 500
	 });
	 eqSumByYearGrid.refresh();
}

function exportEqSumByTypeUse(){
	var eqSumByYearGrid=View.panels.get('eqSumByTypeUsePanel');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 700,
	        height: 500
	 });
	 eqSumByYearGrid.refresh();
}

function exportEqSumByCsiTypeUse(){
	var eqSumByYearGrid=View.panels.get('eqSumByCSIPanel');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 700,
	        height: 500
	 });
	 eqSumByYearGrid.refresh();
}

function exportEqSumByBUId(){
	var eqSumByYearGrid=View.panels.get('eqSumByBuIdPanel');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 700,
	        height: 500
	 });
	 eqSumByYearGrid.refresh();
}

function exportEqSumByDVDPId(){
	 var eqSumByYearGrid=View.panels.get('eqSumByDvDpIdPanel');
	 eqSumByYearGrid.show(true);
	 eqSumByYearGrid.showInWindow({
	        width: 700,
	        height: 500
	 });
	 eqSumByYearGrid.refresh();
}