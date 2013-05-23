<?php
	// Detect crawlers
	$crawlers = 'Google|msnbot|Rambler|Yahoo|AbachoBOT|accoona|' .
	'AcioRobot|ASPSeek|CocoCrawler|Dumbot|FAST-WebCrawler|' .
	'GeonaBot|Gigabot|Lycos|MSRBOT|Scooter|AltaVista|IDBot|eStyle|Scrubby|facebookexternalhit';
	$isCrawler = (preg_match("/$crawlers/", $_SERVER['HTTP_USER_AGENT']) > 0);
	
	// Route matching vars and functions
	function routeToRegExp($route) {
		$optionalParam = '/\((.*?)\)/';
		$namedParam    = '/(\(\?)?:\w+/';
		$escapeRegExp  = '/[\-{}\[\]+?.,\/\\\^$|#\s]/';
		
		$route = preg_replace($escapeRegExp, '\\\\${0}', $route);
		$route = preg_replace($optionalParam, '(?:${1})?', $route);
		$route = preg_replace_callback($namedParam, function($matches) {
			return $matches[1] ? $matches[0] : '([^\/]+)';
		}, $route);
		
		return '/^' . $route . '$/';
	};
	function extractParameters($routeRegExp) {
		$currentPath = $_SERVER['REQUEST_URI'];
		preg_match_all($routeRegExp, $currentPath, $matches);
		
		return reset(array_slice($matches, 1));
	};
	function extractParametersNames($urlStructure) {
		preg_match_all('/:(\w+)/', $urlStructure, $matches);
		return reset(array_slice($matches, 1));
	};
	
	// If $isCrawler find the right route to follow
	if ($isCrawler) {
		$dom = new DOMDocument();
		@$dom->loadHTMLFile('pages/menu.php');
		
		// Get anchors from menu
		$anchors = $dom->getElementsByTagName('a');
		$routeMatch = false;
		$routePage = '';
		foreach ($anchors as $anchor) {
			if ($routeMatch) continue;
			
			$href = $anchor->getAttribute('href');
			$urlStructure = $anchor->getAttribute('data-url-structure');
			
			// Check if current anchor's $href matches with the requested_uri
			if ($href == $_SERVER['REQUEST_URI']) {
				$routeMatch = true;
				if ($href == '/') $routePage = '/pages/home.php';
				else $routePage = '/pages' . $href . '.php';
			// or check if there's a $urlStructure
			} else if (count($urlStructure)) {
				// Transform it into a RegExp
				$urlStructureRegExp = routeToRegExp($urlStructure);
				$routeMatch = preg_match($urlStructureRegExp, $_SERVER['REQUEST_URI']);
				// If route matches, get paramsValues and paramsNames
				if ($routeMatch) {
					$routePage = '/pages' . preg_replace('/\(\/:\w+\)/', '', $urlStructure) . '.php';
					$routeParams = extractParameters($urlStructureRegExp);
					$routeParamsNames = extractParametersNames($urlStructure);
					
					// Set them into $_POST superglobal
					foreach ($routeParamsNames as $index => $routeParamName)
						$_POST[$routeParamName] = $routeParams[$index];
				}
			}
		}
		// If router recognized a route
		if ($routeMatch) {
			// Create empty vars in case of include failuer
			$head = '';
			$body = '';
			// Request page
			@include substr($routePage, 1);
		}
	}
?>
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<link rel="shortcut icon" href="/images/favicon.ico" />

<?php if (!$isCrawler || $head == '') : ?>
	<!--DEFAULT <head /> content-->
	<title>jQuery Router</title>
	<meta name="description" content="Your site description" />
	
	<meta property="og:image" content="http://www.example.com/images/favicon-share.jpg" />
	<meta property="og:title" content="jQuery Router | by Laser Design Studio" />
	<meta property="og:description" content="Your site description" />
<?php else :
	// Else echo $head content from requested page.php
	echo $head; endif; ?>
	
	<!--These two meta tag won't change-->
	<meta property="og:site_name" content="jQuery Router | by Laser Design Studio" />
	<meta property="og:url" content="http://www.example.com<?php echo $_SERVER['REQUEST_URI']; ?>" />
</head>

<body>
	<?php include '/pages/menu.php'; ?>
	<div id="shell" class="wrap">
		<header><h1>jQuery.Router</h1></header>
		<div id="pearl">
<?php
	// echo $body when navigated by a Crawler
	if ($isCrawler)
		echo $body;
?>
		</div>
	</div>
	
	<script src="/js/jquery-2.0.0.min.js"></script>
	<script src="/js/jQuery.Router.js"></script>
	<script>
		// Create an instance of the plugin
		var jQueryRouter = new $.Router({
			target: 'body',
			loadTarget: '#pearl',
			mainMenu: 'nav#main',
			menuItemsSelector: ''
		});
	</script>
</body>
</html>