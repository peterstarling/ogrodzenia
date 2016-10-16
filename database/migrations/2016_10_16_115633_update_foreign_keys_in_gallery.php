<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateForeignKeysInGallery extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('galleries', function ($table) {
            $table->dropForeign(['default_photo']);
            $table->foreign('default_photo')->references('id')->on('photos')->onDelete('cascade');
        });

        Schema::table('photos', function ($table) {
            $table->dropForeign(['gallery_id']);
            $table->foreign('gallery_id')->references('id')->on('galleries')->onDelete('cascade');
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
            $table->foreign('default_photo')->references('id')->on('photos');
        });

        Schema::table('photos', function ($table) {
            $table->dropForeign(['gallery_id']);
            $table->foreign('gallery_id')->references('id')->on('galleries');
        });
    }
}
