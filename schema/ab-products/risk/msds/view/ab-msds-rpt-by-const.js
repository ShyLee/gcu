/**

* @author xianchao

*/
var abRiskMsdsRptByConController = View.createController('abRiskMsdsRptByConController',
{
	/**
	 * on_click event handler for 'Show' action
	 */
	fieldsArraysForRestriction: new Array(['msds_chemical.chemical_id'], ['msds_chemical.alias','like']
	, ['msds_chemical.tier2'], ['msds_chemical.cas_number']
	, ['msds_chemical.un_number'], ['msds_chemical.ec_number']
	, ['msds_chemical.icsc_number'], ['msds_chemical.rtecs_number']
	, ['msds_data.ghs_id'], ['msds_data.product_name']
	, ['msds_data.chemical_name'], ['msds_data.manufacturer_id']),
	/**
	 * Show grid by console restriction
	 */
	abRiskMsdsRptByConConsole_onShow: function(){
		var res = getRestrictionStrFromConsole(this.abRiskMsdsRptByConConsole, this.fieldsArraysForRestriction);
		var proId=this.abRiskMsdsRptByConConsole.getFieldValue('provider_id');
		if(proId){
			res=res+" and (msds_data.distributor_id='"+proId+"' or  msds_data.manufacturer_id='"+proId+"' or  msds_data.preparer_id='"+proId+"')";
		}
		this.abRiskMsdsRptByConGrid.refresh(res);
		this.abRiskMsdsRptByConGridLoc.show(false);
	}
});
//after click con 
function clickCon(){
	var grid = abRiskMsdsRptByConController.abRiskMsdsRptByConGrid;
	var num = grid.selectedRowIndex;
	var rows = grid.rows;
	var res = '1=1';
	var msdsId = rows[num]['msds_constituent.msds_id'];
	var chemicalId=rows[num]['msds_constituent.chemical_id'];
	var res=new Ab.view.Restriction();
	//res.addClause('msds_location.msds_id', msdsId);
	res.addClause('msds_constituent.chemical_id', chemicalId);
	abRiskMsdsRptByConController.abRiskMsdsRptByConGridLoc.refresh(res);
}