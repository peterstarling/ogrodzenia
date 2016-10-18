<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddDefaultUser extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        DB::table('users')->insert(['name' => 'Balusteel', 'email' => 'info@balusteelogrodzenia.pl', 'password' => \Hash::make('zaq12wsx')]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('users')->where('name', 'Balusteel')->where('email', 'info@balusteelogrodzenia.pl')->delete();
    }
}
