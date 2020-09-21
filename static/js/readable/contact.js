
	$(document).ready(function () {						

		$(".breadcrumb").html("<li> <a class='breadcrumb-item' href='/'> Ditook </a></li> \
			<li> <a class='breadcrumb-item' href='/articles/'>  Article </a></li>\
			<li class='active'> Contact </li>");
		var maxChars = 830;
		var leftChars = maxChars;

		$('#contactForm').submit( function(e) {
			    e.preventDefault();
				if (validateContactForm()){	
					initNotificationBox('Sending your message.');				
					$.ajax({
							type: 'POST',
							url: '/contact/send_concern/',
							data: {
								'name': $('#inputContactName').val(),
								'email': $('#inputContactEmail').val(),
								'subject': $('#inputContactSub').val(),
								'message': $('#inputContactMsg').val(),
								csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
							},
							dataType: 'json',
							success: function(data){
								setNotificationBox(data['responseMsg'], data['responseType']);
								$(' #inputContactName, #inputContactSub, #inputContactEmail, #inputContactMsg').val('');								
								/*$('#inputContactMsg').trigger('keyup');*/
								styleSendButton();
							},
							error: function(data){
								setNotificationBox('Oops! Something went wrong.', 'fa fa-exclamation-circle');
							}
					});	
				}	
			 
		});

		function validateContactForm(){
                                              
				if (!isValidEmailFormat($('#inputContactEmail').val())){
					$('#showContactErrMsg').text('Invalid email format.');					
				}
				else if ($('#inputContactName').val() == '' || $('#inputContactSub').val() == '' || $('#inputContactMsg').val() == '')
					$('#showContactErrMsg').text('Please fill all the fields.');
				else
					return true;
				return false;	
		}

		function styleSendButton(){
				if (isValidEmailFormat($('#inputContactEmail').val()) && $('#inputContactName').val() != '' && $('#inputContactSub').val() != '' 
					&& $('#inputContactMsg').val() != '')
					$('.form-box button').css({'color': 'teal'});
				else if($('.form-box button').css('color') == 'rgb(0, 128, 128)')
					$('.form-box button').css({'color':'gray'});			

		}

		function isValidEmailFormat(email){

				var pattern = new RegExp(/^[\w.%+-]+@[a-z0-9]+\.[a-z]{2,}$/i);
				return pattern.test(email);
		}

		$('#inputContactName, #inputContactEmail, #inputContactSub, #inputContactMsg').change( function() {  
				$('#showContactErrMsg').text('');
				styleSendButton();
		});	

		$('.messageBox').focusin( function() { $(this).css({

				'border-color': '#66afe9', 
    			'outline': '0',
    			'-webkit-box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6)',
    			'box-shadow': 'inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6)'
    		}); 
	    });

		$('.messageBox').focusout( function() { $(this).css({
				
				'border':'1px solid silver',
				'-webkit-box-shadow': '',
    			'box-shadow': ''
			}); 
		} );	

		/*$('#inputContactMsg').keyup( function(e) {				
				leftChars = maxChars - this.value.length;
				if (leftChars <= 60)
					$('#showLeftChars').css({'color': 'orange'});
				else 
					$('#showLeftChars').css({'color': 'green'});
				$('#showLeftChars').text(leftChars);			
		});*/
	});		



