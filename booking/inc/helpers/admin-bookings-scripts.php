<?php

if (!defined('ABSPATH')) {
    exit;
}

?>
<script>
document.addEventListener('DOMContentLoaded', function() {
    const bookingRows = document.querySelectorAll('.booking-row');
    bookingRows.forEach(row => {
        row.addEventListener('click', function() {
            const url = this.getAttribute('data-booking-url');
            if (url) {
                window.location.href = url;
            }
        });
    });
});

function changeBookingStatus(bookingId, userId, newStatus) {
    const selectElement = event.target;
    const originalValue = selectElement.value;
    selectElement.disabled = true;
    
    fetch(ajaxurl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=atlas_change_booking_status&booking_id=" + bookingId + "&user_id=" + userId + "&new_status=" + newStatus + "&nonce=" + atlas_admin_nonce
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const row = selectElement.closest("tr");
            const statusCell = row.querySelector(".column-status span");
            
            statusCell.className = newStatus === "pending" ? "notice-error inline" : "notice-success inline";
            statusCell.textContent = getStatusText(newStatus);
            
            showNotice("Статус бронирования изменен на: " + getStatusText(newStatus), "success");
            
            updateStatistics();
        } else {
            selectElement.value = originalValue;
            showNotice("Ошибка при изменении статуса: " + (data.data || "Неизвестная ошибка"), "error");
        }
    })
    .catch(error => {
        console.error("Ошибка:", error);
        selectElement.value = originalValue;
        showNotice("Ошибка при изменении статуса", "error");
    })
    .finally(() => {
        selectElement.disabled = false;
    });
}

function getStatusText(status) {
    const statusTexts = {
        "pending": "Ожидает оплаты",
        "paid": "Оплачено",
        "cancelled": "Отменено",
        "confirmed": "Подтверждено"
    };
    return statusTexts[status] || status;
}

function deleteBooking(bookingId, userId) {
    if (!confirm("Вы уверены, что хотите удалить это бронирование? Это действие нельзя отменить.")) {
        return;
    }
    
    const deleteButton = event.target;
    const originalText = deleteButton.textContent;
    deleteButton.textContent = "Удаление...";
    deleteButton.disabled = true;
    
    fetch(ajaxurl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "action=atlas_delete_booking&booking_id=" + bookingId + "&user_id=" + userId + "&nonce=" + atlas_admin_nonce
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const row = deleteButton.closest("tr");
            row.style.opacity = "0.5";
            row.style.transition = "opacity 0.3s";
            setTimeout(() => {
                row.remove();
                updateStatistics();
            }, 300);
            
            showNotice("Бронирование успешно удалено", "success");
        } else {
            showNotice("Ошибка при удалении: " + (data.data || "Неизвестная ошибка"), "error");
            deleteButton.textContent = originalText;
            deleteButton.disabled = false;
        }
    })
    .catch(error => {
        console.error("Ошибка:", error);
        showNotice("Ошибка при удалении бронирования", "error");
        deleteButton.textContent = originalText;
        deleteButton.disabled = false;
    });
}

function updateStatistics() {
    const rows = document.querySelectorAll("tbody tr");
    let totalBookings = rows.length;
    let pendingBookings = 0;
    let totalTourists = 0;
    
    rows.forEach(row => {
        const statusCell = row.querySelector(".column-status span");
        if (statusCell && statusCell.textContent.trim() === "pending") {
            pendingBookings++;
        }
        
        const touristsCell = row.querySelector(".column-tourists");
        if (touristsCell) {
            totalTourists += parseInt(touristsCell.textContent) || 0;
        }
    });
    
    const statsTable = document.querySelector(".metabox-holder .postbox .inside table tbody");
    if (statsTable) {
        const rows = statsTable.querySelectorAll("tr");
        if (rows[0]) rows[0].querySelector("td").textContent = totalBookings;
        if (rows[1]) rows[1].querySelector("td").textContent = pendingBookings;
        if (rows[2]) rows[2].querySelector("td").textContent = totalTourists;
    }
}

function showNotice(message, type) {
    const notice = document.createElement("div");
    notice.className = "notice notice-" + type + " is-dismissible";
    notice.innerHTML = "<p>" + message + "</p>";
    
    const wrap = document.querySelector(".wrap");
    wrap.insertBefore(notice, wrap.firstChild);
    
    setTimeout(() => {
        notice.remove();
    }, 5000);
}

