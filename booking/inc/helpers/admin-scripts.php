<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('acf/input/admin_footer', 'atlas_tour_dates_validation_script');
function atlas_tour_dates_validation_script() {
    ?>
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        $(document).on('change', 'input[name*="date_start"], input[name*="date_end"], .acf-field[data-name="date_start"] input, .acf-field[data-name="date_end"] input', function() {
            var $row = $(this).closest('[data-name="tour_dates"] .acf-row');
            var startDateField = $row.find('input[name*="date_start"], .acf-field[data-name="date_start"] input');
            var endDateField = $row.find('input[name*="date_end"], .acf-field[data-name="date_end"] input');
            var startDate = startDateField.val();
            var endDate = endDateField.val();
            
            if (startDate && endDate) {
                var start = new Date(startDate);
                var end = new Date(endDate);
                
                if (end < start) {
                    alert('Дата окончания не может быть раньше даты начала тура');
                    endDateField.val('');
                }
            }
        });
        
        
    });
    </script>
    <?php
}


