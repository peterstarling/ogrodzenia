<?php $__env->startSection('content'); ?>

<div id="sub-page">

		<div class="sp-left">

			<div class="title-sub-page">
				<h1 class="h2">Kontakt</h1>
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
<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d54644.76345426415!2d16.992067223063682!3d52.75059296224805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470473ddac643f7b%3A0x874a98f697cbc7f2!2sPrusa+58%2C+64-610+Rogo%C5%BAno!5e0!3m2!1spl!2spl!4v1488552592777" width="600" height="450" frameborder="0" style="border:0" allowfullscreen></iframe>
			</div>
		</div>

		<?php echo $__env->make('layouts/sp-right', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>
<?php $__env->stopSection(); ?>


<?php echo $__env->make('layouts.app', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>