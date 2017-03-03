@extends('layouts.app')

@section('content')

<div id="sub-page">

		<div class="sp-left">

			<div class="title-sub-page">
				<h1 class="h2">Kontakt</h1>
			</div>

			<div class="content-sub-page">


				<h3>Balusteel S.C. Łukasz Wieczorek Dawid Siodła</h3>
				<p>
				ul. Prusa 58<br>
				64-610 Rogoźno k. Poznania<br>
				NIP PL606 009 43 67<br>
				REGON 361288620<br>
				</p>

				<p>
				tel. <b>783 414 801</b><br>
				e-mail: <b>biuro@balusteel.pl</b><br>
				<p>

				<h3>Formularz kontaktowy</h3>

				<p>
					Pola oznaczone gwiazdką są wymagane *
					{!! Form::open(['class' => 'form-horizontal']) !!}
						<div class="form-group {!! $errors->has('name') ? 'has-error' : '' !!}">
							{!! Form::label('name', 'Imię&nbsp;i&nbsp;nazwisko&nbsp;*', ['class' => 'col-sm-2 control-label']) !!}
							<div class="col-sm-10">
								{!! Form::text('name', null, ['placeholder' => 'Imię i nazwisko', 'class' => 'form-control', 'aria-describedby' => 'name-validation']) !!}
								<span id="name-validation" class="help-block {!! $errors->has('name') ? '' : 'hidden' !!}">
									@foreach ($errors->get('name') as $error)
										{!! $error !!}<br>
									@endforeach
								</span>
							</div>

						</div>
						<div class="form-group {!! $errors->has('email') ? 'has-error' : '' !!}">
							{!! Form::label('email', 'E-mail&nbsp;*', ['class' => 'col-sm-2 control-label']) !!}
							<div class="col-sm-10">
								{!! Form::text('email', null, ['placeholder' => 'E-mail', 'class' => 'form-control', 'aria-describedby' => 'email-validation']) !!}
								<span id="email-validation" class="help-block {!! $errors->has('email') ? '' : 'hidden' !!}">
									@foreach ($errors->get('email') as $error)
										{!! $error !!}<br>
									@endforeach
								</span>
							</div>
						</div>
						<div class="form-group {!! $errors->has('phone') ? 'has-error' : '' !!}">
							{!! Form::label('phone', 'Telefon&nbsp;kontaktowy', ['class' => 'col-sm-2 control-label']) !!}
							<div class="col-sm-10">
								{!! Form::text('phone', null, ['placeholder' => 'Phone', 'class' => 'form-control', 'aria-describedby' => 'phone-validation']) !!}
								<span id="phone-validation" class="help-block {!! $errors->has('phone') ? '' : 'hidden' !!}">
									@foreach ($errors->get('phone') as $error)
										{!! $error !!}<br>
									@endforeach
								</span>
							</div>
						</div>
						<div class="form-group">
							{!! Form::label('reason', 'Powód&nbsp;kontaktu&nbsp;*', ['class' => 'col-sm-2 control-label']) !!}
							<div class="col-sm-10">
								{!! Form::select('reason', ['zapytanie ofertowe', 'inne'], null, ['placeholder' => 'wybierz', 'class' => 'form-control']) !!}
							</div>
						</div>
						<div class="form-group">
							<div class="col-sm-2">
							</div>
							<div class="col-sm-10">
								{!! Captcha::img() !!}
							</div>
						</div>
						<div class="form-group {!! $errors->has('captcha') ? 'has-error' : '' !!}">
							{!! Form::label('captcha', 'Kod&nbsp;z&nbsp;obrazka&nbsp;*', ['class' => 'col-sm-2 control-label']) !!}
							<div class="col-sm-10">
								{!! Form::text('captcha', null, ['placeholder' => 'Captcha code', 'class' => 'form-control', 'aria-describedby' => 'captcha-validation']) !!}
								<span id="captcha-validation" class="help-block {!! $errors->has('captcha') ? '' : 'hidden' !!}">
									@foreach ($errors->get('captcha') as $error)
										{!! $error !!}<br>
									@endforeach
								</span>
							</div>
						</div>
						<div class="form-group {!! $errors->has('query') ? 'has-error' : '' !!}">
							{!! Form::textarea('query', null, ['class' => 'form-control', 'placeholder' => 'treść wiadomości', 'aria-describedby' => 'query-validation']) !!}
							<span id="query-validation" class="help-block {!! $errors->has('query') ? '' : 'hidden' !!}">
								@foreach ($errors->get('query') as $error)
									{!! $error !!}<br>
								@endforeach
							</span>
						</div>
						<div class="form-group">
						    <div class="text-center">
						      <button type="submit" class="btn btn-default">Wyślij</button>
						    </div>
						</div>
					{!! Form::close() !!}
				</p>

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