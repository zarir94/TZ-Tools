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
 