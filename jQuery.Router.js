/**
*	@project: jQuery.Router class
*	@description: a simple and auto-setup AJAX + History API site manager
*	@author: Laser Design Studio
*/
(function($) {
	jQuery.Router = function(options) {
		var router = {};
		var settings = $.extend({
				pageFolder: 'pages/',
				target: '#pearl',
				loadTarget: null,
				contentWrap: '',
				titleSeparator: '|',
				mainMenu: '#main-menu',
				menuItemsSelector: 'li',
				menuAnchorsSelector: 'a',
				homeAsReset: false,
				parametersName: {},
				setupFunctions: {},
				onUnload: function() {},
				onLoad: function() {}
			}, options);
		var routes = {};
		var root = $('base').eq(0).attr('href') || '/';
		var siteTitle = document.title;
		// Elements cache
		var $targetContainer = $(settings.target);
		var $mainMenuAnchors = $(settings.mainMenu + ' ' + settings.menuAnchorsSelector);
		var $mainMenuItems = (settings.menuItemsSelector == '')
			? $mainMenuAnchors
			: $(settings.mainMenu + ' ' + settings.menuItemsSelector);
		
		// Setup HTML5 history funcitonality and plan routes
		$mainMenuAnchors
			.each(function(index) {
				var $this = $(this),
					$item = (settings.menuItemsSelector == '') ? $this : $this.children(settings.menuItemsSelector),
					routeName = $this.attr('href').replace(root, '') || 'home';
				
				// Attach click event on mainmenu links
				$this.click(function(e) {
					e.preventDefault();
					//if ($item.hasClass('active')) return false;
					if ($this.attr('href') == document.location.pathname.replace(root, ''))
						return false;
					// Push anchor state
					history.pushState({'route': routeName}, '', $this.attr('href'));
					router.load();
				});
				
				// Write route info
				routes[routeName] = {
					elem: $item,
					title: $item.text(),
					url: routeName + '.php',
					scrollAxis: $this.data('scroll-axis') || 'y',
					pageSetup: settings.setupFunctions[routeName] || null
				};
			});
		
		// URL manager
		router.replaceAppend = function(url) {
			history.replaceState(history.state, '', root + history.state.route + '/' + url);
		};
		
		// Page loader
		router.load = function() {
			var currentPath = document.location.pathname.replace(root, ''),
				route = routes[currentPath];
			
			if (route !== undefined) {
				var pathNames = document.location.pathname.replace(root, '').split('/'),
					parametersName = settings.parametersName[currentPath],
					postData = {};
			} else {
				var pathNames = document.location.pathname.replace(root, '').split('/'),
					currentPath = pathNames[0] || 'home',
					route = routes[currentPath],
					parametersName = settings.parametersName[currentPath],
					postData = {};
			}
			
			// Check if route exist, else "redirect" to home
			if (route === undefined) {
				history.pushState({'route': 'home'}, '', root);
				router.load();
				return false;
			}
			
			// Manage .active menu-item
			$mainMenuItems.removeClass('active');
			route.elem.addClass('active');
			// Manage title
			if (settings.homeAsReset && currentPath == 'home')
				document.title = siteTitle;
			else
				document.title = siteTitle + ' ' + settings.titleSeparator + ' ' + route.title;
			
			// If homeAsReset call onUnload and exit
			if (settings.homeAsReset && currentPath == 'home') {
				settings.onUnload(currentPath, route);
				return false;
			}
			
			// Build post data object (if needed)
			if (pathNames.slice(1).length)
				$.each(pathNames.slice(1), function(index, parameter) {
					if (parametersName === undefined || parametersName[index] === undefined)
						var key = index + '';
					else var key = parametersName[index];
					postData[key] = pathNames[index +1];
				});
			
			// Set loading state
			$targetContainer.addClass('loading');
			
			// Call onUnload setup function and check response
			var unloadFunctionResponse = settings.onUnload(currentPath, route) || false;
			
			// If a deferred obj is returned, wait for its end
			// and load requested page
			if ($.isFunction(unloadFunctionResponse.promise))
				unloadFunctionResponse.done(function() {
					$.post(
						root + settings.pageFolder + route.url,
						postData,		// Pass to the script other pathNames as argument
						function(responseText) {
							// Remove loading state
							$targetContainer.removeClass('loading');
							
							if (settings.loadTarget == null)
								$targetContainer
									.html($(responseText))
									.wrapInner(settings.contentWrap);
							else
								$targetContainer
									.find(settings.loadTarget)
										.html($(responseText))
										.wrapInner(settings.contentWrap);
							
							// Call general setup function
							settings.onLoad(currentPath, route, this);
							// Call page's setup function
							if ($.isFunction(settings.setupFunctions[currentPath]))
								setTimeout(function() {
									settings.setupFunctions[currentPath]()
								}, 0);
						}
					);
				});
			// Else load requested page w/o waiting
			else
				$.post(
					root + settings.pageFolder + route.url,
					postData,		// Pass to the script other pathNames as argument
					function(responseText) {
						// Remove loading state
						$targetContainer.removeClass('loading');
						
						if (settings.loadTarget == null)
							$targetContainer
								.html($(responseText))
								.wrapInner(settings.contentWrap);
						else
							$targetContainer
								.find(settings.loadTarget)
									.html($(responseText))
									.wrapInner(settings.contentWrap);
						
						// Call general setup function
						settings.onLoad(currentPath, route, this);
						// Call page's setup function
						if ($.isFunction(settings.setupFunctions[currentPath]))
							setTimeout(function() {
								settings.setupFunctions[currentPath]()
							}, 0);
					}
				);
		};
		// Call loadPage on external page change and once onInit
		window.onpopstate = router.load;
		router.load();
		
		return router;
	};
	
	
})(jQuery);