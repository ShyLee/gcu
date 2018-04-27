/*
 * controller definition  
 */
var abEqxpolicyController = View.createController('abEqxpolicyController', {
	afterInitialDataFetch: function(){
		var title = View.taskInfo.taskId;
		if(View.title != title){
			View.setTitle(title);
		}
	}
});
