/**
 * @author HuangMuliang
 */
var ascBjUsmsOverallEmRmByZhicWhole =  View.createController('ascBjUsmsOverallEmRmByZhicWholeController', {
	
	
	zhicId:"",
	
	afterInitialDataFetch:function(){
		this.zhicId = this.view.parameters['zhic_id'];
		var title =String.format(getMessage('secondGridTitle'),this.zhicId );
		this.ascBjUsmsOverallEmRmByZhicWhole_emGrid.setTitle(title);
	},
	
	ascBjUsmsOverallEmRmByZhicWhole_emGrid_afterRefresh:function(){
		var title =String.format(getMessage('secondGridTitle'),this.zhicId );
		this.ascBjUsmsOverallEmRmByZhicWhole_emGrid.setTitle(title);
	}
	
});

