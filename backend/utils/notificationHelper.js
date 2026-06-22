const Notification = require('../models/Notification');

/**
 * Creates a notification in MongoDB and broadcasts it in real-time if a Socket instance is active.
 * 
 * @param {Object} app - Express application instance (to access the Socket.IO server).
 * @param {Object} data - The notification data object { recipient, sender, type, title, message, link }.
 * @returns {Promise<Object>} - The created notification document.
 */
const createNotification = async (app, data) => {
    try {
        const notif = await Notification.create(data);
        
        // Emit Socket.IO event if configured
        const io = app.get('io');
        if (io) {
            io.to(data.recipient.toString()).emit('new_notification', notif);
            console.log(`📡 [REAL-TIME NOTIFICATION] Sent to user room: ${data.recipient}`);
        }
        
        return notif;
    } catch (error) {
        console.error('Error in createNotification helper:', error);
        throw error;
    }
};

module.exports = { createNotification };
