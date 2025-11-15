# Capstone E_07 - Air Quality Monitoring System

A Node-RED flow for monitoring air quality using STM32 sensors, calculating ISPU (Indonesian Air Pollution Standard Index), and sending email alerts when air quality reaches dangerous levels.

## Overview

This Node-RED flow processes air quality sensor data from STM32 devices via MQTT, calculates pollution indices, stores data in MongoDB, and sends email notifications when air quality becomes hazardous.

### Features

- Real-time MQTT data ingestion from STM32 sensors with GPS coordinates
- Reverse geocoding using OpenStreetMap Nominatim API
- ISPU (Indonesian Air Pollution Standard Index) calculation for PM2.5, CO, NO2, and O3
- MongoDB storage for raw sensor data and calculated ISPU values
- Automated email alerts for dangerous air quality levels (ISPU > 300)
- Beautiful HTML email templates with detailed pollutant information and safety recommendations

## Prerequisites

Before importing and running this flow, ensure you have:

1. **Node-RED** installed (v3.0.0 or higher recommended)
2. **Node.js** (v14 or higher)
3. **Required Node-RED nodes** (install via Palette Manager):
   - `node-red-contrib-mongodb` (for MongoDB integration)
   - `node-red-node-email` (for email notifications)
4. **MongoDB database** (can be MongoDB Atlas or local instance)
5. **Gmail account** with App Password (for email alerts)

## Installation

### 1. Install Required Node-RED Nodes

Open Node-RED and go to **Menu > Manage palette > Install**, then search and install:

```
node-red-contrib-mongodb
node-red-node-email
```

Or install via command line:

```bash
cd ~/.node-red
npm install node-red-contrib-mongodb node-red-node-email
```

### 2. Import the Flow

1. Open Node-RED in your browser (typically `http://localhost:1880`)
2. Click the menu icon (☰) in the top-right corner
3. Select **Import**
4. Click **select a file to import** and choose `flows.json`
5. Click **Import**

## Configuration

After importing, you need to configure several components:

### 1. MQTT Broker Configuration

The flow uses HiveMQ public broker by default. To modify:

1. Double-click the **MQTT in** node (labeled "MQTT STM32 1")
2. Click the pencil icon next to the broker field
3. Configure your MQTT broker settings:
   - **Server**: `broker.hivemq.com` (or your broker address)
   - **Port**: `1883`
   - **Client ID**: Leave empty or specify unique ID
   - **Use TLS**: Unchecked (or enable if your broker requires it)

**MQTT Topic:**
- All data (sensors + location): `capstone07/stm32/data`

**Note**: The flow now uses a single topic for all data. If you change the topic name, update it in the MQTT input node.

### 2. MongoDB Configuration

Configure your MongoDB connection:

1. Double-click any **mongodb out** node
2. Click the pencil icon next to the mongodb field
3. Configure your MongoDB settings:
   - **Hostname**: `capstone.va7sxnf.mongodb.net` (or your MongoDB host)
   - **Topology**: `DNS cluster` (for Atlas) or `Direct connection`
   - **Port**: `27017`
   - **Database**: `STM32`
   - **Authentication**: Add username and password if required
   - **Connection Options**: For MongoDB Atlas, use format:
     ```
     retryWrites=true&w=majority&authSource=admin
     ```

**Collections:**
- `sensors` - Stores raw sensor data with location
- `ispus` - Stores calculated ISPU values

### 3. Email Alert Configuration

Configure Gmail SMTP for sending alerts:

1. Double-click the **Alert Email** node
2. Configure the following settings:
   - **To**: Add recipient email address(es)
   - **Server**: `smtp.gmail.com`
   - **Port**: `465`
   - **Secure**: Checked (SSL/TLS)
   - **Userid**: Your Gmail address (e.g., `varick.zahir@gmail.com`)
   - **Password**: Your Gmail App Password (see below)

**Creating Gmail App Password:**

1. Go to your Google Account settings
2. Navigate to **Security**
3. Enable **2-Step Verification** (if not already enabled)
4. Go to **App passwords**
5. Generate a new app password for "Mail"
6. Copy the 16-character password and paste it in the email node configuration

### 4. STM32 Data Format

The flow expects the following JSON format from your STM32 device:

**Topic: `capstone07/stm32/data`**
```json
{
  "pm25": 35.5,
  "co": 5000,
  "no2": 120,
  "o3": 80,
  "lat": -7.771,
  "lon": 110.377
}
```

All sensor data and GPS coordinates are sent in a single payload to one topic.

## Running the Flow

### 1. Deploy the Flow

Click the **Deploy** button in the top-right corner of Node-RED.

### 2. Verify Connections

Check the debug sidebar for connection status:
- MQTT nodes should show "connected"
- MongoDB nodes should not show any error messages

### 3. Monitor Data Flow

1. Open the **Debug** sidebar (bug icon on the right)
2. You should see incoming MQTT messages when STM32 sends data
3. Watch for processed data through the flow

