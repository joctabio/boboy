var b_chatid;
var order_id;
var current;
var order;

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

  for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
      }
  }
};

$(document).ready(function(){
    $("#retrieve-item-list").select2({
        placeholder: "Search for an item",
        ajax: {
            url: "modules/orders/ajax.php",
            dataType: 'json',
            quietMillis: 100,
            data: function (term, page) {
                return {
                    term: term, //search term
                    page_limit: 10 // page size
                };
            },
            results: function (data, page) {
                return { results: data.results };
            }

        },
        initSelection: function(element, callback) {
            return $.getJSON("modules/orders/ajax.php?id=" + (element.val()), null, function(data) {

                    return callback(data);

            });
        }

    });
    order_id = getUrlParameter('o');
    function loadOrderItems(order_id){
        var holder = $("#vieworder-ajax-parent");
        $.ajax({
            url: "modules/orders/ajax.php",
            method: "POST",
            data:{
                "order_view":1,
                "order_id":order_id
            },
            dataType: "html",
            success:function(data){
                if(order != data){
                    order = data;
                    holder.html(order);
                }
                //holder.html(data);
                /*
                $("#od-st").html(data["order_total"]);
                $("#od-sf").html(data["custom_fee"]);
                $("#od-tt").html(data["total"]);
                $("#od-noi").html(data["noi"]);
                */
            }
            ,error:function(e){
                //alert("ajax failed");
            }
        });
    }
    $("body").on("click","#btn-close-order", function(){
        $("#modal-order-close").modal();
    });
    $("body").on("click","#ban-brand", function(){
        var id = getUrlParameter('bid');
        $.ajax({
            url: "modules/brands/ban.php",
            method: "POST",
            data:{
                "ban":1,
                "brand_id":id
            },
            success:function(data){
                if(data == "ban_success"){
                    location.reload();
                }
            }
        });
    });
    $("body").on("click","#unban-brand", function(){
        var id = getUrlParameter('bid');
        $.ajax({
            url: "modules/brands/ban.php",
            method: "POST",
            data:{
                "unban":1,
                "brand_id":id
            },
            success:function(data){
                if(data == "unban_success"){
                    location.reload();
                }
            }
        });
    });
    $("body").on("click","#btn-close-order-confirm", function(){
        $.ajax({
            url: "modules/orders/ajax.php",
            method: "POST",
            data:{
                "close_order":1,
                "order_id":order_id
            },
            success:function(data){
                if(data == "close_success"){
                    loadOrderItems(order_id);
                }
            }
        });
    });
    $("body").on("click","#btn-confirm-cancel-order", function(e){
        $(".preloader").show();
        var id = $(this).val();
        $(this).prop("disabled",true);
        $.ajax({
            url: "modules/orders/ajax.php",
            method: "POST",
            data:{
                "delete_order":1,
                "order_id":id
            },
            success:function(data){
                setTimeout(function(){
                    if(data == "delete_success"){
                        window.location = "/admin/?p=orders";
                    }
                    if(data == "delete_failed"){
                        $(".preloader").hide();
                        $("#modal-error").modal();
                    }
                    $(this).prop("disabled",false);
                },0);
            }
        });
    });

    $("body").on("click",".btn-chat", function(e){
        b_chatid = $(this).val();
        if($("#chat-modal").modal()){
            $.ajax({
                url: "modules/chat/ajax.php",
                method: "POST",
                data: {
                    "convert_bid":b_chatid
                },
                success:function(data){
                    $("#chat-modal-title").html(data);
                }
            });
            loadChat(b_chatid);
        }
    });

    $("body").on("click","#tmodal-order-del", function(e){
        var id = $(this).val();
        $("#btn-confirm-cancel-order").val(id);
        $("#modal-order-del").modal();
    });

    $("#loginform").on("submit",function(e){
        e.preventDefault();
        $("#btn-login").prop("disabled",true);
        $.ajax({
            url:"../login/ajax.php",
            method:"POST",
            data:$(this).serialize(),
            success:function(data){
            if(data == "login_success"){
                window.location = "/admin/";
            }
            if(data == "login_failed"){
                alert("Username or password does not exist");
            }
            $("#btn-login").prop("disabled",false);
            }
        });
    });

    $("body").on("click","#del-customer",function(e){
        e.preventDefault();
        $("#modal-customer-del").modal();
    });
    $("body").on("click","#del-brand",function(e){
        e.preventDefault();
        $("#modal-brand-del").modal();
    });

    $("body").on("click","#del-customer-confirm",function(e){
        $(".preloader").show();
        var id = getUrlParameter('id');
        $.ajax({
            url: "modules/users/delete.php",
            method: "POST",
            data:{
                "delete_customer":1,
                "usr_id":id
            },
            success:function(data){
                $(".preloader").fadeOut();
                if(data == "delete_success"){
                    window.location = "/admin/?p=customers";
                }
                if(data == "delete_failed"){
                    $("#modal-error").modal();
                }
            }
        });
    });
    $("body").on("click","#del-brand-confirm",function(e){
        $(".preloader").show();
        var bid = getUrlParameter('bid');        
        $.ajax({
            url: "modules/brands/delete.php",
            method: "POST",
            data:{
                "delete_brand":1,
                "brand_id":bid
            },
            success:function(data){
                $(".preloader").fadeOut();
                if(data == "delete_success"){
                    window.location = "/admin/?p=brands";
                }
                if(data == "delete_failed"){
                    $("#modal-error").modal();
                }
            }
        });
    });
    $("#form-cust-password").on("submit",function(e){
        e.preventDefault();
        $(".preloader").show();
        var id = getUrlParameter('id');
        var data = $(this).serializeArray();
        data.push({name: "usr_id", value: id});
        $.ajax({
            url: "modules/users/password.php",
            method: "POST",
            data: data,
            dataType: "json",
            success:function(data){
                $("#password-input").val("");
                if(data['code'] == "validation_failed"){
                    $("#password-input-error").show();
                }
                if(data['code'] == "update_failed"){
                    $("#modal-error").modal();
                    $("#password-input-error").hide();

                }
                if(data['code'] == "update_success"){
                    $("#customer-password-success").show();
                    setTimeout(function(){
                        $("#customer-password-success").fadeOut();
                    },5000);
                    $("#password-input-error").hide();
                }
                $(".preloader").fadeOut();
            }
        });
    });
    $("#form-brand-password").on("submit",function(e){
        e.preventDefault();
        $(".preloader").show();
        var id = getUrlParameter('bid');
        var data = $(this).serializeArray();
        data.push({name: "brand_id", value: id});
        $.ajax({
            url: "modules/brands/password.php",
            method: "POST",
            data: data,
            dataType: "json",
            success:function(data){
                $("#password-input").val("");
                if(data['code'] == "validation_failed"){
                    $("#password-input-error").show();
                }
                if(data['code'] == "update_failed"){
                    $("#modal-error").modal();
                    $("#password-input-error").hide();

                }
                if(data['code'] == "update_success"){
                    $("#customer-password-success").show();
                    setTimeout(function(){
                        $("#customer-password-success").fadeOut();
                    },5000);
                    $("#password-input-error").hide();
                }
                $(".preloader").fadeOut();
            }
        });
    });
    $("#form-cust-d").on("submit",function(e){
        e.preventDefault();
        $(".preloader").show();
        var id = getUrlParameter('id');
        var data = $(this).serializeArray();
        data.push({name: 'usr_id', value: id});
        $.ajax({
            url: "modules/users/update.php",
            method: "POST",
            data:data,
            dataType: "json",
            success:function(data){
                //alert(data);
                //alert(JSON.stringify(data));
                
                if(data['code'] == "update_success"){
                    $("#customer-update-success").show();
                    $(".page-wrapper").scrollTop(20);
                    setTimeout(function(){
                        $("#customer-update-success").fadeOut();
                    },5000)
                }
                if(data['code'] == "update_failed"){
                    $("#modal-error").modal();
                }
                if(data['code'] == "input_failed"){
                    //alert("higko ang form");
                }
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                      if(data[key] == 0){
                        //$("#"+key).addClass("has-error");
                        $("#"+key+"-error").show();
                      }else{
                        //$("#"+key).removeClass("has-error");
                        $("#"+key+"-error").hide();
                      }
                    }
                }
                
                $(".preloader").fadeOut();
            }
        });
    });

    $("#form-brand-d").on("submit",function(e){
        e.preventDefault();
        $(".preloader").show();
        var id = getUrlParameter('bid');
        var data = $(this).serializeArray();
        data.push({name: 'brand_id', value: id});
        $.ajax({
            url: "modules/brands/update.php",
            method: "POST",
            data:data,
            dataType: "json",
            success:function(data){
                if(data['code'] == "update_success"){
                    $("#brand-update-success").show();
                    setTimeout(function(){
                        $("#brand-update-success").fadeOut();
                    },5000)
                }
                if(data['code'] == "update_failed"){
                    $("#modal-error").modal();
                }
                if(data['code'] == "input_failed"){
                    //alert("higko ang form");
                }
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                      if(data[key] == 0){
                        //$("#"+key).addClass("has-error");
                        $("#"+key+"-error").show();
                      }else{
                        //$("#"+key).removeClass("has-error");
                        $("#"+key+"-error").hide();
                      }
                    }
                }
                $(".preloader").fadeOut();
            }
        });
    });

    $("#form-chat").on("submit",function(e){
        e.preventDefault();
        var msg = $("#chat-input-message").val();
        if(msg == "" || msg == null){
    
        }else{
          var data = $(this).serializeArray();
          data.push({name: 'brand_id', value: b_chatid});
          $("#chat-input-message").val("");
          $.ajax({
            url:"modules/chat/send_message.php",
            method:"POST",
            data: data,
            success:function(data){
                if(data == "message_sent"){
                    loadChat(b_chatid);
                }
                if(data == "message_failed"){
    
                }
            }
          });
        }
    });

    function loadChat(b_chatid){
        var cac = $("#chat-ajax-content");
        $.ajax({
          url: "modules/chat/ajax.php",
          method: "POST",
          data:{
            "chat_content": 1,
            "brand_id":b_chatid
          },
          success: function(data){
            if(current == null || current == ""){
              setTimeout(function() {
                scrollBottomChat();
              }, 500);
            }
            if(current != data) {
              current = data;
              cac.html(data);
              setTimeout(function(){
                scrollBottomChat();
              },100);
            }
          }
        });
    }

    var tblpen = $('#table-pending-orders').DataTable( {
        aaSorting: [[1, 'desc']],
        columnDefs: [
        {   
            "className": ["dt-right"],
            "targets": [3,4]
        }],
        bDeferRender:true,
        responsive:true,
        ajax: {
            url: "modules/orders/pending.php",
            type: "POST"
        },
        rowId: 'order_id',
        columns:[
            { "data": "order_id"},
            { "data": "datetime"},
            { "data": "customer"},
            { "data": "price"},
            { "data": "status" }
        ],
        oLanguage:{
            sProcessing: "Loading orders",
            sZeroRecords: "No orders"
        }
    });

    var tblcust = $('#table-customers').DataTable( {
        aaSorting: [[0, 'desc']],
        columnDefs: [
        {   
            "className": ["dt-right"],
            "targets": [3,4]
        }],
        ajax: {
            url: "modules/users/customers.php",
            type: "POST"
        },
        rowId: 'usr_id',
        columns:[
            { "data": "name"},
            { "data": "email"},
            { "data": "address"},
            { "data": "contact"},
            { "data": "status" }
        ],
        oLanguage:{
            sProcessing: "Loading",
            sZeroRecords: "No Customers"
        }
    });

    var tblbrands = $('#table-brands').DataTable( {
        aaSorting: [[0, 'desc']],
        columnDefs: [
        {   
            "className": ["dt-right"],
            "targets": [3,4]
        }],
        ajax: {
            url: "modules/brands/partners.php",
            type: "POST"
        },
        rowId: 'brand_id',
        columns:[
            { "data": "name"},
            { "data": "email"},
            { "data": "address"},
            { "data": "contact"},
            { "data": "status" }
        ],
        oLanguage:{
            sProcessing: "Loading",
            sZeroRecords: "No Brands"
        }
    });

    setInterval( function () {
        tblpen.ajax.reload();
        tblcust.ajax.reload();
        tblbrands.ajax.reload();
    }, 5000 );
    
    function scrollBottomChat(){
        $(".chat-panel-body").animate({ scrollTop: $('.chat-panel-body').prop("scrollHeight")}, 250);
    };

    $('#table-pending-orders').on( 'click', 'tr', function () {
        // Get the rows id value
        var id = tblpen.row( this ).id();
        // Filter for only numbers
        id = id.replace(/\D/g, '');
        // Transform to numeric value
        id = parseInt(id, 10);
        // Redirect to order details page
        window.location = "/admin/?p=orders&o="+id;
        //alert( 'Clicked row id '+id );
    });

    $('#table-customers').on( 'click', 'tr', function () {
        // Get the rows id value
        var id = tblcust.row( this ).id();
        // Filter for only numbers
        id = id.replace(/\D/g, '');
        // Transform to numeric value
        id = parseInt(id, 10);
        // Redirect to order details page
        window.location = "/admin/?p=customers&id="+id;
        //alert( 'Clicked row id '+id );
    });

    $('#table-brands').on( 'click', 'tr', function () {
        // Get the rows id value
        var id = tblbrands.row( this ).id();
        // Filter for only numbers
        id = id.replace(/\D/g, '');
        // Transform to numeric value
        id = parseInt(id, 10);
        // Redirect to order details page
        window.location = "/admin/?p=brands&bid="+id;
        //alert( 'Clicked row id '+id );
    });

    
    
    // Realtime Dynamic Refresh
    (function realtimeCheck() {
        loadOrderItems(order_id);
       setTimeout(realtimeCheck, 5000);
    }());
});

