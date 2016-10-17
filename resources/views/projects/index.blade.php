@extends('layouts.app')

@section('content')

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2>Realizacje</h2>
			</div>
			
			<div class="content-sub-page">
			
				<h3>Nieprzeciętne rozwiązania</h3>
				<div>
					@foreach($projects as $project)
						<div class="col-lg-4 col-md-6 col-xs-6 thumb text-center">
							
						</div>
					@endforeach
				</div>
			</div>
		</div>

		@include('layouts/sp-right')
@stop