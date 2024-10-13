import React, { useState, useEffect } from 'react';
import { get } from 'aws-amplify/api';

function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchDevices() {
            try {
                const restOperation = get({ 
                    apiName: 'DeviceApi', 
                    path: '/devices'
                });
                const response = await restOperation.response;

                // Handle the response JSON
                const json = await response.body.json(); 
                
                console.log('GET call succeeded: ', json);
                setDevices(json);

            } catch (error) {
                console.error('Failed to fetch devices:', error);
                setError('Failed to fetch devices');
            } finally {
                setLoading(false);
            }
        }

        fetchDevices();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h1>IoT Device Management</h1>
            <h2>Devices</h2>
            {devices.length === 0 ? (
                <p>No devices found</p>
            ) : (
                <ul>
                    {devices.map((device) => (
                        <li key={device.device_name}>
                            {device.device_name} - Current Version: {device.current_version}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default DeviceList;
