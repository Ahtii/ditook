var total_notifications = 0;
var new_total_notifications = 0;

function inbox_marked(selector) {
    $(selector).removeClass('fa fa-square-o');
    $(selector).addClass('fa fa-check-square-o');
    if ($('.inbox-select-all i').hasClass('fa fa-square-o')) {
        var checked_notifications_len = $('.inbox').find('.fa-check-square-o').parent().length;
        var all_notifications_len = $('.inbox').length;
        if (checked_notifications_len == all_notifications_len) {
            $('.inbox-select-all i').removeClass('fa fa-square-o');
            $('.inbox-select-all i').addClass('fa fa-check-square-o')
        }
    }
}

function inbox_unmarked(selector) {
    $(selector).removeClass('fa fa-check-square-o');
    $(selector).addClass('fa fa-square-o');
    if ($('.inbox-select-all i').hasClass('fa fa-check-square-o')) {
        $('.inbox-select-all i').removeClass('fa fa-check-square-o');
        $('.inbox-select-all i').addClass('fa fa-square-o')
    }
}

function set_unset_notification_target(comment_id, article_id) {
    if (comment_id) {
        var selector = $(".commentStyle").find("input[value=" + comment_id + "]").siblings('.commentSection');
        $([document.documentElement, document.body]).animate({
            scrollTop: $(selector).offset().top - 100
        }, 100);
        $(selector).addClass('hilighter_effect')
    } else if (article_id) {
        $([document.documentElement, document.body]).animate({
            scrollTop: $(".article_controls").offset().top - 100
        }, 100);
        $('.article_controls > div').addClass('hilighter_effect')
    }
}

function setup_empty_notification() {
    $('.inbox-header > b').text(" Notification");
    $('.inbox-seen, .inbox-clear').css('display', 'none');
    $('.inbox-holder ul').append("<li class='inbox-empty'><i class='fa fa-square-o'></i>&nbsp; <span> Nothing to show. </span></li>");
    $('.inbox-select-all').remove();
    $('.inbox-new-notifications').remove();
    $('.notifier_count').remove();
    $('.notifier').remove()
}

function alter_notifications_header() {
    if (new_total_notifications > 0) {
        if (new_total_notifications < 100) {
            $('.inbox-header-text').text(new_total_notifications + " Notification");
            $('.notifier_count').text(new_total_notifications)
        } else {
            $('.inbox-header-text').text("99+ Notification");
            $('.notifier_count').text("99+")
        }
    } else if (total_notifications > 0) {
        if (total_notifications < 100) {
            $('.inbox-header-text').text(total_notifications + " Notification");
            $('.notifier_count').text(total_notifications)
        } else {
            $('.inbox-header-text').text("99+ Notification");
            $('.notifier_count').text("99+")
        }
    } else setup_empty_notification()
}

function create_notification_holder(obj) {
    total_notifications = obj.length;
    var new_notifications = 0;
    if (!obj[0].fields.viewed) $('.inbox-new-notifications').css('display', 'inline');
    $.each(obj, function(index) {
        var message = obj[index].fields.message;
        var avatar_url = obj[index].fields.avatar_url;
        var article_id = obj[index].fields.target;
        var notificaion_id = obj[index].pk;
        var comment_id = obj[index].fields.comment_id;
        var inbox = "<li class='inbox'><input id='notificaion_id' type='hidden' value=" + notificaion_id + " readonly><img class='img-circle inbox-user-avatar' src=" + avatar_url + "><p class='inbox-message'>" + message + "</p><i class='fa fa-square-o inbox-checkbox'></i><input id='comment_id' type='hidden' value=" + comment_id + "></li>";
        if (obj[index].fields.viewed)
            inbox = inbox.substring(0, 16) + " inbox-viewed'> <i class='fa fa-eye inbox-viewed-icon'></i>" + inbox.substring(18);
        else new_total_notifications++;
        $('.inbox-holder ul').append(inbox)
    });
    alter_notifications_header()
}

function show_notifier() {
    if (new_total_notifications) {
        var notifier = "<span class='fa fa-exclamation-circle notifier'></span>";
        $('#userHeader img').after(notifier);
        if (new_total_notifications < 100) $('.notification_icon').after("<i class='badge notifier_count'>" + new_total_notifications + "</i>");
        else $('.notification_icon').after("<i class='badge notifier_count'>99+</i>")
    }
}

