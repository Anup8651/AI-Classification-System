import React from 'react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;

  return (
    <div className="error-box">
      <strong>⚠️ Error:</strong> {error}
    </div>
  );
};

export default ErrorMessage;
