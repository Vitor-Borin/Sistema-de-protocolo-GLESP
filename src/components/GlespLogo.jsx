import React from 'react';
import glespLogo from '../assets/brasao-glesp.png';

export const GlespLogo = React.memo(({ className }) => (
    <img src={glespLogo} alt="Brasão da GLESP" className={className} />
));
