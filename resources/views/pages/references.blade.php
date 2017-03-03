@extends('layouts.app')

@section('content')

<div id="sub-page">

		<div class="sp-left">

			<div class="title-sub-page">
				<h1 class="h2">Referencje</h1>
			</div>

			<div class="content-sub-page">

				<div class="row references">
				 	<div class="col-md-4">
				 		<a href="/media/references/poznanska_13.jpg" target="_blank">
				 		<img src="/media/references/poznanska_13.jpg"></a>
				 	</div>
					<div class="col-md-4">
				 		<a href="/media/references/referencje.jpg" target="_blank">
						<img src="media/references/referencje.jpg"></a>
					</div>
					<div class="col-md-4">
				 		<a href="/media/references/referencje1.jpg" target="_blank">
						<img src="media/references/referencje1.jpg"></a>
					</div>
				</div>

			</div>
		</div>

		@include('layouts/sp-right')

	</div>
@stop