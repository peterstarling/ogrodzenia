@extends('layouts.app')

@section('content')

<div id="slider" class="carousel slide" data-ride="carousel">

  	<div class="carousel-inner">
		<div class="item">
		  	<img src="./media/slider-img00.jpg" alt="">
		  
		  	<div class="carousel-caption">
				<h2>Wieloletnie doświadczenie <div class="sub-text-s">oraz zdobyta wiedza</div></h2>
				
				<p>Firma BaluSteel SC specjalizuje się w produkcji oraz montażu ogrodzeń, balustrad, bram garażowych, automatyki, rolet zewnętrznych, konstrukcji stalowych oraz wszelkich innych elementów stalowych.</p>
				<p class="color-grey00">Wieloletnie doświadczenie oraz zdobyta wiedza sprawiają, że stal nie ma przed nami żadnych tajemnic. Bardzo często łączymy swoje wyroby ze szkłem lub drewnem, tworząc oryginalne i nieprzeciętne rozwiązania.</p>
				
				<a href="#" class="button-more" target="_blank">Zobacz więcej</a>
		  	</div>
		</div>

		<div class="item active">
		  	<img src="./media/slider-img00.jpg" alt="">
		  
		  	<div class="carousel-caption">
				<h2>Stworzone dla&nbsp;ciebie <div class="sub-text-s">Wykonamy najtrudniejszy projekt</div></h2>
				
				<p>Oferujemy balustrady dla najbardziej wymagających klientów. Zaprojektujemy, wykonamy oraz zamontujemy zarówno balustrady zewnętrzne jak i wewnętrzne. Bogaty wybór wzorów oraz możliwości technicznych sprawi, że każdy klient odnajdzie ofertę dopasowaną do swoich potrzeb.</p>
				<p>Postaramy się, aby ogrodzenie oraz balustrada balkonowa tworzył spójną całość i ozdobiły dom w możliwie najlepszy sposób.</p>
				<p class="color-grey00">Proponujemy balustrady klasyczne oraz nowoczesne. Wykonamy zarówno barierki malowane proszkowo oraz ze stali nierdzewnej. Dodatek szkła lub drewna może jeszcze bardziej podkreślić indywidualny charaker projektu. Nasze wyroby zapewniają bezpieczeństwo trwałość na długie lata.</p>
				
				<a href="#" class="button-more" target="_blank">Zobacz więcej</a>
		  	</div>
		</div>

		<div class="item">
		  	<img src="./media/slider-img00.jpg" alt="">
		  
		  	<div class="carousel-caption">
				<h2>Ułatwiamy codzienność <div class="sub-text-s">automatyka dla Ciebie</div></h2>

				<p>Ułatwimy codzienność dzięki automatyce do bramy najlepszych producentów. Oferujemy sprzęt znanych marek takich jak FAAC czy Nice, jak również mniej znanych producentów (co nie znaczy, że gorszych) jak BFT czy Beninka. Proponujemy montaż, konserwację jak również serwis gwarancyjny i pogwarancyjny zamontowanych automatów. Dowiedz się więcej przechodząc do następnej podstrony gdzie opisaliśmy dla Ciebie możliwości zastosowania automatyki w Twoim domu.</p>
				
				
				<a href="#" class="button-more" target="_blank">Zobacz więcej</a>
		  	</div>
		</div>

		<div class="item">
			<img src="./media/slider-img00.jpg" alt="">

			<div class="carousel-caption">
				<h2>Profesjonalny montaż <div class="sub-text-s">tylko najlepsi fachowcy</div></h2>

				<p>Oferujemy sprzedaż oraz montaż bram garażowych najepszych producentów. Profesionalnie zamontujemy każdą bramę - Bramy garażowe segmentowe, roletowe, uchylne i rozwierne.</p>
				<p class="color-grey00">Brama garażowa to przeważnie największa ruchoma cześć w domu. Często obsługiwana jest za pomocą napędu elektrycznego. Zanim zdecydujemy się na wybór bramy, powinniśmy szczegółowo przeanalizować dostępne możliwości.</p>
				
				<a href="#" class="button-more" target="_blank">Zobacz więcej</a>
			</div>
		</div>

		<div class="item">
		  	<img src="./media/slider-img00.jpg" alt="">
		  
		  	<div class="carousel-caption">
				<h2>Prywatność i bezpieczeństwo <div class="sub-text-s">zadbamy o to</div></h2>

				<p>Nasza Firma specjalizuje się również w montażu systemów osłonowych do okien. Polecamy piękne i przystępne cenowo rolety zewnętrzne.</p>
				<p class="color-grey00">Funkcjonalne rolety zewnętrzne to doskonałe zabezpieczenie przed słońcem, wiatrem, deszczem, śniegiem i innymi zjawiskami atmosferycznymi. Zapewniają bardzo dobrą izolację termiczną budynku.</p>
				
				<a href="#" class="button-more" target="_blank">Zobacz więcej</a>
	  		</div>
		</div>

		<div class="item">
			<img src="./media/slider-img00.jpg" alt="">

			<div class="carousel-caption">
				<h2>Szybkość działania<div class="sub-text-s">Spóźniony klient? Pomożemy</div></h2>

				<p>Oferujemy wykonanie oraz montaż wszelkiego rodzaju konstrukcji stalowych. Możemy przygotować małe konstrukcje stalowe takie jak schody, podesty techniczne, belko stropowe oraz całe obiekty takie jak magazyny, niewielkie hale, wiaty itd. Konstrukcje stalowe zabezpieczamy antykorozyjnie najczęściej przez cynkowanie ogniowe lub malowanie zestawem farb antykorozyjnych. Oferujemy usługi montażu konstrukcji stalowych. Zachęcamy do współpracy.</p>
				
				<a href="#" class="button-more" target="_blank">Zobacz więcej</a>
			</div>
		</div>
	</div>
	<div class="container center-top00">
		<ul class="carousel-indicators">
			  
			<li data-target="#slider" data-slide-to="0">
				<span class="button-arrow-left"></span>

				<h3>Ogrodzenia</h3>
				<p>Najlepszą wizytówką każdego domu jest solidne i nowoczesne ogrodzenie.</p>
			</li>
			
			<li data-target="#slider" data-slide-to="1">
				<span class="button-arrow-left"></span>

				<h3>Balustrady</h3>
				<p>Dzięki zastosowaniu najlepszych materiałów zabezpieczenie balkonu lub schodów stanie się ozdobą.</p>
			</li>

			<li data-target="#slider" data-slide-to="2" class="active">
				<span class="button-arrow-left"></span>

				<h3>Automatyka</h3>
				<p>Ułatwimy twoje codzienne życie.</p>
			</li>

			<li data-target="#slider" data-slide-to="3">
				<span class="button-arrow-left"></span>

				<h3>Bramy garażowe</h3>
				<p>Oferujemy sprawdzone bramy, dzięki którym zapewnisz sobie spokój na długie lata.</p>
			</li>

			<li data-target="#slider" data-slide-to="4">
				<span class="button-arrow-left"></span>

				<h3>Rolety zewnętrzne</h3>
				<p>Prywatność i spokój oraz dodatkowa izolacja termiczna to inwestycja która się opłaca.</p>
			</li>

			<li data-target="#slider" data-slide-to="5">
				<span class="button-arrow-left"></span>

				<h3>Konstrukcje stalowe</h3>
				<p>Wykonamy i zmontujemy prawie każdą konstrukcję stalową. Zaczynając od schodów na halach i magazynach kończąc.</p>
			</li>
		</ul>
		  
		@include('layouts/box-welcome-info')
	</div>
		
	<div class="right-backdrop-color"></div>

