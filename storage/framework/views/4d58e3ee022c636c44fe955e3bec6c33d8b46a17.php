<!DOCTYPE html>
<html lang="pl">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no">

	<title><?php echo Meta::get('title'); ?> - <?php echo Meta::get('site_name'); ?></title>
	<?php echo Meta::tag('description'); ?>


	<?php echo Meta::tag('site_name', 'My site'); ?>

	<?php echo Meta::tag('url', getenv('REQUEST_URI')); ?>

	<?php echo Meta::tag('locale', 'en_EN'); ?>


	<link rel="apple-touch-icon" sizes="57x57" href="/favicons/apple-icon-57x57.png">
	<link rel="apple-touch-icon" sizes="60x60" href="/favicons/apple-icon-60x60.png">
	<link rel="apple-touch-icon" sizes="72x72" href="/favicons/apple-icon-72x72.png">
	<link rel="apple-touch-icon" sizes="76x76" href="/favicons/apple-icon-76x76.png">
	<link rel="apple-touch-icon" sizes="114x114" href="/favicons/apple-icon-114x114.png">
	<link rel="apple-touch-icon" sizes="120x120" href="/favicons/apple-icon-120x120.png">
	<link rel="apple-touch-icon" sizes="144x144" href="/favicons/apple-icon-144x144.png">
	<link rel="apple-touch-icon" sizes="152x152" href="/favicons/apple-icon-152x152.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-icon-180x180.png">
	<link rel="icon" type="image/png" sizes="192x192"  href="/favicons/android-icon-192x192.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">
	<link rel="icon" type="image/png" sizes="96x96" href="/favicons/favicon-96x96.png">
	<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
	<link rel="manifest" href="/favicons/manifest.json">
	<meta name="msapplication-TileColor" content="#ffffff">
	<meta name="msapplication-TileImage" content="/favicons/ms-icon-144x144.png">
	<meta name="theme-color" content="#ffffff">

    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link href="<?php echo route('home'); ?>/css/all.min.css?version=1.0" rel="stylesheet">
</head>
<body>
	<div id="topline">

		<div class="container">
			<div class="row no-padding">
				<div class="top-tools hidden-xs">
					<ul class="menu00">
						<li><a href="<?php echo route('home'); ?>">Strona główna</a></li>
						<li><a href="<?php echo route('about-us'); ?>">O nas</a></li>
						<li><a href="<?php echo route('references'); ?>">Referencje</a></li>
						<li><a href="<?php echo route('opinions'); ?>">Opinie klientów</a></li>
						<li><a href="<?php echo route('contact-us'); ?>">Kontakt</a></li>
					</ul>
					<a href="#" class="o-lang">Polski <img src="/media/flag-pl.png"></a>
					<form class="o-search hidden" action="#">
					  <input class="area-txt" type="text">
					  <input class="button-search" type="submit">
					</form>
				</div>
			</div>
		  <div class="row line-2nd no-padding">
			<div class="col-md-4 col-sm-12 col-xs-12">
				<div class="logo">
                                    <a href="<?php echo route('home'); ?>" class="a-logo"> </a>
				</div>
			</div>
			<div class="col-md-8 col-sm-12 col-xs-12">

				<nav class="navbar navbar-default navbar-fixed-top">
				  <div class="container-fluid">

					<div class="navbar-header">
					  <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					  </button>
					  <a class="navbar-brand" href="#"></a>
					</div>

					<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">

						<ul class="menu navbar-nav  "> <!-- Fiksnąć to menu na mobile'u --->
                                                    <li class="dropdown"><a href="<?php echo route('offer'); ?>">Oferta</a>&nbsp;<a href="#"    class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false" ><i class=" glyphicon glyphicon-chevron-down"></i></a>
                                                            <ul class="dropdown-menu">
                                                              <li><a href="<?php echo url('oferta/ogrodzenia.html'); ?>">Ogrodzenia</a></li>
                                                              <li><a href="<?php echo url('oferta/bramy-garazowe.html'); ?>">Bramy garażowe</a></li>
                                                              <li><a href="<?php echo url('oferta/automatyka-do-bram.html'); ?>">Napędy i automatyka do bram</a></li>
                                                              <li><a href="<?php echo url('oferta/rolety-zewnetrzne.html'); ?>">Rolety zewnętrzne</a></li>
                                                              <li><a href="<?php echo url('oferta/konstrukcje-stalowe.html'); ?>">Konstrukcje stalowe</a></li>
                                                            </ul>
                                                        </li>
							<li><a href="<?php echo route('price-list'); ?>">Cennik</a></li>
							<li><a href="<?php echo route('private-projects'); ?>">Realizacje prywatne</a></li>
							<li><a href="<?php echo route('commercial-projects'); ?>">Realizacje dla firm</a></li>
							<li><a href="<?php echo route('guidebook'); ?>">Poradnik</a></li>
							<li><a href="<?php echo route('faq'); ?>">Częste pytania</a></li>
						</ul>

					</div>
				  </div>
				</nav>

			</div>
		  </div>
		</div>

	</div>

	<?php echo $__env->yieldContent('content'); ?>


	<?php echo $__env->make('layouts/testimonials', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>

    <div id="footer">

		<div class="container"  itemscope itemtype="http://schema.org/HomeAndConstructionBusiness">
                    <meta itemprop="image" content="http://balusteelogrodzenia.pl/media/logov1-png.png"/>
		  <div class="info-bottom">
			<div class="one-box-phone">
                            Tel: <span itemprop="telephone">+48 512 133 040</span>
			</div>
			<div class="one-box-mail">
				biuro@balusteel.pl
			</div>
			<div class="one-box-location">
                            <span  itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
                                ul.  <span itemprop="streetAddress">Prusa 58</span> <span itemprop="postalCode">64-610</span> <span  itemprop="addressLocality">Rogoźno k. Poznania</span>, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Polska
                            </span>
			</div>
		  </div>
		  <div class="row copyright no-padding">
			<div class="col-md-12 col-sm-12 col-xs-12">

				<ul class="bottom-menu">
					<li><a href="<?php echo route('home'); ?>">Strona główna</a></li>
					<li><a href="<?php echo route('about-us'); ?>">O nas</a></li>
					<li><a href="<?php echo route('guidebook'); ?>">Poradnik</a></li>
					<li><a href="<?php echo route('faq'); ?>">Częste pytania</a></li>
					<li><a href="<?php echo route('references'); ?>">Referencje</a></li>
					<li><a href="<?php echo route('contact-us'); ?>">Kontakt</a></li>
				</ul>

                            <div class="the-end-text">&copy; 2016 <span itemprop="name">Balusteel</span> - Wszystkie prawa zastrzeżone.</div>
			</div>
		  </div>
		</div>

    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <script>
	  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
	  ga('create', 'UA-85210544-1', 'auto');
	  ga('send', 'pageview');
	</script>
</body>
</html>