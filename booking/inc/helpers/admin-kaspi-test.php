<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_kaspi_admin_page() {
    if (isset($_POST['clear_payments'])) {
        update_option('atlas_kaspi_payments', array());
        echo '<div class="notice notice-success"><p>Все платежи очищены</p></div>';
    }
    
    if (isset($_POST['test_kaspi'])) {
        $tran_id = 'KSP' . uniqid();
        $order_id = 'test_' . time();
        $amount = 100000;
        
        $payment_data = array(
            'tran_id' => $tran_id,
            'order_id' => $order_id,
            'amount' => $amount,
            'tour_id' => 33,
            'user_id' => 3,
            'status' => 'pending',
            'created_at' => current_time('mysql')
        );
        
        $payments = get_option('atlas_kaspi_payments', array());
        $payments[$tran_id] = $payment_data;
        update_option('atlas_kaspi_payments', $payments);
        
        echo '<div class="notice notice-success"><p>Тестовый платеж создан: ' . $tran_id . '</p></div>';
    }
    
    ?>
    <div class="wrap">
        <h1>🧪 Kaspi Payment Test</h1>
        
        <div class="card">
            <h2>Создать тестовый платеж</h2>
            <form method="post">
                <p>Нажмите кнопку чтобы создать тестовый платеж для Kaspi</p>
                <input type="submit" name="test_kaspi" class="button button-primary" value="Создать тестовый платеж">
            </form>
        </div>
        
        <div class="card">
            <h2>Тестовые URL</h2>
            <?php
            $payments = get_option('atlas_kaspi_payments', array());
            if (!empty($payments)) {
                $last_payment = end($payments);
                $tran_id = $last_payment['tran_id'];
                $order_id = $last_payment['order_id'];
                $amount = $last_payment['amount'];
                
                echo '<p><strong>Последний платеж:</strong></p>';
                echo '<p>TranId: <code>' . $tran_id . '</code></p>';
                echo '<p>OrderId: <code>' . $order_id . '</code></p>';
                echo '<p>Amount: <code>' . number_format($amount) . ' ₸</code></p>';
                
                echo '<h3>1. Проверить платеж:</h3>';
                echo '<p><code>https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=check&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</code></p>';
                
                echo '<h3>2. Kaspi URL:</h3>';
                echo '<p><code>https://kaspi.kz/online?TranId=' . $tran_id . '&OrderId=' . $order_id . '&Amount=' . $amount . '&Service=AtlasBooking&returnUrl=https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '</code></p>';
                
                echo '<h3>3. Тестовая форма:</h3>';
                echo '<form action="https://kaspi.kz/online" method="post" target="_blank">';
                echo '<input type="hidden" name="TranId" value="' . $tran_id . '">';
                echo '<input type="hidden" name="OrderId" value="' . $order_id . '">';
                echo '<input type="hidden" name="Amount" value="' . $amount . '">';
                echo '<input type="hidden" name="Service" value="AtlasBooking">';
                echo '<input type="hidden" name="returnUrl" value="https://api.booking.atlas.kz/wp-json/atlas/v1/kaspi/payment_app.cgi?command=pay&txn_id=' . $tran_id . '&account=' . $order_id . '&sum=' . $amount . '">';
                echo '<input type="submit" class="button button-secondary" value="🚀 Тест Kaspi Payment">';
                echo '</form>';
            } else {
                echo '<p>Нет созданных платежей. Создайте тестовый платеж выше.</p>';
            }
            ?>
        </div>
        
        <div class="card">
            <h2>Все платежи</h2>
            <?php
            if (!empty($payments)) {
                echo '<p><strong>Всего платежей: ' . count($payments) . '</strong></p>';
                echo '<form method="post" style="margin-bottom: 15px;">';
                echo '<input type="submit" name="clear_payments" class="button button-secondary" value="🗑️ Очистить все платежи" onclick="return confirm(\'Вы уверены? Это удалит все платежи!\');">';
                echo '</form>';
                echo '<table class="wp-list-table widefat fixed striped">';
                echo '<thead><tr><th>TranId</th><th>OrderId</th><th>Amount</th><th>Status</th><th>Created</th></tr></thead>';
                echo '<tbody>';
                foreach ($payments as $payment) {
                    echo '<tr>';
                    echo '<td>' . $payment['tran_id'] . '</td>';
                    echo '<td>' . $payment['order_id'] . '</td>';
                    echo '<td>' . number_format($payment['amount']) . ' ₸</td>';
                    echo '<td>' . $payment['status'] . '</td>';
                    echo '<td>' . $payment['created_at'] . '</td>';
                    echo '</tr>';
                }
                echo '</tbody></table>';
            } else {
                echo '<p>Нет платежей</p>';
            }
            ?>
        </div>
    </div>
    <?php
}










