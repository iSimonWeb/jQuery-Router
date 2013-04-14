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
		// @returns current pathname w/ or w/o root
		var getPathname = function(wRoot) {
			if (wRoot)
				return document.location.pathname;
			else
				return document.location.pathname.replace(rootRegExp, '');
		};
		var setActiveItem = function(routeRegExp) {
			var currentPath = getPathname(true),
				$targetAnchor = $mainMenuAnchors.filter('[href="' + currentPath + '"]');
			
			if (!$targetAnchor.length) {
				$mainMenuAnchors.each(function(index, mainMenuAnchor) {
					if ($targetAnchor.length) return false;
					
					$mainMenuAnchor = $(mainMenuAnchor);
					if (routeRegExp.test($mainMenuAnchor.attr('href')))
						$targetAnchor = $mainMenuAnchor;
				});
			}
			
			$mainMenuItems.removeClass('active');
			if (settings.menuItemsSelector == '')
				$targetAnchor.addClass('active');
			else
				$targetAnchor.parents(settings.menuItemsSelector).addClass('active');
		};
		
		// Cached regular expressions for matching named param parts and splatted
		// parts of route strings.
		var optionalParam = /\((.*?)\)/g;
		var namedParam    = /(\(\?)?:\w+/g;
		//var splatParam    = /\*\w+/g;
		var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
		var routeToRegExp = function(route) {
			route = route
				.replace(escapeRegExp, '\\$&')
				.replace(optionalParam, '(?:$1)?')
				.replace(namedParam, function(match, optional){
					return optional ? match : '([^\/]+)';
				})
				//.replace(splatParam, '(.*?)');
			return new RegExp('^' + route + '$');
		};
		var extractParameters = function(routeRegExp) {
			var currentPath = getPathname(true);
			return routeRegExp.exec(currentPath).slice(1);
		};
		var extractParametersNames = function(urlStructure) {
			return $.map(urlStructure.match(/:(\w+)/g), function(param) {
				return param.slice(1);
			});
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
					//paramRegExp = /:(\w+)/g,
					routePageRegExp = /\/:\w+/g,
					routeParams = {},
					routeRegExp = '';
				
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
				
				// Check static/dynamic route type
				if (!urlStructure) {
					var routeExist = false;
					$.each(routes, function(routeName, route) {
						if (routeExist) return;
						routeExist = route.regExp.test($anchor.attr('href'));
					});
					if (routeExist) return;
				}
				
				if (urlStructure) {
					routeRegExp = routeToRegExp(urlStructure);
					routeParams = extractParametersNames(urlStructure);
				}
				else routeRegExp = routeToRegExp($anchor.attr('href'));
				
				// Write route info
				routes[routeName] = {
					//elem: $this,
					//title: $this.text(),
					regExp: routeRegExp,
					pageUrl: routePage,
					paramList: routeParams,
					scrollAxis: $anchor.data('scroll-axis') || 'y',
					pageSetup: settings.setupFunctions[routeName] || null
				};
			});
		console.log(routes);
		// URL manager
		router.replaceAppend = function(url) {
			history.replaceState(history.state, '', root + history.state.route + '/' + url);
		};
		
		// Page loader
		router.load = function() {
			var currentPath = getPathname(),
				route = routes[currentPath];
			
			// Check if pathname match w/ one of the routes
			// e.g. '/tours/disneyland'
			if (route === undefined) {
			// If not, try to get only the first pathname
			// e.g. 'tours'
				var pathNames = getPathname().split('/');
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
			
			// Build param object (if any)
			var paramObj = {};
			if (route.paramList.length) {
				var parametersValues = extractParameters(route.regExp);
				$.each(route.paramList, function(index, paramName) {
					paramObj[paramName] = parametersValues[index];
				});
			}
			
			//setActiveItem(route.regExp);
			(function() {
				// Manage .active menu-item
				var currentPath = getPathname(true),
					$targetAnchor = $mainMenuAnchors.filter('[href="' + currentPath + '"]');
				
				if (!$targetAnchor.length) {
					$mainMenuAnchors.each(function(index, mainMenuAnchor) {
						if ($targetAnchor.length) return false;
						
						$mainMenuAnchor = $(mainMenuAnchor);
						if (route.regExp.test($mainMenuAnchor.attr('href')))
							$targetAnchor = $mainMenuAnchor;
					});
				}
				
				$mainMenuItems.removeClass('active');
				if (settings.menuItemsSelector == '')
					$targetAnchor.addClass('active');
				else
					$targetAnchor.parents(settings.menuItemsSelector).addClass('active');
				
				// Manage title
				if (settings.homeAsReset && currentPath == 'home')
					document.title = siteTitle;
				else
					document.title = siteTitle + ' ' + settings.titleSeparator + ' ' + $targetAnchor.text();
			});
			
			// If homeAsReset call onUnload and exit
			if (settings.homeAsReset && currentPath == 'home') {
				settings.onUnload(currentPath, route);
				return false;
			}
			
			// Set loading state
			$targetContainer.addClass('loading');
			
			// Call onUnload setup function and check response
			var unloadFunctionResponse = settings.onUnload(currentPath, route) || false;
			console.log('loading ' + currentPath);
			// If a deferred obj is returned, wait for its end
			// and load requested page
			if ($.isFunction(unloadFunctionResponse.promise))
				unloadFunctionResponse.done(function() {
					$.post(
						root + settings.pageFolder + route.pageUrl,
						paramObj,		// Pass to the script other pathNames as argument
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
										.html(responseText)
										.wrapInner(settings.contentWrap);
							
							// Call general setup function
							settings.onLoad(currentPath, route, this);
							// Call page's setup function
							if ($.isFunction(settings.setupFunctions[currentPath]))
								setTimeout(function() {
									settings.setupFunctions[currentPath]()
								}, 0);
						},
						'text'
					);
				});
			// Else load requested page w/o waiting
			else
				$.post(
					root + settings.pageFolder + route.pageUrl,
					paramObj,		// Pass to the script other pathNames as argument
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
									.html(responseText)
									.wrapInner(settings.contentWrap);
						
						// Call general setup function
						settings.onLoad(currentPath, route, this);
						// Call page's setup function
						if ($.isFunction(settings.setupFunctions[currentPath]))
							setTimeout(function() {
								settings.setupFunctions[currentPath]()
							}, 0);
					},
					'text'
				);
		};
		// Call loadPage on external page change and once onInit
		window.onpopstate = router.load;
		router.load();
		
		return router;
	};
})(jQuery);