/*
Template Name: Monster Admin
Author: Themedesigner
Email: niravjoshi87@gmail.com
File: js
*/
$(function() {
    "use strict";
    $(function() {
        $(".preloader").fadeOut();
    });
    jQuery(document).on('click', '.mega-dropdown', function(e) {
        e.stopPropagation()
    });
    // ============================================================== 
    // This is for the top header part and sidebar part
    // ==============================================================  
    var set = function() {
        var width = (window.innerWidth > 0) ? window.innerWidth : this.screen.width;
        var topOffset = 70;
        if (width < 500) {
            $("body").addClass("mini-sidebar");
            $('.navbar-brand span').hide();
            $(".scroll-sidebar, .slimScrollDiv").css("overflow-x", "visible").parent().css("overflow", "visible");
            $(".sidebartoggler i").addClass("ti-menu");
        } else {
            $("body").removeClass("mini-sidebar");
            $('.navbar-brand span').show();
            $(".sidebartoggler i").removeClass("ti-menu");
        }

        var height = ((window.innerHeight > 0) ? window.innerHeight : this.screen.height) - 1;
        height = height - topOffset;
        if (height < 1) height = 1;
        if (height > topOffset) {
            $(".page-wrapper").css("min-height", (height) + "px");
        }

    };
    $(window).ready(set);
    $(window).on("resize", set);

    // topbar stickey on scroll

    $(".fix-header .topbar").stick_in_parent({

    });

    // this is for close icon when navigation open in mobile view
    $(".nav-toggler").click(function() {
        $("body").toggleClass("show-sidebar");
        $(".nav-toggler i").toggleClass("ti-menu");
        $(".nav-toggler i").addClass("ti-close");
    });
    $(".sidebartoggler").on('click', function() {
        $(".sidebartoggler i").toggleClass("ti-menu");
    });

    // ============================================================== 
    // Auto select left navbar
    // ============================================================== 
    $(function() {
        var url = window.location;
        var element = $('ul#sidebarnav a').filter(function() {
            return this.href == url;
        }).addClass('active').parent().addClass('active');
        while (true) {
            if (element.is('li')) {
                element = element.parent().addClass('in').parent().addClass('active');
            } else {
                break;
            }
        }
    });

    // ============================================================== 
    // Sidebarmenu
    // ============================================================== 
    $(function() {
        $('#sidebarnav').metisMenu();
    });
    // ============================================================== 
    // Slimscrollbars
    // ============================================================== 
    $('.scroll-sidebar').slimScroll({
        position: 'left',
        size: "5px",
        height: '100%',
        color: '#dcdcdc'
    });

    // ============================================================== 
    // Resize all elements
    // ============================================================== 
    $("body").trigger("resize");
});

