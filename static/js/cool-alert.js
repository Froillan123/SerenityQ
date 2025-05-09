// Cool Alert System
let alertCounter = 0;
const alertDuration = 5000;

function showCoolAlert(type, title, message, persistent = false) {
    const alertId = 'alert-' + alertCounter++;
    const alertContainer = document.getElementById('coolAlertContainer');
    
    const alertEl = document.createElement('div');
    alertEl.className = `cool-alert ${type}`;
    alertEl.id = alertId;
    alertEl.style.setProperty('--progress-duration', `${alertDuration}ms`);
    
    let iconClass;
    switch(type) {
        case 'success': iconClass = 'fas fa-check-circle'; break;
        case 'error': iconClass = 'fas fa-exclamation-circle'; break;
        case 'warning': iconClass = 'fas fa-exclamation-triangle'; break;
        case 'info': iconClass = 'fas fa-info-circle'; break;
        case 'loading': iconClass = 'fas fa-circle-notch'; break;
        default: iconClass = 'fas fa-info-circle';
    }
    
    alertEl.innerHTML = `
        <i class="cool-alert-icon ${iconClass}"></i>
        <div class="cool-alert-content">
            <div class="cool-alert-title">${title}</div>
            <div class="cool-alert-message">${message}</div>
        </div>
        ${persistent ? '' : '<button class="cool-alert-close">&times;</button>'}
        ${persistent ? '' : '<div class="cool-alert-progress"></div>'}
    `;
    
    alertContainer.appendChild(alertEl);
    
    setTimeout(() => {
        alertEl.classList.add('show');
    }, 10);
    
    const closeBtn = alertEl.querySelector('.cool-alert-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            removeCoolAlert(alertId);
        });
    }
    
    if (!persistent) {
        setTimeout(() => {
            removeCoolAlert(alertId);
        }, alertDuration);
    }
    
    return alertId;
}

function removeCoolAlert(alertId) {
    const alertEl = document.getElementById(alertId);
    if (alertEl) {
        alertEl.classList.remove('show');
        alertEl.classList.add('hide');
        setTimeout(() => {
            alertEl.remove();
        }, 500);
    }
} 