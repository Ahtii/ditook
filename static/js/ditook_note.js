$(document).ready(function(){$('.note_body').contents().find('head').append("<link rel='stylesheet' href='/static/css/ditook_note_body.css'>");var editor=$('.note_body').contents()[0];editor.designMode="on";var title=$('#title').val();var body=$('#body').val();if(title)
$('.note_title').val(title);if(body)
$($(editor)[0].body).append(body);else $(editor.body).append("<p><br></p>");function ribbon_style(ele){if($(ele).hasClass('ribbon_btn_active')){$(ele).removeClass('ribbon_btn_active')}else{$(ele).addClass('ribbon_btn_active')}
$('.note_body')[0].contentWindow.focus()}
$('#bold').on('click',function(e){ribbon_style("#bold");editor.execCommand("Bold",!1,null)});$('#italic').on('click',function(e){ribbon_style("#italic");editor.execCommand("Italic",!1,null)});var g_parent=document.querySelector('.note_body');function set_note_code_style(){editor.execCommand("styleWithCSS",!1,!0);var parent=g_parent.contentDocument.getSelection()
var d_parent=parent.anchorNode;if($(d_parent.parentNode)[0].textContent!="")
editor.execCommand("insertHTML",!1,"<p><br></p>");editor.execCommand("FormatBlock",!1,"p");var p_node=g_parent.contentDocument.getSelection().focusNode;$(p_node).addClass('ditook_note_code');}
function unset_note_code_style(){var parent=g_parent.contentDocument.getSelection().anchorNode.parentNode;if($(parent)[0].localName=="p"){$(parent).after("<p><br></p>");if($(parent)[0].textContent=="")
$(parent).remove()}else if($(parent)[0].localName!="body"){parent=parent.parentNode;$(parent).after("<p><br></p>")}else{var cur_node=$($(parent)[0].childNodes[0]);if($(cur_node)[0].textContent=="")
$(cur_node).remove()}
$(editor).focus()}
$('#code').on('click',function(e){ribbon_style("#code");var edit=editor.queryCommandValue("BackColor");if($('#code').hasClass('ribbon_btn_active'))
set_note_code_style();else unset_note_code_style()});$(editor).on('keydown',function(e){if(e.keyCode===13)
editor.execCommand("defaultParagraphSeparator",!1,"p")})})