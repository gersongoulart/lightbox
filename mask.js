// CWBfw Mask jQuery Plug-in
// ----------------------------------------
(function($) {

	'use strict';

	// Pointer to the mask's DOM element.
	var $html = $('html');
	var $mask = $('#mask');
	if ( !$mask.length ) {
		$mask = $('<div id="mask"/>').appendTo('body');
	}

	// Save current use status.
	// Mask's default settings.
	// Background and opacity are empty because their defaults are set via the CSS #mask selector.
	var isMaskOn = 0;
	var latestOptions = {};
	var defaultSettings = {
		background : '',
		opacity : '',
		style : false,
		animate: true,
		publish: true,
		open: false,
		close: false,
		click: false
	};

	function _closeMask(){
		// Check if the mask is actually visible before trying to hide it.
		if( !isMaskOn ) {
			return;
		}

		isMaskOn = isMaskOn - 1;
		if ( isMaskOn < 0 ) {
			isMaskOn = 0;
		}

		// Hide the mask.
		$mask.off()[ latestOptions.animate ? 'fadeOut' : 'hide' ]().empty();

		// Remove the class on the <html> element that indicates the mask is in use.
		$html.removeClass('mask-on');
		latestOptions = {};
	}

	// **$.mask**
	// Turns on the page mask and can, optionally, change mask settings temporarily at this call.
	$.mask = function openMask(options){
		// Make sure the mask is not visible because if it is we do not want to re-launch it.
		if( isMaskOn ) {
			return;
		}

		latestOptions = !options ? defaultSettings : $.extend({}, defaultSettings, options);
		isMaskOn = isMaskOn + 1;
		$mask.off();

		// If there's an option for a callback function when the mask is clicked, set it up here.
		if ( typeof latestOptions.click === 'function' ) {
			$mask.on('click', function(){ latestOptions.click.call($mask, $mask, latestOptions); });
		}

		// If there's an option for a callback function when the mask is loaded, set it up here.
		$mask.one('close', _closeMask);
		if ( typeof latestOptions.close === 'function' ) {
			$mask.one('close', function(){ latestOptions.close.call($mask, $mask, latestOptions); });
		}

		// If there's an option for a callback function when the mask is loaded, set it up here.
		// if ( typeof latestOptions.open === 'function' ) setTimeout(function(){ latestOptions.open($mask); }, 200);
		if ( typeof latestOptions.open === 'function' ) {
			$mask.one('open', function(){ latestOptions.open.call($mask, $mask, latestOptions); });
		}

		// Configure the mask with informed options or the default settings
		if ( typeof latestOptions.style === 'string' ) {
			$mask.attr('style', latestOptions.style);
		}
		else {
			$mask.css({ opacity: latestOptions.opacity, background: latestOptions.background });
		}

		// Add a `class` to the `<html>` element to indicate the mask is in use and allow CSS changes to the page for this state.
		if(latestOptions.publish) {
			setTimeout(function(){ $html.addClass('mask-on'); }, 200);
		}

		// Display the mask.
		return $mask[ latestOptions.animate ? 'fadeIn' : 'show' ]().trigger('open');
	};

	// **$.mask**
	// Turns off the page mask.
	$.mask.off = function closeMask(callback){
		if ( typeof callback === 'function' ) {
			$mask.one('close', function(){ callback.call($mask, $mask); });
		}
		return $mask.trigger('close');
	};

})(window.jQuery||window.Zepto, undefined);