@extends('layouts.app')

@section('content')

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2>Realizacje</h2>
			</div>
			
			<div class="content-sub-page">
			
				<h3>Nieprzeciętne rozwiązania</h3>
				<p class="txt-line-2nd">{!! var_dump($projects) !!}</p>
			
			</div>
		</div>

		<div class="sp-right">
			
			<div class="sp-top">					
				<div class="box-welcome-info">

					<h3>Wieloletnie doświadczenie oraz zdobyta wiedza sprawiają, że stal szlachetna nie ma przed nami żadnych tajemnic.</h3>

					<p>Bardzo często łączymy swoje wyroby ze szkłem czy drewnem tworząc oryginalne i nieprzeciętne rozwiązania.</p>
					<p>Wykonujemy pomiary oraz wycenę u klienta GRATIS. Do każdego zamówienia podchodzimy indywidualnie, zawsze starając się dostosować do wymagań i budżetu zamawiającego.</p>

					<span>Zapraszamy do współpracy</span>

				</div>
				<div class="right-backdrop-color-subpage01"></div>
			</div>

			<div class="sp-bot">
				<div class="box-one-p00">
					<div class="one-panel00 col-md-3 col-sm-3 col-xs-12">
						<span class="n-date">09<sup>2016</sup></span>
						<h4>Nowa strona WWW</h4>
						<p>W Październiku oficjalnie ruszyła nowa odsłona naszej strony internetowej. Zapraszamy do obejrzenia galerii naszych realizacji oraz oferty.</p>
						<a href="#" class="n-button-more">Realizacje</a>
					</div>
				</div>
				<div class="right-backdrop-color-subpage02"></div>
			</div>
			
		</div>

	</div>
@stop