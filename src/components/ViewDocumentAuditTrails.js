import React, { useEffect, useState, useCallback } from 'react';
import './ViewDocumentAuditTrails.css';
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

    const fetchAuditTrails = useCallback(async (isLoadMore = false) => {
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

            if (response?.data) {
                setAuditTrails(prev => isLoadMore ? [...prev, ...response.data.content] : response.data.content);
                setHasMore(!response.data.last);
                setError(null);
            } else {
                throw new Error('Invalid response data');
            }
        } catch (err) {
            console.error('Error fetching audits:', err);
            setError('Failed to fetch audits. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [filters, sortConfig, page]); // Added filters, sortConfig, and page as dependencies

    useEffect(() => {
        setPage(0); // Reset to the first page when filters or sorting changes
        fetchAuditTrails();
    }, [filters, sortConfig, fetchAuditTrails]); // Added fetchAuditTrails as a dependency

    useEffect(() => {
        if (page > 0) fetchAuditTrails(true);
    }, [page, fetchAuditTrails]); // Added fetchAuditTrails as a dependency

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
            ? <FontAwesomeIcon data-testid="sort-icon" icon={faSortUp} className="ml-1 text-blue-500" /> 
            : <FontAwesomeIcon data-testid="sort-icon" icon={faSortDown} className="ml-1 text-blue-500" />;
    };

    const loadMore = () => setPage(prevPage => prevPage + 1);

    return (
        <div className="view-audits" data-testid="viewAudits-1">
            <h1 className="title">View Audits</h1>

             {/* Filter Section */}
            <div className="filter-section">
                <div className="filter-item">
                    <input
                        type="text"
                        name="documentName"
                        placeholder="Filter by Document"
                        value={filters.documentName}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-item">
                    <input
                        type="text"
                        name="username"
                        placeholder="Filter by Username"
                        value={filters.username}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-item">
                    <select
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                    >
                        <option value="">Filter by Action</option>
                        <option value="SUBMIT">SUBMIT</option>
                        <option value="VERIFY">VERIFY</option>
                    </select>
                </div>
                <div className="filter-item">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                        type="datetime-local"
                        name="startDate"
                        id="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                    />
                </div>
                <div className="filter-item">
                    <label htmlFor="endDate">End Date</label>
                    <input
                        type="datetime-local"
                        name="endDate"
                        id="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                    />
                </div>
            </div>

            {/* Table Section */}
            <table className="audit-table">
                <thead>
                    <tr className="headers">
                        <th data-testid="header-document" className="sort-header" onClick={() => handleSort('documentName')}>
                            Document {getSortIcon('documentName')}
                        </th>
                        <th data-testid="header-username" className="sort-header" onClick={() => handleSort('username')}>
                            User {getSortIcon('username')}
                        </th>
                        <th data-testid="header-action" className="sort-header" onClick={() => handleSort('action')}>
                            Action {getSortIcon('action')}
                        </th>
                        <th data-testid="header-timestamp" className="sort-header" onClick={() => handleSort('timestamp')}>
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

            {/* Display Loading or Error */}
            {loading && (
                <div className="spinner-container">
                    <div className="spinner" data-testid="spinner" aria-live="polite"></div>
                </div>
            )}
            {error && <p className="error-message">{error}</p>}

            {/* Load More Button */}
            {hasMore && !loading && (
                <div className="load-more-container" data-testid="load-more-btn">
                    <button onClick={loadMore} className="load-more-btn">Load More</button>
                </div>
            )}
        </div>
    );
};

export default ViewAuditTrails;
