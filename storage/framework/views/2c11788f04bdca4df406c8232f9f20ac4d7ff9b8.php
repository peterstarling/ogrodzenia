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

				<p>
					Pola oznaczone gwiazdką są wymagane *
					<?php echo Form::open(['class' => 'form-horizontal']); ?>

						<div class="form-group <?php echo $errors->has('name') ? 'has-error' : ''; ?>">
							<?php echo Form::label('name', 'Imię&nbsp;i&nbsp;nazwisko&nbsp;*', ['class' => 'col-sm-2 control-label']); ?>

							<div class="col-sm-10">
								<?php echo Form::text('name', null, ['placeholder' => 'Imię i nazwisko', 'class' => 'form-control', 'aria-describedby' => 'name-validation']); ?>

								<span id="name-validation" class="help-block <?php echo $errors->has('name') ? '' : 'hidden'; ?>">
									<?php $__currentLoopData = $errors->get('name'); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getFirstLoop(); ?>
										<?php echo $error; ?><br>
									<?php endforeach; $__env->popLoop(); $loop = $__env->getFirstLoop(); ?>
								</span>
							</div>

						</div>
						<div class="form-group <?php echo $errors->has('email') ? 'has-error' : ''; ?>">
							<?php echo Form::label('email', 'E-mail&nbsp;*', ['class' => 'col-sm-2 control-label']); ?>

							<div class="col-sm-10">
								<?php echo Form::text('email', null, ['placeholder' => 'E-mail', 'class' => 'form-control', 'aria-describedby' => 'email-validation']); ?>

								<span id="email-validation" class="help-block <?php echo $errors->has('email') ? '' : 'hidden'; ?>">
									<?php $__currentLoopData = $errors->get('email'); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getFirstLoop(); ?>
										<?php echo $error; ?><br>
									<?php endforeach; $__env->popLoop(); $loop = $__env->getFirstLoop(); ?>
								</span>
							</div>
						</div>
						<div class="form-group <?php echo $errors->has('phone') ? 'has-error' : ''; ?>">
							<?php echo Form::label('phone', 'Telefon&nbsp;kontaktowy', ['class' => 'col-sm-2 control-label']); ?>

							<div class="col-sm-10">
								<?php echo Form::text('phone', null, ['placeholder' => 'Phone', 'class' => 'form-control', 'aria-describedby' => 'phone-validation']); ?>

								<span id="phone-validation" class="help-block <?php echo $errors->has('phone') ? '' : 'hidden'; ?>">
									<?php $__currentLoopData = $errors->get('phone'); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getFirstLoop(); ?>
										<?php echo $error; ?><br>
									<?php endforeach; $__env->popLoop(); $loop = $__env->getFirstLoop(); ?>
								</span>
							</div>
						</div>
						<div class="form-group">
							<?php echo Form::label('reason', 'Powód&nbsp;kontaktu&nbsp;*', ['class' => 'col-sm-2 control-label']); ?>

							<div class="col-sm-10">
								<?php echo Form::select('reason', ['zapytanie ofertowe', 'inne'], null, ['placeholder' => 'wybierz', 'class' => 'form-control']); ?>

							</div>
						</div>
						<div class="form-group">
							<div class="col-sm-2">
							</div>
							<div class="col-sm-10">
								<?php echo Captcha::img(); ?>

							</div>
						</div>
						<div class="form-group <?php echo $errors->has('captcha') ? 'has-error' : ''; ?>">
							<?php echo Form::label('captcha', 'Kod&nbsp;z&nbsp;obrazka&nbsp;*', ['class' => 'col-sm-2 control-label']); ?>

							<div class="col-sm-10">
								<?php echo Form::text('captcha', null, ['placeholder' => 'Captcha code', 'class' => 'form-control', 'aria-describedby' => 'captcha-validation']); ?>

								<span id="captcha-validation" class="help-block <?php echo $errors->has('captcha') ? '' : 'hidden'; ?>">
									<?php $__currentLoopData = $errors->get('captcha'); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getFirstLoop(); ?>
										<?php echo $error; ?><br>
									<?php endforeach; $__env->popLoop(); $loop = $__env->getFirstLoop(); ?>
								</span>
							</div>
						</div>
						<div class="form-group <?php echo $errors->has('query') ? 'has-error' : ''; ?>">
							<?php echo Form::textarea('query', null, ['class' => 'form-control', 'placeholder' => 'treść wiadomości', 'aria-describedby' => 'query-validation']); ?>

							<span id="query-validation" class="help-block <?php echo $errors->has('query') ? '' : 'hidden'; ?>">
								<?php $__currentLoopData = $errors->get('query'); $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $error): $__env->incrementLoopIndices(); $loop = $__env->getFirstLoop(); ?>
									<?php echo $error; ?><br>
								<?php endforeach; $__env->popLoop(); $loop = $__env->getFirstLoop(); ?>
							</span>
						</div>
						<div class="form-group">
						    <div class="text-center">
						      <button type="submit" class="btn btn-default">Wyślij</button>
						    </div>
						</div>
					<?php echo Form::close(); ?>

				</p>
			
			</div>
		</div>

		<div class="sp-right">
			
			<div class="sp-top">					
				<div class="box-welcome-info">

					<h3>Wieloletnie doświadczenie oraz zdobyta wiedza sprawiają, że stal szlachetna nie ma przed nami żadnych tajemnic.</h3>

					<p>Bardzo często łączymy swoje wyroby ze szkłem czy drewnem tworząc oryginalne i nieprzeciętne rozwiązania.</p>
					<p>Wykonujemy pomiary oraz wycenę u klienta GRATIS. Do każdego zamówienia podchodzimy indywidualnie, zawsze starając się dostosować do wymagań i budżetu zamawiającego.</p>

					<span>Zapraszamy do współpracy</span>

				</div>
				<div class="right-backdrop-color-subpage01"></div>
			</div>

			<div class="sp-bot">
				<div class="box-one-p00">
					<div class="one-panel00 col-md-3 col-sm-3 col-xs-12">
						<span class="n-date">09<sup>2016</sup></span>
						<h4>Nowa strona WWW</h4>
						<p>W Październiku oficjalnie ruszyła nowa odsłona naszej strony internetowej. Zapraszamy do obejrzenia galerii naszych realizacji oraz oferty.</p>
						<a href="#" class="n-button-more">Realizacje</a>
					</div>
				</div>
				<div class="right-backdrop-color-subpage02"></div>
			</div>
			
		</div>

	</div>
<?php $__env->stopSection(); ?>
<?php echo $__env->make('layouts.app', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>