var controller = View.createController('controller', {
	
	
	afterViewLoad:function(){
		var role = View.user.role;
			//房产管理员
			if(role=="UNV RM ADMIN"){
				$('test1').hidden=false;
				$('test2').hidden=false;
			}else
			//二级单位
		 	if(role=="UNV DV ADMIN"||role=="UNV DV LAB ADMIN"||role=="UNV DV OWN ADMIN"){
		 		$('test2').hidden=false;
			}else
			//设备管理员
			if(role=="UNV EQ ADMIN"||role=="UNV HEAD"){
				$('test3').hidden=false;
				$('test4').hidden=false;
			}else
			//二级单位
			if(role=="UNV DV EQ ADMIN"||role=="UNV DV EQ ELE ADMIN"||role=="UNV DV EQ MOWN ADMIN"||role=="UNV DV EQ OWN ADMIN"||role=="UNV DV EQ STU ADMIN"){
				$('test4').hidden=false;
			}else
			//宿舍管理员
			if(role=="UNV STU ADMIN"){
				$('test5').hidden=false;
				$('test6').hidden=false;
			}else
			//二级单位
			if(role=="UNV DV STU ADMIN"){
				$('test6').hidden=false;
			}else 
			//实验管理员
			if(role=="UNV LAB ADMIN"){
//				$('test11').hidden=false;
				var tr1 = document.getElementById("test11");  
			    tr1.style.display = 'block';  
			}
	},
	
	afterInitialDataFetch: function() {	
		
		$('1').value="下载";
		$('2').value="下载";
		$('3').value="下载";
		$('4').value="下载";
		$('5').value="下载";
		$('6').value="下载";
		$('7').value="下载";
		$('8').value="下载";
		$('9').value="下载";
		$('10').value="下载";
		$('11').value="下载";
	},
	downLoad1: function(){
		var src=View.project.projectGraphicsFolder + '/document/华南理工大学广州学院-房产管理操作手册.doc';
		window.open(src);
	},
	downLoad2: function(){
		var src=View.project.projectGraphicsFolder + '/document/华南理工大学广州学院-二级单位房产管理操作手册.doc';
		window.open(src);
	},
	downLoad3: function(){
		var src=View.project.projectGraphicsFolder + '/document/华南理工大学广州学院-设备管理操作手册.doc';
		window.open(src);
	},

	downLoad4: function(){
		var src=View.project.projectGraphicsFolder + '/document/华南理工大学广州学院-二级单位设备管理操作手册.doc';
		window.open(src);
	},
	downLoad5: function(){
		var src=View.project.projectGraphicsFolder + '/document/华南理工大学广州学院-宿舍管理操作手册.doc';
		window.open(src);
	},
	downLoad6: function(){
		var src=View.project.projectGraphicsFolder + '/document/华南理工大学广州学院-二级单位宿舍管理操作手册.doc';
		window.open(src);
	},
	downLoad7: function(){
		var src=View.project.projectGraphicsFolder + '/document/常见问题处理手册.doc';
		window.open(src);
	},
	downLoad8: function(){
		var src=View.project.projectGraphicsFolder + '/document/IE8-WindowsXP-x86.exe';
		window.open(src);
	},
	downLoad9: function(){
		var src=View.project.projectGraphicsFolder + '/document/Firefox.exe';
		window.open(src);
	},
	downLoad10: function(){
		var src=View.project.projectGraphicsFolder + '/document/adobe-flash.exe';
		window.open(src);
	},
	downLoad11: function(){
		var src=View.project.projectGraphicsFolder + '/document/华南理工大学广州学院-实验室管理操作手册.doc';
		window.open(src);
	}
	
});

