<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateGallerySchema extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // add slug and default photo
        Schema::table('galleries', function ($table) {
            $table->string('slug', 50)->after('description');
            $table->integer('default_photo')->nullable()->unsigned()->after('slug');

            $table->unique('slug');
            $table->foreign('default_photo')->references('id')->on('photos');
        });
        
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('galleries', function ($table) {
            $table->dropForeign(['default_photo']);
            $table->dropUnique(['slug']);

            $table->dropColumn(['slug', 'default_photo']);
        });
    }
}
