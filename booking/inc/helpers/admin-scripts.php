<?php

if (!defined('ABSPATH')) {
    exit;
}

add_action('acf/input/admin_footer', 'atlas_tour_dates_validation_script');
function atlas_tour_dates_validation_script() {
    ?>
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        $(document).on('change', 'input[name*="date_start"], input[name*="date_end"]', function() {
            var $row = $(this).closest('[data-name="tour_dates"] .acf-row');
            var startDate = $row.find('input[name*="date_start"]').val();
            var endDate = $row.find('input[name*="date_end"]').val();
            
            if (startDate && endDate) {
                var start = new Date(startDate);
                var end = new Date(endDate);
                
                if (end < start) {
                    alert('Дата окончания не может быть раньше даты начала тура');
                    $(this).val('');
                }
            }
        });
        
        $(document).on('change blur keyup', 'input[name*="date_start"]', function() {
            var $row = $(this).closest('[data-name="tour_dates"] .acf-row');
            updateEndDate($row);
        });
        
        $(document).on('change', 'select[name*="duration"]', function() {
            var $row = $(this).closest('[data-name="tour_dates"] .acf-row');
            updateEndDate($row);
        });
        
        function updateEndDate($row) {
            var startDateField = $row.find('input[name*="date_start"]');
            var endDateField = $row.find('input[name*="date_end"]');
            var durationField = $row.find('select[name*="duration"]');
            
            var startDate = startDateField.val();
            var duration = durationField.val() || '7';
            
            if (startDate) {
                var start;
                
                if (startDate.length === 8 && /^\d{8}$/.test(startDate)) {
                    var year = startDate.substring(0, 4);
                    var month = startDate.substring(4, 6);
                    var day = startDate.substring(6, 8);
                    start = new Date(year, month - 1, day);
                } else {
                    start = new Date(startDate);
                }
                
                start.setDate(start.getDate() + parseInt(duration));
                var endDateStr = start.getFullYear() + '-' + 
                    String(start.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(start.getDate()).padStart(2, '0');
                
                endDateField.val(endDateStr);
            }
        }
        
        if (window.MutationObserver) {
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                        var target = $(mutation.target);
                        if (target.is('input[name*="date_start"]')) {
                            var $row = target.closest('[data-name="tour_dates"] .acf-row');
                            updateEndDate($row);
                        }
                    }
                });
            });
            
            $('[data-name="tour_dates"]').each(function() {
                observer.observe(this, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['value']
                });
            });
        }
        
    });
    </script>
    <?php
}

add_action('admin_footer', 'atlas_flight_duration_calculator');
function atlas_flight_duration_calculator() {
    ?>
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        function calculateFlightDuration() {
            var $container = $(this).closest('.acf-fields, .postbox, .inside');
            
            var departureTime = $container.find('input[name*="departure_time"]').val();
            var arrivalTime = $container.find('input[name*="arrival_time"]').val();
            var durationField = $container.find('input[name*="duration"]');
            
            if (!departureTime || !arrivalTime) {
                departureTime = $('input[name*="departure_time"]').val();
                arrivalTime = $('input[name*="arrival_time"]').val();
                durationField = $('input[name*="duration"]');
            }
            
            if (departureTime && arrivalTime) {
                var departure = new Date(departureTime);
                var arrival = new Date(arrivalTime);
                
                if (arrival < departure) {
                    arrival.setDate(arrival.getDate() + 1);
                }
                
                var diffMs = arrival - departure;
                var diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                var diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                
                var durationStr = diffHours + 'ч ';
                if (diffMinutes > 0) {
                    durationStr += diffMinutes + 'м';
                }
                
                if (durationField.length > 0 && !durationField.val()) {
                    durationField.val(durationStr.trim());
                }
            }
        }
        
        $(document).on('change', 'input[name*="departure_time"], input[name*="arrival_time"]', calculateFlightDuration);
        
        var currentPostType = $('#post_type').val() || $('input[name="post_type"]').val();
        if (currentPostType === 'flight') {
            setTimeout(function() {
                var departureTime = $('input[name*="departure_time"]').val();
                var arrivalTime = $('input[name*="arrival_time"]').val();
                
                if (departureTime && arrivalTime) {
                    calculateFlightDuration.call($('input[name*="departure_time"]')[0]);
                }
            }, 1000);
        }
        
        $(document).on('acf/setup_fields', function(e, el) {
            if (currentPostType === 'flight') {
                setTimeout(function() {
                    var departureTime = $(el).find('input[name*="departure_time"]').val();
                    var arrivalTime = $(el).find('input[name*="arrival_time"]').val();
                    
                    if (departureTime && arrivalTime) {
                        calculateFlightDuration.call($(el).find('input[name*="departure_time"]')[0]);
                    }
                }, 500);
            }
        });
    });
    </script>
    <?php
}

