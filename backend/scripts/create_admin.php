<?php
declare(strict_types=1);

/**
 * Create H2Os MGT admin — h2os / alexim39
 * Usage (CLI): php backend/scripts/create_admin.php
 * Usage (cPanel Terminal): php ~/api.hydrogenwaterbottles.store/backend/scripts/create_admin.php
 * Usage (phpMyAdmin SQL): INSERT INTO admins (username, password_hash) VALUES ('h2os', '$2y$10$...') — hash below is for alexim39
 */

$backendRoot = dirname(__DIR__);
require_once $backendRoot . '/config/config.php';
Config::load($backendRoot);

if (is_file($backendRoot . '/vendor/autoload.php')) {
    require_once $backendRoot . '/vendor/autoload.php';
} else {
    spl_autoload_register(function (string $class) use ($backendRoot): void {
        if (!str_starts_with($class, 'App\\')) return;
        $file = $backendRoot . '/src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (is_file($file)) require_once $file;
    });
}

use App\Core\Database;

$username = 'h2os';
$password = 'alexim39';
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    $pdo = Database::connection();
    // Ensure admins table exists (in case schema not yet run)
    $pdo->exec("CREATE TABLE IF NOT EXISTS `admins` (
      `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      `username` VARCHAR(64) NOT NULL,
      `password_hash` VARCHAR(255) NOT NULL,
      `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `uq_admins_username` (`username`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Upsert — update password if exists, else insert
    $existing = Database::fetchOne('SELECT id FROM admins WHERE username = :u LIMIT 1', ['u' => $username]);
    if ($existing) {
        Database::execute('UPDATE admins SET password_hash = :h, updated_at = NOW() WHERE username = :u', ['h' => $hash, 'u' => $username]);
        echo "Updated admin '$username' — password reset to '$password'\n";
    } else {
        Database::execute('INSERT INTO admins (username, password_hash) VALUES (:u, :h)', ['u' => $username, 'h' => $hash]);
        echo "Created admin '$username' — password '$password'\n";
    }

    // Also output SQL for phpMyAdmin manual insert if CLI not available
    echo "\nphpMyAdmin SQL (if CLI fails):\n";
    echo "INSERT INTO admins (username, password_hash) VALUES ('h2os', '" . addslashes($hash) . "')\n";
    echo "ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);\n";

    $row = Database::fetchOne('SELECT id, username, created_at FROM admins WHERE username = :u', ['u' => $username]);
    echo "\nVerified: " . json_encode($row) . "\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Failed: " . $e->getMessage() . "\n");
    exit(1);
}
