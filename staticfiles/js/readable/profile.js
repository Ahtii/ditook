
$(document).ready( function () {

	var backdropActive = false;
	var windowWidth = $(window).width();
	$(window).resize( function() { 
		windowWidth = $(window).width();
		setupprofileSideMenu();
		curInput();	
		adjustBio();	
		$(bioInput).css({'background-color':'white'});
		if (backdropActive)
			bioStyle();
	});	
	var menuOpened = false;
	var br_not_set = true;		
	textareaFix = false;
	$('#editProfile').click( function() { 		
		if ($('.notificationBox').is(':visible'))
			$('.notificationBox .close').trigger('click');				    
		setBackdrop();
		$('.sideBarMenu').css('top','95%');
		setStylePro();
		showAlert();
		if (!menuOpened && $(window).outerWidth() < 581)
			$('.profileSideMenuTitle').trigger('click');			
		$('.profileSideMenuTitle').unbind("click");
		backdropActive = true;
		$(this).prop("disabled",true);
		if (textareaFix){
			$('.profileSideMenu .updateForm textarea').css('margin-bottom','-20px');
			textareaFix = false;
		}		
	});

	$('.updateProControls .cancle').click( function(e){
		e.preventDefault();
		$('.sideBarMenu').css('top','');
		removeBackdrop();	
		removeStylePro();
		hideAlert();	
		onClickOfprofileSideMenu();
		if (menuOpened)			
			$('.profileSideMenuTitle').trigger('click');
		backdropActive = false;
		$(this).css('display','');
		$('#editProfile').prop("disabled",false);
		textareaFix = true;
		$('.profileSideMenu .updateForm textarea').css('margin-bottom','');
	});	

	$('.updatePro .close').click( function() { $('.updatePro').css('display','none'); } );
	$('.updateBio .close').click( function() { $('.updateBio').css('display','none'); } );

	onClickOfprofileSideMenu();

	function onClickOfprofileSideMenu () {		
		$('.profileSideMenuTitle').click( function(){
			if (!menuOpened){
				$('.mobileProfileSideMenu').addClass('mobileProfileSideMenu-opened');				
				menuOpened = true;
				setTimeout( function(){
					if (menuOpened){
						$('.profileSideMenuTitle').text(' Menu');
						$('.profileSideMenu a span, .profileSideMenu li strong, .updateForm textarea').css('display','inline-block');
						$('.profileSideMenuTitle, .profileSideMenu li').css({'padding-left':'5px'});
					}									
				}, 190);					
				$(this).removeClass('fa-list');	
				$(this).addClass('fa-times');	
			} else {
				menuOpened = false;
				if (backdropActive)
					$('.updateProControls').css('display','inline-block');
				$('.mobileProfileSideMenu').removeClass('mobileProfileSideMenu-opened');					
				$('.profileSideMenuTitle').text('');
				$('.profileSideMenu a span, .profileSideMenu li strong, .updateForm textarea').css({'display':''});
				$('.profileSideMenuTitle, .profileSideMenu li').css({'padding-left':''});										
				$(this).removeClass('fa-times');	
				$(this).addClass('fa-list');
			} 				
		});
	}
	
	function createNotificationProgressBar(){

			var string = "<div class='progress'> \
							<div id='progressbar' class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%'>  \
							   <span class='sr-only'> 0% </span> \
							</div> \
						 </div>";

			$('.notificationBox span').append(string);	
			$('.notificationBox .progress').css({'margin-top':'10px','margin-bottom':'-5px','height':'10px'});		 			
			$('.notificationBox .progress-bar').css({'position':'relative'});	 			
			$('.notificationBox .progress-bar span').css({'position':'absolute','top':'-5px','font-size':'13px'});	 				
	}
	
	function isSupportedFileForm(value){
		var imgType = value.split('.').pop();
		if (imgType == 'jpeg' || imgType == 'jpg' || imgType == 'png' || imgType == 'tif' || imgType == 'tiff')		
			return true;
		return false;
	}
	var imgChanged = false;
	formdata = new FormData();
	var imgInput = '';
	var bioInput = '';
	curInput();	
	function curInput(){
		if (windowWidth < 581){
			imgInput = '#mobileUploadImg';
		    bioInput = '.profileSideMenu .updateForm textarea';
		}else{
			imgInput = '#uploadImg';
			bioInput = '#bio textarea';
		}
	}
	var onImgInputClick = function(){ $(imgInput).trigger("click"); };
	$(imgInput).on('change', function(e){
		var file = this.files[0];	
		if (isSupportedFileForm(file.name)){
			$('.userDp img').attr('src',URL.createObjectURL(e.target.files[0]));					
			$('.navMenu img').attr('src',URL.createObjectURL(e.target.files[0]));			
			if ($('.update').attr('disabled')){
				$('.update').attr('disabled',false);
				$('.update').css({'background-color':''});
			}
			formdata.append("image", file);							
			createNotificationProgressBar();
			imgChanged = true;
		} else {
			setNotificationBox('Supported file formats are: jpeg / jpg, png and tif / tiff.','fa fa-exclamation-circle');
			if (!$('.update').attr('disabled')){
				$('.update').attr('disabled',true);
				$('.update').css({'background-color':'silver'});
			}			
		}
	});

	function adjustBio(){
		var value = $(bioInput).val().trim();
		var length = value.length;
		if (length > 20)
			$(bioInput).css('min-height','30px');
		else if (length != 0)
			$(bioInput).css('font-size','12px');
		else
			$(bioInput).css('font-size','12px');
	}	
	adjustBio();
	$(bioInput).keyup( function(){		
		adjustBio();
		if ($(this).val() == '')
			$(this).css({'font-size':'8px'});
		else{
			if (windowWidth > 820)
				$(this).css('font-size','13px');
			else
				$(this).css('font-size','11px');
		}
	});

	$('#profileUpdate, #mobileProfileUpdate').on('submit', function(e){
		e.preventDefault();
		var csrfmiddlewaretoken = $('input[name=csrfmiddlewaretoken]').val();
		formdata.append("bio", $(bioInput).val());		
		formdata.append("csrfmiddlewaretoken", csrfmiddlewaretoken);
		if (imgChanged)
			setNotificationBox('Uploading Image...', 'fa fa-upload');				
		$.ajax({
			xhr: function(){
				var xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener('progress', function(e){
					if (e.lengthComputable){
						var per = Math.round((e.loaded/e.total) * 100);
						$('#progressbar').attr('aria-valuenow',per).css('width',per+'%');
						$('#progressbar span').text(per + '%');						
					}	
				});
				return xhr;
			},
			url: '/authenticate/updateProfile/',
			type: "POST",
			data: formdata,			
			processData: false,
			contentType: false,
			success: function(data) {
				$('.progress').remove();
				if (data['response'].substring(0, 3) == 'Pro'){
					$('.cancle').trigger('click');
					$('.profileSideMenuTitle').trigger('click');
				}
				if (windowWidth < 581)
					$('#bio textarea').val($('.profileSideMenu .updateForm textarea').val());
				else
					$('.profileSideMenu .updateForm textarea').val($('#bio textarea').val());						
				setNotificationBox(data['response'], data['responseType']);							
			},
			error: function(xhr){
				setNotificationBox('Oops.. Something went wrong!', 'fa fa-exclamation-circle');
			}
		});		
	});

	function removeBackdrop() {
		$('.selection-section, footer, .navbar-default, .userName, .userArticleShares, .userArticleLikes').css({'filter':''});
		$('body').css({'filter':'','background-color':''});
		$('.userDp img').css({'z-index':'', 'border-color':''});
		$(bioInput).css({'background-color':'', 'padding':'','border':'','border-radius':'','margin-left':''});	
		$(".userInfo, .profileContent, .mobileProfileSideMenu").css({'background-color':''});
	}

	function removeStylePro() {
		$('.userDp img').mouseenter( function() { 
			$(this).css({'transition':'', '-webkit-transition':'', 'background-color':'', 'box-shadow':'', 'transition':'', '-webkit-transition':''}); 
		});
		$('.userDp img').mouseleave( function() { 
			$(this).css({'transition':'', '-webkit-transition':'', 'background-color':'', 'transition':'', '-webkit-transition':''}); 
		});
		$(bioInput).mouseenter( function() { 
			$(this).css({'background-color':'', 'transition':'', '-webkit-transition':'', 'color':'', 'transition':'', '-webkit-transition':''}); 
		});
		$(bioInput).mouseleave( function() { 
			$(this).css({'background-color':'', 'transition':'', '-webkit-transition':'', 'color':'', 'transition':'', '-webkit-transition':''}); 
		});
		$(bioInput).attr('readonly', true);
	}

	function hideAlert() {

		$('.userDp img').unbind("click");
		$('.updatePro').fadeOut(1);
		$('.updateBio').fadeOut(1);		
		$('.updateProControls').fadeOut(1);
	}

	function bioStyle() {		
		
		$('.userDp img').css({
				'z-index':'999999',
				'border-color':'teal'
		});
		$(bioInput).css({
				'background-color':'white',
				'z-index':'999999',
				'padding':'5px',
				'border':'2px solid teal',
				'border-radius':'5px'
		});	

		$(bioInput).mouseenter( function() { 
			$(this).css({
				'background-color':'teal',
				'transition':'background-color 0.5s',
				'-webkit-transition':'background-color 0.5s',
				'color':'white',
				'transition':'color 0.5s',
				'-webkit-transition':'color 0.5s',
				'box-shadow': '0px 0px 15px white',
				'transition':'box-shadow 0.5s',
				'-webkit-transition':'box-shadow 0.5s',
			}); 
		});
		$(bioInput).mouseleave( function() { 
			$(this).css({
				'background-color':'white',
				'transition':'background-color 0.5s',
				'-webkit-transition':'background-color 0.5s',
				'color':'rgb(92, 102, 122)',
				'transition':'color 0.5s',
				'-webkit-transition':'color 0.5s',
				'box-shadow': ''
			}); 
		});
		$(bioInput).attr('readonly', false);
	}

	function setBackdrop() {

		$('.selection-section, footer, .navbar-default, .userName, .userArticleShares, .userArticleLikes').css({'filter':'brightness(40%)'});		
		$(".userInfo, .profileContent, .mobileProfileSideMenu").css({'background-color':'gray'});
		if (windowWidth > 580)
			$("#bio textarea").css({'margin-left':'-10px'});
		$(bioInput).css({'background-color':'white'});		
		$('body').css({'background-color':'gray'});				
		$('*:disabled');
		bioStyle();		
	}	

	function setStylePro() {

		$('.userDp img').mouseenter( function() { 
			$(this).css({				
				'box-shadow': '0px 0px 20px white',
				'transition':'box-shadow 0.5s',
				'-webkit-transition':'box-shadow 0.5s',

			}); 
		});
		$('.userDp img').mouseleave( function() { 
			$(this).css({		
				'box-shadow':''
			}); 
		});		
	}

	function showAlert(){
		$('.userDp img').bind("click", onImgInputClick);
		$('.updatePro').fadeIn();
		$('.updateBio').fadeIn(1200);		
		$('.updateProControls').fadeIn(1500);
	}

	$('#become_fan').on('submit', function(e){
		e.preventDefault();	
		$.ajax({
			type: 'POST',
			url: '/add_fan/',
			data: { csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val() },
			dataType: 'json',
			success: function(data){
				if (data['response']){
					var fans = parseInt($('.fans div:last-child').text());
					if (data['fan']){
						fans = fans + 1;						
						$('.fan_parent button').css('color','gray');
					}else{
						if (fans)
							fans = fans - 1;						
						$('.fan_parent button').css('color','');
					}
					$('.fans div:last-child').text(fans);
				} else	
					setNotificationBox("Something went wrong.", "fa fa-exclamation-circle");				
			},
			error: function(xhr){
				setNotificationBox("Something went wrong.", "fa fa-exclamation-circle");
			}
		});
	});
});