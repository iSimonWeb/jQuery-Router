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

TO BE CONTINUED...
=============
