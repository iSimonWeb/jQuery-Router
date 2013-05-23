<?php
	// Start buffering <head />
	if ($isCrawler) : ob_start();
?>
	<!--CUSTOM <head /> for chuck-norris page-->
	<title>Chuck Norris Ipsum</title>
	<meta name="description" content="Lorem Ipsum generator with Chuck Norris Facts" />
	
	<meta property="og:image" content="http://www.example.com/images/favicon-share.jpg" />
	<meta property="og:title" content="jQuery Router | by Laser Design Studio" />
	<meta property="og:site_name" content="jQuery Router | by Laser Design Studio" />
	<meta property="og:description" content="Lorem Ipsum generator with Chuck Norris Facts" />
<?php
		$head = ob_get_contents();
		ob_end_clean();
	endif;
	
	// Start buffering <body />
	if ($isCrawler) ob_start();
?>
<!--Put page contents here-->
<article>
	<h2>Chuck Norris Ipsum</h2>
	<p>Chuck ipsum. Chuck Norris is currently suing NBC, claiming Law and Order are trademarked names for his left and right legs. When you open a can of whoop-ass, Chuck Norris jumps out. If you have five dollars and Chuck Norris has five dollars, Chuck Norris has more money than you. Chuck Norris went looking for a bar but couldn’t find one. He walked to a vacant lot and sat there. Sure enough within an hour an a half someone constructed a bar around him. He then ordered a shot, drank it, and then burned the place to the ground. Chuck Norris yelled over the roar of the flames, “always leave things the way you found em!” Scientists used to believe that diamond was the world’s hardest substance.</p>
</article>
<?php
	if ($isCrawler) {
		$body = ob_get_contents();
		ob_end_clean();
	}
?>