export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getTimeRemaining(expiryDate) {
  if (!expiryDate) return { hours: 0, minutes: 0, isExpired: true, text: 'No deadline' };
  const diff = new Date(expiryDate).getTime() - Date.now();
  if (diff <= 0) {
    return { hours: 0, minutes: 0, isExpired: true, text: 'Expired' };
  }
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return { hours, minutes, isExpired: false, text: `${days}d ${hours % 24}h remaining` };
  }
  if (hours > 0) {
    return { hours, minutes, isExpired: false, text: `${hours}h ${minutes}m remaining` };
  }
  return { hours, minutes, isExpired: false, text: `${minutes}m remaining` };
}
