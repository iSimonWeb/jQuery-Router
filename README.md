jQuery-Router
=============

The easiest way to setup an AJAX + History API navigation style on your site.
You just need a main menu in order to make the script understand the main routes of your site.

Simple setup
=============
```html
<body>
	<section id="shell">
		<nav id="main">
			<h1 id="icon"><a href="/">My fantastic tour agency</a></h1>
			<a href="/about-us">About Us</a>
			<div class="submenu-wrap">
				<a href="/tours" data-url-structure="/tours(/:tourName)">Tours</a>
				<div class="submenu"></div>
					<a href="/tours/disneyland">Disneland</a>
					<a href="/tours/honolulu">Honolulu</a>
					<a href="/tours/miami-beach">Miami Beach</a>
				</div>
			</div>
			<a href="/contacts">Contacts</a>
		</nav>
		<section id="pearl"></section>
	</section>
	
	<script src="/js/jquery-1.9.1.min.js"></script>
	<script src="/js/jQuery.Router.js"></script>
</body>
```

Simple configuration
=============
```javascript
function($) {
	$(document).ready(function() {
		var mySiteRouter = new $.Router(args);
	});
})(jQuery);
```

Options
=============

As it always is, you can pass an object to the constructor to customize your router instance.
These are the defaults:
```javascript
{
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
}
```

Options explaination
=============

```javascript
{
	// The folder that contains all your site's pages
	pageFolder: 'pages/',
```
```javascript
	// Main container of your async loaded content
	// defaults to #pearl 'cause I love the idea of #shell > #pearl
	// BOOBS: (just to have your attention)
	// during page load the script add the class ".loading" to "target" element 
	target: '#pearl',
	// If "target" isn't where you want to put your site's pages content
	// set "loadTarget" to match a child element of "target"
	// e.g. '.mCSB_container' in case you're using http://manos.malihu.gr/jquery-custom-content-scroller/
	loadTarget: null,
	// Some HTML code to wrap received data with
	// Since the plugin use $.wrap() to manage that,
	// you must follow jQuery .wrap() rules;
	// you can also use a function.
	// e.g. '<div class="wrap" />'
	contentWrap: '',
```

```javascript
	// Text to put between your site's title and the current route name
	// BOOBS: site title is automatically retrieved from <title /> in your index file
	// BOOBS: route names are also automatically retrieved, this time from main menu anchor's text
	titleSeparator: '|',
```

```javascript
	// CSS Selector of your site's main menu
	mainMenu: '#main-menu',
	// Items of your main menu,
	// ".active" class will be added when selcted
	// BOOBS: in case of a simpler <nav><a /></nav> menu set this parameter to '' (empty string)
	menuItemsSelector: 'li',
	// Anchors of your main menu,
	// the router will collect several information from them
	menuAnchorsSelector: 'a',
```

```javascript
	// In case your site's home is a reset, set this option to true
	// so Router won't load an 'home.php' page, but will just remove loaded page
	// and call 'onUnload' function
	homeAsReset: false,
```

```javascript
	// If a route name matches a function name inside this object,
	// Router will execute the matched function on page load
	// e.g. {
	//			'home': function() {
	//				console.log('Hell yeah! Home page loaded!');
	//			}
	//		}
	setupFunctions: {},
	// Each time the user change route (load another site page)
	// this function will be executed.
	// Two parameters are passed:
	// - 'pathName': is the route the user is navigating to (root address is removed);
	// 		e.g. 'tours' 		[notice that there's no slash]
	// - 'route': is the route object that the Router build from main-menu
	// 		e.g. {
	//			regExp: RegExp /^\/tours(?:\/([^\/]+))?$/,
	//			pageUrl: 'tours.php',
	//			paramList: ["tour-name"],
	//			scrollAxis: 'y',
	//			pageSetup: function(pathName, route) {
	//				console.log('Tour page loaded!');
	//			}
	//		}
	// e.g. You may use it to make the 'loadTarget' disappear (opacity: 0)
	onUnload: function(pathName, route) {},
	// Same as above, but this one is called on page load
	onLoad: function() {}
}
```
TO BE CONTINUED...
=============
