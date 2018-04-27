
////////////////////create drop-down menus//////////////////////////////////

View.createController('dropDownMenu', {

    exFormPanelMenus_projectForm_onShowMenu: function() {
    	var menuItems = [];  
    	var menuItem1 = new Ext.menu.Item({
    		text: 'Sub Menu1',
            handler: this.handler1.createDelegate(this)
        });
    	var menuItem2 = new Ext.menu.Item({
    		text: 'Sub Menu2',
            handler: this.handler2
        });
        menuItems.push({
        	text: 'Menu1', 
        	menu: {items: [menuItem1, menuItem2]}
        });
        menuItems.push({
        	text: 'Menu2', 
	        handler: this.handler1.createDelegate(this)
	    });
     	var menu = new Ext.menu.Menu({items: menuItems});

    	var menuButton = Ext.get('showMenu');
     	menu.show(menuButton, 'tl-bl?');
    },
    
    handler1: function() {		
        View.openDialog("ab-ex-report-grid-baseline.axvw");
    },
    
    handler2: function(){
    	alert("You have clicked on a menu item");
    }
})


////////////////////////////////////////////////////////

