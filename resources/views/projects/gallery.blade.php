@extends('layouts.app')

@section('content')

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2>{!! $gallery['name'] !!}</h2>
			</div>
			
			<div class="content-sub-page">
			
				<div>
						
				</div>
			</div>
		</div>

		@include('layouts/sp-right')
@stop