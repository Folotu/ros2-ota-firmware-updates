import React, { useState, useEffect } from 'react';
import { fetchDevices } from './apiUtils';
import { Link } from 'react-router-dom';

function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadDevices() {
            const response = await fetchDevices();
            setDevices(response);
            setLoading(false);
        }
        loadDevices();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>IoT Device Management Home</h1>
            <h2>Devices</h2>
            {devices.length === 0 ? (
                <p>No devices found</p>
            ) : (
                <ul>
                    {devices.map((device) => (
                        <li key={device.device_name}>
                            {device.device_name} - Current Version: {device.current_version} {<Link to="/update-device">Update Device</Link>}
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default DeviceList;