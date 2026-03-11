// utils.js - Utility functions

// Format XP values (Bytes, KB, MB)
function formatXP(xp) {
    if (xp >= 1000000) {
        return (xp / 1000000).toFixed(2) + ' MB';
    } else if (xp >= 1000) {
        return (xp / 1000).toFixed(2) + ' KB';
    }
    return xp + ' B';
}

// Format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format datetime
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Create SVG element helper
function createSVGElement(type, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', type);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    return element;
}
