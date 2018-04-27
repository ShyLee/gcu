
 View.createController('exGroupByStatus', {
 	afterViewLoad: function() {
 		// override default createRestrictionForLevel() method of this tree control
 		// do it in afterViewLoad() to make sure the overridden method is used in tree control's initial data fetch
 		// the returned restriction will be used by the tree control as is, without any modifications
 		// if the method returns null, the tree control will use its default restriction
 		this.statusTree.createRestrictionForLevel = function(parentNode, level) {
 			var restriction = null;
 			
 			// in this example we want to override only restriction applied from the 1st to the 2nd level
 			// level 0 is the root node (invisible)
 			if (level == 1) {
 				var status = parentNode.data['wr.status.raw'];
 				restriction = new Ab.view.Restriction();
 				restriction.addClause('wr.status', status, '=');
 			}
 			
 			return restriction;
 		}
 	}
});