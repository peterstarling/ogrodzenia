<?php $__env->startSection('content'); ?>

<div id="sub-page">
		
		<div class="sp-left">

			<div class="title-sub-page">
				<h2>Kontakt</h2>
			</div>
			
			<div class="content-sub-page">
			

				<h3>Balusteel S.C. Łukasz Wieczorek Dawid Siodła</h3>
				<p>
				ul. Kościuszki 29<br>
				64-610 Rogoźno k. Poznania<br>
				NIP PL606 009 43 67<br>
				REGON 361288620<br>
				</p>
				
				<p>
				tel. <b>783 414 801</b><br>
				e-mail: <b>biuro@balusteel.pl</b><br>
				<p>

				<h3>Formularz kontaktowy</h3>

				<?php echo $__env->yieldContent('form'); ?>

			</div>
		</div>

		<?php echo $__env->make('layouts/sp-right', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>
<?php $__env->stopSection(); ?>


<?php echo $__env->make('layouts.app', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>