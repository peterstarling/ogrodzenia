<?php $__env->startSection('content'); ?>

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2>Realizacje</h2>
			</div>
			
			<div class="content-sub-page">
			
				<div>
					<?php $__currentLoopData = $projects; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $project): $__env->incrementLoopIndices(); $loop = $__env->getFirstLoop(); ?>
						<div class="col-lg-4 col-md-6 col-xs-6 thumb text-center">
							<div>
							<?php if($project['default_photo']): ?>
							 	<a href="<?php echo route('project', [$project['id'], $project['slug']]); ?>">
							 		<img src="<?php echo $project['default_photo_path']['mini']; ?>"><br>
								 	<b><?php echo $project['name']; ?></b>
							 	</a>
							<?php endif; ?>
							</div>
						</div>
					<?php endforeach; $__env->popLoop(); $loop = $__env->getFirstLoop(); ?>
				</div>
			</div>
		</div>

		<?php echo $__env->make('layouts/sp-right', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>