<?php
declare(strict_types=1);
namespace App\Core;

final class Env
{
    public static function get(string $key, mixed $default = null): mixed
    {
        return \Config::get($key, $default);
    }
}
