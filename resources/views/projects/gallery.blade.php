@extends('layouts.app')

@section('content')

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2>{!! $gallery['name'] !!}</h2>
			</div>
			
			<div class="content-sub-page">
				
				<p>
					{!! $gallery['description'] !!}
				</p>

				<div>
					@foreach($photos as $photo)
						<div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 thumb text-center margin">
							<div>
							 	<a href="{!! $photo->path['full'] !!}" title="{!! $photo->title !!}" target="_blank">
							 		<img src="{!! $photo->path['mini'] !!}"><br>
								 	<b>{!! $photo->title !!}</b>
							 	</a>
							</div>
						</div>
					@endforeach
				</div>
			</div>
		</div>

		@include('layouts/sp-right')
@stop