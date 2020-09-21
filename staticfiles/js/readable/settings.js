
$(document).ready( function(){	
	var menuOpened = false;
	var windowWidth = $(window).width();
	var settingsTabClicked = false;
	$(window).resize( function() { 
		windowWidth = $(window).width(); 
		setupSettingsMenu(); 
		if ($('.settingsMenu').is(':visible')){	
			$(curSelectedTab+' > *').css('color','teal');
			$('.settingsMenu a:not('+curSelectedTab+') > *').css('color','');		
		} else {
			$(curSelectedTab).css('color','teal');								
			$('.tabs a:not('+curSelectedTab+'), .tabs a >:not('+curSelectedTab+')').css('color','');								
		}	
	});	
	settingsTabOnHover();
	settingsTabOnClick();
	setupSettingsMenu();
	function setupSettingsMenu() {
		if ( $(window).outerWidth() < 481 ){
			$('.settingsArea').removeClass('container-fluid');
			$('.settingsContent').removeClass('row');
			$('.tabDetails').removeClass('col-xs-6 col-xs-pull-1 col-sm-7 col-sm-pull-2');
			if ($('.tabDetails').css('margin-top') == '0px')
				$('.tabDetails').css('margin-top','-140px');
			else if (menuOpened)			
				$('.tabDetails').css('margin-top','-150px');
		}else{
			if (!$('.settingsArea').hasClass('container-fluid'))
				$('.settingsArea').addClass('container-fluid');
			if (!$('.settingsContent').hasClass('row'))
				$('.settingsContent').addClass('row');
			if (!$('.tabDetails').hasClass('col-xs-6 col-xs-pull-1 col-sm-7 col-sm-pull-2'))
				$('.tabDetails').addClass('col-xs-6 col-xs-pull-1 col-sm-7 col-sm-pull-2');
			$('.tabDetails').css('margin-top','0px');
		}
	}

	$('.tabBody strong a').hover( function(){
		var $this = '#'+$(this).parent().attr('id');
		var newFontSize = $($this+' i, '+$this+' span').css('font-size').replace('px','');
		newFontSize = parseInt(newFontSize);
		newFontSize += 0.2;
		$($this+' i, '+$this+' span').css({'font-size':newFontSize+'px','transition':'font-size 0.1s','-webkit-transition':'font-size 0.1s'});
	}, function(){
		var $this = '#'+$(this).parent().attr('id');
		$($this+' i, '+$this+' span').css({'font-size':''});
	});	
	var username = $('#accountUsername input').attr('value');
	var password = '*********';
	var email = $('#accountEmail input').attr('value');
	var status = $('#accountDeactivate strong').text();
	var timezone = $('#supportedTimezones option:selected').val();
	$('.tabBody strong a').click( function(e){
		e.preventDefault();
		var $this = '#'+$(this).parent().attr('id');
		if ($(this).children().hasClass('fa-edit')){
			if ($($this+' input').attr('readonly')){
				$($this+' input').attr('readonly',false);
				$($this+' input').css({'border-radius':'5px','box-shadow':'0px 0px 5px silver'});				
				$($this+' a span').text('X');
			} else {
				$($this+' input').attr('readonly',true);
				$($this+' input').css({'border-radius':'','box-shadow':''});
				if ($this == '#accountUsername')
					$($this+' input').val(username);	
				else if ($this == '#accountEmail')
					$($this+' input').val(email);
				else if ($this == '#accountPassword')
					$($this+' input').val(password);	
				$($this+' a span').text('Edit');												
			}				
		} else {
			var icon = $this+' a i';
			var text = $this+' a span';
			var controlStatus = false;
			if ($(icon).hasClass('fa-toggle-off')){				
				$(icon).removeClass('fa-toggle-off');
				$(icon).addClass('fa-toggle-on');
				$(text).text('On');
				controlStatus = true;
			} else {
				$(icon).removeClass('fa-toggle-on');
				$(icon).addClass('fa-toggle-off');
				$(text).text('Off');
			}							
		}	
		if ($this == '#accountDeactivate'){
			if (controlStatus)
				status = 'Deactivate';				
			else
				status = 'Active';
			$($this+' strong').text(status);
			if (status == 'Deactivate'){								
				$.get('/authenticate/deactivateUser/', function(data){
					if (data['redirectTo']){	
						sessionStorage.setItem("responseType",data['responseType']);
						sessionStorage.setItem("response",data['response']);
						window.location.replace(data['redirectTo']);						
					}else
						setNotificationBox(data['response'], data['responseType']);
				});				
			}
		} else if ($this == '#emailOption'||$this == '#articleOption'){
			if (controlStatus)
				$($this+' strong').text('Only me');
			else
				$($this+' strong').text('Everyone');
		}				
	});
	var newUsername = '';
	var newEmail = '';
	var newPassword = '';
	function isValidForm(formId){
		if (formId == '#accountSettingsForm'){
			var valChanged = false;
			newUsername = $('#accountUsername input').val();
			newEmail = $('#accountEmail input').val();
			newPassword = $('#accountPassword input').val();
			newTimezone = $('#supportedTimezones option:selected').val();
			if (newUsername != username)		
				if (!validateFunc['isValidUsername'](newUsername))
					return 'Username must be atleast 3 chars (Max 15), must start with letter, followed by letter, digit or underscore.';				
				else if (!valChanged)
					valChanged = true;
			if (newEmail != email)	
				if (!validateFunc['isValidEmail'](newEmail))
					return "Invalid Email format.";
				else if (!valChanged)
					valChanged = true;
			if (newPassword != password)	
				if (!validateFunc['isValidPassword'](newPassword))
					return "Password must be atleast 8 chars, atleast 1 letter & must not be part of email.";					
				else if (!valChanged)
					valChanged = true;
			if (newTimezone != timezone){
				timezone = newTimezone;
				valChanged = true;		
			}			
			return valChanged;
		}		
	}

	$('#accountSettingsForm').on('submit', function(e){
		e.preventDefault();	
		var formId = '#'+$(this).attr('id');		
		var res = isValidForm(formId);
		$('.errMsg strong').text('');	
		if (res)
			if (typeof res === 'string')
				$('.errMsg strong').text(res);	
			else{
				initNotificationBox("Upading Profile...");
				$.ajax({
					type: 'POST',
					url: '/authenticate/updateUser/',
					data: { 
						'username': newUsername, 
						'email': newEmail, 
						'password': newPassword, 
						'status': status,
						'timezone': timezone, 
						csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val() 
					},
					dataType: 'json',
					success: function(data) {						
						setNotificationBox(data['response'], data['responseType']);	
						if (data['responseType'] == 'fa fa-check'){
							if (data['username'])
								username = data['username'];
							if (data['email'])
								email = data['email'];
						}					
						if (data['redirectTo'])
							window.location.replace(data['redirectTo']);
					},
					error: function(xhr){ setNotificationBox("Oops! Something went wrong.", 'fa fa-exclamation-circle'); }
				});	
			}											
	});
	$('#privacySettingsForm').on('submit', function(e){
		e.preventDefault();
		
	});
	$('#notificationSettingsForm').on('submit', function(e){
		e.preventDefault();
		
	});

	var tabStyleOnHover = {
		set : function (target) {
			$(target).css({
				'color':'rgb(180, 180, 180)',
				'transition':'color 0.3s',
				'-webkit-transition':'color 0.3s'			
			});
		}
	}
	var curSelectedTab = '#settingsAccount';
	var prevSelectedTab = '#settingsAccount';
	function settingsTabOnClick() {
		$('.tabs #settingsAccount, .settingsMenu #settingsAccount > * ').css('color','teal');
		$('.tabs a, .settingsMenu a').on('click', function(e){
			e.preventDefault();
			settingsTabClicked = true;
			curSelectedTab = '#'+$(this).attr('id');			
			if ($('.settingsMenu').is(':visible'))
				if (!menuOpened && prevSelectedTab != curSelectedTab){
					$('.settingsMenu '+prevSelectedTab+' > * ').css('color','');		
					$('.settingsMenu '+curSelectedTab+' > * ').css('color','teal');						
				}					
            var curSelectedTabDetails = curSelectedTab.replace('settings','').toLowerCase()+'Details';
            var prevSelectedTabDetails = prevSelectedTab.replace('settings','').toLowerCase()+'Details';
            if (!$(curSelectedTabDetails).is(':visible')){				
				$(prevSelectedTabDetails).css({'display':'none','transition':'display 2s','-webkit-transition':'display 2s'});
				$(curSelectedTabDetails).css({'display':'block','transition':'display 2s','-webkit-transition':'display 2s'});
            }
            prevSelectedTab = curSelectedTab;	
		});

		$('.settingsMenuTitle').click( function(){		
			if (!menuOpened){
				$('.mobileTabs').css({
					'padding-top':'10px',
					'width':'150px',
					'height':'150px',
					'transition':'width 0.3s',
					'-webkit-transition':'width 0.3s'
				});
				menuOpened = true;				
				setTimeout( function(){
					if (menuOpened){
						$('.settingsMenuTitle').text(' Menu');
						$('.settingsMenu a span').css('display','inline');
						$('.settingsMenuTitle, .settingsMenu a').css('margin-left','5px');															
					}									
				}, 120);				
				$('.tabDetails').css('margin-top','-150px');
				$(this).removeClass('fa-list');	
				$(this).addClass('fa-times');	
			} else {
				menuOpened = false;
				$('.mobileTabs').css({'width':'', 'padding-top':'', 'height':''});
				$('.settingsMenuTitle').text('');
				$('.settingsMenu a span').css({'display':''});
				$('.settingsMenuTitle, .settingsMenu a').css({'margin-left':''});
				$('.tabDetails').css('margin-top','-140px');
				$(this).removeClass('fa-times');	
				$(this).addClass('fa-list');
			} 			
		});
	}

	function settingsTabOnHover() {
		
		$('.tabs a, .settingsMenu a').mouseenter( function(){
			var currentTab = $(this).attr('id');
			if ($('.settingsMenu').is(':visible')){
				if (menuOpened){					
					$('.settingsMenu '+'#'+currentTab+' > *').css('color','teal');
					$('.settingsMenu '+'#'+currentTab).css({
						'border':'2px solid rgb(200,200,200)',
						'box-shadow':'0px 0px 5px silver',
						'border-radius':'10px',
						'padding':'2px',
						'padding-left':'10px',
						'padding-right':'10px',
						'transition':'padding 0.1s',
						'-webkit-transition':'padding 0.1s'
					});	
					tabStyleOnHover['set'](".settingsMenu a > *:not(.settingsMenu "+"#"+currentTab+" > *)");
				}	
			} else {
				$('#'+currentTab).css('color','teal');			
				tabStyleOnHover['set'](".tabs a:not(.tabs "+"#"+currentTab+")");
			}			
		});

		$('.tabs a, .settingsMenu a').mouseleave( function(){
			var currentTab = $(this).attr('id');
			settingsTabClicked = false;
			if ($('.settingsMenu').is(':visible')){
				if (menuOpened){						
					$(curSelectedTab+' > *').css('color','teal');
					$('.settingsMenu a:not('+curSelectedTab+') > *').css('color','');								
					$('.settingsMenu #'+currentTab).css({'padding-left':'','box-shadow':'','padding-right':'','border':'','border-radius':'','padding':''});												
				}
			} else {
				$(curSelectedTab).css('color','teal');								
				$('.tabs a:not('+curSelectedTab+')').css('color','');		
			}
		});		
	}	
});