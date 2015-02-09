(function(){

	'use strict';

	var LightboxBluePrint = function LightboxBluePrint() {
		var lightbox = this;

		this.active = false;

		this.settings = {
			mask: 'lightbox__mask',
			maskActive: 'lightbox__mask--active',
			main: 'lightbox__main',
			file: 'lightbox__file',
			fileVisible: 'lightbox__file--visible',
			center: 'lightbox__center-image',
			title: 'lightbox__title',
			titlePadding: 'lightbox__title__padding',
			exit: 'lightbox__exit',
			prev: 'lightbox__prev',
			next: 'lightbox__next',
			spinner: 'lightbox__spinner',
			spinnerBounce1: 'lightbox__spinner__double-bounce1',
			spinnerBounce2: 'lightbox__spinner__double-bounce2',
			control: 'lightbox__control',
			iconClose: 'icon-close',
			iconArrowLeft: 'icon-arrow-left',
			iconArrowRight: 'icon-arrow-right',
		},

		this.util = {
			findById: function findById(array, idAny, prevOrNextNum) {
				prevOrNextNum = prevOrNextNum || 0;
				// Loop though entire cache and find object with specified id
				for ( var i = 0, len = array.length; i < len; i++ ) {
					if ( array[i].id == idAny ) {
						// Allow for grabing next or previous object insted.
						return array[ i + prevOrNextNum ];
					}
				}
			},
			DOM: function DOM(elementStr, attributesObj, contentNodeOrStr) {
				var contentNodeOrStr = Array.prototype.slice.call(arguments);
				var elementStr = contentNodeOrStr.shift();
				var attributesObj = contentNodeOrStr.shift();

				var elementNode = document.createElement( elementStr );

				for ( var attr in attributesObj ) {
					elementNode[attr] = attributesObj[attr];
				}

				// Append contents
				for ( var i = 0, len = contentNodeOrStr.length; i < len; i++ ) {
					var content = contentNodeOrStr[i];
					content = typeof content === 'string' ? document.createTextNode(content) :
						typeof content === 'object' ? content : null;

					if ( content ) {
						elementNode.appendChild(content);
					}
				}

				return elementNode;
			}
		},

		this.install = function install() {
			if ( document.getElementsByTagName(this.settings.mask).length ) {
				return;
			}

			var body = document.getElementsByTagName('body')[0];
			var lightbox = this.util.DOM('div', { id: this.settings.mask },
				this.util.DOM('div', { id: this.settings.main }),
				this.util.DOM('div', { id: this.settings.exit, className: this.settings.control },
					this.util.DOM('span', { className: this.settings.iconClose })
				),
				this.util.DOM('div', { id: this.settings.prev, className: this.settings.control },
					this.util.DOM('span', { className: this.settings.iconArrowLeft })
				),
				this.util.DOM('div', { id: this.settings.next, className: this.settings.control },
					this.util.DOM('span', { className: this.settings.iconArrowRight })
				)
			);

			body.appendChild(lightbox);
			this.addEventListeners();
		},

		this.addEventListeners = function addEventListeners() {

			// Thumbnail click to open lightbox
			document.getElementById(this.settings.thumbnails)
				.addEventListener('click', function lightboxClickThumbnails(event) {
					if ( event.target && event.target.nodeName == 'IMG' ) {
						lightbox.open(event.target.id);
					}
				});

			// Close button
			document.getElementById(this.settings.exit)
				.addEventListener('click', function lightboxClickExit() {
					lightbox.close();
				});

			// Previous button
			document.getElementById(this.settings.prev)
				.addEventListener('click', function lightboxClickPrev() {
					lightbox.prev();
				});

			// Next button
			document.getElementById(this.settings.next)
				.addEventListener('click', function lightboxClickNext() {
					lightbox.next();
				});

			// Keyboard support
			document.onkeydown = function lightboxKeydown(event) {
				event = event || window.event;
				var code = event.keyCode || event.charCode;

				switch(code) {
				// Esc key.
				case 27:
					lightbox.close();
					break;
				// Left and Up arrows.
				case 37: case 38:
					lightbox.prev();
					break;
				// Right and Down arrows.
				case 39: case 40:
					lightbox.next();
					break;
				}

				// Prevent default behaviour only if user hit a shortcut.
				if ( code === 27 || (code >= 37 && code <= 40)  ) {
					event.preventDefault();
				}
			};

			// Window resize
			window.addEventListener('resize', function lightboxResize() {
				if ( lightbox.active ) {
					lightbox.positionNavigation();
				}
			});
		},

		this.open = function open(idAny) {
			var mask = document.getElementById(this.settings.mask);
			var startingPhoto = idAny ? this.util.findById(this.settings.imageCache, idAny) : this.settings.imageCache[0];

			this.active = true;
			this.displayImage(startingPhoto);
			mask.className = this.settings.maskActive;
		},

		this.close = function close() {
			var mask = document.getElementById( this.settings.mask );
			var regexp = new RegExp('\s*' + this.settings.maskActive, 'gi');

			this.active = false;
			mask.className = mask.className.replace(regexp, '');
		},

		this.prev = function prev() {
			// Get prev image, if this is the first image, loop back to last.
			var imageId = document.getElementsByClassName(this.settings.file)[0].getElementsByTagName('IMG')[0].id;
			var image = this.util.findById(this.settings.imageCache, imageId, -1) || this.settings.imageCache[ this.settings.imageCache.length -1 ];

			this.displayImage(image);
		},

		this.next = function next() {
			// Get next image, if this is the last image, loop back to first.
			var imageId = document.getElementsByClassName(this.settings.file)[0].getElementsByTagName('IMG')[0].id;
			var image = this.util.findById(this.settings.imageCache, imageId, 1) || this.settings.imageCache[0];

			this.displayImage(image);
		},

		this.displayImage = function displayImage(imageObj) {
			var mainContainer = document.getElementById(this.settings.main);
			var image = this.image(imageObj);
			var wrapper = this.util.DOM('div', { className: this.settings.file },
				this.util.DOM('div', { className: this.settings.center }),
				image
			);

			this.loading.show();

			image.onload = function imageLoad() {
				lightbox.loading.hide();

				// Re-position controlls.
				lightbox.positionNavigation();

				// Make image visible.
				wrapper.className += ' ' + lightbox.settings.fileVisible;
			}

			if ( imageObj.title ) {
				var title = this.util.DOM('div', { className: this.settings.title },
					this.util.DOM('div', { className: this.settings.titlePadding }, imageObj.title)
				);

				wrapper.appendChild( title );
			}

			mainContainer.innerHTML = '';
			mainContainer.appendChild( wrapper );
		},

		this.image = function image(photoObj, sizeStr) {
			return this.util.DOM('img', {
				id: photoObj.id,
				src: this.settings.imageUrl(photoObj, sizeStr),
				alt: photoObj.title
			});
		},

		this.loading = {
			show: function loadingShow() {
				var mask = document.getElementById(lightbox.settings.mask);
				var spinner = lightbox.util.DOM('div', { id: lightbox.settings.spinner, className: lightbox.settings.control },
					lightbox.util.DOM('div', { className: lightbox.settings.spinnerBounce1 }),
					lightbox.util.DOM('div', { className: lightbox.settings.spinnerBounce2 })
				);

				mask.appendChild(spinner);
			},
			hide: function loadingShow() {
				var spinner = document.getElementById(lightbox.settings.spinner);

				if (spinner) {
					spinner.parentNode.removeChild(spinner);
				}
			}
		},

		this.positionNavigation = function positionNavigation() {
				var prevControl = document.getElementById(lightbox.settings.prev);
				var nextControl = document.getElementById(lightbox.settings.next);

				if ( lightbox.settings.imageCache.length > 1 ) {
					prevControl.style.display = nextControl.style.display = 'block';
				}

				var controlSize = (document.getElementById(lightbox.settings.next)).offsetWidth;

				var maskWidth = window.innerWidth;
				var maskHeight = window.innerHeight;

				var file = (document.getElementsByClassName(lightbox.settings.file)[0]).getElementsByTagName('IMG')[0];
				var fileWidth = file.offsetWidth;
				var fileHeight = file.offsetHeight;

				var prevPos = ((maskWidth - fileWidth) / 2) - controlSize;
				var nextPos = ((maskWidth + fileWidth) / 2) + controlSize;
				var title = document.getElementsByClassName(lightbox.settings.title)[0];

				// Adjust prev/next icons positions.
				prevControl.style.left = (prevPos > controlSize ? prevPos : controlSize) + 'px';
				nextControl.style.left = (nextPos < maskWidth ? nextPos : maskWidth - controlSize) + 'px';

				// Adjust image title
				if ( title ) {
					title.style.top = (maskHeight - fileHeight)/2 + (fileHeight - title.clientHeight) + 'px';
					title.style.left = title.style.right = file.offsetLeft + 'px';
				}
		}
	}

	function Lightbox(optionsObj) {
		optionsObj = optionsObj || {};

		for ( var opt in optionsObj ) {
			if ( optionsObj.hasOwnProperty(opt) ) {
				this.settings[opt] = optionsObj[opt];
			}
		}

		if ( typeof this.settings.imageCache === 'object' && this.settings.imageCache.length ) {
			this.settings.imageCache = this.settings.imageCache;
		}

		if ( typeof this.settings.thumbnails === 'string' ) {
			var photosContainer = document.getElementById(this.settings.thumbnails);

			for ( var i = 0, len = this.settings.imageCache.length; i < len; i++ ) {
				var photo = this.image(this.settings.imageCache[i], 'thumbnail');

				photosContainer.appendChild(photo);
			}
		}

		this.install();
	}

	Lightbox.prototype = new LightboxBluePrint();

	window.Lightbox = Lightbox;
})();