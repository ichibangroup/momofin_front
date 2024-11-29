import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HelpAndDocumentation from '../HelpAndDocumentation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

describe('HelpAndDocumentation Component', () => {
  beforeEach(() => {
    render(<HelpAndDocumentation />);
  });

  // Header Tests
  test('renders main heading', () => {
    const mainHeading = screen.getByText(/Avento Trust: Digital Document Verification/i);
    expect(mainHeading).toBeInTheDocument();
  });

  // Section Tests
  test('renders project overview section', () => {
    const overviewSection = screen.getByText(/Avento Trust is a cutting-edge document verification platform/i);
    expect(overviewSection).toBeInTheDocument();
  });

  test('renders key features section', () => {
    const documentUploadFeature = screen.getByText(/Document Upload/i);
    const verificationProcessFeature = screen.getByText(/Verification Process/i);
    
    expect(documentUploadFeature).toBeInTheDocument();
    expect(verificationProcessFeature).toBeInTheDocument();
  });

  test('renders user roles section', () => {
    const regularUsers = screen.getByText(/Regular Users/i);
    const adminUsers = screen.getByText(/Organization Administrators/i);
    
    expect(regularUsers).toBeInTheDocument();
    expect(adminUsers).toBeInTheDocument();
  });

  test('renders security principles section', () => {
    const securityPrinciples = screen.getByText(/Security Principles/i);
    expect(securityPrinciples).toBeInTheDocument();

    const principlesList = [
      'Document Integrity',
      'Authenticity Verification', 
      'Comprehensive Audit Trails',
      'Secure, Tamper-Evident Document Storage'
    ];

    principlesList.forEach(principle => {
      expect(screen.getByText(principle)).toBeInTheDocument();
    });
  });

  test('renders FontAwesome icons', () => {
    // Check for icons by their data-icon attribute
    const iconNames = [
      'shield-halved', 
      'clipboard-check', 
      'upload', 
      'file-signature', 
      'users', 
      'lock'
    ];
  
    iconNames.forEach(iconName => {
      const icon = screen.getByTestId(`icon-${iconName}`);
      expect(icon).toBeInTheDocument();
    });
  });

  // Quote Test
  test('renders closing quote', () => {
    const quote = screen.getByText(/Empowering trust in the digital document ecosystem/i);
    expect(quote).toBeInTheDocument();
  });

  // Styling and Structure Tests
  test('checks for correct CSS classes', () => {
    const container = screen.getByText(/Avento Trust: Digital Document Verification/i).closest('.help-documentation-container');
    expect(container).toBeInTheDocument();

    const sections = screen.getAllByText(/Overview|Features|Roles|Security/i).map(el => el.closest('section'));
    sections.forEach(section => {
      expect(section).toHaveClass('mb-8');
    });
  });
});