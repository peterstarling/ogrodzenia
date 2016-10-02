@extends('contact.layout')

@section('form')	
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
@stop