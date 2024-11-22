import React, { useEffect, useState } from 'react';
import '../ViewDocumentAuditTrails.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSort,
    faSortUp,
    faSortDown
} from '@fortawesome/free-solid-svg-icons';
import api from "../utils/api";

const ViewAuditTrails = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [auditTrails, setAuditTrails] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [filters, setFilters] = useState({
        username: '',
        action: '',
        outcome: '',
        startDate: '',
        endDate: '',
        documentName: '',
    });
    const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

    const fetchAuditTrails = async (isLoadMore = false) => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                sortBy: sortConfig.key,
                direction: sortConfig.direction.toUpperCase(),
                page,
                size: 10,
            };

            Object.keys(params).forEach(key => {
                if (!params[key]) delete params[key];
            });

            const response = await api.get('/audit/audits', { params });

            setAuditTrails(prev => isLoadMore ? [...prev, ...response.data.content] : response.data.content);
            setHasMore(!response.data.last);
            setError(null);
        } catch (err) {
            console.error('Error fetching audits:', err);
            setError('Failed to fetch audits. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(0); // Reset to the first page when filters or sorting changes
        fetchAuditTrails();
    }, [filters, sortConfig]);

    useEffect(() => {
        if (page > 0) fetchAuditTrails(true);
    }, [page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleSort = (key) => {
        setSortConfig(prevConfig => ({
            key,
            direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;
        return sortConfig.direction === 'asc' 
            ? <FontAwesomeIcon icon={faSortUp} className="ml-1 text-blue-500" /> 
            : <FontAwesomeIcon icon={faSortDown} className="ml-1 text-blue-500" />;
    };

    const loadMore = () => setPage(prevPage => prevPage + 1);

    return (
        <div className="view-audits" data-testid="viewAudits-1">
            <h1 className="title">View Audits</h1>

            {/* Filter Section */}
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

            {/* Display Loading or Error */}
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}

            {/* Table Section */}
            <table className="audit-table">
                <thead>
                    <tr className="headers">
                        <th className="sort-header" onClick={() => handleSort('documentName')}>
                            Document {getSortIcon('documentName')}
                        </th>
                        <th className="sort-header" onClick={() => handleSort('username')}>
                            User {getSortIcon('username')}
                        </th>
                        <th className="sort-header" onClick={() => handleSort('action')}>
                            Action {getSortIcon('action')}
                        </th>
                        <th className="sort-header" onClick={() => handleSort('timestamp')}>
                            Date {getSortIcon('timestamp')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {auditTrails.length > 0 ? (
                        auditTrails.map((audit) => (
                            <tr key={audit.id}>
                                <td>{audit.documentName}</td>
                                <td>{audit.username}</td>
                                <td>{audit.action}</td>
                                <td>{audit.date}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4">No audit trails found for the applied filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Load More Button */}
            {hasMore && !loading && (
                <button onClick={loadMore} className="load-more-btn">Load More</button>
            )}
        </div>
    );
};

export default ViewAuditTrails;
