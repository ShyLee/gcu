var controller=View.createController('controller',{
	eqNewsPanel_onDeleteMore:function(){
		var selectedRecord = this.eqNewsPanel.getPrimaryKeysForSelectedRows();
		var message="确定要删除";
		
		
		  if(selectedRecord.length>0){
			  var controller=this;
			  var dsNews = View.dataSources.get("sc_eq_news_ds");
				View.confirm(message,function(button){
					if(button=="yes"){
						for (var i = 0; i < selectedRecord.length; i++) {
							var id=selectedRecord[i]["sc_eq_news.id"];
							
							var record = new Ab.data.Record({
					       		 'sc_eq_news.id': id,
					       	 	}, false);
								
							dsNews.deleteRecord(record);
						}
						controller.eqNewsPanel.refresh();
						controller.editNewsPanel.show(false);
					  View.showMessage("删除成功");
					}else{
						
					}
				});
			  
		  }else{
		   View.showMessage("请选择需要删除的公告");
		   return;
		  }
	},
	
	eqNewsPanel_onShow:function(){		
		var selectedRecord = this.eqNewsPanel.getSelectedRecords();
		var message="确定要发布";
		
		
		  if(selectedRecord.length>0){
			  var controller=this;
				View.confirm(message,function(button){
					if(button=="yes"){
						for (var i = 0; i < selectedRecord.length; i++) {
							var row = selectedRecord[i];   
							var id  = row.values["sc_eq_news.id"];
							var dsNews = View.dataSources.get("sc_eq_news_ds");
							var res=new Ab.view.Restriction();
							res.addClause('sc_eq_news.id',id,'=');
							var record=dsNews.getRecord(res);
							record.setValue("sc_eq_news.status","2");
							dsNews.saveRecord(record);
						}
						controller.eqNewsPanel.refresh();
						controller.editNewsPanel.show(false);
					  View.showMessage("发布成功");
					}else{
						
					}
				});
			  
		  }else{
		   View.showMessage("请选择需要发布的公告");
		   return;
		  }
	},
	editNewsPanel_onDelete:function(){
		var message="确定要删除";
		
		var controller=this;
		View.confirm(message,function(button){
			if(button=="yes"){
				var id=controller.editNewsPanel.getFieldValue("sc_eq_news.id");
				if(!valueExistsNotEmpty(id)){
					View.alert('删除失败');
					return;
				}
				controller.editNewsPanel.deleteRecord();
				controller.eqNewsPanel.refresh();
				controller.editNewsPanel.show(false);
				View.alert('删除成功');
			}else{
				
			}
		});
	},
	editNewsPanel_onSave:function(){
		var user = this.view.user;
		var id = user.employee.id;
		var dsEm = View.dataSources.get("em_ds");
		var res=new Ab.view.Restriction();
		res.addClause('em.em_id',id,'=');
		var record=dsEm.getRecord(res);
		var name = record.getValue("em.name");
		this.editNewsPanel.setFieldValue("sc_eq_news.name",name);

		var success=this.editNewsPanel.canSave();
		  if(success){
		   this.editNewsPanel.save();
		   this.editNewsPanel.show(true);
		   this.eqNewsPanel.refresh();
		}
	}
});