document.getElementById("cb-select-all-1").addEventListener("change", function() {
    const checkboxes = document.querySelectorAll("input[name=\"booking[]\"]");
    checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});

document.getElementById("doaction").addEventListener("click", function(e) {
    e.preventDefault();
    
    const bulkAction = document.getElementById("bulk_action").value;
    const checkedBoxes = document.querySelectorAll("input[name=\"booking[]\"]:checked");
    
    if (bulkAction === "-1") {
        showNotice("Выберите действие", "error");
        return;
    }
    
    if (checkedBoxes.length === 0) {
        showNotice("Выберите бронирования для удаления", "error");
        return;
    }
    
    if (bulkAction.startsWith("status_")) {
        const newStatus = bulkAction.replace("status_", "");
        const statusText = getStatusText(newStatus);
        
        if (!confirm("Вы уверены, что хотите изменить статус выбранных бронирований на: " + statusText + "?")) {
            return;
        }
        
        this.value = "Изменение...";
        this.disabled = true;
        
        const bookingsToUpdate = [];
        checkedBoxes.forEach(checkbox => {
            bookingsToUpdate.push({
                bookingId: checkbox.value,
                userId: checkbox.dataset.userId
            });
        });
        
        let updatedCount = 0;
        const totalCount = bookingsToUpdate.length;
        
        bookingsToUpdate.forEach((booking, index) => {
            fetch(ajaxurl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "action=atlas_change_booking_status&booking_id=" + booking.bookingId + "&user_id=" + booking.userId + "&new_status=" + newStatus + "&nonce=" + atlas_admin_nonce
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    updatedCount++;
                    
                    const row = document.querySelector("input[value='" + booking.bookingId + "']").closest("tr");
                    const statusCell = row.querySelector(".column-status span");
                    const statusSelect = row.querySelector(".booking-status-select");
                    
                    statusCell.className = newStatus === "pending" ? "notice-error inline" : "notice-success inline";
                    statusCell.textContent = statusText;
                    statusSelect.value = newStatus;
                    
                    if (updatedCount === totalCount) {
                        showNotice("Успешно изменен статус " + updatedCount + " бронирований на: " + statusText, "success");
                        updateStatistics();
                        document.getElementById("doaction").value = "Применить";
                        document.getElementById("doaction").disabled = false;
                    }
                } else {
                    showNotice("Ошибка при изменении статуса бронирования " + booking.bookingId, "error");
                }
            })
            .catch(error => {
                console.error("Ошибка:", error);
                showNotice("Ошибка при изменении статуса бронирования " + booking.bookingId, "error");
            });
        });
        
    } else if (bulkAction === "delete") {
        if (!confirm("Вы уверены, что хотите удалить выбранные бронирования? Это действие нельзя отменить.")) {
            return;
        }
        
        this.value = "Удаление...";
        this.disabled = true;
        
        const bookingsToDelete = [];
        checkedBoxes.forEach(checkbox => {
            bookingsToDelete.push({
                bookingId: checkbox.value,
                userId: checkbox.dataset.userId
            });
        });
        
        let deletedCount = 0;
        const totalCount = bookingsToDelete.length;
        
        bookingsToDelete.forEach((booking, index) => {
            fetch(ajaxurl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "action=atlas_delete_booking&booking_id=" + booking.bookingId + "&user_id=" + booking.userId + "&nonce=" + atlas_admin_nonce
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    deletedCount++;
                    
                    const row = document.querySelector("input[value='" + booking.bookingId + "']").closest("tr");
                    row.style.opacity = "0.5";
                    row.style.transition = "opacity 0.3s";
                    setTimeout(() => {
                        row.remove();
                    }, 300);
                    
                    if (deletedCount === totalCount) {
                        showNotice("Успешно удалено " + deletedCount + " бронирований", "success");
                        updateStatistics();
                        document.getElementById("doaction").value = "Применить";
                        document.getElementById("doaction").disabled = false;
                    }
                } else {
                    showNotice("Ошибка при удалении бронирования " + booking.bookingId, "error");
                }
            })
            .catch(error => {
                console.error("Ошибка:", error);
                showNotice("Ошибка при удалении бронирования " + booking.bookingId, "error");
            });
        });
    }
});
</script>