</div>

<div id="news">
	<div class="container">
		<div class="row">
			<div class="one-panel-1st col-md-6 col-sm-6 col-xs-12">
				<h4>Kompleksowa obsługa</h4>
				<p>Wykonujemy pomiary oraz wycenę u klienta gratis. Do każdego zamówienia podchodzimy indywidualnie, zawsze starając się dostosować do wymagań i budżetu zamawiającego.</p>
				<img src="./media/img-partners-logos.jpg" alt="Loga partnerów">
			</div>
			
			<div class="box-one-p00">
				<div class="one-panel00 col-md-3 col-sm-3 col-xs-12">
					<span class="n-date">02<sup>07</sup></span>
					<h4>Produkty objęte gwarancją</h4>
					<p>Wybierając produkty firmy BaluSteel wybierasz jakość. Wszystkie wykonane przez nas i zamontowane elementy objęte są gwarancją. W przypadku wystąpienia wad nigdy nie pozostaniesz bez fachowej pomocy.</p>
					<a href="#" class="n-button-more">Więcej</a>
				</div>
				<div class="one-panel00 col-md-3 col-sm-3 col-xs-12">
					<span class="n-date">09<sup>07</sup></span>
					<h4>Nam mattis lorem sit amet</h4>
					<p>Morbi tincidunt purus et augue tristique maximus. In ac dictum massa. Cras a tellus non sapien commodo aliquet purus et augue tristique maximus.</p>
					<a href="#" class="n-button-more">Więcej</a>
				</div>
			</div>
			
			<div class="right-backdrop-color02"></div>
		</div>
	</div>
</div>

@endsection