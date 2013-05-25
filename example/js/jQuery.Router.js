/**
*	@project: jQuery.Router class
*	@description: a simple and auto-setup AJAX + History API site manager
*	@author: Laser Design Studio
*/
(function($) {
	// serializeObject function ========================================================
	// thanks to Tobias Cohen ==========================================================
	// http://stackoverflow.com/a/1186309 ==============================================
	// =================================================================================
	$.fn.serializeObject = function() {
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else
				o[this.name] = this.value || '';
		});
		return o;
	};
	
	jQuery.Router = function(options) {
		var router = {};
		
		// Plugin's options obj ============================================================
		// =================================================================================
		var settings = $.extend({
				ajaxFolder: '/ajax',
				loadTarget: null,
				contentWrap: '',
				titleSeparator: '|',
				mainMenu: 'nav#main',
				menuItemsSelector: 'li',
				menuAnchorsSelector: 'a',
				homeAsReset: false,
				setupFunctions: {},
				onUnload: function() {},
				onLoad: function() {},
				onHashChange: function() {},
				onFormSubmit: function() {},
				debug: false
			}, options);
		
		// Main vars =======================================================================
		// =================================================================================
		var routes = {},
			siteTitle = document.title,
			pageFolder = '/pages';
		
		// Elements cache ==================================================================
		// =================================================================================
		var $body = $('body');
		var $loadTarget = $(settings.loadTarget);
		var $mainMenuAnchors = $(settings.mainMenu + ' ' + settings.menuAnchorsSelector);
		var $mainMenuItems = (settings.menuItemsSelector == '')
			? $mainMenuAnchors
			: $(settings.mainMenu + ' ' + settings.menuItemsSelector);
		
		// Utility functions ===============================================================
		// =================================================================================
		/**
		* @returns current pathname w/o hashFragment
		*/
		var getPathname = function() {
			return document.location.pathname.replace(/#.*$/, '');
		};
		
		/**
		* @param 'routeRegExp': RegExp for matching current route
		*/
		var setActiveItem = function(routeRegExp) {
			var currentPath = getPathname(),
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
		
		// Cached regular expressions for matching named param parts
		// of route strings.
		var optionalParam = /\((.*?)\)/g;
		var namedParam    = /(\(\?)?:\w+/g;
		var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
		var routeToRegExp = function(route) {
			route = route
				.replace(escapeRegExp, '\\$&')
				.replace(optionalParam, '(?:$1)?')
				.replace(namedParam, function(match, optional){
					return optional ? match : '([^\/]+)';
				});
			return new RegExp('^' + route + '$');
		};
		var extractParameters = function(routeRegExp) {
			var currentPath = getPathname();
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
					href = $anchor.attr('href'),
					routeName = (href != '/') ? href : '/home',
					routePage = routeName + '.php',
				// Route params vars
					urlStructure = $anchor.data('url-structure'),
					routePageRegExp = /\(\/:\w+\)/g,
					routeParams = {},
					routeRegExp = '';
				
				// Attach click event on mainmenu links
				$anchor.click(function(e) {
					e.preventDefault();
					var href = $anchor.attr('href');
					
					// if same path, do nothing
					if (href == getPathname())
						return false;
					
					// else push anchor href
					history.pushState({'route': routeName}, '', href);
					router.load();
				});
				
				// Check route existance, if true exit
				if (!urlStructure) {
					var routeExist = false;
					$.each(routes, function(routeName, route) {
						if (routeExist) return;
						routeExist = route.regExp.test($anchor.attr('href'));
					});
					if (routeExist) return;
				}
				
				// Generate routeRegExp and routeParams
				if (urlStructure) {
					routePage = urlStructure.replace(routePageRegExp, '') + '.php';
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
		
		// log routes object
		if (settings.debug)
			console.log(routes);
		
		// URL manager
		router.replaceAppend = function(url) {
			history.replaceState(history.state, '', getPathname() + url);
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
				currentPath = '/' + (pathNames[1] || 'home'),
				route = routes[currentPath];
			}
			// If route still do not exist redirect to 'home' route
			// e.g. there's no routes['tours']
			if (route === undefined) {
				history.pushState({'route': '/home'}, '', '/');
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
			
			(function() {
				// Manage .active menu-item
				var currentPath = getPathname(),
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
				if (settings.homeAsReset && currentPath == '/')
					document.title = siteTitle;
				else
					document.title = siteTitle + ' ' + settings.titleSeparator + ' ' + $targetAnchor.text();
			})();
			
			// If homeAsReset call onUnload and exit
			if (settings.homeAsReset && currentPath == '/home') {
				settings.onUnload(currentPath, route);
				return false;
			}
			
			// Set loading state
			$body
				.removeClass('loading')
				.addClass('loading');
			
			// Call onUnload setup function and check response
			var unloadFunctionResponse = settings.onUnload(currentPath, route) || false;
			// Create pageRequest function to call it later
			var pageRequest = function() {
				$.post(
					pageFolder + route.pageUrl,
					paramObj,		// Pass to the server script extracted parameters
					function(requestedPage) {
						// Remove loading state
						$body.removeClass('loading');
						
						// Append retrived content
						$loadTarget
							.html($(requestedPage))
							.wrapInner(settings.contentWrap);
						
						// Call general setup function
						settings.onLoad(currentPath, route, this);
						// Call page's setup function
						if ($.isFunction(settings.setupFunctions[currentPath]))
							setTimeout(function() {
								settings.setupFunctions[currentPath]()
							}, 0);
						
						// Attach click listener to current page links
						$loadTarget
							.find('a[href^="/"]')
							.not('target[_blank]')
								.on('click', function(e) {
									e.preventDefault();
									var $anchor = $(this),
										href = $anchor.attr('href');
									
									// if same path, do nothing
									if (href == getPathname())
										return false;
									
									// else push anchor href
									history.pushState({'route': href}, '', href);
									router.load();
								});
						// Manage hash change events
						$loadTarget
							.find('a[href^=#]')
								.on('click', function(e) {
									e.preventDefault();
									router.replaceAppend($(this).attr('href'));
									settings.onHashChange($(this).attr('href'));
								});
						if (location.hash.length)
							settings.onHashChange(location.hash);
						
						// Submit form via ajax
						$('form').on('submit', function(e) {
							e.preventDefault();
							
							// Retrieve data
							var $this = $(this),
								formID = $this.attr('id'),
								method = $this.attr('method'),
								url = settings.ajaxFolder + '/' + formID + '.php',
								data = JSON.stringify($this.serializeObject());
							
							// Make request and call user defined function
							$[method](url, data, function(response, textStatus, jqXHR) {
								settings.onFormSubmit(formID, response, textStatus, jqXHR);
							});
						});
					}
				);
			};
			
			// If a deferred obj is returned, wait for its end
			// and load requested page
			if ($.isFunction(unloadFunctionResponse.promise))
				unloadFunctionResponse.done(pageRequest);
			// Else load requested page w/o waiting
			else
				pageRequest();
		};
		// Call loadPage on external page change and once onInit
		window.onpopstate = router.load;
		router.load();
		
		return router;
	};
})(jQuery);