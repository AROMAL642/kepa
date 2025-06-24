const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

router.get('/expired-certificates', async (req, res) => {
  try {
    const today = new Date();
    const vehicles = await Vehicle.find();

    const expiredCertificates = [];

    vehicles.forEach(vehicle => {
      const certs = vehicle.certificateHistory;
      if (!certs || certs.length === 0) return;

      const latestCert = certs[certs.length - 1];

      const insuranceValidity = new Date(latestCert.insuranceValidity);
      const pollutionValidity = new Date(latestCert.pollutionValidity);

      const isInsuranceExpired = insuranceValidity < today;
      const isPollutionExpired = pollutionValidity < today;

      if (isInsuranceExpired || isPollutionExpired) {
        expiredCertificates.push({
          number: vehicle.number,
          model: vehicle.model,
          insuranceExpired: isInsuranceExpired,
          insuranceValidity: latestCert.insuranceValidity,
          pollutionExpired: isPollutionExpired,
          pollutionValidity: latestCert.pollutionValidity
        });
      }
    });

    res.status(200).json(expiredCertificates);
  } catch (error) {
    console.error('Error fetching expired certificates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/expired-count', async (req, res) => {
  try {
    const today = new Date();
    const vehicles = await Vehicle.find();

    let expiredCount = 0;

    vehicles.forEach(vehicle => {
      const certs = vehicle.certificateHistory;
      if (!certs || certs.length === 0) return;

      const latestCert = certs[certs.length - 1];

      const insuranceValidity = latestCert.insuranceValidity ? new Date(latestCert.insuranceValidity) : null;
      const pollutionValidity = latestCert.pollutionValidity ? new Date(latestCert.pollutionValidity) : null;

      const isInsuranceExpired = insuranceValidity && insuranceValidity < today;
      const isPollutionExpired = pollutionValidity && pollutionValidity < today;

      if (isInsuranceExpired || isPollutionExpired) {
        expiredCount++;
      }
    });

    res.status(200).json({ count: expiredCount });
  } catch (error) {
    console.error('Error checking expired certificates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
