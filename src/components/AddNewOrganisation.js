import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './AddNewOrganisation.css';

const ActionButton = ({ label, onClick, disabled, className }) => {
  return (
      <button onClick={onClick} disabled={disabled} className={className}>
        {label}
      </button>
  );
};

ActionButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

ActionButton.defaultProps = {
  disabled: false,
  className: '',
};

const OrganisationDetailsForm = ({ data, onChange, onSubmit, onCancel }) => {
  return (
      <form onSubmit={onSubmit}>
        {['name', 'industry', 'address', 'description'].map((field) => (
            <div className="mb-3" key={field}>
              <label htmlFor={field} className="add-organisation-form-label">
                {field === 'name'
                    ? `Organisation Name:`
                    : `${field.charAt(0).toUpperCase() + field.slice(1)}:`}
              </label>
              <input
                  type={field === 'description' ? 'textarea' : 'text'}
                  className="add-organisation-form-control"
                  id={field}
                  value={data[field]}
                  onChange={(e) => onChange(field, e.target.value)}
                  required
              />
            </div>
        ))}
        <div className="add-organisation-buttons">
          <ActionButton label="Cancel" onClick={onCancel} className="add-organisation-cancel-btn" />
          <ActionButton label="Continue" className="add-organisation-btn continue-btn" />
        </div>
      </form>
  );
};

OrganisationDetailsForm.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    industry: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

const AdminDetailsForm = ({ data, onChange, onSubmit, onBack, isSubmitting, apiError }) => {
  return (
      <form onSubmit={onSubmit}>
        {['username', 'password'].map((field) => (
            <div className="mb-3" key={field}>
              <label htmlFor={field} className="add-organisation-form-label">
                {`${field.charAt(0).toUpperCase() + field.slice(1)}:`}
              </label>
              <input
                  type={field === 'password' ? 'password' : 'text'}
                  className="add-organisation-form-control"
                  id={field}
                  value={data[field]}
                  onChange={(e) => onChange(field, e.target.value)}
                  required
              />
            </div>
        ))}
        {apiError && <div className="add-organisation-error-message">{apiError}</div>}
        <div className="add-organisation-buttons">
          <ActionButton label="Back" onClick={onBack} className="add-organisation-back-btn" />
          <ActionButton
              label={isSubmitting ? 'Submitting...' : 'Add Organisation'}
              disabled={isSubmitting}
              className="add-organisation-btn submit-btn"
          />
        </div>
      </form>
  );
};

AdminDetailsForm.propTypes = {
  data: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  apiError: PropTypes.string,
};

AdminDetailsForm.defaultProps = {
  apiError: null,
};

const AddOrganisation = () => {

  useEffect(() => {
    document.body.classList.add('unscrollable');

    return () => {
      document.body.classList.remove('unscrollable');
    };
  }, []);


  const [organisationData, setOrganisationData] = useState({
    name: '',
    industry: '',
    address: '',
    description: '',
  });
  const [adminData, setAdminData] = useState({ username: '', password: '' });
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOrgDetailsSubmitted, setIsOrgDetailsSubmitted] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (dataSetter) => (field, value) => {
    dataSetter((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleSubmitOrganisationDetails = (event) => {
    event.preventDefault();
    setIsOrgDetailsSubmitted(true);
  };

  const handleSubmitAdminDetails = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    const organisationPayload = {
      ...organisationData,
      adminUsername: adminData.username,
      adminPassword: adminData.password,
      location: organisationData.address
    };

    delete organisationPayload.address;

    try {
      const response = await api.post('/api/momofin-admin/organizations', organisationPayload);
      if (response.status === 200) {
        resetForms();
        navigate('/app/viewOrg');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Failed to add organisation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForms = () => {
    setOrganisationData({ name: '', industry: '', address: '', description: '' });
    setAdminData({ username: '', password: '' });
    setIsOrgDetailsSubmitted(false);
  };

  const handleGoBack = () => {
    setAdminData({ username: '', password: '' });
    setIsOrgDetailsSubmitted(false);
  };

  const handleCancel = () => {
    resetForms();
    navigate('/app/viewOrg');
  };

  return (
      <div className="add-organisation-container mt-5">
        <h1 className="add-organisation-text-3xl font-bold">
          {isOrgDetailsSubmitted ? 'Input Admin Details' : 'Add Organisation'}
        </h1>
        <div className="add-organisation-card">
          <div className="add-organisation-card-body">
            {isOrgDetailsSubmitted ? (
                <AdminDetailsForm
                    data={adminData}
                    onChange={handleInputChange(setAdminData)}
                    onSubmit={handleSubmitAdminDetails}
                    onBack={handleGoBack}
                    isSubmitting={isSubmitting}
                    apiError={apiError}
                />
            ) : (
                <OrganisationDetailsForm
                    data={organisationData}
                    onChange={handleInputChange(setOrganisationData)}
                    onSubmit={handleSubmitOrganisationDetails}
                    onCancel={handleCancel}
                />
            )}
          </div>
        </div>
      </div>
  );
};

export default AddOrganisation;
