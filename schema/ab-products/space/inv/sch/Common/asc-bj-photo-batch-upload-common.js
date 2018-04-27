/**
 * @author 赵永利
 * 
 *  { 'defaultUploadFolder':defaultUploadFolder,'photoName':'abc'}
 */

jQuery(function(){  
	var defaultUploadFolder="em";
	jQuery("input[name=fileType]:radio").bind("change",function(){
		defaultUploadFolder=jQuery(this).val();
	 });
	
	jQuery("#uploadify").uploadify({ 
        swf: '/archibus/schema/ab-core/libraries/uploadify/uploadify.swf',  
        uploader: '/archibus/PhotoUploadService.do',  
        buttonImg: '/archibus/schema/ab-core/libraries/uploadify/cancel.png',  
        cancelImg: '/archibus/schema/ab-core/libraries/uploadify/cancel.png',  
        auto: true, 
        fileSizeLimit:2048,
        queueID: 'fileQueue',  
        queueSizeLimit: 100,  
        fileTypeDesc: '请上传图片文件格式',  
        fileTypeExts:  '*.gif; *.jpg; *.png;*.bmp',  
        method: 'get',  
        multi: true,  
 //       uploadLimit: 100,  
        buttonText: '选择要上传的图片' ,
       // formData: { 'defaultUploadFolder':defaultUploadFolder},
        onUploadStart: function(file) {
            jQuery("#uploadify").uploadify("settings", 'formData',  { 'defaultUploadFolder':defaultUploadFolder});
        },
        onUploadSuccess : function(file, data, response) {
        	//jQuery('#uploadMessage').text("成功上传图片").fadeTo('slow',0.35).fadeOut(600);       
        	
        },onQueueComplete:function(){
        	//jQuery('#uploadify').uploadify('destroy');
        }
    });  
});  