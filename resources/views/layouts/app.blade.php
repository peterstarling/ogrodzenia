<!DOCTYPE html>
<html lang="pl">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">

	<title>BaluSteel</title>
	
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <link href="/css/all.min.css" rel="stylesheet">

</head>
<body>
	<div id="topline">
		
		<div class="container">
			<div class="row no-padding">
				<div class="top-tools">
					<ul class="menu00">
						<li><a href="#">Oferta</a></li>
						<li><a href="#">Realizacje</a></li>
						<li><a href="#">Realizacje dla firm</a></li>
					</ul>
					<a href="#" class="o-lang">Polski <img src="/media/flag-pl.png"></a>
					<form class="o-search" action="#">
					  <input class="area-txt" type="text">
					  <input class="button-search" type="submit">
					</form>
				</div>
			</div>
		  <div class="row line-2nd no-padding">
			<div class="col-md-4 col-sm-12 col-xs-12">
				<h1 class="logo">
					<a href="./index.html" class="a-logo">BaluSteel</a>
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
							<li><a href="./index.html">Strona główna</a></li>
							<li><a href="./o-nas.html">O nas</a></li>
							<li><a href="#">Poradnik</a></li>
							<li><a href="#">Szlifowanie i polerowanie</a></li>
							<li><a href="#">Referencje</a></li>
							<li><a href="#">Kontakt</a></li>
						</ul>
				 
					</div>
				  </div>
				</nav>				

			</div>
		  </div>
		</div>
		
	</div>

	@yield('content')


	<div id="tips" class="carousel slide" data-ride="carousel">

		  <div class="carousel-inner">
				<div class="item">
				  <img src="./media/slider02-img00.jpg" alt="">
				  
				  <div class="carousel-caption">
					Firma Balusteel jest firmą rodzinną<br><b>która istnieje od 1982 r.</b>
				  </div>
				</div>

				<div class="item active">
				  <img src="./media/slider02-img00.jpg" alt="">
				  
				  <div class="carousel-caption">
					Firma Balusteel jest firmą rodzinną<br><b>która istnieje od 1982 r.</b>
				  </div>
				</div>

				<div class="item">
				  <img src="./media/slider02-img00.jpg" alt="">
				  
				  <div class="carousel-caption">
					Firma Balusteel jest firmą rodzinną<br><b>która istnieje od 1982 r.</b>
				  </div>
				</div>

				<div class="item">
				  <img src="./media/slider02-img00.jpg" alt="">
				  
				  <div class="carousel-caption">
					Firma Balusteel jest firmą rodzinną<br><b>która istnieje od 1982 r.</b>
				  </div>
				</div>

		  </div>
		  <ul class="carousel-indicators">
				  
			<li data-target="#tips" data-slide-to="0"></li>				
			<li data-target="#tips" data-slide-to="1" class="active"></li>				
			<li data-target="#tips" data-slide-to="2"></li>				
			<li data-target="#tips" data-slide-to="3"></li>
				
		  </ul>
	
	</div>
	
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
    <script src="./js/bootstrap.min.js"></script>
</body>
</html>