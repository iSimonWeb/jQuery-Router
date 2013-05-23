<?php if (!isset($_POST['amet'])) : // IF NO 'amet' parameter has been set?>
	<?php
		// Start buffering <head />
		if ($isCrawler) : ob_start();
	?>
		<!--CUSTOM <head /> for sit page-->
		<title>jQuery Router</title>
		<meta name="description" content="This is the sit page of my site" />
		
		<meta property="og:image" content="http://www.example.com/images/favicon-share.jpg" />
		<meta property="og:title" content="jQuery Router | by Laser Design Studio" />
		<meta property="og:site_name" content="jQuery Router | by Laser Design Studio" />
		<meta property="og:description" content="This is the sit page of my site" />
	<?php
			$head = ob_get_contents();
			ob_end_clean();
		endif;
		
		// Start buffering <body />
		if ($isCrawler) ob_start();
	?>
	<!--Put page contents here-->
	<article>
		<h2>Sample Sit page with no parameters</h2>
		<p>Put your Sit page with no parameters content here</p>
	</article>
	<?php
		if ($isCrawler) {
			$body = ob_get_contents();
			ob_end_clean();
		}
	?>
<?php else : // IF 'amet' has been set?>
	<?php
		// Start buffering <head />
		if ($isCrawler) : ob_start();
	?>
		<!--CUSTOM <head /> for sit page-->
		<title>jQuery Router | Sit <?php echo $_POST['amet']; ?> page</title>
		<meta name="description" content="This is the <?php echo $_POST['amet']; ?> page of my site" />
		
		<meta property="og:image" content="http://www.example.com/images/favicon-share.jpg" />
		<meta property="og:title" content="jQuery Router | by Laser Design Studio" />
		<meta property="og:site_name" content="jQuery Router | by Laser Design Studio" />
		<meta property="og:description" content="This is the <?php echo $_POST['amet']; ?> page of my site" />
	<?php
			$head = ob_get_contents();
			ob_end_clean();
		endif;
		
		// Start buffering <body />
		if ($isCrawler) ob_start();
	?>
	<!--Put page contents here-->
	<article>
		<h2>Sample <?php echo $_POST['amet']; ?> page</h2>
		<p>Put your <?php echo $_POST['amet']; ?> page content here</p>
	</article>
	<?php
		if ($isCrawler) {
			$body = ob_get_contents();
			ob_end_clean();
		}
	?>
<?php endif; ?>