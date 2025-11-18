<?php

if (!defined('ABSPATH')) {
    exit;
}

function atlas_api_settings_page() {
    if (isset($_POST['save_api_settings'])) {
        check_admin_referer('atlas_api_settings');
        
        update_option('atlas_smsc_login', sanitize_text_field($_POST['smsc_login']));
        update_option('atlas_smsc_password', sanitize_text_field($_POST['smsc_password']));
        
        echo '<div class="notice notice-success"><p>Настройки сохранены</p></div>';
    }
    
    $smsc_login = get_option('atlas_smsc_login', '');
    $smsc_password = get_option('atlas_smsc_password', '');
    
    ?>
    <div class="wrap">
        <h1>⚙️ Настройки API</h1>
        
        <form method="post">
            <?php wp_nonce_field('atlas_api_settings'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="smsc_login">SMSC Логин</label>
                    </th>
                    <td>
                        <input type="text" 
                               id="smsc_login" 
                               name="smsc_login" 
                               value="<?php echo esc_attr($smsc_login); ?>" 
                               class="regular-text">
                        <p class="description">Логин для SMSC.kz API</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="smsc_password">SMSC Пароль</label>
                    </th>
                    <td>
                        <input type="password" 
                               id="smsc_password" 
                               name="smsc_password" 
                               value="<?php echo esc_attr($smsc_password); ?>" 
                               class="regular-text">
                        <p class="description">Пароль для SMSC.kz API</p>
                    </td>
                </tr>
            </table>
            
            <p class="submit">
                <input type="submit" 
                       name="save_api_settings" 
                       class="button button-primary" 
                       value="Сохранить настройки">
            </p>
        </form>
    </div>
    <?php
}

















