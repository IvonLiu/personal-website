$( document ).ready(function() {
    $(".aybell-overlay").hide();
    $(".aybell-launch").click(function (e) {
        e.preventDefault();
        $(".aybell-overlay").fadeIn('fast');
    });
    $(".aybell-close").click(function () {
        $('.aybell-overlay').fadeOut("fast");
    });
});