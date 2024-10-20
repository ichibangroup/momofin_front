import React, { useState, useEffect } from 'react';
import '../ViewOrg.css';

function ViewOrganisations() {
    const [organisations] = useState([
        { name: 'Galih Ibrahim Kurniawan', industry: 'Finance', address: 'Jl.Margonda Raya', description: 'banking things' },
        { name: 'Clayton Ismail Nagle', industry: 'Information System', address: 'Jl.Akses UI', description: 'IT things' },
        { name: 'Muhammad Sakhran Thayyib', industry: 'Healthcare', address: 'Jl.Pemuda', description: 'medical research' },
        { name: 'Gregorius Samuel Hutahaean', industry: 'Entertainment', address: 'Jl.Menteng Raya', description: 'media production' },
        { name: 'Galih Ibrahim Kurniawan', industry: 'Finance', address: 'Jl.Margonda Raya', description: 'banking things' },
        { name: 'Clayton Ismail Nagle', industry: 'Information System', address: 'Jl.Akses UI', description: 'IT things' },
        { name: 'Muhammad Sakhran Thayyib', industry: 'Healthcare', address: 'Jl.Pemuda', description: 'medical research' },
        { name: 'Gregorius Samuel Hutahaean', industry: 'Entertainment', address: 'Jl.Menteng Raya', description: 'media production' },
        { name: 'Galih Ibrahim Kurniawan', industry: 'Finance', address: 'Jl.Margonda Raya', description: 'banking things' },
        
        
    ]);

    useEffect(() => {
        // Fetch data from an API or handle other side effects
    }, []);

    return (
        <div className="view-organisations">
            <h1>View All Organisations</h1>
            <div className="headers">
                <div>Logo</div>
                <div>Name</div>
                <div>Industry</div>
                <div>Address</div>
                <div>Description</div>
                <div>Actions</div>
            </div>
            <div className="organisation-rows-container">
                {organisations.map((org) => (
                    <div key={org.id} className="organisation-row">
                        <div>👤</div> {/* Display user icon */}
                        <div>{org.name}</div>
                        <div>{org.industry}</div>
                        <div>{org.address}</div>
                        <div>{org.description}</div>
                        <div className="actions">
                            <button className="edit-btn">✏️</button>
                            <button className="delete-btn">❌</button>
                        </div>
                    </div>
                ))}
            </div>
            <button className="add-btn">ADD ORGANISATION</button>
        </div>
    );
}

export default ViewOrganisations;
