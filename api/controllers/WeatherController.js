/**
 * WeatherController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const axios = require("axios");

module.exports = {
  
    weatherFromCoords: async (req, res) => {
        try {
            const { lat, long } = req.body;
            if(!lat || !long || Number.isNaN(lat) || Number.isNaN(long)) {
                return res.status(400).json({ success: false, message: "Invalid Data" }); // 400 Bad Request
            }
            const weatherResponse = await axios.get("https://api.open-meteo.com/v1/forecast", {
                params: {
                    latitude: lat,
                    longitude: long,
                    current: "temperature_2m"
                }
            
            });
            const weatherData = await weatherResponse.data;
    
            if(weatherData.error) {
                // on error, the api returns
                // { error: boolean, reason: string}
                // Ex: { error: true, reason: "Latitude must be in range of -90 to 90°. Given: 99999.0."}
                return res.status(400).json({ success: false, message: weatherData.reason, data: "" }); // 400 Bad Request
            }
    
            return res.status(200).json({ 
                success: true, 
                message: "Temperature data obtained successfully", 
                data: {
                    temperature: `${weatherData.current.temperature_2m} ${weatherData.current_units.temperature_2m}`
                } 
            });
        } catch (error) {
            console.log(error);
            res.json({ success: false, message: "Server Error" });
        }
    },

    weatherFromLocation: async (req, res) => {
        try {
            const { location } = req.body;
    
            // first get location coordinates
            const coordsResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: {
                    q: location,
                    format: "json",
                    limit: 1
                },
                timeout: 5000
            });
            const coordData = await coordsResponse.data;
    
            // on invalid location, this api returns an empty array
            if(coordData.length === 0) {
                return res.status(400).json({ success: false, message: "Invalid Location" }); // 400 Bad Request
            }
    
            const lat = coordData[0].lat;
            const long = coordData[0].lon;
    
            if(!lat || !long || Number.isNaN(lat) || Number.isNaN(long)) {
                return res.status(500).json({ success: false, message: "Coorinates API returned Invalid Data" }); // 400 Bad Request
            }
    
            const weatherResponse = await axios.get("https://api.open-meteo.com/v1/forecast", {
                params: {
                    latitude: lat,
                    longitude: long,
                    current: "temperature_2m"
                },
                timeout: 5000
            });
            const weatherData = await weatherResponse.data;
    
            if(weatherData.error) {
                // on error, the api returns
                // { error: boolean, reason: string}
                // Ex: { error: true, reason: "Latitude must be in range of -90 to 90°. Given: 99999.0."}
                return res.status(400).json({ success: false, message: weatherData.reason, data: "" }); // 400 Bad Request
            }
    
            return res.status(200).json({ 
                success: true, 
                message: "Temperature data obtained successfully", 
                data: {
                    temperature: `${weatherData.current.temperature_2m} ${weatherData.current_units.temperature_2m}`
                } 
            });
        } catch (error) {
            console.log(error);
            if (axios.isAxiosError(error) && error.code === 'ETIMEDOUT') {
                return res.status(500).json({ success: false, message: "Request to external service timed out. External service may be down." });
            }
            res.json({ success: false, message: "Server Error" });
        }
    }

};

