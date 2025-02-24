(function ($) {
  "use strict";
  var showRegisterLoginModal = function () {
    // class display-pop-login is custom class in Appearance menu
    $(".display-pop-login").on("click", function (e) {
      e.preventDefault();
      if (user_script_variables.enable_login_popup == "y") {
        $("#tfcl_login_register_modal").modal("show");
        resetLoginModal();
      } else if ($(this).hasClass('login')) {
        window.location.href = user_script_variables.login_page;
      } else if ($(this).hasClass('register')) {
        window.location.href = user_script_variables.register_page;
      } else {
        window.location.href = window.location.href;
      }
    });
  }

  var show_thumbnail_form = function () {
    if ($(".tfcl-login-form").length > 0) {
        $(".tfcl-login-form .modal-content .tfcl_login_redirect_button, .display-pop-login, .display-pop-login.login").click(function () {
            $(this).closest("body").find('.thumb-login').show();
            $(this).closest("body").find('.thumb-register').hide();
        });

        $(".tfcl-login-form .modal-content .tfcl_register_button, .display-pop-login.register").click(function () {
            $(this).closest("body").find('.thumb-register').show();
            $(this).closest("body").find('.thumb-login').hide();
        });

    }
};

  var resetLoginModal = function () {
    var registerSection = document.getElementById("tfcl_register_section");
    var loginSection = document.getElementById("tfcl_login_section");
    var resetSection = document.getElementById("tfcl-reset-password-section");
    loginSection.style.display = "block";
    registerSection.style.display = "none";
    resetSection.style.display = "none";
  }

  var redirectLogin = function () {
    var registerSection = document.getElementById("tfcl_register_section");
    var loginSection = document.getElementById("tfcl_login_section");
    var resetSection = document.getElementById("tfcl-reset-password-section");

    $(".tfcl_login_redirect, .display-pop-login.login").on("click", function () {
      loginSection.style.display = "block";
      registerSection.style.display = "none";
      resetSection.style.display = "none";
    });

    $("#tfcl_register_redirect, .display-pop-login.register").on("click", function () {
      loginSection.style.display = "none";
      registerSection.style.display = "block";
      resetSection.style.display = "none";
    });

    $("#tfcl-reset-password").on("click", function () {
      loginSection.style.display = "none";
      registerSection.style.display = "none";
      resetSection.style.display = "block";
    });
  }

  var handleRegister = function () {
    $("#tfcl_custom-register-form").on("submit", function (e) {
      e.preventDefault();
      $(".tfcl_registration-form").validate({
        errorElement: "span",
        rules: {
          username: {
            required: true,
            minlength: 3,
          },
          email: {
            required: true,
            pattern: /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,10}$/,
          },
          password: {
            required: true,
          },
          confirm_password: {
            required: true,
          },
        },
        messages: {
          username: "",
          email: "",
          password: "",
          confirm_password: "",
        },
      });
      var form = $(this);
      var formData = form.serialize();
      var $messages = $(this)
        .parents(".tfcl_registration-form")
        .find(".tfcl_message");
      if (form.valid()) {
        $.ajax({
          type: "POST",
          url: user_script_variables.ajaxUrl,
          data:
            formData +
            "&action=register_new_user&security=" +
            user_script_variables.nonce,
          beforeSend: function () {
            $messages
              .empty()
              .append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
          },
          success: function (response) {
            // Handle the registration success response
            if (response.status) {
              $messages
                .empty()
                .append(
                  '<span class="success text-success"><i class="fa fa-check"></i> ' +
                  response.message +
                  "</span>"
                );

              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              $messages
                .empty()
                .append(
                  '<span class="error text-danger"><i class="fa fa-close"></i> ' +
                  response.message +
                  "</span>"
                );
            }
          },
          error: function (xhr, status, error) {
            // Handle the registration error response
            console.log(error);
          },
        });
      }
    });
  }

  var handleLogin = function () {
    $("#tfcl_custom-login-form").on("submit", function (e) {
      e.preventDefault();
      $(".tfcl_login-form").validate({
        errorElement: "span",
        rules: {
          username: {
            required: true,
            minlength: 3,
          },
          password: {
            required: true,
          },
        },
        messages: {
          username: "",
          password: "",
        },
      });
      var form = $(this);
      var formData = form.serialize();
      var $messages = $(this).parents(".tfcl_login-form").find(".tfcl_message");

      if (form.valid()) {
        $.ajax({
          type: "POST",
          url: user_script_variables.ajaxUrl,
          data:
            formData +
            "&action=user_login&security=" +
            user_script_variables.nonce,
          beforeSend: function () {
            $messages
              .empty()
              .append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
          },
          success: function (response) {
            // Handle the registration success response
            if (response.status) {
              window.location.href = response.redirect_url;
            } else {
              $messages
                .empty()
                .append(
                  '<span class="error text-danger"><i class="fa fa-close"></i> ' +
                  response.message +
                  "</span>"
                );
            }
          },
          error: function (xhr, status, error) {
            // Handle the registration error response
            console.log(error);
          },
        });
      }
    });
  }

  var togglePassword = function () {
    $(".togglepassword.login, .togglepassword.register").click(function (e) {
      e.preventDefault();
      if (
        $(this).closest(".show_hide_password").find(".password").attr("type") ==
        "text"
      ) {
        $(this)
          .closest(".show_hide_password")
          .find(".password")
          .attr("type", "password");
        $(this).addClass("icon-autodeal-view");
        $(this).removeClass("icon-autodeal-view-hide");
      } else if (
        $(this).closest(".show_hide_password").find(".password").attr("type") ==
        "password"
      ) {
        $(this)
          .closest(".show_hide_password")
          .find(".password")
          .attr("type", "text");
        $(this).removeClass("icon-autodeal-view");
        $(this).addClass("icon-autodeal-view-hide");
      }
    });
  }

  var toggleConfirmPassword = function () {
    $("#toggleConfirmPassword").click(function (e) {
      e.preventDefault();
      if (
        $(this)
          .closest("#show_hide_confirm_password")
          .find("#confirm_password, #confirm_pass")
          .attr("type") == "text"
      ) {
        $(this)
          .closest("#show_hide_confirm_password")
          .find("#confirm_password, #confirm_pass")
          .attr("type", "password");
        $(this).addClass("icon-autodeal-view");
        $(this).removeClass("icon-autodeal-view-hide");
      } else if (
        $(this)
          .closest("#show_hide_confirm_password")
          .find("#confirm_password, #confirm_pass")
          .attr("type") == "password"
      ) {
        $(this)
          .closest("#show_hide_confirm_password")
          .find("#confirm_password, #confirm_pass")
          .attr("type", "text");
        $(this).removeClass("icon-autodeal-view");
        $(this).addClass("icon-autodeal-view-hide");
      }
    });
  }

  var toggleNewPassword = function () {
    $("#toggleNewPass").click(function () {
      if (
        $(this).closest("#show_hide_new_pass").find("#new_pass").attr("type") ==
        "text"
      ) {
        $(this)
          .closest("#show_hide_new_pass")
          .find("#new_pass")
          .attr("type", "password");
        $(this).addClass("icon-autodeal-view");
        $(this).removeClass("icon-autodeal-view-hide");
      } else if (
        $(this).closest("#show_hide_new_pass").find("#new_pass").attr("type") ==
        "password"
      ) {
        $(this)
          .closest("#show_hide_new_pass")
          .find("#new_pass")
          .attr("type", "text");
        $(this).removeClass("icon-autodeal-view");
        $(this).addClass("icon-autodeal-view-hide");
      }
    });
  }

  var toggleOldPassword = function () {
    $("#toggleOldPass").click(function () {
      if (
        $(this).closest("#show_hide_old_pass").find("#old_pass").attr("type") ==
        "text"
      ) {
        $(this)
          .closest("#show_hide_old_pass")
          .find("#old_pass")
          .attr("type", "password");
        $(this).addClass("icon-autodeal-view");
        $(this).removeClass("icon-autodeal-view-hide");
      } else if (
        $(this).closest("#show_hide_old_pass").find("#old_pass").attr("type") ==
        "password"
      ) {
        $(this)
          .closest("#show_hide_old_pass")
          .find("#old_pass")
          .attr("type", "text");
        $(this).removeClass("icon-autodeal-view");
        $(this).addClass("icon-autodeal-view-hide");
      }
    });
  }

  var resetPassword = function () {
    $('.tfcl_forgetpass').on('click', function (e) {
      e.preventDefault();
      var $form = $(this).parents('form');
      $.ajax({
        type: 'post',
        url: user_script_variables.ajaxUrl,
        dataType: 'json',
        data: $form.serialize(),
        beforeSend: function () {
          $('.tfcl_messages_reset_password').empty().append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
        },
        success: function (response) {
          if (response.success) {
            $('.tfcl_messages_reset_password').empty().append('<span class="success text-success"><i class="fa fa-check"></i> ' + response.message + '</span>');
          } else {
            $('.tfcl_messages_reset_password').empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
          }
        }
      });
    });
  }

  var handleProfileUpdate = function () {
    $('#tfcl_profile_submit').on('click', function (e) {
      e.preventDefault();
      var form = $('#tfcl_profile-form');
      var formData = form.serialize();
      var $messages = form.find('.tfcl_message');
      if (form.valid()) {
        $.ajax({
          type: 'POST',
          url: user_script_variables.ajaxUrl,
          data: formData + '&action=profile_update&security=' + user_script_variables.nonce,
          beforeSend: function () {
            $messages.empty().append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
          },
          success: function (response) {
            // Handle the registration success response

            if (response.status) {
              $messages.empty().append('<div class="tfcl-message alert alert-success" role="alert"><span class="success text-success"><i class="fa fa-check"></i> ' + response.message + '</span></div>');
            } else {
              $messages.empty().append('<div class="tfcl-message alert alert-danger" role="alert"><span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span></div>');
            }
          },
          error: function (xhr, status, error) {
            // Handle the registration error response
            console.log(error);
          }
        });
      }
    });
  }

  var uploadDealerPoster = function () {
    $('#tfcl_dealer_poster').on('change', function () {
      var formData = new FormData();
      formData.append('tfcl_dealer_poster', this.files[0]);
      formData.append('action', 'dealer_upload_poster');
      $.ajax({
        url: user_script_variables.ajaxUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.status) {
            $('img#tfcl_dealer_poster_thumb').each(function () {
              $(this).attr('src', response.dealer_poster_url);
            })
          } else {
            $('img#tfcl_dealer_poster_thumb').each(function () {
              $(this).attr('src', '');
            })
          }
        }
      });
    });
  }

  var checkFieldRequired = function (field_required) {
    return (field_required == true);
  }

  var validateProfileForm = function () {
    var formParent = $(".tfcl_profile");
    var first_name = user_script_variables.required_profile_fields.first_name,
      last_name = user_script_variables.required_profile_fields.last_name,
      user_email = user_script_variables.required_profile_fields.user_email,
      user_phone = user_script_variables.required_profile_fields.user_phone,
      user_facebook = user_script_variables.required_profile_fields.user_facebook,
      user_twitter = user_script_variables.required_profile_fields.user_twitter,
      user_instagram = user_script_variables.required_profile_fields.user_instagram,
      user_linkedin = user_script_variables.required_profile_fields.user_linkedin,
      user_dribble = user_script_variables.required_profile_fields.user_dribble,
      user_skype = user_script_variables.required_profile_fields.user_skype;

    formParent.validate({
      ignore: ":hidden", // any children of hidden desc are ignored
      errorElement: "div", // wrap error elements in span not label
      invalidHandler: function (event, validator) { // add aria-invalid to el with error
        $.each(validator.errorList, function (idx, item) {
          if (idx === 0) {
            $(item.element).focus(); // send focus to first el with error
          }
          $(item.element).attr("aria-invalid", true); // add invalid aria
          $(item.element).addClass('is-invalid');
        })

      },
      highlight: function (element, errorClass, validClass) {
        var elem = $(element);
        elem.addClass(errorClass).removeClass(validClass);
        elem.addClass('is-invalid').removeClass('is-valid');
      },
      unhighlight: function (element, errorClass, validClass) {
        var elem = $(element);
        elem.removeClass(errorClass).addClass(validClass);
        elem.removeClass('is-invalid').addClass('is-valid');

      },
      rules: {
        first_name: {
          required: checkFieldRequired(first_name),
        },
        last_name: {
          required: checkFieldRequired(last_name),
        },
        user_email: {
          required: checkFieldRequired(user_email)
        },
        user_phone: {
          required: checkFieldRequired(user_phone)
        },
        user_instagram: {
          required: checkFieldRequired(user_instagram)
        },
        user_dribble: {
          required: checkFieldRequired(user_dribble)
        },
        user_skype: {
          required: checkFieldRequired(user_skype)
        },
        user_facebook: {
          required: checkFieldRequired(user_facebook),
        },
        user_twitter: {
          required: checkFieldRequired(user_twitter),
        },
        user_linkedin: {
          required: checkFieldRequired(user_linkedin),
        },
      },
      messages: {
        first_name: "",
        last_name: "",
        user_email: "",
        user_phone: "",
        user_instagram: "",
        user_dribble: "",
        user_skype: "",
        user_facebook: "",
        user_twitter: "",
        user_linkedin: "",
      },
      submitHandler: function (form) {
        var formData = $(form).serialize();
        var $messages = $(this).parents('.tfcl_profile-form').find('.tfcl_message');

        $.ajax({
          type: 'POST',
          url: user_script_variables.ajaxUrl,
          data: formData + '&action=profile_update&security=' + user_script_variables.nonce,
          beforeSend: function () {
            $messages.empty().append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
          },
          success: function (response) {
            if (response.status) {
              $messages.empty().append('<span class="success text-success"><i class="fa fa-check"></i> ' + response.message + '</span>');

            } else {
              $messages.empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
            }
          },
          error: function (xhr, status, error) {
            console.log(error);
          }
        });
      }
    });
  }

  var onCheckedAgreeTermCondition = function () {
    $('#agree_term_condition').on('change', function (e) {
      $(this).val(e.target.checked);
    })
  }

  var handleResetProfileForm = function () {
    $('#tfcl_profile_reset').click(function () {
      var confirmed = confirm(user_script_variables.confirm_reset_profile_form_text);
      if (confirmed) {
        $('#tfcl_profile-form input').each(function () {
          var input = $(this);
          if (input.attr('type') == 'radio' || input.attr('type') == 'checkbox') {
            input.removeAttr('checked').removeAttr('selected');
          } else {
            input.attr('value', '');
          }
        });
      }
    });
  }

  var handleUploadAvatar = function () {
    $('#tfcl_avatar, #tfcl_avatar_poster').on('change', function () {
      var formData = new FormData();
      formData.append('tfcl_avatar', this.files[0]);
      formData.append('action', 'upload_avatar');
      $("#txtPath").val(this.files[0]['name']);
      $.ajax({
        url: user_script_variables.ajaxUrl,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          if (response.status) {
            $('img#tfcl_avatar_thumbnail').each(function () {
              $(this).attr('src', response.avatar_url);
            })
          } else {
            $('img#tfcl_avatar_thumbnail').each(function () {
              $(this).attr('src', '');
            })
          }
        }
      });
    });
  }

  var handleChangePassword = function () {
    $("#tfcl_change_pass").on('click', function () {
      var security_change_password, old_pass, new_pass, confirm_pass;
      var $this = $(this);
      var $form = $this.parents('form');
      old_pass = $("#old_pass").val();
      new_pass = $("#new_pass").val();
      confirm_pass = $("#confirm_pass").val();
      security_change_password = $("#tfcl_security_change_password").val();
      var $messages = $(this).parents('.tfcl-change-password').find('.tfcl_message');
      if ($form.valid()) {
        $.ajax({
          type: 'POST',
          dataType: 'json',
          url: user_script_variables.ajaxUrl,
          data: {
            'action': 'change_password',
            'old_pass': old_pass,
            'new_pass': new_pass,
            'confirm_pass': confirm_pass,
            'tfcl_security_change_password': security_change_password
          },
          beforeSend: function () {
            $messages.empty().append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
          },
          success: function (response) {
            if (response.success) {
              $messages.empty().append('<span class="success text-success"><i class="fa fa-check"></i> ' + response.message + '</span>');

              setTimeout(() => {
                window.location.reload();
              }, 1000);
            } else {
              $messages.empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
            }
          },
          error: function (xhr, status, error) {
            // Handle the registration error response
            console.log(error);
          }
        });
      }
    });
  }

  var handleBecomeDealer = function () {
    $('#tfcl_become_dealer').on('click', function () {
      var confirmed = confirm(user_script_variables.confirm_become_dealer_text);
      var $messages = $(this).parents('.tfcl_profile-form').find('.tfcl_dealer_message');
      if (confirmed) {
        $.ajax({
          type: 'post',
          url: user_script_variables.ajaxUrl,
          dataType: 'json',
          data: {
            'action': 'become_dealer',
            'security': user_script_variables.nonce
          },
          beforeSend: function () {
            $messages.empty().append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
          },
          success: function (response) {
            if (response.status) {
              $messages.empty().append('<span class="success text-success"><i class="fa fa-check"></i> ' + response.message + '</span>');
              setTimeout(() => {
                window.location.reload();
              }, 300);
            } else {
              $messages.empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
            }
          },
          error: function () {
            // Handle the registration error response
            $messages.empty();
            console.log(error);
          }
        });
      }
    });
  }

  var handleLeaveDealer = function () {
    $('#tfcl_remove_dealer').on('click', function () {
      var confirmed = confirm(user_script_variables.confirm_leave_dealer_text);
      var $messages = $(this).parents('.tfcl_profile-form').find('.tfcl_dealer_message');
      if (confirmed) {
        $.ajax({
          type: 'post',
          url: user_script_variables.ajaxUrl,
          dataType: 'json',
          data: {
            'action': 'leave_dealer',
            'security': user_script_variables.nonce
          },
          beforeSend: function () {
            $messages.empty().append('<span class="success text-success"> Loading <i class="fa fa-spinner fa-spin"></i></span>');
          },
          success: function (response) {
            if (response.status) {
              $messages.empty().append('<span class="success text-success"><i class="fa fa-check"></i> ' + response.message + '</span>');
              setTimeout(() => {
                window.location.reload();
              }, 300);
            } else {
              $messages.empty().append('<span class="error text-danger"><i class="fa fa-close"></i> ' + response.message + '</span>');
            }
          },
          error: function () {
            $messages.empty();
            // Handle the registration error response
            console.log(error);
          }
        });
      }
    });
  }

  var handleLoginGoogle = function () {
    $.ajax({
      type: 'post',
      url: user_script_variables.ajaxUrl,
      dataType: 'json',
      data: {
        'action': 'google_login_ajax',
        'security': user_script_variables.nonce
      },
      success: function (response) {
        if (response.status) {
          window.location.href = response.redirect_url;
        }
      },
      error: function (error) {
        // Handle the registration error response
        console.log(error);
      }
    });
  }

  var setAccessTokenGoogle = function () {
    var urlParams = new URLSearchParams(window.location.search); //get all parameters
    var code = urlParams.get('code');
    if (code) {
      $.ajax({
        type: 'post',
        url: user_script_variables.ajaxUrl,
        dataType: 'json',
        data: {
          'action': 'set_access_token_google',
          'security': user_script_variables.nonce,
          'code': code
        },
        success: function (response) {
          if (response.status) {
            handleLoginGoogle()
          }
        },
        error: function (error) {
          // Handle the registration error response
          console.log(error);
        }
      });
    }
  }

  $(document).ready(function () {
    showRegisterLoginModal();
    redirectLogin();
    handleRegister();
    handleLogin();
    setAccessTokenGoogle();
    togglePassword();
    toggleConfirmPassword();
    toggleNewPassword();
    toggleOldPassword();
    resetPassword();
    handleProfileUpdate();
    validateProfileForm();
    show_thumbnail_form();
    onCheckedAgreeTermCondition();
    handleResetProfileForm();
    handleUploadAvatar();
    handleChangePassword();
    handleBecomeDealer();
    handleLeaveDealer();
    uploadDealerPoster();
  });
})(jQuery);