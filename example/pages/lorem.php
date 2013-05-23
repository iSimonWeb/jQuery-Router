<?php
	// Start buffering <head />
	if ($isCrawler) : ob_start();
?>
	<!--CUSTOM <head /> for lorem page-->
	<title>jQuery Router</title>
	<meta name="description" content="This is the lorem page of my site" />
	
	<meta property="og:image" content="http://www.example.com/images/favicon-share.jpg" />
	<meta property="og:title" content="jQuery Router | by Laser Design Studio" />
	<meta property="og:site_name" content="jQuery Router | by Laser Design Studio" />
	<meta property="og:description" content="This is the lorem page of my site" />
<?php
		$head = ob_get_contents();
		ob_end_clean();
	endif;
	
	// Start buffering <body />
	if ($isCrawler) ob_start();
?>
<!--Put page contents here-->
<article>
	<h2>Sample Lorem page</h2>
	<p>Put your Lorem page content here</p>
</article>
<?php
	if ($isCrawler) {
		$body = ob_get_contents();
		ob_end_clean();
	}
?>