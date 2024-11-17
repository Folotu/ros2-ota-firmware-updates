import React, { useState, useEffect } from 'react';
import { fetchDevices, fetchFirmwareVersions, updateDeviceFirmware } from './apiUtils'; 
import { Link } from 'react-router-dom';

function UpdateDevice() {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [firmwareVersions, setFirmwareVersions] = useState([]);
    const [filteredFirmwareVersions, setFilteredFirmwareVersions] = useState([]);
    const [newFirmwareVersion, setNewFirmwareVersion] = useState('');

    useEffect(() => {
        async function loadDevices() {
            try {
                const devicesData = await fetchDevices();
                setDevices(devicesData);
            } catch (error) {
                console.error('Failed to fetch devices:', error);
            }
        }

        async function loadFirmwareVersions() {
            try {
                const versionsData = await fetchFirmwareVersions();
                setFirmwareVersions(versionsData);
            } catch (error) {
                console.error('Failed to fetch firmware versions:', error);
            }
        }

        loadDevices();
        loadFirmwareVersions();
    }, []);

    const handleDeviceChange = (event) => {
        const deviceName = event.target.value;
        const device = devices.find(d => d.device_name === deviceName);
        setSelectedDevice(device);

        // Filter out the version that the device already has
        if (device) {
            const availableVersions = firmwareVersions.filter(
                (version) => version !== device.current_version
            );
            setFilteredFirmwareVersions(availableVersions);
        }
    };

    const handleVersionChange = (event) => {
        setNewFirmwareVersion(event.target.value);
    };

    const handleFirmwareUpdate = async () => {
        if (selectedDevice && newFirmwareVersion) {
            try {
                await updateDeviceFirmware(selectedDevice.device_name, newFirmwareVersion);
                alert(`Firmware update Job Created: ${selectedDevice.device_name} to version ${newFirmwareVersion}`);
                window.location.href = '/';
            } catch (error) {
                console.error('Failed to update firmware:', error);
            }
        }
    };

    return (
        <div>
            <Link to="/"><h1>IoT Device Management Home</h1></Link>
            <h2>Update Device Firmware</h2>

            <label>
                Select a Device:
                <select onChange={handleDeviceChange}>
                    <option value="">--Select a Device--</option>
                    {devices.map(device => (
                        <option key={device.device_name} value={device.device_name}>
                            {device.device_name} (Current Version: {device.current_version})
                        </option>
                    ))}
                </select>
            </label>

            <br />

            <label>
                Select New Firmware Version:
                <select value={newFirmwareVersion} onChange={handleVersionChange}>
                    <option value="">--Select Version--</option>
                    {filteredFirmwareVersions.map(version => (
                        <option key={version} value={version}>
                            {version}
                        </option>
                    ))}
                </select>
            </label>

            <br />

            <button onClick={handleFirmwareUpdate}>Update Firmware</button>
        </div>
    );
}

export default UpdateDevice;