### 4. Test Email Alerts

To test email functionality:

1. Send test data with ISPU values > 300 (Berbahaya/Dangerous)
2. Check the debug output from the "Status Ispu" function node
3. Verify email delivery to configured recipients

## Data Flow Explanation

1. **MQTT Input**: Receives sensor data with GPS coordinates from a single topic
2. **DateTime Function**: Adds timestamp and prepares data for reverse geocoding
3. **OpenStreetMap**: Performs reverse geocoding to get human-readable location
4. **Location Function**: Extracts county and state from OSM response, removes lat/lon
5. **MongoDB Storage**: Stores raw sensor data with location in `sensors` collection
6. **ISPU Calculation**: Calculates air pollution index for each pollutant
7. **MongoDB Storage**: Stores calculated ISPU values in `ispus` collection
8. **Status Determination**: Categorizes each pollutant (Baik, Sedang, Tidak Sehat, etc.)
9. **Email Alert**: Sends detailed HTML email if any pollutant reaches "Berbahaya" level

## ISPU Categories

| ISPU Value | Status | Color | Description |
|------------|--------|-------|-------------|
| 0 - 50 | Baik (Good) | Green | Air quality is satisfactory |
| 51 - 100 | Sedang (Moderate) | Yellow | Acceptable air quality |
| 101 - 200 | Tidak Sehat (Unhealthy) | Orange | May cause health effects for sensitive groups |
| 201 - 300 | Sangat Tidak Sehat (Very Unhealthy) | Red | Health alert, everyone may experience effects |
| > 300 | Berbahaya (Hazardous) | Dark Red | Emergency conditions, everyone affected |

## Troubleshooting

### MQTT Connection Issues

- **Problem**: MQTT nodes show "disconnected"
- **Solution**:
  - Verify broker address and port
  - Check if the broker requires authentication
  - Ensure your firewall allows MQTT traffic (port 1883)

### MongoDB Connection Issues

- **Problem**: MongoDB errors in debug output
- **Solution**:
  - Verify MongoDB connection string and credentials
  - Check database name and collection names
  - For Atlas: Whitelist your IP address in Network Access
  - Ensure the MongoDB user has read/write permissions

### Email Not Sending

- **Problem**: No email received when conditions are met
- **Solution**:
  - Verify Gmail App Password is correct
  - Check spam/junk folder
  - Ensure 2-Step Verification is enabled on Gmail
  - Review debug output for email node errors
  - Test with a simple message first

### No Data Flowing

- **Problem**: Debug nodes show no output
- **Solution**:
  - Verify STM32 device is publishing to correct topic (`capstone07/stm32/data`)
  - Check MQTT message format matches expected structure (includes pm25, co, no2, o3, lat, lon)
  - Ensure both sensor data and GPS coordinates are in the same payload
  - Review Node-RED logs for errors

### OpenStreetMap API Issues

- **Problem**: Location not being resolved
- **Solution**:
  - Verify latitude and longitude values are valid
  - Check internet connectivity
  - OSM Nominatim has rate limits (1 request/second)
  - Consider implementing delay if sending frequent requests

## Customization

### Modifying MQTT Topics

Edit the topic name in the MQTT input node and the "DateTime" function node if your STM32 uses a different topic.

### Changing Email Recipients

1. Double-click the "Alert Email" node
2. Modify the **To** field with recipient emails (comma-separated for multiple)

### Adjusting Alert Threshold

To change when alerts are sent, edit the "Status Ispu" function node:

```javascript
// Find this line (around line 65):
if ([pm25_status, co_status, no2_status, o3_status].includes("Berbahaya")) {
    // Change "Berbahaya" to "Sangat Tidak Sehat" for alerts at lower threshold
}
```

### Customizing Email Template

Modify the HTML in the "Status Ispu" function node to customize the email appearance.

## Data Storage

### MongoDB Collections

**sensors** collection structure:
```json
{
  "_id": "...",
  "pm25": 35.5,
  "co": 5000,
  "no2": 120,
  "o3": 80,
  "loc": "Sleman, Daerah Istimewa Yogyakarta",
  "dateTime": "2025-11-15T12:30:00.000Z"
}
```

**ispus** collection structure:
```json
{
  "_id": "...",
  "pm25": 75,
  "co": 45,
  "no2": 60,
  "o3": 40,
  "loc": "Sleman, Daerah Istimewa Yogyakarta",
  "dateTime": "2025-11-15T12:30:00.000Z"
}
```

## Security Considerations

1. **MQTT**: Consider using TLS/SSL for MQTT connections in production
2. **MongoDB**: Use strong passwords and restrict IP access
3. **Email**: Never commit Gmail App Passwords to version control
4. **Environment Variables**: Consider using environment variables for sensitive data

## Support

For issues or questions:
- Check Node-RED logs: `~/.node-red/` directory
- Review debug output in Node-RED sidebar
- Verify all configuration settings are correct

## License

This project is part of Capstone E_07.

---
