jQuery-Router
=============

The easiest way to setup an AJAX + History API navigation style on your site.
You just need a main menu in order to make the script understand the main routes of your site.

Simple cofiguration
=============
```javascript
function($) {
	$(document).ready(function() {
		var mySiteRouter = new $.Router();
	});
})(jQuery);
```

Parameters
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
	parametersName: {},
	setupFunctions: {},
	onUnload: function() {},
	onLoad: function() {}
}
```

Parameters explaination
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
	// you must follow jQuery .wrap() rule
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
	// the router will collect several information from them storing them in a JSON
	// e.g.
	//	routes[routeName] = {										// "routeName" is the "href" attribute of menuAnchor
	//		elem: $item,											// menuItem jQuery obj 
	//		title: $item.text(),									// menuItem text
	//		url: routeName + '.php',								// same as above
	//		scrollAxis: $this.data('scroll-axis') || 'y',			// data-scroll-axis attribute of menuAnchor
	//		pageSetup: settings.setupFunctions[routeName] || null	// per page setup, continue reading to discover it
	//	}
	menuAnchorsSelector: 'a',
```

TO BE CONTINUED...
=============
