<?php $__env->startSection('form'); ?>	
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
<?php $__env->stopSection(); ?>
<?php echo $__env->make('contact.layout', array_except(get_defined_vars(), array('__data', '__path')))->render(); ?>