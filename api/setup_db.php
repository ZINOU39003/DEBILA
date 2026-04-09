<?php
require_once 'config.php';

echo "<h2>Bader Portal - Database Setup</h2>";

try {
    $sqlFile = '../database/schema.sql';
    if (!file_exists($sqlFile)) {
        die("Error: schema.sql not found at $sqlFile");
    }

    $sql = file_get_contents($sqlFile);
    
    // Split SQL by semicolon to execute one by one
    // Note: This is a simple parser, might need adjustment for complex triggers
    $queries = array_filter(array_map('trim', explode(';', $sql)));

    foreach ($queries as $query) {
        if (empty($query)) continue;
        $pdo->exec($query);
        echo "<p style='color:green;'>Executed: " . substr($query, 0, 50) . "...</p>";
    }

    echo "<h3 style='color:blue;'>Success! Database tables created in Aiven.</h3>";
    echo "<p>Please DELETE this file (setup_db.php) after use for security.</p>";

} catch (PDOException $e) {
    echo "<h3 style='color:red;'>Error: " . $e->getMessage() . "</h3>";
}
?>
