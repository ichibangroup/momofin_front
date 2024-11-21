import React, { useEffect, useState } from 'react';
import '../ViewDocumentAuditTrails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import api from "../utils/api";

const ViewAuditTrails = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [auditTrails, setAuditTrails] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState({
        username: '',
        action: '',
        outcome: '',
        startDate: '',
        endDate: '',
        documentName: ''
    });
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const fetchAuditTrails = async (isNewPage = false) => {
        if (!hasMore && isNewPage) return;
    
        try {
            setLoading(true);
            const params = {
                ...filters,
                sortBy: "timestamp",
                direction: "DESC",
                page: isNewPage ? page + 1 : page,
                size: pageSize,
            };
    
            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });
    
            const response = await api.get('/audit/audits', { params });
            console.log("Received audit trails response:", response.data);
    
            setAuditTrails((prevTrails) => {
                const newTrails = isNewPage ? [...prevTrails, ...response.data.content] : response.data.content;
                const uniqueTrails = Array.from(new Map(newTrails.map(item => [item.id, item])).values());
                return uniqueTrails;
            });
    
            setPage((prevPage) => isNewPage ? prevPage + 1 : prevPage);
            setHasMore(!response.data.last);
            setError(null);
        } catch (error) {
            console.error('Error fetching audits:', error);
            setError('Failed to fetch audits. Please try again later.');
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchAuditTrails();
    }, [filters]);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop + 1 >=
                document.documentElement.scrollHeight
            ) {
                fetchAuditTrails(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value
        }));
    };

    return (
        <div className="view-audits" data-testid="viewAudits-1">
            <h1 className="title">View Audits</h1>

            
            <div className="filter-section">
                <input
                    type="text"
                    name="username"
                    placeholder="Filter by Username"
                    value={filters.username}
                    onChange={handleFilterChange}
                />
                <input
                    type="text"
                    name="documentName"
                    placeholder="Filter by Document"
                    value={filters.documentName}
                    onChange={handleFilterChange}
                />
                <select
                    name="action"
                    value={filters.action}
                    onChange={handleFilterChange}
                >
                    <option value="">Filter by Action</option>
                    <option value="SUBMIT">SUBMIT</option>
                    <option value="VERIFY">VERIFY</option>
                </select>
                <input
                    type="datetime-local"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                />
                <input
                    type="datetime-local"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                />
            </div>

            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            <table className="audit-table">
                <thead>
                    <tr className="headers">
                        <th>Document</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {auditTrails.length > 0 ? (
                        auditTrails.map((audittrail, index) => (
                            <tr key={audittrail.id || `audit-${index}`}>
                                <td>{audittrail.documentName}</td>
                                <td>{audittrail.username}</td>
                                <td>{audittrail.action}</td>
                                <td>{audittrail.date}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No audit trails found for the applied filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ViewAuditTrails;
