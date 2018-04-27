/**
 * @author cds
 */
var locEmpController = View.createController('locEmp', {

	  afterViewLoad: function (){
		var emId=emId;
		this.emId = this.view.parameters['emId'];
		this.empDetails.addParameter("blRes","em.em_id='"+this.emId+"'");
	  },
      afterInitialDataFetch: function(){
    	  
      },
});