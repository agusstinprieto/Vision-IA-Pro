// Telemetry Simulation Service
// Generates realistic vehicle data for demo purposes

export interface VehicleTelemetry {
    // Motion
    speed: number; // km/h
    rpm: number;
    gear: number;

    // Engine
    engineTemp: number; // °C
    oilPressure: number; // PSI

    // Fuel & Battery
    fuelLevel: number; // %
    batteryVoltage: number; // V

    // Cargo (for refrigerated trucks)
    cargoTemp: number; // °C

    // Location
    gps: {
        lat: number;
        lng: number;
        heading: number; // degrees
        altitude: number; // meters
    };

    // Odometer
    odometer: number; // km
    tripDistance: number; // km

    // Status
    timestamp: number;
}

class TelemetrySimulationService {
    private baseSpeed = 85; // km/h
    private baseRPM = 1800;
    private fuelLevel = 75; // %
    private odometer = 125430; // km
    private tripDistance = 0;

    // Monterrey → Laredo route
    private route = [
        { lat: 25.6866, lng: -100.3161, name: 'Monterrey' },
        { lat: 25.8756, lng: -100.1847, name: 'Salinas Victoria' },
        { lat: 26.2304, lng: -100.0000, name: 'Sabinas Hidalgo' },
        { lat: 26.9176, lng: -99.8167, name: 'Lampazos' },
        { lat: 27.5069, lng: -99.5075, name: 'Laredo' },
    ];

    private currentRouteIndex = 0;
    private routeProgress = 0; // 0-1

    /**
     * Generate realistic telemetry data
     */
    generateTelemetry(): VehicleTelemetry {
        // Add natural variation
        const speed = this.baseSpeed + this.randomVariation(-10, 10);
        const rpm = this.baseRPM + this.randomVariation(-200, 200);

        // Calculate gear based on speed
        const gear = this.calculateGear(speed);

        // Engine temperature varies slightly
        const engineTemp = 90 + this.randomVariation(-5, 5);

        // Oil pressure correlates with RPM
        const oilPressure = 30 + (rpm / 100);

        // Fuel decreases slowly
        this.fuelLevel = Math.max(0, this.fuelLevel - 0.001);

        // Battery voltage is stable
        const batteryVoltage = 13.8 + this.randomVariation(-0.2, 0.2);

        // Cargo temp for refrigerated truck
        const cargoTemp = 4 + this.randomVariation(-2, 2);

        // Update GPS position along route
        const gps = this.updateGPSPosition(speed);

        // Update odometer
        const distanceIncrement = (speed / 3600); // km per second
        this.odometer += distanceIncrement;
        this.tripDistance += distanceIncrement;

        return {
            speed: Math.round(speed),
            rpm: Math.round(rpm),
            gear,
            engineTemp: Math.round(engineTemp * 10) / 10,
            oilPressure: Math.round(oilPressure * 10) / 10,
            fuelLevel: Math.round(this.fuelLevel * 10) / 10,
            batteryVoltage: Math.round(batteryVoltage * 10) / 10,
            cargoTemp: Math.round(cargoTemp * 10) / 10,
            gps,
            odometer: Math.round(this.odometer),
            tripDistance: Math.round(this.tripDistance * 10) / 10,
            timestamp: Date.now()
        };
    }

    /**
     * Calculate gear based on speed
     */
    private calculateGear(speed: number): number {
        if (speed < 20) return 1;
        if (speed < 40) return 2;
        if (speed < 60) return 3;
        if (speed < 80) return 4;
        if (speed < 100) return 5;
        return 6;
    }

    /**
     * Generate random variation
     */
    private randomVariation(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    /**
     * Update GPS position along route
     */
    private updateGPSPosition(speed: number): VehicleTelemetry['gps'] {
        // Move along route based on speed
        const progressIncrement = (speed / 3600) / 100; // Simplified
        this.routeProgress += progressIncrement;

        // Move to next segment if needed
        if (this.routeProgress >= 1) {
            this.routeProgress = 0;
            this.currentRouteIndex = (this.currentRouteIndex + 1) % (this.route.length - 1);
        }

        // Interpolate between current and next point
        const current = this.route[this.currentRouteIndex];
        const next = this.route[this.currentRouteIndex + 1] || this.route[0];

        const lat = current.lat + (next.lat - current.lat) * this.routeProgress;
        const lng = current.lng + (next.lng - current.lng) * this.routeProgress;

        // Calculate heading
        const heading = this.calculateHeading(current, next);

        return {
            lat: Math.round(lat * 10000) / 10000,
            lng: Math.round(lng * 10000) / 10000,
            heading: Math.round(heading),
            altitude: 500 + this.randomVariation(-50, 50)
        };
    }

    /**
     * Calculate heading between two points
     */
    private calculateHeading(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
        const dLng = to.lng - from.lng;
        const dLat = to.lat - from.lat;
        const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);
        return (angle + 360) % 360;
    }

    /**
     * Reset simulation
     */
    reset() {
        this.fuelLevel = 75;
        this.odometer = 125430;
        this.tripDistance = 0;
        this.currentRouteIndex = 0;
        this.routeProgress = 0;
    }

    /**
     * Get current location name
     */
    getCurrentLocation(): string {
        const current = this.route[this.currentRouteIndex];
        const next = this.route[this.currentRouteIndex + 1] || this.route[0];

        if (this.routeProgress < 0.5) {
            return `Saliendo de ${current.name}`;
        } else {
            return `Aproximándose a ${next.name}`;
        }
    }
}

export const telemetrySimulation = new TelemetrySimulationService();
