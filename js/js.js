jQuery(document).ready(function ($) {

	// Cache some variables
	var links = $('.navigation').find('li');
	var slide = $('.slide');
	var button = $('.button');
	var mywindow = $(window);
	var htmlbody = $('html,body');

	// hide loading graphic once everything has loaded
	mywindow.bind("load", function() {
		$('#loadingDiv').hide();
	});
	
	// initialize Stellar.js
	$(window).stellar();

	// Setup waypoints plugin
	slide.waypoint (function (direction) {
		var dataslide = $(this).attr('data-slide');

		//If the user scrolls up change the navigation link that has the same data-slide attribute as the slide to active and 
		//remove the active class from the previous navigation link 
		if (direction === 'up') {
			$('.navigation li[data-slide="' + (dataslide-1) + '"]').addClass('active').siblings().removeClass('active');
		}
        // else if the user scrolls down change the navigation link that has the same data-slide attribute as the slide to active and 
        //remove the active class from the next navigation link 
		else {
			$('.navigation li[data-slide="' + dataslide + '"]').addClass('active').siblings().removeClass('active');
		}
	});

	// waypoints doesn't detect the first slide when user scrolls up to the top, so we add this code that removes the class from navigation link slide 2 and adds it to navigation link slide 1.
	mywindow.scroll(function() {
		if (mywindow.scrollTop() === 0) {
			$('.navigation li[data-slide="1"]').addClass('active').siblings().removeClass('active');
		}
	});

	// Create a function that will be passed a slide number and then will scroll to that slide using jquery animate. The easing plugin is also used, so we passed in the easing method of 'easeInOutQuint' which is available through the plugin.
	function goToByScroll(dataslide) {
		htmlbody.animate({scrollTop: $('.slide[data-slide="' + dataslide + '"]').offset().top}, 2000, 'easeInOutQuint');
	}

	// When the user clicks on the navigation links, get the data-slide attr value of the link and pass that to the goToByScroll function
	links.click(function(e) {
		e.preventDefault();
		var dataslide = $(this).attr('data-slide');
		goToByScroll(dataslide);
	});

	// When the user clicks on the nav link, get the data-slide attr value of the button and pass that variable to goToByScroll 
	button.click(function (e) {
		e.preventDefault();
		var dataslide = $(this).attr('data-slide');
		goToByScroll(dataslide);
	});

	// respond to user answering a question
	$('.answers').on('submit', function(e) {
		var whichSlide = $(this).attr('data-form');
		checkQuestion(whichSlide);
		e.preventDefault();
	});

	// Make a structure to keep track of which questions have been answered	
	var answerCheck = {};
	$.each($('.slide'),function() {
		my_id = $(this).data('slide');
		if ($(this).find('.answers').length) {    // slide has question
			answerCheck[my_id] = "unanswered";
		} else {                                  // slide doesn't have question
			answerCheck[my_id] = "NA";
		}
	});

	function checkQuestion(i) {
		var theAnswer = $('#slide' + i + ' input[type="radio"]:checked').val();
		answerCheck[i] = "answered";
		var skipped = [];

		// Update list of unanswered questions
		for(var q in answerCheck) {
			if (answerCheck[q] === "unanswered") {
				skipped.push(q);
			}
		}

		// if skipped is empty, set the value of the answerCheck form field to 1
		if (skipped.length === 0) {
			$('#answerCheck').val(1);
		}

		// Update the validation message so that if not all the questions are answered, the user will be told which were skipped.
	    $('input[name="answerCheck"]').rules('add', {
	    	required: true,
	    	min: 1,
	    	messages: {
	    		min: "You didn't answer questions: " + skipped.join(', ') + "."
	    	}
	    });

		if (theAnswer === 'right') {
			$('#slide' + i + ' .rightResponse').show().siblings().filter('div').hide();
		} else if (theAnswer === 'wrong') {
			$('#slide' + i + ' .wrongResponse').show().siblings().filter('div').hide();
		} else {
			alert('Oops! You forgot to answer the question.');
		}
	}

	// Modal window stuff
    $('.cb-modal').colorbox({
        iframe: true, 
        innerHeight: '70%', 
        innerWidth: '50%',
        opacity: 0.2,
        scalePhotos: true,
        href: function() {
            return $(this).attr('src');
        }
    });

    $('.cb-modal').hover(
        function() {
            $(this).css('z-index','5');
        }, function() {
            $(this).css('z-index','2');
        }
    );

    // form validation
    $('#mailForm').validate({
    	rules: {
    		answerCheck: {
    			required: true,
				min: 1
    		}
    	},
    	submitHandler: function() {
    		var dataString = $('#mailForm').serialize();
    		$.ajax({
    			type: "POST",
    			url: "../tut_mail.php",
    			data: dataString,
    			success: function() {
    				$('#confirmationMessage').html('<span>Your email has been sent.</span>');
    				$('#mailForm input[type="text"]').val('');
    			}
    		});
    	}
    });


});