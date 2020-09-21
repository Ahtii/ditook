(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1";
    fjs.parentNode.insertBefore(js, fjs)
}(document, 'script', 'facebook-jssdk'));
$(document).ready(function() {   
    function article_box_not_empty(){
        if (tinymce.get("articleBody").getContent()){
            $(window).on('beforeunload', function(){
                setTimeout(function(){
                    setTimeout(function(){
                        
                    }, 1000);
                }, 1);
                return "Are you sure ?";
            });
        }else
            $(window).off('beforeunload');        
    }    
    var target_comment_id = $('#target_comment').val();
    var target_article_id = $('#target_article').val();
    if (target_comment_id || target_article_id) set_unset_notification_target(target_comment_id, target_article_id);
    $(".breadcrumb").html("<li> <a class='breadcrumb-item' href='/'> Ditook </a></li> \
            <li class='active'> Article </li>");    

    function isValidArticleForm() {
        if ($('.category-menu option:selected').val() && $('#articleTitle').val() && tinymce.get("articleBody").getContent())
            return !0;
        return !1
    }
    $('.category-menu, #articleTitle, #articleBody').change(function() {
        $('#articleErrMsg').text('')
    });

    function cancle_comment_event(selector, comment, comment_date, parent){
        $('.commentStyle').on('click', '.comment-cancle', {'selector':selector,'comment':comment,'comment_date':comment_date,'parent':parent},function(e, obj){
            var data = e.data;
            if (obj){
                data = obj;
                $(data.parent).append(data.comment_date);                   
            } else 
                $(data.parent).append(data.comment_date);   
            $(data.selector).val(data.comment);
            $(data.parent).children('.comment-edit-post').remove();
            $(data.selector).prop("readonly", true);            
            $(this).children('i').removeClass('fa fa-times');
            $(this).children('i').addClass('fa fa-edit');
            $(this).addClass('comment-edit');
            $(this).removeClass('comment-cancle');
        });
    }   

    function comment_edit_post_event(){
        $('.commentStyle').on('click', '.comment-edit-post', function(e){
            e.preventDefault();     
            var parent = $(this).closest('.commentSection');    
            var comment = $(parent).find('textarea').val();
            var comment_id = $(parent).siblings('#comment_id').val(); 
            var article_id = $("#article_id").val(); 
            var parent = $(this).parent();
            var self = this;
            if (comment){
                data = {'comment':comment, 'comment_id':comment_id, 'article_id':article_id, 'csrfmiddlewaretoken':$('input[name=csrfmiddlewaretoken]').val()}
                $.post('/articles/comment_edit_post/',data).done(function(data){
                    if (!data.response){
                        var parent = $(self).closest('.commentStyle');
                        var prev_comment = $(parent).prev();                        
                        $(parent).remove();
                        $(prev_comment).after(data);
                        comment_edit_event();   
                        comment_del_event();                                                
                    }
                });
            }   
        });
    } 

    function comment_edit_event(){
        $('.commentStyle').on('click','.comment-edit', function(){            
            var selector = $(this).siblings('.comment-box').children('textarea');
            $(selector).prop("readonly", false);
            var post = "<button type='submit' class='btn btn-primary comment-edit-post'> Post </button>";
            var old_comment = $(selector).val();
            var parent = $(this).siblings('.comment-footer').children('.comment-date');
            var old_comment_date = $(parent).children('.comment-footer-text');
            old_comment_date.remove();      
            $(parent).append(post);
            $(this).children('i').removeClass('fa fa-edit');
            $(this).children('i').addClass('fa fa-times');
            $(this).addClass('comment-cancle');
            $(this).removeClass('comment-edit');
            cancle_comment_event(selector, old_comment, old_comment_date, parent);
            comment_edit_post_event();
        });
    }    

    function comment_del_event(){
        $('.commentStyle').on('click','.comment-del', function(){
            var comment_id = $(this).parent().siblings('#comment_id').val();
            if (comment_id){
                data = {'comment_id':comment_id,'article_id':$('#article_id').val(),'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()}
                $.post('/articles/del_comment/',data).done(function(data){
                    if (data.response){
                        var noOfComments = parseInt($('.comment b').text());
                        $.each(data.replies, function(){
                            var selector = $('.commentStyle').find("input[value="+this+"]").parent();                   
                            $(selector).remove();
                            var notification = $('.inbox').find("#comment_id[value="+this+"]").parent();                        
                            update_notification_panel(notification);                                        
                            noOfComments--;
                        });
                        var selector = $(".commentStyle").find("input[value="+comment_id+"]").parent();                                     
                        $(selector).remove();   
                        $('.comment b').text(noOfComments - 1);                     
                    }
                });
            }
        });
    }
    
    comment_edit_event();   
    comment_del_event();    

    function createNotificationProgressBar() {
        var string = "<div class='progress'> \
                            <div id='progressbar' class='progress-bar' role='progressbar' aria-valuenow='0' aria-valuemin='0' aria-valuemax='100' style='width: 0%'>  \
                               <span class='sr-only'> 0% </span> \
                            </div> \
                         </div>";
        $('.notificationBox span').append(string);
        $('.notificationBox .progress').css({
            'margin-top': '10px',
            'margin-bottom': '-5px',
            'height': '10px'
        });
        $('.notificationBox .progress-bar').css({
            'position': 'relative'
        });
        $('.notificationBox .progress-bar span').css({
            'position': 'absolute',
            'top': '-5px',
            'font-size': '13px'
        })
    }
    var formdata = new FormData();
    var images = [];
    formdata.append('csrfmiddlewaretoken', $('input[name=csrfmiddlewaretoken]').val())
    var index = 0;

    function adjust_warning_box() {
        var position = $('.article_update').position();
        var top = position.top - 90;
        var left = position.left - 100;
        $('.warning_box').css({
            'top': top,
            'left': left
        })
    }

    function adjust_code_output_box() {
        var top = $('#mceu_13').position().top + 150;
        $('.code_output_box').css({
            'top': top,
            'left': '5px'
        })
    }
    $(window).resize(function() {
        if ($('.article_update').length) adjust_warning_box();
        if ($('#mceu_13').length) adjust_code_output_box()
    });
    var update_article = !1;
    function del_images_if_any(body){
        $.each(images, function(index, value){
            var result = body.indexOf(value.name);
            if (result == -1)
                images.splice(index, 1);
        });
    }
    function sequence_images(body){
        var length = images.length;
        var start = 0;
        for (var g_index = 0; g_index < length; g_index++){
            start = body.indexOf("alt=\"", start) + 5;
            var end = body.indexOf("\"", start);
            var filename = body.substring(start, end);                                
            $.each(images, function(index, value){
                if (value.name == filename){
                    if (g_index != index){
                        var file = images[g_index];
                        images[g_index] = value;
                        images[index] = file;
                    }          
                    return false;
                }
            });
        }
    }
    $('#articleForm').on('submit', function(e) {
        e.preventDefault();
        $('#articleErrMsg').text('');
        var res = isValidArticleForm();
        if (res) {
            createNotificationProgressBar();
            var title = $('#articleTitle').val(),
                body = tinymce.get("articleBody").getContent(),
                category = $('.category-menu option:selected').val();
            del_images_if_any(body);                     
            sequence_images(body); 
            $.each(images, function(index, value){
                formdata.append(index, value);
            });           
            body = body.replace(/<pre/g, "<pre class='format_code_tg'");            
            formdata.append('title', title);
            formdata.append('body', body);
            formdata.append('category', category);
            formdata.append('update_article', update_article);
            $.ajax({
                xhr: function() {
                    var xhr = new window.XMLHttpRequest();
                    xhr.upload.addEventListener('progress', function(e) {
                        if (e.lengthComputable) {
                            var per = Math.round((e.loaded / e.total) * 100);
                            $('#progressbar').attr('aria-valuenow', per).css('width', per + '%');
                            $('#progressbar span').text(per + '%')
                        }
                    });
                    return xhr
                },
                type: 'POST',
                url: '/articles/postArticle/',
                data: formdata,
                processData: !1,
                contentType: !1,
                success: function(data) {
                    update_article = !1;
                    $('.progress').remove();
                    setNotificationBox(data.response, data.responseType);
                    if (data.responseType == 'fa fa-check')
                        $('#articleTitle, #articleBody').val('')
                },
                error: function() {
                    setNotificationBox("Ops something went wrong.", "fa fa-exclamation-circle")
                }
            })
        } else $('#articleErrMsg').text("All fields are required.")
    });

    $('.article_update').on('click', function(e) {
        e.preventDefault();
        $('.article_control').prepend("<i id='edit_busy' class='fa fa-spinner fa-spin'></i>");
        var id = $('#article_id').val();
        $.ajax({
            type: 'GET',
            url: '/articles/get_article/' + id,
            success: function(data) {
                var response = data.article;
                if (response) {
                    var obj = JSON.parse(response);
                    var category = obj[0].fields.category.replace(' ', '_');
                    $('.category-menu #' + category).attr('selected', !0);
                    $('#articleTitle').val(obj[0].fields.title);
                    tinymce.activeEditor.setContent(obj[0].fields.body);
                    $([document.documentElement, document.body]).animate({
                        scrollTop: $("#articleBody").offset().top + 620
                    }, 150);
                    tinymce.execCommand('mcefocus', !1, 'articleBody');
                    update_article = !0
                } else setNotificationBox("Sorry! cannot get the article. It maybe deleted.!", "fa fa-exclamation-circle")                
            },
            error: function() {
                setNotificationBox("Ops something went wrong.", "fa fa-exclamation-circle")
            },
            complete: function(){
                $('#edit_busy').remove();
            }
        })
    });

    function warning_box_events() {
        $('#warning_box_No').on('click', function(e) {
            e.preventDefault();
            $('.warning_box').hide(80)
        });
        $('#warning_box_Yes').on('click', function(e) {
            e.preventDefault();
            var id = $('#article_id').val();
            $('.warning_box').hide(80);
            initNotificationBox('Deleting article...!');
            $.ajax({
                type: 'POST',
                url: '/articles/del_article/' + id,
                data: {
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function(data) {
                    if (data.response) {
                        sessionStorage.setItem('response', data.response);
                        sessionStorage.setItem('responseType', data.responseType);
                        window.location.href = '/'
                    } else setNotificationBox('Sorry! Could not delete the article.', 'fa fa-exclamation-circle')
                },
                error: function() {
                    setNotificationBox("Ops something went wrong.", "fa fa-exclamation-circle")
                }
            })
        })
    }
    var hide_code_output_box = !1;

    function code_output_box_events() {
        $('#code_output_box_ok').on('click', function(e) {
            e.preventDefault();
            $('.code_output_box').hide(80);
            $('.mce-toolbar-grp .mce-btn.mce-last button').css({
                'border-radius': '',
                'border': ''
            });
        });
        $('#code_output_box_dsa').on('click', function(e) {
            e.preventDefault();
            hide_code_output_box = !0;
            $('.code_output_box').hide(80);
            $('.mce-toolbar-grp .mce-btn.mce-last button').css({
                'border-radius': '',
                'border': ''
            });
        })
    }
    $('.article_delete').on('click', function(e) {
        e.preventDefault();
        if (!$('.article_details .warning_box').length) {
            var warning_box = "<div class='alert alert-info warning_box'> \
                                    <div class='warning_box_pointer'></div>\
                                    <p> Are you sure ? </p> \
                                    <hr class='warning_box_hr'>\
                                    <button class='btn' id='warning_box_No'>No</button> \
                                    <button class='btn' id='warning_box_Yes'>Yes</button> \
                               </div>";
            $('.article_details').append(warning_box);
            adjust_warning_box();
            warning_box_events()
        }
        if (!$('.warning_box').is(":visible"))
            $('.warning_box').show(80)
    });
    var selected_file = '';

    function show_img(filename, file) {
        tinymce.activeEditor.execCommand('insertHtml', !1, "<p><img width='60%' height='60%' class='ditook_article_img' alt='" + filename + "' src='" + file + "'></p>")
    }

    function article_img_form_event(){        
        $('#article_img_uploader').on('change', function(e){
            e.preventDefault();
            var file = e.target.files[0];
            var overwrite = false;    
            if (selected_file != ''){                
                $.each(images, function(index, value){
                    if (selected_file == value.name){
                        overwrite = true;
                        images[index] = file;
                    }
                });
                if (!overwrite)
                    images[index++] = file;    
                selected_file = ''; 
            } else
                images[index++] = file;                                  
            show_img(file.name, URL.createObjectURL(e.target.files[0]));                
        });
    }  
    article_img_form_event();
    function insertCode(body, ele, edit, start_end="</div>"){
        body = body.split('\n');
        var len = body.length;
        for (i = 0; i < len; i++) {
            body[i] = "<p>" + body[i] + "</p>";
            ele += body[i]
        }
        ele += start_end;
        edit.execCommand('mceInsertContent', !1, ele);                                                    
    }  
    function unstrip_tags(body){
        var unstriped_body = "";
        var start = 0;
        body = body.split("</p>");        
        var len = body.length - 1;    
        for (i=0;i<len;i++){
            if (unstriped_body)
                unstriped_body += '\n';
            body[i] = body[i].replace("<p>","") ;
            unstriped_body += body[i];            
        }
        return unstriped_body;
    }
    tinymce.init({
        selector: "#articleBody",
        theme: 'modern',
        content_css: '/static/css/article.css',
        editor_css: '/static/css/article.css',
        paste_retain_style_properties: 'all',
        branding: !1,
        menubar: false,
        toolbar: "redo undo bold italic alignleft alignright aligncenter ditook_blockquote ditook_code indent outdent note link picture code_output",
        plugins: "image imagetools link",
        imagetools_toolbar: "rotateleft rotateright | flipv fliph | editimage imageoptions",
        paste_as_text: !0,        
        init_instance_callback: function(editor) {
            editor.on('click', function(e) {
                if (e.target.nodeName == "IMG") {
                    var img = tinymce.activeEditor.selection.getNode();
                    selected_file = img.alt                    
                }
            });            
        },
        setup: function(edit) {     
            var body = "", note = {'title': "", 'body': ""}, note_is_active = false, ditook_code_active = false;;       
            edit.addButton('picture', {
                title: 'picture',
                image: '/static/media/Images/image.png',
                onclick: function() {                                               
                    var file_path = $("#article_img_uploader").val();                    
                    if (file_path){
                        var filename = file_path.split('\\')[2];
                        var body = tinymce.activeEditor.getContent();
                        var res = body.indexOf(/alt=\""+filename+"\"/g);
                        if (res == -1)
                            $('#article_img_uploader').val('');                                                                
                    } 
                    $('#article_img_uploader').trigger('click');
                }
            });
            edit.addButton("code_output", {
                title: "code_output",
                image: '/static/media/Images/output.png',
                onclick: function(e) {                  
                    edit.windowManager.open({
                        title: 'Code output',
                        body: [{
                            type:'textbox',
                            name:'output',
                            value: body,
                            multiline: !0,
                            minWidth: '450',
                            minHeight: '250',
                            paste_retain_style_properties: 'all'
                        }],
                        onclose: function(){
                            body = "";
                        },
                        onsubmit: function(e) {                             
                            var res = "<div class='code_output' contenteditable='false'>";  
                            var text = "<p class='code_output_text'>Output: </p>";
                            edit.execCommand('mceInsertContent', !1, text);                         
                            insertCode(e.data.output, res, edit);                            
                            body = "";
                        }
                    })
                }                
            });
            edit.addButton("ditook_code", {
                title: "code",
                image: '/static/media/Images/ditook_code.png',
                onclick: function() {
                    ditook_code_active = true;                    
                    edit.windowManager.open({
                        title: 'Code',
                        body: [{
                            type:'textbox',
                            name:'ditook_code',
                            value: body,
                            multiline: !0,
                            minWidth: '450',
                            minHeight: '250',
                            paste_retain_style_properties: 'all'
                        }],
                        onclose: function(){
                            body = "";
                            ditook_code_active = false;
                        },
                        onsubmit: function(e) {                             
                            var res = "<pre><div class='ditook_code' contenteditable='false'>";                           
                            insertCode(e.data.ditook_code, res, edit,"</div></pre>");                            
                            body = "";
                            ditook_code_active = false;
                        }
                    })
                }                
            });            
            var code_editor_called = !1;
            edit.addButton("note", {
                title: "note",
                image: '/static/media/Images/note.png',                
                onclick: function() {
                    edit.windowManager.open({
                        title: 'Note',  
                        id: 'ditook_note',                                         
                        url: window.location.href+"/ditook_note?title="+note.title+"&body="+encodeURIComponent(note.body),                                            
                        buttons: [{
                            type: 'button',
                            text: 'Ok',
                            onclick: function(){
                                var parent = $('#ditook_note iframe').contents()[0].body;
                                var title = $(parent).find('.note_title').val();
                                var body = $($(parent).find('iframe').contents()[0].body)[0].innerHTML;                                
                                if (title.indexOf("Note: ") == -1)
                                    title = 'Note: '+title;                                                           
                                if (body){
                                    var res = "<div class='note' contenteditable='false'><p class='note-title'>"+title+"</p><div class='note-body'>";                            
                                    insertCode(body, res, edit, "</div></div>");
                                    tinymce.activeEditor.windowManager.close();
                                }
                            },
                            onclose: function(){
                                note = {'title':'', 'body':''};
                            }
                        }]                                                                                    
                    })
                }
            });
            edit.addButton("ditook_blockquote", {
                title: "blockquote",
                image: '/static/media/Images/ditook_blockquote.png',                
                onclick: function() {
                    edit.windowManager.open({
                        title: 'Blockquote',
                        body: [{
                                type: 'textbox',
                                name: 'blockquote_body',
                                value: body,
                                multiline: true,
                                minWidth: '450',
                                minHeight: '250',
                                paste_retain_style_properties: 'all'
                        }],
                        onclose: function(){
                            body = "";
                        },                        
                        onsubmit: function(e) { 
                            var res = "<div class='ditook_blockquote' contenteditable='false'>";                            
                            insertCode(e.data.blockquote_body, res, edit);                           
                            body = "";
                        }
                    })
                }
            });               
            edit.on('BeforeSetContent', function(e){
                if (ditook_code_active && note_is_active){                        
                    e.preventDefault();
                    var body = $('#ditook_note-body iframe').contents().find('.note_body');                    
                    $(body).focus();
                    var content = '<p>'+e.content+'</p>';                    
                    $(body).append(content);
                }                      
            });
            edit.on('dblclick', function(e){
                if (!$(e.target).is('html')){
                    var className = $(e.target).attr('class');                                    
                    if (className !== undefined){
                        body = unstrip_tags(e.target.innerHTML);                            
                        if (className.indexOf('note') != -1){
                            var b_or_t = e.target.parentNode;                            
                            if (className.indexOf('title') != -1){
                                b_or_t = b_or_t.children[1].innerHTML;
                                var title = e.target.innerHTML.replace("Note:","");                                
                                note = {'title':title,'body':b_or_t};                                
                            } else{
                                var title = b_or_t.children[0].innerHTML.replace("Note:","");
                                note = {'title':title,'body':body};
                            }
                            tinymce.activeEditor.buttons.note.onclick();
                        }else if (className == 'code_output')                     
                            tinymce.activeEditor.buttons.code_output.onclick();                        
                        else if (className == 'ditook_blockquote')
                            tinymce.activeEditor.buttons.ditook_blockquote.onclick();                        
                        else if (className == 'ditook_code')
                            tinymce.activeEditor.buttons.ditook_code.onclick();
                    }                               
                }                
            });        
            edit.on('ExecCommand', function(e) {
                var val = e.value;
                if (e.command == "mceInsertContent") {                                        
                    if (val.indexOf('<pre') > -1 && !note_is_active) {
                        if (!$('#articleForm .code_output_box').length) {                            
                            var code_output_box = "<div class='alert alert-info code_output_box'> \
                                                        <div class='code_output_box_pointer'>\
                                                        </div><p> Click on <i class='fa fa-circle-o'></i> to write code output. </p>\
                                                        <hr class='code_output_box_hr'>\
                                                        <button class='btn' id='code_output_box_ok'>Ok</button>\
                                                        <button class='btn' id='code_output_box_dsa'>Don't show again</button>\
                                                   </div>";
                            $('#articleForm').prepend(code_output_box);
                            adjust_code_output_box();
                            code_output_box_events();
                            $('.mce-toolbar-grp .mce-btn.mce-last button').css({
                                'border-radius': '40px',
                                'border': '2px solid teal'
                            });
                        } else if (!hide_code_output_box) {
                            $('.code_output_box').show(80);
                            $('.code_output_box').show(80);
                            $('.mce-toolbar-grp .mce-btn.mce-last button').css({
                                'border-radius': '40px',
                                'border': '2px solid teal'
                            });
                        } else {
                            $('.code_output_box').hide();
                            $('.mce-toolbar-grp .mce-btn.mce-last button').css({
                                'border-radius': '',
                                'border': ''
                            });
                        }
                    }
                }
            });
            edit.on('keyup', function(){
                article_box_not_empty();
            });
        }
    });
    if ($('#userHeader').is(':visible'))
        article_box_not_empty();
    function postComment(comment, parent = '', response = '') {
        var html = ''
        if (comment) {
            $.ajax({
                type: 'POST',
                url: '/articles/postComment/',
                data: {
                    'comment': comment,
                    'parent': parent,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                },
                success: function(data) {
                    var noOfComments = parseInt($('.comment b').text());
                    if (noOfComments) {
                        if (parent) {
                            response(data)
                        } else $('.postComment').after(data)
                    } else $('.postComment').after(data);
                    $('.comment b').text(noOfComments + 1);
                },
                error: function(xhr, status, error) {
                    setNotificationBox(xhr + ' - ' + status + ' - ' + error, "fa fa-exclamation-circle")
                }
            })
        }
    }
    $('#articleCommentForm').on('submit', function(e) {
        e.preventDefault();
        postComment($('#articleCommentForm textarea').val());
        $('#articleCommentForm textarea').val('');
    });
    $('.commentStyle').on('click', '#like', function(e) {
        e.preventDefault();        
        var id = $(this).closest('.commentStyle').find("#comment_id").val();
        $.ajax({
            type: 'POST',
            context: this,
            url: '/articles/updateComment/',
            data: {
                'commentId': id,
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    $(this).siblings().text(data.noOfLikes);
                    if (data.Unliked) {
                        $(this).parent().removeClass('change-color');
                        $(this).parent().addClass('default-color')
                    } else {
                        $(this).parent().removeClass('default-color');
                        $(this).parent().addClass('change-color')
                    }
                } else setNotificationBox("Oops! Something Went Wrong.", "fa fa-exclamation-circle")
            },
            error: function(xhr, status, error) {
                setNotificationBox(xhr + ' - ' + status, "fa fa-exclamation-circle")
            }
        });
    });

    function attachEvent() {
        $('#articleReplyForm').on('submit', function(e) {
            e.preventDefault();
            var id = $(this).closest('.commentStyle').find("#comment_id").val();
            var self = this;
            postComment($('#articleReplyForm textarea').val(), id, function(response) {
                var parent = $(self).closest('.commentStyle').clone(!0, !0);
                parent.empty();
                parent.append(response);
                $(self).closest('.commentStyle').after(parent);
                $('#articleReplyForm textarea').val('');
                $(self).parent().parent().parent().remove();
            });
        })
    }
    $('.commentStyle').on('click', '#reply', function(e) {
        e.preventDefault();
        var parent = $(this).closest(".commentSection");        
        var duplicate = $('.postComment').clone();
        var user = '@' + parent.find('.userName').text();        
        duplicate = duplicate.children().removeClass('col-xs-11').addClass('col-xs-offset-1 col-xs-10');
        duplicate.find('textarea').attr('placeholder', user);
        duplicate.find('button').text('Reply');
        duplicate.find('form').attr('id', 'articleReplyForm');
        parent.parent().append(duplicate);
        attachEvent();
    });
    $('.articleLikes').on('click', function(e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/articles/update_article_likes/',
            data: {
                csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
            },
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    $('.articleLikes b').text(data.total_likes);
                    if (data.liked) {
                        $('.articleLikes').removeClass('default-color');
                        $('.articleLikes').addClass('change-color')
                    } else {
                        $('.articleLikes').removeClass('change-color');
                        $('.articleLikes').addClass('default-color')
                    }
                } else {
                    setNotificationBox(data.response, "fa fa-exclamation-circle")
                }
            },
            error: function(xhr, status, error) {
                setNotificationBox("Oops something went wrong.", "fa fa-exclamation-circle")
            }
        })
    });

    function share_link_on_fb() {        
        FB.ui({
            method: 'share',
            href: window.location.href,
        }, function(response) {})
    }

    function share_link_on_tw() {
        window.open('https://twitter.com/intent/tweet?url=/' + window.location.href + '&text=I like this site: ', 'Twitter', 'width=400, height=350')
    }

    function share_link_on_go() {
        window.open('https://plus.google.com/share?url=/' + window.location.href, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600')
    }
    $('.articleShares .dropdown-menu li').on('click', function(e) {
        e.preventDefault();
        var selected_site = $(this).attr('id');
        if (selected_site == 'share_fb')
            share_link_on_fb();
        else if (selected_site == 'share_tw')
            share_link_on_tw();
        else share_link_on_go()
    })
})