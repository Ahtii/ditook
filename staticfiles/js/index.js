$(document).ready(function(){$(".breadcrumb").html("<li class='active'> Ditook </li>");if(sessionStorage.response){$('#msg').val(sessionStorage.response);$('#msgType').val(sessionStorage.responseType)}
var response=$('#msg').val();if(response){setNotificationBox(response,$('#msgType').val());$('#msg').val('');$('#msgType').val('')}
sessionStorage.clear();if($('#registeruser').val())
$('#signup').trigger('click');$('#registeruser').val(!1);if($('#loginuser').val())
$('#signin').trigger('click');$('#loginuser').val(!1)})