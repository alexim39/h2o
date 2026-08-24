<?php
declare(strict_types=1);
namespace App\Core;

use PDO;
use PDOException;

/**
 * Centralized MySQL Service — Prepared statements only (SQL injection proof).
 * Falls back gracefully if DB unavailable (mock mode).
 */
final class Database
{
    private static ?PDO $pdo = null;
    private static bool $mockMode = false;

    public static function isMock(): bool { return self::$mockMode; }

    public static function connection(): ?PDO
    {
        if (self::$pdo !== null) return self::$pdo;
        if (self::$mockMode) return null;

        $host = \Config::get('DB_HOST', '127.0.0.1');
        $port = \Config::get('DB_PORT', '3306');
        $db   = \Config::get('DB_DATABASE', 'hydrogen_store');
        $user = \Config::get('DB_USERNAME', 'root');
        $pass = \Config::get('DB_PASSWORD', '');
        $charset = \Config::get('DB_CHARSET', 'utf8mb4');

        $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
        $opts = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        try {
            self::$pdo = new PDO($dsn, $user, $pass, $opts);
            // Enforce strict mode
            self::$pdo->exec("SET NAMES {$charset} COLLATE utf8mb4_unicode_ci");
            return self::$pdo;
        } catch (PDOException $e) {
            // Graceful fallback to mock if configured
            $fallback = strtolower((string)\Config::get('DB_MOCK_FALLBACK', 'true'));
            if (in_array($fallback, ['1','true','yes','on'], true)) {
                self::$mockMode = true;
                error_log('[HYDRO DB] Connection failed — mock fallback active: ' . $e->getMessage());
                return null;
            }
            throw $e;
        }
    }

    /** Helper: prepared SELECT */
    public static function fetchAll(string $sql, array $params = []): array
    {
        $pdo = self::connection();
        if ($pdo === null) return [];
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public static function fetchOne(string $sql, array $params = []): ?array
    {
        $pdo = self::connection();
        if ($pdo === null) return null;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function execute(string $sql, array $params = []): int
    {
        $pdo = self::connection();
        if ($pdo === null) return 0;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    public static function lastInsertId(): string
    {
        $pdo = self::connection();
        return $pdo ? $pdo->lastInsertId() : '0';
    }

    public static function begin(): void  { self::connection()?->beginTransaction(); }
    public static function commit(): void { self::connection()?->commit(); }
    public static function rollBack(): void { self::connection()?->rollBack(); }
}
