<!DOCTYPE html>
<html lang="pl">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0; user-scalable=no">

	<title>{!! Meta::get('title') !!}</title>
	
	{!! Meta::tag('site_name', 'My site') !!}
	{!! Meta::tag('url', getenv('REQUEST_URI')) !!}
	{!! Meta::tag('locale', 'en_EN') !!}

	{!! Meta::tag('title') !!}
	{!! Meta::tag('description') !!}

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
    <link href="/css/all.min.css?version=1.0" rel="stylesheet">

</head>
<body>
	<div id="topline">
		
		<div class="container">
			<div class="row no-padding">
				<div class="top-tools hidden-xs">
					<ul class="menu00">
						<li><a href="{!! route('home') !!}">Strona główna</a></li>
						<li><a href="{!! route('about-us') !!}">O nas</a></li>
						<li><a href="{!! route('references') !!}">Referencje</a></li>
						<li><a href="{!! route('opinions') !!}">Opinie klientów</a></li>
						<li><a href="{!! route('contact-us') !!}">Kontakt</a></li>
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
				<h1 class="logo">
					<a href="{!! route('home') !!}" class="a-logo">BaluSteel</a>
				</h1>
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
				 
						<ul class="menu">
							<li><a href="{!! route('offer') !!}">Oferta</a></li>
							<li><a href="{!! route('price-list') !!}">Cennik</a></li>
							<li><a href="{!! route('private-projects') !!}">Realizacje prywatne</a></li>
							<li><a href="{!! route('private-projects') !!}">Realizacje dla firm</a></li>
							<li><a href="{!! route('guidebook') !!}">Poradnik</a></li>
							<li><a href="{!! route('faq') !!}">Częste pytania</a></li>
						</ul>
				 
					</div>
				  </div>
				</nav>				

			</div>
		  </div>
		</div>
		
	</div>

	@yield('content')


	@include('layouts/testimonials')
	
    <div id="footer">
		
		<div class="container">
		  <div class="info-bottom">
			<div class="one-box-phone">
				Tel: +48 783 414 801 
			</div> 
			<div class="one-box-mail">
				biuro@balusteel.pl
			</div> 
			<div class="one-box-location">
				ul. Białoborska 16 04-668 Poznań &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Polska
			</div>  
		  </div>
		  <div class="row copyright no-padding">
			<div class="col-md-12 col-sm-12 col-xs-12">
				
				<ul class="bottom-menu">
					<li><a href="./index.html">Strona główna</a></li>
					<li><a href="./o-nas.html">O nas</a></li>
					<li><a href="#">Poradnik</a></li>
					<li><a href="#">Szlifowanie i polerowanie</a></li>
					<li><a href="#">Referencje</a></li>
					<li><a href="#">Kontakt</a></li>
				</ul>
				
				<div class="the-end-text">&copy; 2016 balusteel - Wszystkie prawa zastrzeżone.</div>
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