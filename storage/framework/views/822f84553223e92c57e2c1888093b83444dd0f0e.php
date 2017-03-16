<?php $__env->startSection('content'); ?>

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2><?php echo $gallery['name']; ?></h2>
			</div>
			
			<div class="content-sub-page">
				
				<p>
					<?php echo $gallery['description']; ?>

				</p>

				<div>
					<?php $__currentLoopData = $photos; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $photo): $__env->incrementLoopIndices(); $loop = $__env->getFirstLoop(); ?>
						<div class="col-lg-4 col-md-6 col-sm-6 col-xs-12 thumb text-center margin">
							<div>
							 	<a href="<?php echo $photo->path['full']; ?>" title="<?php echo $photo->title; ?>" target="_blank">
							 		<img src="<?php echo $photo->path['mini']; ?>"><br>
								 	<b><?php echo $photo->title; ?></b>
							 	</a>
							</div>
						</div>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getFirstLoop(); ?>
				</div>
			</div>
		</div>

		<?php echo $__env->make('layouts/sp-right', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>