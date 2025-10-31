<?php

if (!defined('ABSPATH')) {
    exit;
}

?>
<style>
.booking-row:hover {
    background-color: #f0f0f1 !important;
}

.column-actions .button {
    margin-right: 5px;
}

.button-link-delete {
    color: #a00 !important;
    text-decoration: none;
    border: none !important;
    background: none !important;
    padding: 0 !important;
    font-size: 13px;
}

.button-link-delete:hover {
    color: #dc3232 !important;
    text-decoration: underline;
}

.button-link-delete:disabled {
    color: #999 !important;
    cursor: not-allowed;
}

.booking-status-select {
    font-size: 12px;
    padding: 2px 5px;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: #fff;
    min-width: 120px;
}

.booking-status-select:disabled {
    background: #f1f1f1;
    color: #999;
    cursor: not-allowed;
}

.column-actions {
    white-space: nowrap;
}

.column-actions .button,
.column-actions select {
    vertical-align: middle;
}
</style>
