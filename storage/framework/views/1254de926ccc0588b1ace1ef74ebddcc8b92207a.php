<?php $__env->startSection('content'); ?>

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2>Referencje</h2>
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

		<?php echo $__env->make('layouts/sp-right', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>

	</div>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>