function init_user_notifications() {
    var logged_in_user = $('#cur_user').val();
    if (logged_in_user) {
        $.ajax({
            type: 'GET',
            url: '/articles/get_notifications/',
            success: function(data) {
                var obj = JSON.parse(data);
                var count = obj.length;
                if (count) {
                    create_notification_holder(obj);
                    show_notifier();
                    $('.inbox-select-all').css('display', 'inline');
                    $('.inbox').on('click', function() {
                        var nodes = Array.prototype.slice.call($('.inbox-holder ul').children());
                        var ref = this;
                        var index = nodes.indexOf(ref);
                        var notification_id = String(obj[index].pk);
                        var article_id = obj[index].fields.target;
                        data = {
                            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val(),
                            'notification_id': notification_id
                        };
                        $.post('/articles/notifications_target/', data).done(function(data) {
                            if (data.response == 'success')
                                window.location.replace("/articles/" + article_id);
                            else if (data.response == 'fail')
                                $('.inbox').find("#notification_id[value=" + notification_id + "]").parent().remove()
                        })
                    }).children('.inbox-checkbox').on('click', function(e) {
                        e.stopPropagation();
                        if ($(this).hasClass('fa fa-square-o')) inbox_marked(this);
                        else inbox_unmarked(this)
                    })
                } else {
                    $('.inbox-header-text').text('Notification');
                    $('.inbox-seen, .inbox-clear').css('display', 'none');
                    $('.inbox-holder ul').append("<li class='inbox-empty'><i class='fa fa-square-o'></i>&nbsp; <span> Nothing to show. </span></li>")
                }
            },
            error: function() {
                setNotificationBox("Ops something went wrong..!", "fa fa-exclamation-circle")
            }
        })
    }
}
init_user_notifications();
var validateFunc = {
    isValidEmail: function(email) {
        var pattern = new RegExp(/^[\w.%+-]+@[a-z0-9]+\.[a-z]{2,}$/i);
        return pattern.test(email)
    },
    isValidUsername: function(username) {
        var pattern = new RegExp(/^[a-z][\w]{2,14}$/i);
        return pattern.test(username)
    },
    isValidPassword: function(password, password_reset_form = !1) {
        var pattern = new RegExp(/^(?=.*[a-zA-Z]).{8,}$/i);
        var result = pattern.test(password);
        if (password_reset_form)
            return result;
        var email = $('#inputEmail').val();
        try {
            var res = new RegExp(password, "i")
        } catch (e) {
            return !1
        }
        return !0;
        return !1
    },
    isValidConfirmPassword: function() {
        var password = $('#inputPassword').val();
        if (password != '' && password == $('#inputConfirmPassword').val())
            return !0;
        return !1
    }
}

function initNotificationBox(msg) {
    var $this = '.notificationBox';
    $($this + ' strong').text(msg);
    $($this + ' i').addClass("fa fa-send vertical-align");
    $($this + ' span').addClass("fa fa-circle-o-notch fa-spin");
    if (!$($this).is(':visible'))
        $($this).fadeIn("fast")
}

function setNotificationBox(msg, className) {
    var $this = '.notificationBox';
    $($this + ' span').removeClass();
    $($this + ' i').attr('class', className + ' vertical-align');
    $($this + ' strong').text(msg);
    if (!$($this).is(':visible'))
        $($this).fadeIn("fast")
}
var clicked_inbox_header = "";

function backgroundEffect() {
    var wScroll = $(window).scrollTop();
    $('.selection-section, #footerBody').css('background-position', 'center ' + (wScroll + 0.75) + 'px')
}
$(window).scroll(function() {
    backgroundEffect()
});
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs)
}(document, 'script', 'facebook-jssdk'));
window.fbAsyncInit = function() {
    FB.init({
        appId: '2060825523934251',
        cookie: !0,
        xfbml: !0,
        version: 'v2.11'
    })
};

function share_link() {
    FB.api('/me/feed', 'post', {
        link: window.location
    }, function(response) {
        /*linke posted*/
    })
}

function update_notification_panel(notifications) {
    $.each(notifications, function() {
        $(this).remove();
        if (new_total_notifications)
            new_total_notifications--;
        total_notifications--;        
    });
    alter_notifications_header()
}

function mark_as_seen() {
    var notification_list = [],
        notifications = $('.inbox:not(.inbox-viewed)').find('.fa-check-square-o').parent();
    if (notifications.length) {
        $.each(notifications, function() {
            var selector = $(this).children('input');
            notification_list.push($(selector).val())
        });        
        $.post('/articles/mark_as_seen/', {
            'notification_list': notification_list,
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        }).done(function(data) {
            $.each(data.non_existing_notifications, function() {
                var parent = $('.inbox').find('#notificaion_id[value=' + this + ']').parent();
                parent.remove();
                total_notifications--
            });
            $.each(data.existing_notifications, function() {
                var parent = $('.inbox').find('#notificaion_id[value=' + this + ']').parent();
                $(parent).append("<i class='fa fa-eye inbox-viewed-icon'></i>");
                $(parent).addClass('inbox-viewed');
                $(parent).remove();
                $(parent).children('.inbox-checkbox').removeClass('fa fa-check-square-o');
                $(parent).children('.inbox-checkbox').addClass('fa fa-square-o');
                $('.inbox-holder > ul').append(parent);
                new_total_notifications--
            });
            alter_notifications_header()
        })
    }    
}

