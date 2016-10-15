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

		@include('layouts/sp-right')
@stop