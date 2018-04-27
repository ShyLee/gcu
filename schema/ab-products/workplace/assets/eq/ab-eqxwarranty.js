/*
 * controller definition  
 */
var abEqxwarrantyController = View.createController('abEqxwarrantyController', {
	afterInitialDataFetch: function(){
		var title = View.taskInfo.taskId;
		if(View.title != title){
			View.setTitle(title);
		}
	}
});