function clear_notifications() {
    var notification_list = [],
        notifications = $('.inbox').find('.fa-check-square-o').parent();
    if (notifications.length) {
        $.each(notifications, function() {
            var selector = $(this).children('#notificaion_id');
            notification_list.push($(selector).val())
        });
        $.post('/articles/clear_notifications/', {
            'notification_list': notification_list,
            'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
        }).done(function(data) {
            update_notification_panel(notifications)
        })
    }
}

function inbox_is_empty() {
    return $('.inbox-empty').is(':visible')
}
var pathname = window.location.pathname;
if (pathname == '/')
    $('.site_header').css('background-color', '#cd1b27');
else {
    if (pathname.indexOf("articles") > -1)
        $('#nav #Articles a').css('background-color', '#cd1b27');
    else if (pathname.indexOf("contact") > -1)
        $('#nav #Contact a').css('background-color', '#cd1b27')
}
$('#authentication').click(function() {
    $('#authentication').css("color", "white")
});
$(document).ready(function() {
    function setup_otp_resend_btn(email) {
        var resend = $('#loginModal #login').clone(!1, !1);
        $(resend).text('Resend');
        $(resend).attr('id', 'resend');
        $(resend).addClass('resend_otp');
        $("#loginModal .login_email").after(resend);
        $("#loginModal #check_otp_input").val('');
        $('#showLoginErrMsg').text('');        
        $("#resend").on('click', function(e) {
            e.preventDefault();            
            $('#resend').prop('disabled', !0);
            send_otp_for_password_reset(email)
        })
    }

    function send_otp_for_password_reset(email) {
        if (!email)
            email = $('.login_email_forgot_group input').val();
        if (validateFunc.isValidEmail(email)) {
            $('#showLoginErrMsg').text('');
            initNotificationBox('Sending password reset link.');
            $('#login-footer #login').prop('disabled', !0);
            data = {
                'email': email,
                'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
            };
            $.post('/authenticate/OtpManager/', data).done(function(data) {
                $('#login-footer #login').prop('disabled', !1);
                $('.notificationBox .close').trigger('click');
                if (data.response) {
                    setNotificationBox(data.response, data.responseType);
                    if (!$('#resend').is(":visible")) {
                        var message = "<p class='type-otp-message'>Enter a valid vertification code sent to your email:</p>"
                        alter_login_form(message, 'check_otp_form', 'Done', email);
                        setup_otp_resend_btn(email)
                    } else $('#resend').prop('disabled', !1)
                } else {
                    $('#showLoginErrMsg').text("Please type a registered email.")
                }
            })
        } else invalidInputs('#loginModal', '#showLoginErrMsg', 'Invalid email address.')
    }

    function set_wait_buffer() {
        var wait_buffer = "<div class='login_wait_buffer_container'><div class='login_wait_buffer'><i class='fa fa-spinner fa-spin'></i></div></div>";
        $('#loginModal .modal-content').css('filter', 'brightness(60%)');
        $('#loginModal .modal-content').before(wait_buffer)
    }

    function unset_wait_buffer() {
        $('#loginModal .modal-content').css('filter', '');
        $('.login_wait_buffer_container').remove()
    }
    var form_event = {
        forgot_password_event: function(empty) {
            $('#forgot_password_form').on('submit', function(e) {
                e.preventDefault();
                send_otp_for_password_reset(empty)
            })
        },
        check_otp_event: function(email) {
            $('#check_otp_form').on('submit', function(e) {
                e.preventDefault();
                $('#showLoginErrMsg').text('');
                var code = $('#check_otp_input').val();
                if (code) {
                    $.post('/authenticate/OtpManager/', {
                        'code': code,
                        'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
                    }).done(function(data) {
                        if (data.response == 'success') {
                            alter_login_form('', 'change_password_form', 'Set', email)
                        } else $('#showLoginErrMsg').text(data.errMsg)
                    })
                } else invalidInputs('#loginModal', '#showLoginErrMsg', 'Cannot be empty.')
            })
        },
        change_password_event: function(email) {
            $('#change_password_form').on('submit', function(e) {
                e.preventDefault();
                var password = $('#new_login_password').val();
                data = {
                    'email': email,
                    'password': password,
                    'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()
                };
                set_wait_buffer();
                $.post('/authenticate/set_new_password/', data).done(function(data) {
                    unset_wait_buffer();
                    if (data.response) {
                        $('#sign_in_btn').trigger('click')
                    } else setNotificationBox("Ops something went wrong.", "fa fa-exclamation-circle")
                }).fail(function() {
                    unset_wait_buffer();
                    setNotificationBox("Ops something went wrong. Please refresh the page and try again.", "fa fa-exclamation-circle")
                })
            })
        }
    };
    login_form_event();

    function sing_in_btn_event() {
        $('#sign_in_btn').on('click', function(e) {
            e.preventDefault();
            var form = "#" + $('#loginModal form').attr('id');
            $(form).off('submit');
            $('#showLoginErrMsg').text('');
            $('#loginModal #login-footer #login').text('Login');
            $('.login_email, .login_password, .login-dilog-hr, .social_login, .create_account').css('display', 'block');
            $('#loginModal form').attr('id', 'loginForm');
            login_form_event();
            if (form == '#forgot_password_form') {
                $('.forgot-message').remove();
                $('.login_email_forgot_group').remove()
            } else if (form == '#check_otp_form') {
                $('.type-otp-message').remove();
                $('#resend').remove();
                $('.login_email_forgot_group').remove()
            } else $('.new_login_password_group').remove();
            $(this).remove()
        })
    }

    function alter_login_form(message, form, btn_name, email) {
        var id = "#" + $('#loginModal form').attr('id');
        $(id).off('submit');
        $('#showLoginErrMsg').text('');
        $('#loginModal form').attr('id', form);
        $('#loginModal #login-footer #login').text(btn_name);
        if (form == 'forgot_password_form') {
            $('.login_password, .login-dilog-hr, .social_login, .create_account').css('display', 'none');
            var sign_in_btn = "<p id='sign_in_btn'><i class='fa fa-chevron-circle-left'></i></p>";
            $('#loginModal .modalHeaderStyle').after(sign_in_btn);
            sing_in_btn_event();
            var email_group = $('#loginModal .login_email').clone(!1, !1);
            $(email_group).removeClass('login_email');
            $(email_group).addClass('login_email_forgot_group');
            $(email_group).children('input').attr('id', 'login_email_input');
            $(email_group).prepend(message);
            $('.login_email').before(email_group);
            $('.login_email').css('display', 'none')
        } else if (form == 'check_otp_form') {
            $('.forgot-message').remove();
            $('.login_email_forgot_group').prepend(message);
            $('.login_email_forgot_group label').css('display', 'none');
            $('.login_email_forgot_group input').attr('type', 'text');
            $('.login_email_forgot_group input').val('');
            $('.login_email_forgot_group input').attr('id', 'check_otp_input');
            $('.login_email_forgot_group input').attr('placeholder', 'vertification code.')
        } else {
            $('#resend, .type-otp-message, .login_email_forgot_group').remove();
            setup_password_reset_form()
        }
        var form_event_name = form.replace('form', 'event');
        form_event[form_event_name](email)
    }

    function generateErrMsg(eleName) {
        if (eleName == 'Email')
            if (emailTaken)
                return "Email already taken.";
            else return "Invalid Email format.";
        else if (eleName == 'Username')
            if (usernameTaken)
                return "Username already taken.";
            else return "Username must be atleast 3 chars (Max 15), must start with letter, followed by letter, digit or underscore.";
        else if (eleName == 'Password')
            return "Password must be atleast 8 chars, atleast 1 letter & must not be part of email.";
        else return "Did not match"
    }

    function conf_password_event() {
        $('#inputConfLoginPassword, #new_login_password').on('focusout', function() {
            $('#showLoginErrMsg').text('');
            var password = $('#new_login_password').val();
            var conf_password = $('#inputConfLoginPassword').val();
            if (password != '') {
                if (!validateFunc.isValidPassword(password, !0))
                    $('#showLoginErrMsg').text(generateErrMsg('Password'));
                if (password != conf_password)
                    $('#showLoginErrMsg').text(generateErrMsg('Confirm Password'))
            } else $("#showLoginErrMsg").text('Cannot be empty.')
        })
    }

    function setup_password_reset_form() {
        $('.login_password').css('display', 'block');
        var new_password = $('.login_password').clone(!1, !1);
        $(new_password).removeClass('login_password').addClass('new_login_password_group');
        $(new_password).find('.forgot-password').remove();
        $(new_password).find('input').attr('id', 'new_login_password');
        $(new_password).find('label').text('New Password:');
        var conf_label = $(new_password).children('label').clone(!1, !1);
        $(conf_label).text('Confirm password:');
        $(conf_label).css('margin-top', '15px');
        var conf_password = $(new_password).find('input').clone(!1, !1);
        $(conf_password).prop('id', 'inputConfLoginPassword');
        var placeholder = $(conf_password).attr('placeholder').replace(/Password/, 'Confirm Password');
        $(conf_password).attr('placeholder', placeholder);
        $(new_password).append(conf_label);
        $(new_password).append(conf_password);
        $('#sign_in_btn').after(new_password);
        $("#new_login_password").keyup(function() {
            showHidePass($(this).val())
        });
        initShowPassword("new_login_password", "inputConfLoginPassword");
        conf_password_event();
        $('.login_password').css('display', 'none')
    }
    $('.forgot-password').on('click', function() {
        var message = "<p class='forgot-message'>Please type a registered email to create a new password.</p>"
        alter_login_form(message, 'forgot_password_form', 'Send', '')
    });
    $('.inbox-select-all').on('click', function() {
        var selector = $(this).children('i'),
            notifications = $('.inbox');
        if ($(selector).hasClass('fa fa-square-o')) {
            inbox_marked(selector);
            $.each(notifications, function() {
                inbox_marked($(this).children('.inbox-checkbox'))
            })
        } else {
            inbox_unmarked(selector);
            $.each(notifications, function() {
                inbox_unmarked($(this).children('.inbox-checkbox'))
            })
        }
    });
    $('.inbox-seen').on('click', function() {
        clicked_inbox_header = "seen";        
        mark_as_seen()
    });
    $('.inbox-clear').on('click', function() {
        clicked_inbox_header = "clear";        
        clear_notifications()
    });
    $('.inbox-close').on('click', function() {
        $('.inbox-holder').hide(80)
    });
    $('.notification_icon').on('click', function(e) {
        $('.inbox-holder').show(80)
    });
    $('.page_scroller').on('click', function(e) {
        e.preventDefault();
        if ($('.page_scroller i').attr('class') == 'fa fa-chevron-down') {
            $('.page_scroller i').removeClass('fa fa-chevron-down');
            $('.page_scroller i').addClass('fa fa-chevron-up');
            $('.page_scroller').removeClass('page_scroller_animate_up');
            $('.page_scroller').addClass('page_scroller_animate_down');
            $([document.documentElement, document.body]).animate({
                scrollTop: $("footer").offset().top
            }, 200)
        } else {
            $('.page_scroller i').removeClass('fa fa-chevron-up');
            $('.page_scroller i').addClass('fa fa-chevron-down');
            $('.page_scroller').removeClass('page_scroller_animate_down');
            $('.page_scroller').addClass('page_scroller_animate_up');
            $([document.documentElement, document.body]).animate({
                scrollTop: $(".selection-section").offset().top
            }, 200)
        }
    });
    $('#search_by_article').css('background-color', '#D3212D');
    $('.search_by .dropdown-menu li').on('click', function() {
        var this_id = $(this).attr('id');
        if (this_id == 'search_by_user') {
            $('#search_by_user').css('background-color', '#D3212D');
            $('#search_by_article').css('background-color', '#E32636')
        } else {
            $('#search_by_user').css('background-color', '#E32636');
            $('#search_by_article').css('background-color', '#D3212D')
        }
    });
    $('.main_page').on('click', '#categories a', function(e) {
        e.preventDefault();
        var category = $(this).text();        
        $.ajax({
            type: 'GET',
            url: window.location.href,
            data: {
                'category': category
            },
            success: function(data) {
                var start = data.indexOf("<div class=\"main_page\"");
                var end = data.indexOf('</footer>') + 18;
                var page = data.substring(start, end);                
                $('.main_page').empty();
                $('.main_page').append(page)
                $('.subHeader b').text(category);
            },
            error: function(xhr) {
                setNotificationBox('Something went wrong.', 'fa fa-exclamation-circle')
            }
        })
    });
    $('#navbarForm').on('submit', function(e) {
        e.preventDefault();
        var search_target = encodeURIComponent($('#nav input').val());
        if (search_target) {
            var search_by = 'article';
            if ($('#search_by_user').css('background-color') == 'rgb(211, 33, 45)')
                search_by = 'user';
            var new_link = $('#search_page').attr('href') + '?target=' + search_target + '&by=' + search_by;
            $('#search_page').attr('href', new_link);
            $('#search_page')[0].click();
            $('#nav input').val('')
        }
    });
    $('#authentication, #userHeader, #sidebarHeader').click(function() {
        var $this = "#" + $(this).attr('id') + ' i';
        var $parent = "#" + $(this).attr('id');
        if ($('.dropdown-menu').is(':visible')) {
            $($this).removeClass('fa-angle-up');
            $($this).addClass('fa-angle-down')
        } else {
            $($this).removeClass('fa-angle-down');
            $($this).addClass('fa-angle-up')
        }
        $($this).css({
            'transition': 'fa fa-angle-up 1s',
            '-webkit-transition': 'fa fa-angle-up 1s'
        })
    });
    $(document).on('click', function(e) {
        if ($('#authentication i').attr('class') == "fa fa-angle-up") {
            $('#authentication i').removeClass('fa fa-angle-up');
            $('#authentication i').addClass('fa fa-angle-down')
        }
        if ($('#userHeader i').attr('class') == "fa fa-angle-up") {
            $('#userHeader i').removeClass('fa fa-angle-up');
            $('#userHeader i').addClass('fa fa-angle-down')
        }
        if ($('#sidebarHeader i').attr('class') == "fa fa-angle-up") {
            $('#sidebarHeader i').removeClass('fa fa-angle-up');
            $('#sidebarHeader i').addClass('fa fa-angle-down')
        }
    });

    function initShowPassword(inputboxId, otherinputboxId = '') {
        $('.show_password').on("mousedown", function() {
            var passType = document.getElementById(inputboxId);
            passType.type = "text";
            $('.show_password').css('color', 'teal');
            if (otherinputboxId) {
                var ConfPassType = document.getElementById(otherinputboxId);
                ConfPassType.type = "text"
            }
        }).on("mouseup mouseleave", function() {
            var passType = document.getElementById(inputboxId);
            passType.type = "password";
            $('.show_password').css('color', 'black');
            if (otherinputboxId) {
                var ConfPassType = document.getElementById(otherinputboxId);
                ConfPassType.type = "password"
            }
        })
    }
    $('.notificationBox .close').click(function() {
        $('.notificationBox').fadeOut("fast")
    });
    var smallDeviceReached = !1;

    function adjustFooterOnMobile() {
        function toDefault() {
            $('.follow, .resources').css({
                'padding-left': ''
            });
            $('.follow').removeClass('col-xs-5');
            $('.resources').removeClass('col-xs-6');
            $('.briefDescrp').removeClass('col-xs-offset-1 col-xs-11');
            $('.follow, .resources, .briefDescrp').addClass('col-xs-4')
        }

        function onExtraSmallDevices(left) {
            $('.resources, .follow').css({
                'padding-left': left
            });
            $('.resources, .follow, .briefDescrp').removeClass('col-xs-4');
            $('.resources').addClass('col-xs-6');
            $('.follow').addClass('col-xs-5');
            $('.briefDescrp').addClass('col-xs-offset-1 col-xs-11')
        }
        var $winWidth = $(window).width();
        if ($winWidth < 581) {
            if ($winWidth > 519 && $winWidth < 561)
                onExtraSmallDevices("60px");
            else if ($winWidth > 459 && $winWidth < 521)
                onExtraSmallDevices("40px");
            else if ($winWidth > 399 && $winWidth < 460)
                onExtraSmallDevices("20px");
            else if ($winWidth > 560 && $winWidth < 581)
                onExtraSmallDevices("80px");
            else onExtraSmallDevices("0px");
            smallDeviceReached = !0
        } else if (smallDeviceReached)
            toDefault()
    }

    function adjustModalOnMobile() {
        if ($(window).width() < 769)
            if ($(window).width() > 380) {
                $("<style type='text/css'> .modalOnMobile {  left: 0; right: 0;  top: 30px; bottom: 0; margin: auto; width: 300px; position: absolute; } </style>").appendTo("head");
                $('.modal-dialog').addClass('modalOnMobile')
            } else if ($('.modal-dialog').hasClass('modalOnMobile'))
            $('.modal-dialog').removeClass('modalOnMobile')
    }
    adjustModalOnMobile();
    adjustFooterOnMobile();
    $(window).resize(function() {
        adjustModalOnMobile();
        adjustFooterOnMobile()
    });
    var errorList = {
        'Email': 'blue',
        'Username': 'blue',
        'Password': 'blue',
        'ConfirmPassword': 'blue'
    };
    var emailTaken = !1;
    var usernameTaken = !1;

    function setModelToDefault(modelName) {
        if (modelName == "#signupModal") {
            $('#inputEmail').css({
                'border': '1px solid silver'
            });
            $('#inputUsername').css({
                'border': '1px solid silver'
            });
            $('#inputPassword').css({
                'border': '1px solid silver'
            });
            $('#inputConfirmPassword').css({
                'border': '1px solid silver'
            });
            $(modelName).find('form')[0].reset();
            $.each(errorList, function(key, value) {
                errorList[key] = 'blue'
            });
            $('#showRegisterErrMsg').text('');
            emailTaken = !1;
            usernameTaken = !1
        } else $('#showLoginErrMsg').text('')
    }
    $('#registerUser').click(function() {
        $('#loginModal .close').trigger('click');
        setTimeout(function() {
            $('#signup').trigger('click')
        }, 700)
    });
    $('#signin, #signup, #alert-login').click(function() {
        var $this = $(this).attr('data-target');
        if ($($this).hasClass('flipOutY'))
            $($this).removeClass('flipOutY');
        $($this).addClass('flipInY');
        var authType = $(this).text().split(" ")[2];
        $('.fa-eye').hide();
        if (authType == 'Up') {
            initShowPassword('inputPassword', 'inputConfirmPassword');
            clearModalAndValidate('register')
        } else {
            initShowPassword('inputLoginPassword');
            clearModalAndValidate('Login')
        }
    });

    function prevErrMsg() {
        var returnVal = '';
        $.each(errorList, function(key, value) {
            if (value == 'red')
                returnVal = key;
            return returnVal
        });
        return returnVal
    }

    function isAllSignupModalInputValid() {
        var returnVal = !0;
        $.each(errorList, function(key, value) {
            if (value != 'green') {
                returnVal = !1;
                return returnVal
            }
        });
        return returnVal
    }

    function showHidePass(inputboxVal) {
        if (inputboxVal == '')
            $('.show_password').hide();
        else $('.show_password').show()
    }    
    function validateInputs(inputNameId) {
        var value = $(inputNameId).val();        
        var inputName = inputNameId.replace("#input", "");
        var funcName = 'isValid' + inputName;
        if (inputName == 'Username' || inputName == 'Email')
            $.ajax({
                type: 'GET',
                url: '/authenticate/register/',
                data: {
                    'inputName': inputName,
                    'inputVal': value,
                    'is_taken': !1
                },
                dataType: 'json',
                success: function(data) {
                    callback(data.is_taken)
                },
                error: function(xhr) {
                    setNotificationBox("Oops! Something went wrong.", 'fa fa-exclamation-circle')
                }
            });
        else callback(!1);

        function callback(responce) {
            $('#showRegisterErrMsg').empty();
            if (responce || (!validateFunc[funcName](value))) {
                $(inputNameId).addClass('animated shake').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $(inputNameId).removeClass('animated shake')
                });
                $(inputNameId).css({
                    'border': '1px solid red'
                });
                if (responce)
                    if (inputName == 'Email')
                        emailTaken = !0;
                    else usernameTaken = !0;
                else if (emailTaken && inputName == 'Email')
                    emailTaken = !1;
                else if (usernameTaken && inputName == 'Username')
                    usernameTaken = !1;
                $('#showRegisterErrMsg').append(generateErrMsg(inputName));
                errorList[inputName] = 'red'
            } else {
                $(inputNameId).css({
                    'border': '1px solid green'
                });
                errorList[inputName] = 'green';
                var eleName = prevErrMsg();
                if (eleName != '')
                    $('#showRegisterErrMsg').append(generateErrMsg(inputName))
            }
        }
    }
    var fbNotActive = !0;
    $('#fbLogin').on('click', function(e) {
        e.preventDefault();
        checkLoginState()
    });

    function statusChangeCallback(response) {
        if (response.status === 'connected') {
            getFBData()
        } else {
            FB.login(function(response) {
                getFBData()
            }, {
                scope: 'publish_actions'
            })
        }
    }

    function checkLoginState() {
        FB.getLoginStatus(function(response) {
            statusChangeCallback(response)
        })
    }

    function getFBData() {
        FB.api('/me', {
            fields: 'first_name, email, picture.width(200).height(200)'
        }, function(response) {
            picture_url = ''
            if (!response.picture.data.is_silhouette)
                picture_url = response.picture.data.url;            
            $.ajax({
                type: 'GET',
                url: '/authenticate/fb_auth/',
                data: {
                    'username': response.first_name,
                    'email': response.email,
                    'picture_url': picture_url
                },
                dataType: 'json',
                success: function(data) {                    
                    if (data.response) {
                        if (data.response == 'sign in') {
                            $('#inputLoginPassword').val('');
                            $('#inputLoginEmail').val(response.email)
                        } else {
                            $('#signin').trigger('click');
                            setNotificationBox(data.response, 'fa fa-exclamation-circle')
                        }
                    } else {
                        $('#signin').trigger('click');
                        $('#signup').trigger('click');                     
                    }
                },
                error: function() {
                    setNotificationBox('Somethig went wrong.', 'fa fa-exclamation-circle')
                }
            });
        })
    }

    function validateCurrentInput(inputName) {
        inputName = inputName.replace("#input", "");
        if (errorList[inputName] == 'red') {
            $('#showRegisterErrMsg').empty();
            $('#showRegisterErrMsg').append(generateErrMsg(inputName))
        }
    }

    function validateIfValsPresent() {
        email = $('#inputEmail').val();
        username = $('#inputUsername').val();
        password = $('#inputPassword').val();
        confPassword = $('#inputConfirmPasswordPassword').val();
        if (email)
            validateInputs('#inputEmail');
        if (username)
            validateInputs('#inputUsername');
        if (password)
            validateInputs('#inputPassword');
        if (confPassword)
            validateInputs('#inputConfirmPassword')
    }

    function clearModalAndValidate(form) {
        $.ajax({
            type: "GET",
            url: '/authenticate/' + form + '/',
            data: {},
            dataType: 'json',
            success: function(data) {
                if (form == 'register') {
                    setModelToDefault('#signupModal');
                    $('#inputPassword, #inputConfirmPassword').val(data.response);
                    $('#inputUsername').val(data.responseInput1);
                    $('#inputEmail').val(data.responseInput2);
                    if (data.responseInput1)
                        $('#inputEmail, #inputUsername').trigger('change');                    
                    validateIfValsPresent();
                    validateSignUpModal()
                } else {
                    setModelToDefault('#loginModal');
                    $('#inputLoginPassword').val(data.response);
                    $('#inputLoginEmail').val(data.email);
                    validateLoginModal()
                }
            }
        })
    }

    function encript_password(len, last_val) {
        var value = [];
        while (len) {
            value.push("*");
            len--
        }
        value.push(last_val);        
        return value
    }

    function validateSignUpModal() {
        $("#inputEmail, #inputUsername, #inputPassword, #inputConfirmPassword").focusin(function() {
            var $this = '#' + $(this).attr('id');
            validateCurrentInput($this)
        });
        $("#inputEmail, #inputUsername, #inputPassword, #inputConfirmPassword").change(function() {
            var $this = '#' + $(this).attr('id');
            validateInputs($this);
            if ($this == '#inputPassword')
                validateInputs('#inputConfirmPassword');
            if (!$('#showRegisterErrMsg').text().search('Please'))
                $('#showRegisterErrMsg').text('')
        });
        $('#inputPassword').keyup(function() {
            showHidePass($(this).val())
        })
    }

    function validateLoginModal() {
        $('#inputLoginEmail, #inputLoginPassword').change(function() {
            if ($('#showLoginErrMsg').text() != '')
                $('#showLoginErrMsg').text('')
        });
        $('#inputLoginPassword').keyup(function() {
            showHidePass($(this).val())
        })
    }

    function invalidInputs(modalName, modalErrMsgAreaName, errMsg) {
        if (modalName == '#signupModal')
            $(modalName + ' .modal-dialog').addClass('animated jello').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                $(modalName + ' .modal-dialog').removeClass('animated jello')
            });
        if ($(modalErrMsgAreaName).text() == '')
            $(modalErrMsgAreaName).text(errMsg)
    }

    function login_form_event() {
        $('#loginForm').on('submit', function(e) {
            e.preventDefault();            
            if ($('inputLoginEmail').val() == '' || $('inputLoginPassword').val() == '')
                invalidInputs('#loginModal', '#showLoginErrMsg', 'Please fill all the fields with valid inputs.');
            else {
                var email = $('#inputLoginEmail').val();
                var password = $('#inputLoginPassword').val();
                $.ajax({
                    type: "POST",
                    url: "/authenticate/Login/",
                    data: {
                        'email': email,
                        'password': password,
                        csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                    },
                    dataType: 'json',
                    success: function(data) {
                        if (!data.isValidUser)
                            invalidInputs('#loginModal', '#showLoginErrMsg', data.responseMsg);
                        else {
                            if (data.isActive) {
                                $('.modal .close').trigger('click');
                                window.location.replace(data.redirectTo)
                            } else {
                                $('#showLoginErrMsg').text(data.responseMsg);
                                if (!$('#showLoginErrMsg').is(':visible'))
                                    $('#showLoginErrMsg').show()
                            }
                        }
                    },
                    error: function(xhr) {
                        setNotificationBox("Oops! Something went wrong.", 'fa fa-exclamation-circle')
                    }
                })
            }
        })
    }
    login_form_event();
    $("#registerForm").on('submit', function(e) {
        e.preventDefault();
        if (isAllSignupModalInputValid()) {
            initNotificationBox('Sending confirmation link.');
            var username = $('#inputUsername').val();
            var password = $('#inputPassword').val();
            var email = $('#inputEmail').val();
            $.ajax({
                type: 'POST',
                url: "/authenticate/register/",
                data: {
                    'email': email,
                    'username': username,
                    'password': password,
                    csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
                },
                dataType: 'json',
                success: function(data) {
                    setNotificationBox(data.responseMsg, data.responseType);
                    setModelToDefault('#signupModal')
                },
                error: function(xhr) {
                    setNotificationBox("Oops! Something went wrong.", "fa fa-exclamation-circle")
                }
            });
            $('.modal .close').trigger('click')
        } else invalidInputs('#signupModal', '#showRegisterErrMsg', 'Please fill all the fields with valid inputs.')
    });
    $(".modal .close").click(function() {
        var $this = "#" + $(this).parents("div.modal").attr('id');
        if ($($this).hasClass('flipInY in'))
            $($this).removeClass('flipInY in');
        $($this).addClass('flipOutY');
        setTimeout(function() {
            $($this).modal('hide')
        }, 500)
    });
    $("#signupModal, #loginModal, #requirePassModal, #forgotModal").on('show.bs.modal', function() {
        $('body').css({
            'margin-right': '-17px',
            'overflow-y': 'auto',
        })
    });
    $(".modal").on('hidden.bs.modal', function() {
        $('body').css({
            'margin-right': '0px'
        })
    })
})