<?php
namespace Havenly\helpers;

class Logger {
    public static function console($data, $type = 'log') {
        $types = ['log', 'error', 'warn', 'info'];
        $type = in_array($type, $types) ? $type : 'log';
        echo "<script>console.$type(" . json_encode($data) . ");</script>";
    }
}
?>