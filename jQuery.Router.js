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
				setupFunctions: {},
				onUnload: function() {},
				onLoad: function() {}
			}, options);
		
		// Main vars =======================================================================
		var routes = {},
			root = $('base').eq(0).attr('href') || '/',
			rootRegExp = new RegExp('^' + root),
			siteTitle = document.title;
		
		// Elements cache ==================================================================
		var $targetContainer = $(settings.target);
		var $mainMenuAnchors = $(settings.mainMenu + ' ' + settings.menuAnchorsSelector);
		var $mainMenuItems = (settings.menuItemsSelector == '')
			? $mainMenuAnchors
			: $(settings.mainMenu + ' ' + settings.menuItemsSelector);
		
		// Utility functions ===============================================================
		// @returns current pathname w/o root
		var getPathname = function() {
			return document.location.pathname.replace(rootRegExp, '');
		};
		
		// Setup HTML5 history funcitonality and plan routes
		$mainMenuItems
			.each(function(index) {
				var $this = $(this),
					$anchor = (settings.menuItemsSelector == '')
						? $this
						: $this.find(settings.menuAnchorsSelector),
					routeName = $anchor.attr('href').replace(rootRegExp, '') || 'home',
					routePage = routeName + '.php',
				// Route params vars
					urlStructure = $anchor.data('url-structure'),
					paramRegExp = /:(\w+)/g,
					routePageRegExp = /\/:\w+/g,
					routeParams = {};
				
				// Attach click event on mainmenu links
				$anchor.click(function(e) {
					e.preventDefault();
					
					// if same path, do nothing
					if ($anchor.attr('href') == '/' + getPathname())
						return false;
					
					// else push anchor href
					history.pushState({'route': routeName}, '', $anchor.attr('href'));
					router.load();
				});
				
				// if parametrized url
				if (urlStructure) {
					// Get paramValues fom anchor href
					// using urlStructure from data-url-structure attribute
					var routeRegExp = urlStructure.replace(paramRegExp, '([^\/]+)');
					routeRegExp = new RegExp('^' + routeRegExp + '$');
					var paramValues = routeRegExp.exec($anchor.attr('href')).slice(1);
					
					// Get paramKeys from urlStructure
					var urlStructureRegExp = urlStructure.replace(paramRegExp, ':([^\/]+)');
					urlStructureRegExp = new RegExp('^' + urlStructureRegExp + '$');
					var paramKeys = urlStructureRegExp.exec(urlStructure).slice(1);
					
					// Combine 'em in an object
					$.each(paramKeys, function(index, key) {
						routeParams[key] = paramValues[index] || 0;
					});
					
					// Change routePage
					routePage = urlStructure.replace(routePageRegExp, '') + '.php';
				}
					
				// Write route info
				routes[routeName] = {
					elem: $this,
					title: $this.text(),
					href: $anchor.attr('href'),
					pageUrl: routePage,
					params: routeParams,
					scrollAxis: $anchor.data('scroll-axis') || 'y',
					pageSetup: settings.setupFunctions[routeName] || null
				};
			});
		
		// URL manager
		router.replaceAppend = function(url) {
			history.replaceState(history.state, '', root + history.state.route + '/' + url);
		};
		
		// Page loader
		router.load = function() {
			var route = routes[getPathname()];
			
			// Check if pathname match w/ one of the routes
			// e.g. '/tours/disneyland'
			if (route !== undefined)
				var pathNames = getPathname().split('/');
			else {
			// If not, try to get only the first pathname
			// e.g. 'tours'
				var pathNames = getPathname().split('/'),
					currentPath = pathNames[0] || 'home',
					route = routes[currentPath];
			}
			// If route still do not exist redirect to 'home' route
			// e.g. there's no routes['tours']
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
			
			// Set loading state
			$targetContainer.addClass('loading');
			
			// Call onUnload setup function and check response
			var unloadFunctionResponse = settings.onUnload(currentPath, route) || false;
			
			// If a deferred obj is returned, wait for its end
			// and load requested page
			if ($.isFunction(unloadFunctionResponse.promise))
				unloadFunctionResponse.done(function() {
					$.post(
						root + settings.pageFolder + route.pageUrl,
						route.params,		// Pass to the script other pathNames as argument
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
					root + settings.pageFolder + route.pageUrl,
					route.params,		// Pass to the script other pathNames as argument
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