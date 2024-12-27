import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ServicesList() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await axios.get('http://localhost:5004/api/services');
      setServices(data);
    };
    fetchServices();
  }, []);

  return (
    <div>
      <h2>Services</h2>
      <ul>
        {services.map(service => (
          <li key={service.id}>{service.name}: {service.description}</li>
        ))}
      </ul>
    </div>
  );
}

export default ServicesList;

