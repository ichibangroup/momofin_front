import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Button = ({ onClick, className, title, icon, children }) => {
    return (
        <button className={className} onClick={onClick} title={title}>
            {icon ? <FontAwesomeIcon icon={icon} /> : null}
            {children}
        </button>
    );
};

export default Button;
