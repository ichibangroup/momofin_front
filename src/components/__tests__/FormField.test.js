import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormField from '../FormField';

describe('FormField', () => {
    const defaultProps = {
        id: 'test-field',
        label: 'Test Label',
        value: '',
        onChange: jest.fn(),
    };

    it('renders with required props', () => {
        render(<FormField {...defaultProps} />);

        expect(screen.getByLabelText(/test label/i)).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
        expect(screen.getByRole('textbox')).toHaveAttribute('id', 'test-field');
    });

    it('renders different input types correctly', () => {
        const { rerender } = render(
            <FormField {...defaultProps} type="password" />
        );
        expect(screen.getByLabelText(/test label/i)).toHaveAttribute('type', 'password');

        rerender(<FormField {...defaultProps} type="email" />);
        expect(screen.getByLabelText(/test label/i)).toHaveAttribute('type', 'email');

        rerender(<FormField {...defaultProps} type="number" />);
        expect(screen.getByLabelText(/test label/i)).toHaveAttribute('type', 'number');
    });

    it('handles onChange events', () => {
        const handleChange = jest.fn();
        render(<FormField {...defaultProps} onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test value' } });

        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('displays error message when error prop is provided', () => {
        const errorMessage = 'This field is required';
        render(<FormField {...defaultProps} error={errorMessage} />);

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });

    it('applies correct styling based on error state', () => {
        const { rerender } = render(<FormField {...defaultProps} />);
        expect(screen.getByRole('textbox')).toHaveClass('border-gray-300');

        rerender(<FormField {...defaultProps} error="Error message" />);
        expect(screen.getByRole('textbox')).toHaveClass('border-red-500');
    });

    it('renders with initial value', () => {
        render(<FormField {...defaultProps} value="initial value" />);
        expect(screen.getByRole('textbox')).toHaveValue('initial value');
    });

    it('handles number type input correctly', () => {
        render(
            <FormField
                {...defaultProps}
                type="number"
                value={42}
            />
        );

        const input = screen.getByRole('spinbutton');
        expect(input).toHaveValue(42);
    });

    it('maintains label-input association using htmlFor', () => {
        render(<FormField {...defaultProps} />);

        const label = screen.getByText(/test label/i);
        const input = screen.getByRole('textbox');

        expect(label).toHaveAttribute('for', 'test-field');
        expect(input).toHaveAttribute('id', 'test-field');
    });
});